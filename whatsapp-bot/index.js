import 'dotenv/config'
import { readFile, writeFile, mkdir, rm } from 'fs/promises'
import { existsSync }                 from 'fs'
import path                           from 'path'
import { fileURLToPath }              from 'url'
import qrcode                         from 'qrcode-terminal'
import pino                           from 'pino'
import makeWASocket, {
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} from '@whiskeysockets/baileys'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logger    = pino({ level: 'silent' })

// ── Configuración ─────────────────────────────────────────────────────────────
const SUPABASE_URL        = process.env.SUPABASE_URL
const BOT_SECRET          = process.env.WHATSAPP_BOT_SECRET ?? ''
const EDGE_FN_URL         = `${SUPABASE_URL}/functions/v1/whatsapp-admin`
const AUTH_DIR            = path.join(__dirname, 'auth')
const MAX_REINTENTOS      = 5

// Números de WhatsApp autorizados como admin (sin +, sin espacios, con código de país)
// Ejemplo: "573001234567,573009876543"
const ADMINS = (process.env.ADMIN_NUMEROS ?? '')
  .split(',')
  .map(n => n.trim().replace(/\D/g, ''))
  .filter(Boolean)

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL no configurada en .env')
  process.exit(1)
}
if (ADMINS.length === 0) {
  console.error('❌ ADMIN_NUMEROS no configurada en .env (ej: 573001234567)')
  process.exit(1)
}

console.log('🎸 VentaDeAcordeones.Com — Bot WhatsApp Admin')
console.log(`📱 Admins autorizados: ${ADMINS.join(', ')}`)

// ── Comandos directos (sin IA) ────────────────────────────────────────────────
const COMANDOS_AYUDA = `*🎸 Comandos disponibles:*

/nuevo — Iniciar nueva conversación
/cancelar — Cancelar proceso actual
/productos — Ver últimos 5 productos
/pedidos — Ver últimos 5 pedidos
/ayuda — Mostrar este menú

O escríbeme directamente qué necesitas:
• _"Quiero crear un acordeón Hohner"_
• _"¿Cuántas ventas tenemos?"_
• _"Actualizar stock del producto X"_`

// ── Llamar a la Edge Function ─────────────────────────────────────────────────
async function llamarAgente(numero, mensaje) {
  try {
    const res = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type':  'application/json',
        'x-bot-secret':  BOT_SECRET,
      },
      body: JSON.stringify({ numero, mensaje }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`❌ Edge Function ${res.status}:`, err)
      return '⚠️ Error del servidor. Intenta de nuevo.'
    }

    const data = await res.json()

    // Si se guardó un producto, agregar notificación
    if (data.producto_guardado) {
      const p = data.producto_guardado
      const url = `https://ventadeacordeones.com/productos/${p.slug}`
      return (
        (data.respuesta ? data.respuesta + '\n\n' : '') +
        `✅ *¡Producto creado exitosamente!*\n` +
        `📦 ${p.nombre}\n` +
        `🔗 ${url}\n\n` +
        `Puedes seguir creando otro producto o escribe */nuevo* para empezar de cero.`
      )
    }

    return data.respuesta ?? '(sin respuesta del agente)'

  } catch (err) {
    console.error('❌ Error llamando Edge Function:', err.message)
    return '⚠️ No pude conectar con el servidor. Intenta en un momento.'
  }
}

// ── Iniciar bot ───────────────────────────────────────────────────────────────
async function iniciarBot(reintentos = 0) {
  if (!existsSync(AUTH_DIR)) await mkdir(AUTH_DIR, { recursive: true })

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR)
  const { version }          = await fetchLatestBaileysVersion()

  const sock = makeWASocket({
    version,
    logger,
    auth: {
      creds: state.creds,
      keys:  makeCacheableSignalKeyStore(state.keys, logger),
    },
    printQRInTerminal: false,
    browser: ['VentaDeAcordeones Bot', 'Chrome', '1.0.0'],
  })

  // ── QR Code ────────────────────────────────────────────────────────────────
  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log('\n📲 Escanea este QR con WhatsApp (Dispositivos vinculados → Vincular dispositivo):')
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'close') {
      const codigo = lastDisconnect?.error?.output?.statusCode
      const reconectar = codigo !== DisconnectReason.loggedOut

      if (reconectar && reintentos < MAX_REINTENTOS) {
        console.log(`🔄 Reconectando (intento ${reintentos + 1}/${MAX_REINTENTOS})...`)
        setTimeout(() => iniciarBot(reintentos + 1), 5000)
      } else if (codigo === DisconnectReason.loggedOut) {
        console.log('🚪 Sesión cerrada. Escanea el QR de nuevo.')
        // Limpiar auth para forzar nuevo QR
        await rm(AUTH_DIR, { recursive: true, force: true }).catch(() => {})
        iniciarBot(0)
      } else {
        console.error('❌ Demasiados reintentos. Reinicia el bot manualmente.')
        process.exit(1)
      }
    }

    if (connection === 'open') {
      console.log('✅ Bot conectado a WhatsApp')
      console.log(`📱 Número del bot: ${sock.user?.id?.split(':')[0]}`)
    }
  })

  // ── Guardar credenciales ───────────────────────────────────────────────────
  sock.ev.on('creds.update', saveCreds)

  // ── Mensajes entrantes ─────────────────────────────────────────────────────
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return

    for (const msg of messages) {
      if (msg.key.fromMe) continue
      if (!msg.message)   continue

      const jid    = msg.key.remoteJid ?? ''
      const numero = jid.replace('@s.whatsapp.net', '').replace(/\D/g, '')

      // Solo procesar mensajes de admins
      if (!ADMINS.includes(numero)) {
        console.log(`⚠️ Mensaje ignorado de número no autorizado: ${numero}`)
        continue
      }

      // Extraer texto del mensaje
      const texto = (
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        ''
      ).trim()

      if (!texto) continue

      console.log(`📩 [${numero}] ${texto}`)

      // ── Comandos directos ────────────────────────────────────────────────
      if (texto === '/ayuda' || texto === '/help') {
        await sock.sendMessage(jid, { text: COMANDOS_AYUDA })
        continue
      }

      if (texto === '/nuevo' || texto === '/cancelar') {
        // Resetear sesión vía Edge Function con mensaje especial
        const respuesta = await llamarAgente(numero, '__RESET_SESSION__')
        await sock.sendMessage(jid, {
          text: texto === '/nuevo'
            ? '🆕 Sesión reiniciada. ¿Qué producto quieres crear?'
            : '❌ Proceso cancelado. ¿En qué más te puedo ayudar?',
        })
        continue
      }

      // ── Indicador de escritura ───────────────────────────────────────────
      await sock.sendPresenceUpdate('composing', jid)

      // ── Llamar al agente IA ──────────────────────────────────────────────
      const respuesta = await llamarAgente(numero, texto)

      await sock.sendPresenceUpdate('paused', jid)

      // WhatsApp tiene límite de ~65k chars por mensaje
      if (respuesta.length > 4000) {
        const partes = respuesta.match(/.{1,4000}/gs) ?? [respuesta]
        for (const parte of partes) {
          await sock.sendMessage(jid, { text: parte })
        }
      } else {
        await sock.sendMessage(jid, { text: respuesta })
      }

      console.log(`📤 [${numero}] Respuesta enviada (${respuesta.length} chars)`)
    }
  })

  return sock
}

// ── Arrancar ──────────────────────────────────────────────────────────────────
iniciarBot().catch((err) => {
  console.error('❌ Error fatal:', err)
  process.exit(1)
})
