import express from 'express'
import cors from 'cors'
import crypto from 'crypto'
import dotenv from 'dotenv'
dotenv.config()

import feedHandler, { generarFeedXML } from './api/meta/feed-productos.js'
import {
  iniciarServicioActualizacion,
  configurarWebhookProductos,
  actualizarFeed,
  obtenerEstadisticasFeed,
  asegurarBucketFeedsMeta,
} from './api/meta/actualizacion-automatica.js'

const app = express()
const PORT = process.env.PORT || 3000

// ── Seguridad: headers HTTP ───────────────────────────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('X-XSS-Protection', '1; mode=block')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://checkout.epayco.co; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.openai.com https://checkout.epayco.co; frame-src https://checkout.epayco.co;"
  )
  next()
})

// ── Rate limiting simple en memoria ──────────────────────────────────────────
const intentos = new Map()
const VENTANA_MS = 60_000
const MAX_REQUESTS = 60

setInterval(() => {
  const ahora = Date.now()
  for (const [ip, datos] of intentos) {
    if (ahora - datos.inicio > VENTANA_MS) intentos.delete(ip)
  }
}, 5 * 60_000)

function rateLimiter(max = MAX_REQUESTS) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip
    const ahora = Date.now()
    const datos = intentos.get(ip) || { count: 0, inicio: ahora }

    if (ahora - datos.inicio > VENTANA_MS) {
      datos.count = 0
      datos.inicio = ahora
    }

    datos.count++
    intentos.set(ip, datos)

    if (datos.count > max) {
      return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta en un minuto.' })
    }
    next()
  }
}

app.use(cors())
app.use(express.json({ limit: '5mb' }))
app.use(rateLimiter())

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
    port: PORT,
  })
})

console.log('--- DIAGNÓSTICO DE INICIO ---')
console.log('NODE_ENV:', process.env.NODE_ENV)
console.log('PORT:', PORT)
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Configurada' : '❌ Faltante')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Faltante')
console.log('EPAYCO_PRIVATE_KEY:', (process.env.EPAYCO_PRIVATE_KEY || process.env.EPAYCO_P_KEY) ? '✅ Configurada' : '⚠️ Faltante (validación de firma desactivada)')
console.log('---------------------------')

// ── ePayco: confirmación de pago con validación HMAC-SHA256 ───────────────────
app.post('/api/epayco/confirmar', rateLimiter(20), async (req, res) => {
  try {
    const {
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
      x_signature,
      x_cod_response,
      x_response,
      x_cust_id_cliente,
    } = req.body

    const pKey = process.env.EPAYCO_PRIVATE_KEY || process.env.EPAYCO_P_KEY
    const custId = x_cust_id_cliente || process.env.VITE_EPAYCO_CUSTOMER_ID

    if (!pKey) {
      console.error('EPAYCO_P_KEY no configurada — validación de firma omitida')
      return res.status(500).json({ error: 'Configuración de pago incompleta en el servidor' })
    }

    // Validación HMAC-SHA256 según documentación ePayco
    const mensaje = `${custId}^${pKey}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`
    const firmaCalculada = crypto.createHash('sha256').update(mensaje).digest('hex')

    if (firmaCalculada !== x_signature) {
      console.warn(`Firma inválida para ref_payco=${x_ref_payco}`)
      return res.status(400).json({ valida: false, error: 'Firma de pago inválida' })
    }

    const pagoAprobado = x_cod_response === '1' || x_response === 'Aceptada'

    if (pagoAprobado && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )

      const { error } = await supabase
        .from('pedidos')
        .update({
          estado: 'pagado',
          referencia_pago: x_ref_payco,
          transaction_id: x_transaction_id,
          actualizado_el: new Date().toISOString(),
        })
        .eq('referencia_pago', x_ref_payco)
        .neq('estado', 'pagado')

      if (error) console.error('Error actualizando pedido:', error.message)
    }

    res.json({
      valida: true,
      aprobado: pagoAprobado,
      ref_payco: x_ref_payco,
    })
  } catch (error) {
    console.error('Error en /api/epayco/confirmar:', error.message)
    res.status(500).json({ error: 'Error interno al confirmar pago' })
  }
})

// ── ePayco: validar firma desde el frontend ───────────────────────────────────
app.post('/api/epayco/validar-firma', rateLimiter(30), (req, res) => {
  const { x_ref_payco, x_transaction_id, x_amount, x_currency_code, x_signature, x_cust_id_cliente } = req.body
  const pKey = process.env.EPAYCO_PRIVATE_KEY || process.env.EPAYCO_P_KEY
  const custId = x_cust_id_cliente || process.env.VITE_EPAYCO_CUSTOMER_ID

  if (!pKey) return res.json({ valida: null, motivo: 'sin_configuracion' })

  const mensaje = `${custId}^${pKey}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`
  const firmaCalculada = crypto.createHash('sha256').update(mensaje).digest('hex')
  const valida = firmaCalculada === x_signature

  if (!valida) console.warn(`Firma inválida en validar-firma para ref=${x_ref_payco}`)

  res.json({ valida })
})

// ── Meta feed: XML directo ────────────────────────────────────────────────────
app.get('/api/meta/feed-productos', async (req, res) => {
  try {
    const xml = await generarFeedXML()
    res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=3600')
    res.status(200).send(xml)
  } catch (error) {
    res.status(500).json({ error: 'Error al generar feed', mensaje: error.message })
  }
})

// ── Meta feed: estado del servicio ───────────────────────────────────────────
app.get('/api/meta/estado-servicio', async (req, res) => {
  try {
    const estadisticas = await obtenerEstadisticasFeed()
    res.status(200).json({
      servicio: 'Feed Meta - Actualización Automática',
      estado: 'activo',
      configuracion: { frecuencia: '60 minutos' },
      estadisticas,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estado', mensaje: error.message })
  }
})

// ── Meta feed: actualización manual (requiere API key interna) ────────────────
function autenticarAdmin(req, res, next) {
  const apiKey = process.env.ADMIN_API_KEY
  if (!apiKey) return next() // Si no está configurada, permitir (entorno dev)
  const authHeader = req.headers['authorization'] || ''
  if (authHeader !== `Bearer ${apiKey}`) {
    return res.status(401).json({ error: 'No autorizado' })
  }
  next()
}

app.post('/api/meta/actualizar-feed', autenticarAdmin, async (req, res) => {
  try {
    const resultado = await actualizarFeed()
    res.status(200).json(resultado)
  } catch (error) {
    res.status(500).json({ exito: false, error: error.message })
  }
})

// ── Archivos estáticos ────────────────────────────────────────────────────────
app.use(express.static('dist'))

import { createRequire } from 'module'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
const __dirname = dirname(fileURLToPath(import.meta.url))

app.get(/(.*)/, (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

// ── Arrancar ──────────────────────────────────────────────────────────────────
app.listen(PORT, async () => {
  console.log(`🚀 Servidor iniciado en http://localhost:${PORT}`)
  const bucket = await asegurarBucketFeedsMeta()
  if (bucket?.error) {
    console.log('⚠️ No se pudo asegurar el bucket feeds-meta:', bucket.error)
  } else if (bucket?.creado) {
    console.log('✅ Bucket feeds-meta creado')
  } else {
    console.log('✅ Bucket feeds-meta disponible')
  }
  iniciarServicioActualizacion()
  configurarWebhookProductos()
})
