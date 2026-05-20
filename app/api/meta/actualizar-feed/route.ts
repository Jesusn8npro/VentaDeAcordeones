import { NextResponse } from 'next/server'
import { actualizarFeed } from '../../../../api/meta/actualizacion-automatica'
import { ipDe, permitir } from '../../_lib/rateLimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PORT de POST /api/meta/actualizar-feed (server.js). Auth admin idéntica:
// si ADMIN_API_KEY está definida, exige Authorization: Bearer <key>;
// si no está definida, permite (entorno dev) — igual que autenticarAdmin().
export async function POST(req: Request) {
  if (!permitir(ipDe(req), 60)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta en un minuto.' },
      { status: 429 }
    )
  }

  const apiKey = process.env.ADMIN_API_KEY
  if (apiKey) {
    const authHeader = req.headers.get('authorization') || ''
    if (authHeader !== `Bearer ${apiKey}`) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }
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
