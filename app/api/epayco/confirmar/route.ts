import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { leerBody } from '../../_lib/parseBody'
import { ipDe, permitir } from '../../_lib/rateLimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── ePayco: confirmación de pago con validación HMAC-SHA256 ──────────────────
// PORT byte-idéntico de POST /api/epayco/confirmar (server.js). Mismo path,
// mismo cálculo de firma, mismas envs. ePayco llama esta URL desde sus
// servidores (registrada en el panel ePayco) — NO cambiar path ni HMAC.
export async function POST(req: Request) {
  if (!permitir(ipDe(req), 20)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta en un minuto.' },
      { status: 429 }
    )
  }

  try {
    const body = await leerBody(req)
    const {
      x_ref_payco,
      x_transaction_id,
      x_amount,
      x_currency_code,
      x_signature,
      x_cod_response,
      x_response,
      x_cust_id_cliente,
    } = body

    const pKey = process.env.EPAYCO_PRIVATE_KEY || process.env.EPAYCO_P_KEY
    const custId = x_cust_id_cliente || process.env.VITE_EPAYCO_CUSTOMER_ID

    if (!pKey) {
      console.error('EPAYCO_P_KEY no configurada — validación de firma omitida')
      return NextResponse.json(
        { error: 'Configuración de pago incompleta en el servidor' },
        { status: 500 }
      )
    }

    // Validación HMAC-SHA256 según documentación ePayco (IDÉNTICO a server.js)
    const mensaje = `${custId}^${pKey}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`
    const firmaCalculada = crypto.createHash('sha256').update(mensaje).digest('hex')

    if (firmaCalculada !== x_signature) {
      console.warn(`Firma inválida para ref_payco=${x_ref_payco}`)
      return NextResponse.json(
        { valida: false, error: 'Firma de pago inválida' },
        { status: 400 }
      )
    }

    const pagoAprobado = x_cod_response === '1' || x_response === 'Aceptada'

    if (
      pagoAprobado &&
      process.env.SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
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

    return NextResponse.json({
      valida: true,
      aprobado: pagoAprobado,
      ref_payco: x_ref_payco,
    })
  } catch (error: any) {
    console.error('Error en /api/epayco/confirmar:', error?.message)
    return NextResponse.json(
      { error: 'Error interno al confirmar pago' },
      { status: 500 }
    )
  }
}
