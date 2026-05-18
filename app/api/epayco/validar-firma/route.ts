import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { leerBody } from '../../_lib/parseBody'
import { ipDe, permitir } from '../../_lib/rateLimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PORT byte-idéntico de POST /api/epayco/validar-firma (server.js).
// Lo llama el frontend para validar la firma de respuesta de ePayco.
export async function POST(req: Request) {
  if (!permitir(ipDe(req), 30)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta en un minuto.' },
      { status: 429 }
    )
  }

  const body = await leerBody(req)
  const {
    x_ref_payco,
    x_transaction_id,
    x_amount,
    x_currency_code,
    x_signature,
    x_cust_id_cliente,
  } = body

  const pKey = process.env.EPAYCO_PRIVATE_KEY || process.env.EPAYCO_P_KEY
  const custId = x_cust_id_cliente || process.env.VITE_EPAYCO_CUSTOMER_ID

  if (!pKey) return NextResponse.json({ valida: null, motivo: 'sin_configuracion' })

  const mensaje = `${custId}^${pKey}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`
  const firmaCalculada = crypto.createHash('sha256').update(mensaje).digest('hex')
  const valida = firmaCalculada === x_signature

  if (!valida) console.warn(`Firma inválida en validar-firma para ref=${x_ref_payco}`)

  return NextResponse.json({ valida })
}
