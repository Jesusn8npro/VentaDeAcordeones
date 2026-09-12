import { obtenerSupabaseAdmin } from './supabaseAdmin'
import { enviarCorreo, correoDeLaTienda } from './correo'
import { correoPedidoPagado, correoAvisoTienda } from './plantillasCorreo'

/**
 * Aplica al pedido el resultado de un cobro de ePayco.
 *
 * Vive aquí y no dentro del webhook porque hay DOS caminos por los que se sabe que un
 * pago se aprobó, y los dos tienen que acabar exactamente igual (mismo cotejo de importe,
 * mismo estado, mismo descuento de stock una sola vez):
 *
 *   1. `/api/epayco/confirmar` — confirmación servidor a servidor de ePayco.
 *   2. `/api/epayco/verificar` — cuando el cliente vuelve de pagar, le preguntamos a
 *      ePayco por el ref de la transacción. No depende del P_KEY, así que este es el
 *      camino que sostiene la tienda mientras el P_KEY no esté configurado.
 *
 * El que llegue primero cobra; el segundo ve `duplicado: true` y no toca nada.
 */

const APROBADO = new Set(['1'])

export function normalizarMonto(v: unknown): number {
  const n = Number(String(v ?? '').replace(/,/g, ''))
  return Number.isFinite(n) ? n : NaN
}

export function esAprobado(codResponse: unknown, response: unknown): boolean {
  return APROBADO.has(String(codResponse ?? '')) || String(response ?? '') === 'Aceptada'
}

export interface ResultadoPago {
  ok: boolean
  estado: 'pagado' | 'pendiente' | 'rechazado' | 'revision' | 'sin_pedido' | 'sin_base'
  duplicado?: boolean
  numeroPedido?: string
  error?: string
  codigoHttp?: number
}

/**
 * `datos` son los campos x_* de ePayco, vengan de la confirmación o de la API de validación.
 * `origen` solo se usa para la traza.
 */
export async function aplicarPagoEpayco(
  datos: Record<string, any>,
  origen: 'confirmacion' | 'verificacion',
): Promise<ResultadoPago> {
  const supabase = obtenerSupabaseAdmin()
  if (!supabase) {
    console.error(`[epayco/${origen}] Falta SUPABASE_SERVICE_ROLE_KEY: no se pudo registrar el pago`)
    return { ok: false, estado: 'sin_base', error: 'Base de datos no disponible', codigoHttp: 503 }
  }

  const {
    x_ref_payco, x_transaction_id, x_amount, x_currency_code, x_cod_response, x_response,
    x_id_invoice, x_id_factura, x_extra1, x_approval_code, x_franchise, x_bank_name,
    x_fecha_transaccion, x_test_request, x_signature,
  } = datos

  const pagoAprobado = esAprobado(x_cod_response, x_response)

  // Traza de TODA respuesta recibida, antes de tocar el pedido. Las columnas son las que
  // ya tenía `transacciones_epayco_logs` (se creó antes, con otros nombres de campo).
  try {
    await supabase.from('transacciones_epayco_logs').insert([
      {
        epayco_ref_payco: String(x_ref_payco ?? ''),
        epayco_transaction_id: String(x_transaction_id ?? ''),
        tipo_evento: origen,
        estado_nuevo: pagoAprobado ? 'pagado' : String(x_response ?? 'rechazado'),
        cod_response: String(x_cod_response ?? ''),
        mensaje_response: `${x_response ?? ''} · ${normalizarMonto(x_amount)} ${String(x_currency_code ?? '')} · pedido ${String(x_id_invoice ?? x_id_factura ?? '-')}`,
        signature_valida: origen === 'confirmacion' ? Boolean(x_signature) : true,
      },
    ])
  } catch {
    /* el registro es para auditar, nunca para bloquear un cobro */
  }

  // ── Localizar el pedido: por numero_pedido (el invoice) y, si no, por id (x_extra1) ──
  const referencia = String(x_id_invoice || x_id_factura || '').trim()
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
    console.error(`[epayco/${origen}] Pedido no encontrado (invoice=${referencia || '-'}, extra1=${idExtra || '-'})`)
    return { ok: false, estado: 'sin_pedido', error: 'Pedido no encontrado', codigoHttp: 404 }
  }

  // Los datos del cliente hacen falta para el correo de "pago aprobado". Van en una
  // consulta aparte porque el select de arriba solo pide lo justo para cobrar.
  const { data: cliente } = await supabase
    .from('pedidos')
    .select('nombre_cliente, email_cliente, telefono_cliente, subtotal, costo_envio, descuento_aplicado, direccion_envio')
    .eq('id', pedido.id)
    .maybeSingle()

  // ── El dinero recibido tiene que coincidir con lo que vale el pedido ──────────────
  const montoPagado = normalizarMonto(x_amount)
  const totalPedido = normalizarMonto(pedido.total)
  const moneda = String(x_currency_code || '').toUpperCase()

  if (pagoAprobado) {
    if (moneda !== 'COP') {
      console.error(`[epayco/${origen}] Moneda inesperada ${moneda} en pedido ${pedido.numero_pedido}`)
      return { ok: false, estado: 'revision', numeroPedido: pedido.numero_pedido, error: 'Moneda no válida', codigoHttp: 409 }
    }
    // Tolerancia de 1 peso por redondeos de la pasarela.
    if (!Number.isFinite(montoPagado) || Math.abs(montoPagado - totalPedido) > 1) {
      console.error(`[epayco/${origen}] Monto no coincide en ${pedido.numero_pedido}: pagado ${montoPagado}, pedido ${totalPedido}`)
      await supabase
        .from('pedidos')
        .update({
          estado: 'revision',
          notas_admin: `Monto recibido ${montoPagado} != total ${totalPedido}`,
          actualizado_el: new Date().toISOString(),
        })
        .eq('id', pedido.id)
      return { ok: false, estado: 'revision', numeroPedido: pedido.numero_pedido, error: 'El monto no coincide con el pedido', codigoHttp: 409 }
    }
  }

  const datosPago = {
    epayco_ref_payco: String(x_ref_payco ?? ''),
    epayco_transaction_id: String(x_transaction_id ?? ''),
    epayco_cod_response: String(x_cod_response ?? ''),
    epayco_signature: String(x_signature ?? ''),
    epayco_approval_code: x_approval_code ?? null,
    epayco_franchise: x_franchise ?? null,
    epayco_bank_name: x_bank_name ?? null,
    epayco_fecha_transaccion: x_fecha_transaccion ? new Date(x_fecha_transaccion).toISOString() : null,
    epayco_test_request: x_test_request === 'TRUE' || x_test_request === true,
    epayco_response_raw: datos,
    referencia_pago: pedido.numero_pedido,
    actualizado_el: new Date().toISOString(),
  }

  if (!pagoAprobado) {
    await supabase
      .from('pedidos')
      .update({ ...datosPago, estado: String(x_cod_response) === '3' ? 'pendiente' : 'rechazado' })
      .eq('id', pedido.id)
      .neq('estado', 'pagado')
    return {
      ok: true,
      estado: String(x_cod_response) === '3' ? 'pendiente' : 'rechazado',
      numeroPedido: pedido.numero_pedido,
    }
  }

  // ── Idempotencia: solo la PRIMERA aprobación descuenta stock ──────────────────────
  const { data: actualizados, error: errorUpdate } = await supabase
    .from('pedidos')
    .update({ ...datosPago, estado: 'pagado' })
    .eq('id', pedido.id)
    .neq('estado', 'pagado')
    .select('id')

  if (errorUpdate) {
    console.error(`[epayco/${origen}] Error actualizando pedido:`, errorUpdate.message)
    return { ok: false, estado: 'pagado', numeroPedido: pedido.numero_pedido, error: 'No se pudo guardar el pago', codigoHttp: 500 }
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

  // ── Correos: solo en la PRIMERA aprobación, para no repetirlos en cada reintento ──
  // Sin `await`: ePayco espera una respuesta rápida de este webhook y un correo lento
  // haría que reintentara la confirmación.
  if (primeraVez) {
    const datosCorreo = {
      numeroPedido: pedido.numero_pedido,
      nombreCliente: String(cliente?.nombre_cliente || 'cliente'),
      total: totalPedido,
      subtotal: Number(cliente?.subtotal) || undefined,
      costoEnvio: Number(cliente?.costo_envio) || undefined,
      descuento: Number(cliente?.descuento_aplicado) || undefined,
      productos: Array.isArray(pedido.productos) ? pedido.productos : [],
    }

    const correoCliente = String(cliente?.email_cliente || '').trim()
    if (correoCliente) {
      const aviso = correoPedidoPagado(datosCorreo)
      void enviarCorreo({ para: correoCliente, asunto: aviso.asunto, html: aviso.html, texto: aviso.texto })
    }

    const tienda = correoDeLaTienda()
    if (tienda) {
      const interno = correoAvisoTienda({
        ...datosCorreo,
        email: correoCliente || undefined,
        telefono: String(cliente?.telefono_cliente || '') || undefined,
        ciudad: (cliente?.direccion_envio as any)?.ciudad || undefined,
        estado: 'pagado',
      })
      void enviarCorreo({
        para: tienda,
        asunto: interno.asunto,
        html: interno.html,
        texto: interno.texto,
        responderA: correoCliente || undefined,
      })
    }
  }

  return { ok: true, estado: 'pagado', duplicado: !primeraVez, numeroPedido: pedido.numero_pedido }
}
