import { NextResponse } from 'next/server'
import { actualizarFeed } from '../../../../api/meta/actualizacion-automatica'
import { ipDe, permitir } from '../../_lib/rateLimit'
import { obtenerSupabaseAdmin } from '../../_lib/supabaseAdmin'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// POST /api/meta/actualizar-feed — endpoint de administración.
// Exige Authorization: Bearer <ADMIN_API_KEY>. Si la variable NO está definida
// responde 401 en vez de dejar pasar: antes se abría al no estar configurada, y
// este endpoint ejecuta tareas con service role (incluida la creación de buckets
// públicos), así que "abierto por falta de configuración" es un fallo grave.
export async function POST(req: Request) {
  if (!permitir(ipDe(req), 60)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta en un minuto.' },
      { status: 429 }
    )
  }

  // Dos formas de entrar, las dos comprobadas en el servidor:
  //
  //  a) Bearer ADMIN_API_KEY — para cron y llamadas desde fuera.
  //  b) La sesion del admin — para el boton del panel. Antes solo existia (a), y el
  //     boton "Generar feed manual" se quedaba en 401 para siempre porque la clave no
  //     puede viajar al navegador sin volverse publica.
  const apiKey = process.env.ADMIN_API_KEY
  const authHeader = req.headers.get('authorization') || ''
  let autorizado = Boolean(apiKey) && authHeader === `Bearer ${apiKey}`

  if (!autorizado) {
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : ''
    const supabase = obtenerSupabaseAdmin()
    if (token && supabase) {
      const { data: sesion } = await supabase.auth.getUser(token)
      const id = sesion?.user?.id
      if (id) {
        const { data: perfil } = await supabase.from('usuarios').select('rol').eq('id', id).maybeSingle()
        autorizado = perfil?.rol === 'admin'
      }
    }
  }

  if (!autorizado) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  try {
    const resultado = await actualizarFeed()
    return NextResponse.json(resultado, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { exito: false, error: error?.message },
      { status: 500 }
    )
  }
}
