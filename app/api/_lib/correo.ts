/**
 * Envío de correos con Resend.
 *
 * Se usa la API REST directamente en vez del SDK: es una sola llamada `fetch` y así no
 * entra otra dependencia al bundle del servidor.
 *
 * ⚠️ Mientras el dominio no esté verificado en Resend, la cuenta solo puede enviar
 * DESDE `onboarding@resend.dev` y HACIA el correo con el que se registró la cuenta.
 * Por eso `enviarCorreo` nunca lanza: si Resend rechaza el envío se anota en el log y
 * la compra sigue su curso. Un pedido no se pierde porque falle un correo.
 *
 * Para que lleguen a los clientes hay que verificar ventadeacordeones.com en
 * resend.com/domains (registros DNS en Cloudflare) y poner RESEND_FROM.
 */

const API = 'https://api.resend.com/emails'

const REMITENTE_POR_DEFECTO = 'VentaDeAcordeones.com <onboarding@resend.dev>'

export interface CorreoEnviado {
  ok: boolean
  id?: string
  error?: string
}

export function correoConfigurado(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

/** Copia interna para la tienda: cada pedido llega también al correo del negocio. */
export function correoDeLaTienda(): string | null {
  return process.env.CORREO_TIENDA || process.env.RESEND_TO_ADMIN || null
}

export async function enviarCorreo(opciones: {
  para: string | string[]
  asunto: string
  html: string
  texto?: string
  responderA?: string
}): Promise<CorreoEnviado> {
  const clave = process.env.RESEND_API_KEY
  if (!clave) {
    console.warn('[correo] RESEND_API_KEY no está definida: no se envió nada')
    return { ok: false, error: 'sin_configurar' }
  }

  const destinatarios = (Array.isArray(opciones.para) ? opciones.para : [opciones.para])
    .map((d) => String(d || '').trim())
    .filter(Boolean)

  if (!destinatarios.length) return { ok: false, error: 'sin_destinatario' }

  try {
    const res = await fetch(API, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${clave}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || REMITENTE_POR_DEFECTO,
        to: destinatarios,
        subject: opciones.asunto,
        html: opciones.html,
        text: opciones.texto,
        reply_to: opciones.responderA || process.env.CORREO_TIENDA || undefined,
      }),
      signal: AbortSignal.timeout(12_000),
    })

    const cuerpo = await res.json().catch(() => ({}))

    if (!res.ok) {
      // El mensaje de Resend dice exactamente qué falta (dominio sin verificar,
      // destinatario no permitido en modo de prueba, clave inválida…).
      console.error(`[correo] Resend ${res.status}: ${JSON.stringify(cuerpo).slice(0, 300)}`)
      return { ok: false, error: `http_${res.status}` }
    }

    return { ok: true, id: cuerpo?.id }
  } catch (error: any) {
    console.error('[correo] No se pudo enviar:', error?.message)
    return { ok: false, error: 'excepcion' }
  }
}
