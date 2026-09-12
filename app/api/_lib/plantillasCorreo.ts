/**
 * Plantillas de los correos de la tienda.
 *
 * HTML de correo, no HTML de web: tablas, estilos en línea y nada de flexbox ni
 * variables CSS. Gmail y Outlook descartan las hojas de estilo y buena parte de CSS
 * moderno, así que lo que no vaya en el atributo `style` de cada etiqueta no se ve.
 *
 * Todas llevan también versión en texto plano: mejora la entrega (los filtros de spam
 * penalizan los correos que solo traen HTML) y es lo que se lee en los relojes.
 */

const MARCA = '#c8a24a'
const TINTA = '#14151a'
const SUAVE = '#6b7280'
const BORDE = '#e6e7eb'
const SITIO = process.env.NEXT_PUBLIC_URL_BASE || 'https://ventadeacordeones.com'
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO || '573144865310'

export interface LineaPedido {
  nombre?: string
  cantidad?: number
  precio?: number
  subtotal?: number
}

export interface DatosCorreoPedido {
  numeroPedido: string
  nombreCliente: string
  total: number
  subtotal?: number
  costoEnvio?: number
  descuento?: number
  productos: LineaPedido[]
}

const pesos = (n: unknown) =>
  '$' + Math.round(Number(n) || 0).toLocaleString('es-CO', { maximumFractionDigits: 0 })

const escapar = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const wa = (texto: string) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(texto)}`

function filasProductos(productos: LineaPedido[]): string {
  return productos
    .filter((p) => p?.nombre)
    .map(
      (p) => `
      <tr>
        <td style="padding:12px 0;border-bottom:1px solid ${BORDE};color:${TINTA};font-size:15px;line-height:1.45">
          ${escapar(p.nombre)}
          ${Number(p.cantidad) > 1 ? `<span style="color:${SUAVE}"> &times; ${Number(p.cantidad)}</span>` : ''}
        </td>
        <td style="padding:12px 0;border-bottom:1px solid ${BORDE};color:${TINTA};font-size:15px;text-align:right;white-space:nowrap">
          ${pesos(p.subtotal ?? (Number(p.precio) || 0) * (Number(p.cantidad) || 1))}
        </td>
      </tr>`,
    )
    .join('')
}

function armazon(contenido: string, preencabezado: string): string {
  return `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapar(preencabezado)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f6;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${BORDE}">
        <tr>
          <td style="background:${TINTA};padding:20px 28px">
            <a href="${SITIO}" style="color:${MARCA};font-size:17px;font-weight:700;text-decoration:none;letter-spacing:.3px">VentaDeAcordeones.com</a>
          </td>
        </tr>
        <tr><td style="padding:28px">${contenido}</td></tr>
        <tr>
          <td style="padding:18px 28px;background:#fafafb;border-top:1px solid ${BORDE};color:${SUAVE};font-size:12px;line-height:1.6">
            Taller y tienda en Bogotá &middot; Envíos a toda Colombia<br>
            <a href="${SITIO}" style="color:${SUAVE}">ventadeacordeones.com</a> &middot;
            <a href="${wa('Hola, tengo una pregunta sobre mi pedido')}" style="color:${SUAVE}">WhatsApp</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function boton(texto: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0">
    <tr><td style="background:${MARCA};border-radius:10px">
      <a href="${href}" style="display:inline-block;padding:13px 26px;color:${TINTA};font-size:15px;font-weight:700;text-decoration:none">${escapar(texto)}</a>
    </td></tr>
  </table>`
}

function resumen(d: DatosCorreoPedido): string {
  const lineaExtra = (etiqueta: string, valor: number, signo = '') =>
    valor > 0
      ? `<tr><td style="padding:4px 0;color:${SUAVE};font-size:14px">${etiqueta}</td>
         <td style="padding:4px 0;color:${SUAVE};font-size:14px;text-align:right">${signo}${pesos(valor)}</td></tr>`
      : ''

  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:6px">
    ${filasProductos(d.productos)}
    ${lineaExtra('Descuento', Number(d.descuento) || 0, '−')}
    ${lineaExtra('Envío', Number(d.costoEnvio) || 0)}
    <tr>
      <td style="padding:14px 0 0;color:${TINTA};font-size:16px;font-weight:700">Total</td>
      <td style="padding:14px 0 0;color:${TINTA};font-size:18px;font-weight:700;text-align:right">${pesos(d.total)}</td>
    </tr>
  </table>`
}

const textoProductos = (d: DatosCorreoPedido) =>
  d.productos
    .filter((p) => p?.nombre)
    .map((p) => `- ${p.nombre}${Number(p.cantidad) > 1 ? ` x${p.cantidad}` : ''}`)
    .join('\n')

// ── 1. Pedido registrado, pago todavía sin confirmar ─────────────────────────
export function correoPedidoRegistrado(d: DatosCorreoPedido) {
  const seguimiento = `${SITIO}/respuesta-epayco?ref=${encodeURIComponent(d.numeroPedido)}`
  return {
    asunto: `Recibimos tu pedido ${d.numeroPedido}`,
    html: armazon(
      `<h1 style="margin:0 0 10px;font-size:22px;color:${TINTA}">Ya guardamos tu pedido</h1>
       <p style="margin:0 0 4px;color:${SUAVE};font-size:15px;line-height:1.6">
         Hola ${escapar(d.nombreCliente.split(' ')[0] || '')}, tu pedido quedó registrado con el número
         <strong style="color:${TINTA}">${escapar(d.numeroPedido)}</strong>.
       </p>
       <p style="margin:10px 0 0;color:${SUAVE};font-size:15px;line-height:1.6">
         En cuanto el banco confirme el pago entra en preparación en el taller y te avisamos.
         Si el pago quedó a medias, puedes terminarlo escribiéndonos por WhatsApp con ese número.
       </p>
       ${resumen(d)}
       ${boton('Ver el estado de mi pedido', seguimiento)}
       <p style="margin:0;color:${SUAVE};font-size:13px;line-height:1.6">
         ¿Alguna duda? Responde este correo o escríbenos por
         <a href="${wa(`Hola, sobre mi pedido ${d.numeroPedido}`)}" style="color:${MARCA}">WhatsApp</a>.
       </p>`,
      `Tu pedido ${d.numeroPedido} quedó registrado`,
    ),
    texto: `Ya guardamos tu pedido ${d.numeroPedido}.

${textoProductos(d)}

Total: ${pesos(d.total)}

Estado del pedido: ${seguimiento}
WhatsApp: https://wa.me/${WHATSAPP}

VentaDeAcordeones.com`,
  }
}

// ── 2. Pago aprobado ─────────────────────────────────────────────────────────
export function correoPedidoPagado(d: DatosCorreoPedido) {
  const seguimiento = `${SITIO}/respuesta-epayco?ref=${encodeURIComponent(d.numeroPedido)}`
  return {
    asunto: `Pago confirmado · pedido ${d.numeroPedido}`,
    html: armazon(
      `<h1 style="margin:0 0 10px;font-size:22px;color:${TINTA}">Tu pago quedó aprobado</h1>
       <p style="margin:0;color:${SUAVE};font-size:15px;line-height:1.6">
         Gracias ${escapar(d.nombreCliente.split(' ')[0] || '')}. El pedido
         <strong style="color:${TINTA}">${escapar(d.numeroPedido)}</strong> ya entró en preparación.
       </p>
       ${resumen(d)}
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:22px 0 6px;border-top:1px solid ${BORDE}">
         <tr><td style="padding-top:18px">
           <p style="margin:0 0 6px;color:${TINTA};font-size:15px;font-weight:700">Qué sigue</p>
           <p style="margin:0;color:${SUAVE};font-size:14px;line-height:1.7">
             <strong style="color:${TINTA}">1.</strong> Revisamos y empacamos el instrumento (unas 24 horas hábiles).<br>
             <strong style="color:${TINTA}">2.</strong> Lo despachamos y te enviamos la guía.<br>
             <strong style="color:${TINTA}">3.</strong> Ciudades principales 48–72 h hábiles; intermedias 3–5 días; municipios 5–8 días.
           </p>
         </td></tr>
       </table>
       ${boton('Seguir mi pedido', seguimiento)}`,
      `Pago confirmado del pedido ${d.numeroPedido}`,
    ),
    texto: `Tu pago quedó aprobado. Pedido ${d.numeroPedido}.

${textoProductos(d)}

Total pagado: ${pesos(d.total)}

Seguimiento: ${seguimiento}
WhatsApp: https://wa.me/${WHATSAPP}

VentaDeAcordeones.com`,
  }
}

// ── 3. Aviso interno para la tienda ──────────────────────────────────────────
export function correoAvisoTienda(
  d: DatosCorreoPedido & { email?: string; telefono?: string; ciudad?: string; estado: string },
) {
  return {
    asunto: `${d.estado === 'pagado' ? '💰 PAGADO' : '🛒 Nuevo pedido'} · ${d.numeroPedido} · ${pesos(d.total)}`,
    html: armazon(
      `<h1 style="margin:0 0 14px;font-size:20px;color:${TINTA}">
         ${d.estado === 'pagado' ? 'Pago confirmado' : 'Pedido nuevo sin pagar todavía'}
       </h1>
       <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:${TINTA}">
         <tr><td style="padding:3px 0;color:${SUAVE};width:110px">Pedido</td><td>${escapar(d.numeroPedido)}</td></tr>
         <tr><td style="padding:3px 0;color:${SUAVE}">Cliente</td><td>${escapar(d.nombreCliente)}</td></tr>
         ${d.email ? `<tr><td style="padding:3px 0;color:${SUAVE}">Correo</td><td>${escapar(d.email)}</td></tr>` : ''}
         ${d.telefono ? `<tr><td style="padding:3px 0;color:${SUAVE}">Teléfono</td><td><a href="${wa(`Hola ${d.nombreCliente.split(' ')[0] || ''}, te escribo de VentaDeAcordeones.com por tu pedido ${d.numeroPedido}`)}" style="color:${MARCA}">${escapar(d.telefono)}</a></td></tr>` : ''}
         ${d.ciudad ? `<tr><td style="padding:3px 0;color:${SUAVE}">Ciudad</td><td>${escapar(d.ciudad)}</td></tr>` : ''}
       </table>
       ${resumen(d)}`,
      `${d.numeroPedido} · ${pesos(d.total)}`,
    ),
    texto: `${d.estado === 'pagado' ? 'PAGADO' : 'Pedido nuevo (sin pagar)'}
Pedido: ${d.numeroPedido}
Cliente: ${d.nombreCliente}${d.email ? `\nCorreo: ${d.email}` : ''}${d.telefono ? `\nTeléfono: ${d.telefono}` : ''}${d.ciudad ? `\nCiudad: ${d.ciudad}` : ''}

${textoProductos(d)}

Total: ${pesos(d.total)}`,
  }
}
