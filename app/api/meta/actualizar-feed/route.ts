import { NextResponse } from 'next/server'
import { actualizarFeed } from '../../../../api/meta/actualizacion-automatica'
import { ipDe, permitir } from '../../_lib/rateLimit'

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

  const apiKey = process.env.ADMIN_API_KEY
  if (!apiKey) {
    console.error('[meta/actualizar-feed] ADMIN_API_KEY no configurada: endpoint cerrado')
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  const authHeader = req.headers.get('authorization') || ''
  if (authHeader !== `Bearer ${apiKey}`) {
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
