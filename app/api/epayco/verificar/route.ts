import { NextResponse } from 'next/server'
import { leerBody } from '../../_lib/parseBody'
import { ipDe, permitir } from '../../_lib/rateLimit'
import { aplicarPagoEpayco } from '../../_lib/aplicarPago'
import { consultarTransaccionEpayco } from '../../_lib/epayco'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Verificación del pago al volver de ePayco ────────────────────────────────
// La llama la pantalla /respuesta-epayco con el `ref_payco` que ePayco pone en la
// URL de retorno.
//
// Por qué hace falta teniendo ya el webhook: la firma de la confirmación se calcula
// con el P_KEY del panel de ePayco. Mientras ese P_KEY no esté puesto, ninguna
// confirmación cuadra y el cliente pagaría sin que la tienda se entere. Aquí no hace
// falta ninguna clave: se le pregunta a la API pública de validación de ePayco por ese
// ref y su respuesta es la que se guarda.
//
// Seguro aunque el ref venga del navegador: lo único que se acepta del cliente es el
// identificador de la transacción. El importe, el pedido y el estado salen de la
// respuesta de ePayco, y `aplicarPagoEpayco` sigue exigiendo que el importe cuadre con
// el total del pedido. Inventarse un ref no sirve: o no existe, o corresponde a un pago
// cuyo importe no casa con el pedido que se quiera activar.

export async function POST(req: Request) {
  if (!permitir(ipDe(req), 20)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 })
  }

  try {
    const body = await leerBody(req)
    const ref = String(body?.ref_payco || body?.x_ref_payco || '').trim()

    if (!/^[A-Za-z0-9._-]{4,64}$/.test(ref)) {
      return NextResponse.json({ error: 'Referencia no válida.' }, { status: 400 })
    }

    const datos = await consultarTransaccionEpayco(ref)
    if (!datos) {
      return NextResponse.json({ verificado: false, error: 'ePayco no devolvió datos para esa referencia.' }, { status: 404 })
    }

    const resultado = await aplicarPagoEpayco(datos, 'verificacion')

    return NextResponse.json(
      {
        verificado: true,
        estado: resultado.estado,
        numero_pedido: resultado.numeroPedido ?? null,
        duplicado: resultado.duplicado ?? false,
        error: resultado.error,
      },
      { status: resultado.codigoHttp ?? 200 },
    )
  } catch (error: any) {
    console.error('[epayco/verificar]', error?.message)
    return NextResponse.json({ error: 'No pudimos verificar el pago.' }, { status: 500 })
  }
}
