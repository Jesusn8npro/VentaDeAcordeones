import { NextResponse } from 'next/server'
import { ipDe, permitir } from '../../_lib/rateLimit'
import { obtenerSupabaseAdmin } from '../../_lib/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ── Estado de un pedido por su número ────────────────────────────────────────
// Lo usa la pantalla a la que vuelve el cliente después de pagar. Hace falta porque
// las políticas de la base de datos ya no dejan que el navegador lea la tabla de
// pedidos, y porque quien compra como invitado no tiene sesión con la que
// identificarse.
//
// Solo devuelve lo justo para decir "tu pedido está pagado / pendiente": ni dirección,
// ni teléfono, ni correo, ni datos de la tarjeta. El número de pedido lleva marca de
// tiempo y un aleatorio, así que no se puede ir probando de uno en uno, y el límite de
// peticiones remata esa puerta.

export async function GET(req: Request) {
  if (!permitir(ipDe(req), 30)) {
    return NextResponse.json({ error: 'Demasiadas consultas.' }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const referencia = (searchParams.get('ref') || '').trim()

  if (!/^VDA-\d{10,16}-\d{1,4}$/.test(referencia)) {
    return NextResponse.json({ error: 'Referencia no válida.' }, { status: 400 })
  }

  const supabase = obtenerSupabaseAdmin()
  if (!supabase) {
    return NextResponse.json({ error: 'No podemos consultar el pedido ahora mismo.' }, { status: 503 })
  }

  const { data, error } = await supabase
    .from('pedidos')
    .select('numero_pedido, estado, total, creado_el, productos, metodo_pago')
    .eq('numero_pedido', referencia)
    .maybeSingle()

  if (error) {
    console.error('[pedidos/estado]', error.message)
    return NextResponse.json({ error: 'No podemos consultar el pedido ahora mismo.' }, { status: 502 })
  }
  if (!data) {
    return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 })
  }

  return NextResponse.json({
    numero_pedido: data.numero_pedido,
    estado: data.estado,
    total: data.total,
    creado_el: data.creado_el,
    metodo_pago: data.metodo_pago,
    // Solo nombre y cantidad: el cliente reconoce su compra sin exponer nada más.
    productos: (Array.isArray(data.productos) ? data.productos : []).map((p: any) => ({
      nombre: p?.nombre,
      cantidad: p?.cantidad,
    })),
  })
}
