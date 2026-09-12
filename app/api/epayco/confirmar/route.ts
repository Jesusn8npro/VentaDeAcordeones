import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { leerBody } from '../../_lib/parseBody'
import { ipDe, permitir } from '../../_lib/rateLimit'
import { aplicarPagoEpayco, esAprobado } from '../../_lib/aplicarPago'
import { consultarTransaccionEpayco } from '../../_lib/epayco'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── ePayco: confirmación de pago (servidor a servidor) ───────────────────────
// Una de las dos vías por las que un pedido pasa a 'pagado' y se descuenta stock.
// El navegador no puede hacerlo por su cuenta (antes sí: bastaba un postMessage
// falso para cobrar $0 y vaciar el inventario).
//
// URL que debe estar registrada en el panel de ePayco y en NEXT_PUBLIC_EPAYCO_URL_CONFIRMATION:
//   https://ventadeacordeones.com/api/epayco/confirmar
// (Antes apuntaba a /confirmacion-epayco, que es una página 'use client': ePayco
//  hacía POST contra ella y no se ejecutaba nada, así que ningún pago se confirmaba.)
//
// Cómo casa el pedido: ePayco devuelve en `x_id_invoice` la referencia que le
// enviamos al abrir el checkout, que es `pedidos.numero_pedido`. `x_ref_payco` es
// el identificador de ePayco, NO nuestro número de pedido: buscar por ahí nunca
// encontraba nada.
//
// ⚠️ La firma se calcula con el **P_KEY** del panel de ePayco, que NO es el
// PRIVATE_KEY. Si el P_KEY no está configurado, la firma jamás cuadra. Por eso,
// cuando la firma falla, no se descarta el aviso: se le pregunta a la API pública
// de validación de ePayco qué pasó de verdad con ese ref. Esa consulta no lleva
// claves y su respuesta es la que manda, así que nadie puede falsificar un cobro
// inventándose un POST.

export async function POST(req: Request) {
  if (!permitir(ipDe(req), 60)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 })
  }

  try {
    const body = await leerBody(req)
    const { x_ref_payco, x_transaction_id, x_amount, x_currency_code, x_signature, x_cod_response, x_response } = body

    const pKey = process.env.EPAYCO_P_KEY || process.env.EPAYCO_PRIVATE_KEY
    // El customer id sale del entorno, no del cuerpo de la petición: es un dato
    // NUESTRO y no algo que el emisor pueda elegir.
    const custId = process.env.EPAYCO_CUST_ID || process.env.EPAYCO_CUSTOMER_ID || body.x_cust_id_cliente

    // Firma oficial de ePayco: p_cust_id_cliente ^ p_key ^ x_ref_payco ^ x_transaction_id ^ x_amount ^ x_currency_code
    let firmaOk = false
    if (pKey && custId) {
      const mensaje = `${custId}^${pKey}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`
      const firmaCalculada = crypto.createHash('sha256').update(mensaje).digest('hex')
      const firmaRecibida = String(x_signature || '').toLowerCase()
      firmaOk =
        firmaRecibida.length === firmaCalculada.length &&
        crypto.timingSafeEqual(Buffer.from(firmaCalculada), Buffer.from(firmaRecibida))
    } else {
      console.warn('[epayco/confirmar] Sin EPAYCO_P_KEY o EPAYCO_CUST_ID: se verificará contra la API de ePayco')
    }

    // ── Camino A: firma válida. Los datos del POST son de fiar. ────────────────
    if (firmaOk) {
      const resultado = await aplicarPagoEpayco(body, 'confirmacion')
      return NextResponse.json(
        {
          valida: true,
          aprobado: resultado.estado === 'pagado',
          registrado: resultado.ok,
          duplicado: resultado.duplicado,
          numero_pedido: resultado.numeroPedido,
          ref_payco: x_ref_payco,
          error: resultado.error,
        },
        { status: resultado.codigoHttp ?? 200 },
      )
    }

    // ── Camino B: la firma no cuadra. No se cree nada del POST: se le pregunta a ePayco. ──
    console.warn(`[epayco/confirmar] Firma inválida para ref_payco=${x_ref_payco}; consultando a ePayco`)
    const verificado = await consultarTransaccionEpayco(String(x_ref_payco || ''))

    if (!verificado) {
      return NextResponse.json({ valida: false, error: 'Firma de pago inválida' }, { status: 400 })
    }

    // Se usan los datos que devuelve ePayco, NUNCA los del cuerpo recibido: así un POST
    // falso con un ref real de otra compra no puede cambiar importe ni pedido.
    const resultado = await aplicarPagoEpayco(verificado, 'confirmacion')
    return NextResponse.json(
      {
        valida: true,
        verificado_contra_epayco: true,
        aprobado: resultado.estado === 'pagado' && esAprobado(verificado.x_cod_response, verificado.x_response),
        registrado: resultado.ok,
        duplicado: resultado.duplicado,
        numero_pedido: resultado.numeroPedido,
        ref_payco: x_ref_payco,
        error: resultado.error,
      },
      { status: resultado.codigoHttp ?? 200 },
    )
  } catch (error: any) {
    console.error('[epayco/confirmar]', error?.message)
    return NextResponse.json({ error: 'Error interno al confirmar pago' }, { status: 500 })
  }
}
