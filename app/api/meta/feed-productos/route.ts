import { NextResponse } from 'next/server'
import { generarFeedXML } from '../../../../api/meta/feed-productos'
import { ipDe, permitir } from '../../_lib/rateLimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PORT de GET /api/meta/feed-productos (server.js). Meta/Facebook Commerce
// consume este XML. Mismo Content-Type / Cache-Control; CORS '*' (server.js
// tenía app.use(cors()) global).
export async function GET(req: Request) {
  if (!permitir(ipDe(req), 60)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta en un minuto.' },
      { status: 429 }
    )
  }
  try {
    const xml = await generarFeedXML()
    return new NextResponse(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al generar feed', mensaje: error?.message },
      { status: 500 }
    )
  }
}
