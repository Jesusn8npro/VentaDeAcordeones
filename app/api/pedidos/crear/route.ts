import { NextResponse } from 'next/server'
import { leerBody } from '../../_lib/parseBody'
import { ipDe, permitir } from '../../_lib/rateLimit'
import { obtenerSupabaseAdmin } from '../../_lib/supabaseAdmin'
import { crearSesionEpayco } from '../../_lib/epayco'
import { enviarCorreo, correoDeLaTienda } from '../../_lib/correo'
import { correoPedidoRegistrado, correoAvisoTienda } from '../../_lib/plantillasCorreo'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Creación de pedidos EN EL SERVIDOR ───────────────────────────────────────
// Antes el navegador insertaba el pedido directamente en Supabase con el `total`
// que él mismo calculaba, y además descontaba stock. Con la anon key en la mano
// cualquiera podía crear un pedido de $1.000 por un acordeón de $6.500.000.
//
// Aquí el cliente solo dice QUÉ quiere comprar (producto_id + cantidad) y sus datos
// de envío. El precio, el descuento, el envío y el total salen SIEMPRE de la BD.
// El stock NO se toca: se descuenta cuando ePayco confirma el pago
// (app/api/epayco/confirmar/route.ts), que es el único momento en que sabemos que
// el dinero entró.

// Mismas reglas que el carrito (src/contextos/carritoReducer.ts): si cambian allí,
// cambiarlas aquí. El servidor es el que manda.
const ENVIO_GRATIS_DESDE = 50_000
const COSTO_ENVIO = 5_000
const DESCUENTO_AUTO_DESDE = 100_000
const DESCUENTO_AUTO_PCT = 0.1

const MAX_UNIDADES_POR_PRODUCTO = 10
const MAX_ITEMS = 20

// Extra de instalación/accesorio que ofrece el modal de pago contra entrega.
// El precio vive AQUÍ, no en el navegador: antes el cliente mandaba el total ya sumado.
const PRECIO_UPSELL = 32_000

// Límites que impone ePayco por transacción. Un pedido de 5.590.000 (un Corona III) se
// rechaza con "Amount must be between 5000 and 5000000": el cliente pulsaba Pagar y solo
// veía un error. Ahora se detecta ANTES de llamar a la pasarela y se le ofrece cerrar la
// compra por WhatsApp, que es como se venden esos acordeones igualmente.
const PAGO_MINIMO_EPAYCO = 5_000
const PAGO_MAXIMO_EPAYCO = 5_000_000
const METODOS_PAGO = new Set(['epayco', 'contra_entrega'])

/**
 * Descuento por volumen del producto (columna `promociones`), validado en el
 * servidor. El navegador solo dice qué promoción eligió; el porcentaje sale de la BD.
 */
function descuentoDePromocion(promociones: any, cantidad: number): number {
  const lista = Array.isArray(promociones?.promociones)
    ? promociones.promociones
    : Array.isArray(promociones)
      ? promociones
      : []
  let mejor = 0
  for (const promo of lista) {
    const minimo = Number(promo?.cantidadMinima) || 0
    const pct = Number(promo?.descuentoPorcentaje) || 0
    if (promo?.activa && minimo > 1 && cantidad >= minimo && pct > mejor && pct < 100) mejor = pct
  }
  return mejor
}

const texto = (v: unknown, max: number): string =>
  typeof v === 'string' ? v.trim().slice(0, max) : ''

const emailValido = (v: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)

// El id de usuario llega del navegador: si no tiene forma de UUID se ignora, para que
// el pedido quede como compra de invitado en vez de fallar el insert con basura dentro.
const ES_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function generarNumeroPedido(): string {
  return `VDA-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`
}

export async function POST(req: Request) {
  if (!permitir(ipDe(req), 10)) {
    return NextResponse.json({ error: 'Demasiados intentos. Espera un minuto.' }, { status: 429 })
  }

  const supabase = obtenerSupabaseAdmin()
  if (!supabase) {
    console.error('[pedidos/crear] Falta SUPABASE_SERVICE_ROLE_KEY')
    return NextResponse.json(
      { error: 'No podemos procesar pedidos en este momento. Escríbenos por WhatsApp.' },
      { status: 503 },
    )
  }

  try {
    const body = await leerBody(req)

    // ── 1. Items: solo id + cantidad. Los precios que mande el cliente se ignoran ──
    const itemsCrudos = Array.isArray(body.items) ? body.items : []
    if (itemsCrudos.length === 0 || itemsCrudos.length > MAX_ITEMS) {
      return NextResponse.json({ error: 'El carrito está vacío o tiene demasiados productos.' }, { status: 400 })
    }

    const pedidos = new Map<string, number>()
    for (const item of itemsCrudos) {
      const id = texto(item?.producto_id ?? item?.id, 64)
      const cantidad = Number(item?.cantidad)
      if (!id) {
        return NextResponse.json({ error: 'Hay un producto sin identificar en el carrito.' }, { status: 400 })
      }
      if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > MAX_UNIDADES_POR_PRODUCTO) {
        return NextResponse.json({ error: `Cantidad no válida (máximo ${MAX_UNIDADES_POR_PRODUCTO} por producto).` }, { status: 400 })
      }
      pedidos.set(id, Math.min(MAX_UNIDADES_POR_PRODUCTO, (pedidos.get(id) || 0) + cantidad))
    }

    // ── 2. Datos del cliente ──────────────────────────────────────────────────
    const metodoPago = METODOS_PAGO.has(texto(body.metodo_pago, 20)) ? texto(body.metodo_pago, 20) : 'epayco'
    const c = body.cliente || {}
    const nombre = texto(c.nombre, 80)
    const apellido = texto(c.apellido, 80)
    const email = texto(c.email, 160).toLowerCase()
    const telefono = texto(c.telefono, 30)
    const direccion = texto(c.direccion, 200)
    const ciudad = texto(c.ciudad, 80)
    const departamento = texto(c.departamento, 80)
    const tipoDocumento = texto(c.tipoDocumento, 10)
    const numeroDocumento = texto(c.numeroDocumento, 30)

    if (!nombre || !telefono || !direccion || !ciudad || !departamento) {
      return NextResponse.json({ error: 'Faltan datos de envío obligatorios.' }, { status: 400 })
    }
    // El documento solo lo exige la pasarela; contra entrega se toma al recibir.
    if (metodoPago === 'epayco' && (!apellido || !tipoDocumento || !numeroDocumento)) {
      return NextResponse.json({ error: 'Faltan datos de facturación obligatorios.' }, { status: 400 })
    }
    if (!emailValido(email)) {
      return NextResponse.json({ error: 'El correo electrónico no es válido.' }, { status: 400 })
    }

    // ── 3. Precios reales desde la BD ─────────────────────────────────────────
    const { data: productos, error: errorProductos } = await supabase
      .from('productos')
      .select('id, nombre, slug, precio, stock, activo, promociones')
      .in('id', [...pedidos.keys()])

    if (errorProductos) {
      console.error('[pedidos/crear] Supabase productos:', errorProductos.message)
      return NextResponse.json({ error: 'No pudimos verificar los productos. Intenta de nuevo.' }, { status: 502 })
    }

    const lineas: Array<Record<string, any>> = []
    let subtotal = 0

    for (const [id, cantidad] of pedidos) {
      const p = (productos || []).find((x: any) => String(x.id) === String(id))
      if (!p || !p.activo) {
        return NextResponse.json({ error: `Un producto de tu carrito ya no está disponible.` }, { status: 409 })
      }
      const precio = Number(p.precio)
      if (!Number.isFinite(precio) || precio <= 0) {
        return NextResponse.json({ error: `"${p.nombre}" no tiene precio publicado. Escríbenos por WhatsApp.` }, { status: 409 })
      }
      const stock = Number(p.stock ?? 0)
      if (stock < cantidad) {
        return NextResponse.json(
          { error: `Solo quedan ${stock} unidades de "${p.nombre}".` },
          { status: 409 },
        )
      }
      // Descuento por volumen: lo decide la BD, no el navegador.
      const pctPromo = descuentoDePromocion(p.promociones, cantidad)
      const precioFinal = pctPromo > 0 ? Math.round(precio * (1 - pctPromo / 100)) : precio
      subtotal += precioFinal * cantidad
      lineas.push({
        id: p.id,
        producto_id: p.id,
        nombre: p.nombre,
        slug: p.slug,
        cantidad,
        precio: precioFinal,
        precio_lista: precio,
        descuento_porcentaje: pctPromo,
        subtotal: precioFinal * cantidad,
      })
    }

    // Extra opcional (contra entrega). Precio fijado en el servidor.
    if (body.upsell === true) {
      subtotal += PRECIO_UPSELL
      lineas.push({ id: 'upsell', nombre: 'Kit de mantenimiento', cantidad: 1, precio: PRECIO_UPSELL, subtotal: PRECIO_UPSELL, upsell: true })
    }

    // ── 4. Envío, descuento automático y cupón (el cupón lo valida la BD) ─────
    // Contra entrega: el envío se cobra al recibir, no aquí.
    const costoEnvio = metodoPago === 'contra_entrega' ? 0 : subtotal >= ENVIO_GRATIS_DESDE ? 0 : COSTO_ENVIO
    // El 10% automático es una regla del carrito; contra entrega mantiene el precio de la oferta.
    const descuentoAuto =
      metodoPago !== 'contra_entrega' && subtotal >= DESCUENTO_AUTO_DESDE
        ? Math.round(subtotal * DESCUENTO_AUTO_PCT)
        : 0

    let descuentoCupon = 0
    let cuponCodigo: string | null = null
    const codigoPedido = texto(body.cupon, 40).toUpperCase()
    const usuarioIdCrudo = texto(body.usuario_id, 64)
    const usuarioId = ES_UUID.test(usuarioIdCrudo) ? usuarioIdCrudo : null

    if (codigoPedido) {
      const { data: resultado, error: errorCupon } = await supabase.rpc('validar_cupon', {
        p_codigo: codigoPedido,
        p_usuario_id: usuarioId,
        p_subtotal: subtotal,
        p_productos: JSON.stringify(lineas),
      })
      const fila = Array.isArray(resultado) ? resultado[0] : resultado
      if (!errorCupon && fila?.valido) {
        descuentoCupon = Math.max(0, Math.min(Number(fila.descuento_aplicable) || 0, subtotal))
        cuponCodigo = codigoPedido
      }
      // Cupón inválido → se ignora en silencio y se cobra el precio normal.
    }

    const descuentoTotal = Math.min(descuentoAuto + descuentoCupon, subtotal)
    const total = Math.max(0, subtotal + costoEnvio - descuentoTotal)

    if (total <= 0) {
      return NextResponse.json({ error: 'El total del pedido no es válido.' }, { status: 400 })
    }

    // ── 5. Crear el pedido (pendiente hasta que ePayco confirme) ──────────────
    const numeroPedido = generarNumeroPedido()

    const { data: pedido, error: errorPedido } = await supabase
      .from('pedidos')
      .insert([
        {
          numero_pedido: numeroPedido,
          usuario_id: usuarioId,
          nombre_cliente: `${nombre} ${apellido}`.trim(),
          email_cliente: email,
          telefono_cliente: telefono,
          direccion_envio: {
            nombre, apellido, email, telefono, direccion, ciudad, departamento,
            codigoPostal: texto(c.codigoPostal, 20),
            instrucciones: texto(c.instrucciones, 300),
            tipoDocumento, numeroDocumento,
          },
          productos: lineas,
          subtotal,
          descuento_aplicado: descuentoTotal,
          costo_envio: costoEnvio,
          total,
          estado: 'pendiente',
          metodo_pago: metodoPago,
          referencia_pago: numeroPedido,
          notas_cliente: texto(body.notas, 500) || null,
          epayco_test_request: process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === 'true',
        },
      ])
      .select('id, numero_pedido, total, subtotal, costo_envio, descuento_aplicado')
      .single()

    if (errorPedido || !pedido) {
      console.error('[pedidos/crear] Supabase insert:', errorPedido?.message)
      return NextResponse.json({ error: 'No pudimos registrar el pedido. Intenta de nuevo.' }, { status: 502 })
    }

    // ── 6. Sesión de pago, también en el servidor ────────────────────────────
    // El navegador recibe un identificador de sesión, no el importe: la pasarela ya
    // sabe cuánto cobrar porque se lo dijimos nosotros con el total del pedido.
    let sessionId: string | null = null
    let pagoEnLinea: string | null = null
    const total_ = Number(pedido.total)
    if (metodoPago === 'epayco' && total_ > PAGO_MAXIMO_EPAYCO) {
      pagoEnLinea = 'monto_alto'
    } else if (metodoPago === 'epayco' && total_ < PAGO_MINIMO_EPAYCO) {
      pagoEnLinea = 'monto_bajo'
    } else if (metodoPago === 'epayco') {
      const sitio = process.env.NEXT_PUBLIC_URL_BASE || 'https://ventadeacordeones.com'
      const nombrePedido =
        lineas.length === 1
          ? String(lineas[0].nombre).slice(0, 70)
          : `${lineas.length} productos · VentaDeAcordeones.com`
      sessionId = await crearSesionEpayco({
        referencia: pedido.numero_pedido,
        nombreProducto: nombrePedido,
        descripcion: nombrePedido,
        total: Number(pedido.total),
        // Los precios del catálogo ya son finales; el IVA no se desglosa aparte
        // (mismo criterio que tenía el checkout anterior).
        base: Number(pedido.total),
        iva: 0,
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        tipoDocumento: tipoDocumento || 'CC',
        numeroDocumento: numeroDocumento || '0',
        urlRespuesta: `${sitio}/respuesta-epayco?ref=${encodeURIComponent(pedido.numero_pedido)}`,
        urlConfirmacion: `${sitio}/api/epayco/confirmar`,
      })
    }

    // ── 7. Avisos por correo ──────────────────────────────────────────────────
    // Van sin `await`: un correo lento (o Resend caído) no puede dejar al cliente
    // esperando delante del botón de pagar. El pedido ya está guardado.
    const datosCorreo = {
      numeroPedido: pedido.numero_pedido,
      nombreCliente: `${nombre} ${apellido}`.trim(),
      total: Number(pedido.total),
      subtotal: Number(pedido.subtotal),
      costoEnvio: Number(pedido.costo_envio),
      descuento: Number(pedido.descuento_aplicado),
      productos: lineas,
    }

    const alCliente = correoPedidoRegistrado(datosCorreo)
    void enviarCorreo({ para: email, asunto: alCliente.asunto, html: alCliente.html, texto: alCliente.texto })

    const tienda = correoDeLaTienda()
    if (tienda) {
      const aviso = correoAvisoTienda({ ...datosCorreo, email, telefono, ciudad, estado: 'pendiente' })
      void enviarCorreo({ para: tienda, asunto: aviso.asunto, html: aviso.html, texto: aviso.texto, responderA: email })
    }

    return NextResponse.json({
      id: pedido.id,
      numero_pedido: pedido.numero_pedido,
      total: pedido.total,
      subtotal: pedido.subtotal,
      costo_envio: pedido.costo_envio,
      descuento_aplicado: pedido.descuento_aplicado,
      cupon: cuponCodigo,
      productos: lineas,
      sessionId,
      // Cuando el pago en línea no es posible, el pedido igual queda registrado: la venta
      // se cierra por WhatsApp con ese número delante.
      pagoEnLinea: pagoEnLinea || (sessionId ? 'ok' : 'pasarela_caida'),
      limitePagoEnLinea: PAGO_MAXIMO_EPAYCO,
    })
  } catch (error: any) {
    console.error('[pedidos/crear]', error?.message)
    return NextResponse.json({ error: 'Error interno al crear el pedido.' }, { status: 500 })
  }
}
