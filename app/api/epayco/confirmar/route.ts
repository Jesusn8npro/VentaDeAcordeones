import { NextResponse } from 'next/server'
import crypto from 'node:crypto'
import { leerBody } from '../../_lib/parseBody'
import { ipDe, permitir } from '../../_lib/rateLimit'
import { obtenerSupabaseAdmin } from '../../_lib/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── ePayco: confirmación de pago (servidor a servidor) ───────────────────────
// ESTA es la única vía por la que un pedido pasa a 'pagado' y por la que se
// descuenta stock. El navegador ya no puede hacerlo (antes sí: bastaba un
// postMessage falso para cobrar $0 y vaciar el inventario).
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

const APROBADO = new Set(['1'])

function normalizarMonto(v: unknown): number {
  const n = Number(String(v ?? '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : NaN
}

export async function POST(req: Request) {
  if (!permitir(ipDe(req), 60)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 })
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
      x_id_invoice,
      x_extra1,
      x_approval_code,
      x_franchise,
      x_bank_name,
      x_fecha_transaccion,
      x_test_request,
    } = body

    const pKey = process.env.EPAYCO_PRIVATE_KEY || process.env.EPAYCO_P_KEY
    // El customer id sale del entorno, no del cuerpo de la petición: es un dato
    // NUESTRO y no algo que el emisor pueda elegir.
    const custId =
      process.env.EPAYCO_CUST_ID ||
      process.env.EPAYCO_CUSTOMER_ID ||
      body.x_cust_id_cliente

    if (!pKey || !custId) {
      console.error('[epayco/confirmar] Falta EPAYCO_P_KEY o EPAYCO_CUST_ID en el entorno')
      return NextResponse.json({ error: 'Configuración de pago incompleta en el servidor' }, { status: 500 })
    }
    if (!process.env.EPAYCO_CUST_ID && !process.env.EPAYCO_CUSTOMER_ID) {
      console.warn('[epayco/confirmar] EPAYCO_CUST_ID no definida: usando el valor recibido en la petición')
    }

    // Firma oficial de ePayco: p_cust_id_cliente ^ p_key ^ x_ref_payco ^ x_transaction_id ^ x_amount ^ x_currency_code
    const mensaje = `${custId}^${pKey}^${x_ref_payco}^${x_transaction_id}^${x_amount}^${x_currency_code}`
    const firmaCalculada = crypto.createHash('sha256').update(mensaje).digest('hex')

    const firmaRecibida = String(x_signature || '')
    const firmaOk =
      firmaRecibida.length === firmaCalculada.length &&
      crypto.timingSafeEqual(Buffer.from(firmaCalculada), Buffer.from(firmaRecibida))

    if (!firmaOk) {
      console.warn(`[epayco/confirmar] Firma inválida para ref_payco=${x_ref_payco}`)
      return NextResponse.json({ valida: false, error: 'Firma de pago inválida' }, { status: 400 })
    }

    const pagoAprobado = APROBADO.has(String(x_cod_response)) || x_response === 'Aceptada'
    const supabase = obtenerSupabaseAdmin()

    if (!supabase) {
      console.error('[epayco/confirmar] Falta SUPABASE_SERVICE_ROLE_KEY: no se pudo registrar el pago')
      return NextResponse.json({ valida: true, aprobado: pagoAprobado, registrado: false })
    }

    // Traza de TODA confirmación recibida (aprobada o no), antes de tocar el pedido.
    // Las columnas son las que ya tenía la tabla `transacciones_epayco_logs` del proyecto
    // (se creó antes, con otro nombre de campos): por eso no se usan `ref_payco` ni
    // `numero_pedido` a secas. Si el insert falla, el cobro sigue su curso igualmente.
    try {
      await supabase.from('transacciones_epayco_logs').insert([
        {
          epayco_ref_payco: String(x_ref_payco ?? ''),
          epayco_transaction_id: String(x_transaction_id ?? ''),
          tipo_evento: 'confirmacion',
          estado_nuevo: pagoAprobado ? 'pagado' : String(x_response ?? 'rechazado'),
          cod_response: String(x_cod_response ?? ''),
          mensaje_response: `${x_response ?? ''} · ${normalizarMonto(x_amount)} ${String(x_currency_code ?? '')} · pedido ${String(x_id_invoice ?? '—')}`,
          signature_valida: true,
        },
      ])
    } catch {
      /* el registro es para auditar, nunca para bloquear un cobro */
    }

    // ── Localizar el pedido: por numero_pedido (x_id_invoice) y, si no, por id (x_extra1) ──
    const referencia = String(x_id_invoice || '').trim()
    const idExtra = String(x_extra1 || '').trim()

    let pedido: any = null
    if (referencia) {
      const { data } = await supabase
        .from('pedidos')
        .select('id, numero_pedido, total, estado, productos')
        .eq('numero_pedido', referencia)
        .maybeSingle()
      pedido = data
    }
    if (!pedido && idExtra) {
      const { data } = await supabase
        .from('pedidos')
        .select('id, numero_pedido, total, estado, productos')
        .eq('id', idExtra)
        .maybeSingle()
      pedido = data
    }

    if (!pedido) {
      console.error(`[epayco/confirmar] Pedido no encontrado (invoice=${referencia || '—'}, extra1=${idExtra || '—'})`)
      return NextResponse.json({ valida: true, aprobado: pagoAprobado, registrado: false, error: 'Pedido no encontrado' }, { status: 404 })
    }

    // ── El dinero recibido tiene que coincidir con lo que vale el pedido ──────
    const montoPagado = normalizarMonto(x_amount)
    const totalPedido = normalizarMonto(pedido.total)
    const moneda = String(x_currency_code || '').toUpperCase()

    if (pagoAprobado) {
      if (moneda !== 'COP') {
        console.error(`[epayco/confirmar] Moneda inesperada ${moneda} en pedido ${pedido.numero_pedido}`)
        return NextResponse.json({ valida: true, aprobado: false, error: 'Moneda no válida' }, { status: 409 })
      }
      // Tolerancia de 1 peso por redondeos de la pasarela.
      if (!Number.isFinite(montoPagado) || Math.abs(montoPagado - totalPedido) > 1) {
        console.error(
          `[epayco/confirmar] Monto no coincide en ${pedido.numero_pedido}: pagado ${montoPagado}, pedido ${totalPedido}`,
        )
        await supabase
          .from('pedidos')
          .update({ estado: 'revision', notas_admin: `Monto recibido ${montoPagado} ≠ total ${totalPedido}`, actualizado_el: new Date().toISOString() })
          .eq('id', pedido.id)
        return NextResponse.json({ valida: true, aprobado: false, error: 'El monto no coincide con el pedido' }, { status: 409 })
      }
    }

    const datosPago = {
      epayco_ref_payco: String(x_ref_payco ?? ''),
      epayco_transaction_id: String(x_transaction_id ?? ''),
      epayco_cod_response: String(x_cod_response ?? ''),
      epayco_signature: firmaRecibida,
      epayco_approval_code: x_approval_code ?? null,
      epayco_franchise: x_franchise ?? null,
      epayco_bank_name: x_bank_name ?? null,
      epayco_fecha_transaccion: x_fecha_transaccion ? new Date(x_fecha_transaccion).toISOString() : null,
      epayco_test_request: x_test_request === 'TRUE' || x_test_request === true,
      epayco_response_raw: body,
      referencia_pago: pedido.numero_pedido,
      actualizado_el: new Date().toISOString(),
    }

    if (!pagoAprobado) {
      await supabase
        .from('pedidos')
        .update({ ...datosPago, estado: String(x_cod_response) === '3' ? 'pendiente' : 'rechazado' })
        .eq('id', pedido.id)
        .neq('estado', 'pagado')
      return NextResponse.json({ valida: true, aprobado: false, ref_payco: x_ref_payco })
    }

    // ── Idempotencia: solo la PRIMERA confirmación aprobada descuenta stock ───
    const { data: actualizados, error: errorUpdate } = await supabase
      .from('pedidos')
      .update({ ...datosPago, estado: 'pagado' })
      .eq('id', pedido.id)
      .neq('estado', 'pagado')
      .select('id')

    if (errorUpdate) {
      console.error('[epayco/confirmar] Error actualizando pedido:', errorUpdate.message)
      return NextResponse.json({ valida: true, aprobado: true, registrado: false }, { status: 500 })
    }

    const primeraVez = Array.isArray(actualizados) && actualizados.length > 0

    if (primeraVez) {
      const lineas = Array.isArray(pedido.productos) ? pedido.productos : []
      for (const linea of lineas) {
        const productoId = linea?.producto_id || linea?.id
        const cantidad = Number(linea?.cantidad) || 0
        if (!productoId || cantidad <= 0) continue
        const { data: prod } = await supabase.from('productos').select('stock').eq('id', productoId).maybeSingle()
        if (prod && typeof prod.stock === 'number') {
          await supabase
            .from('productos')
            .update({ stock: Math.max(0, prod.stock - cantidad) })
            .eq('id', productoId)
        }
      }
    }

    return NextResponse.json({
      valida: true,
      aprobado: true,
      registrado: true,
      duplicado: !primeraVez,
      ref_payco: x_ref_payco,
      numero_pedido: pedido.numero_pedido,
    })
  } catch (error: any) {
    console.error('[epayco/confirmar]', error?.message)
    return NextResponse.json({ error: 'Error interno al confirmar pago' }, { status: 500 })
  }
}
