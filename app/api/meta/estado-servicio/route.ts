import { NextResponse } from 'next/server'
// @ts-ignore — módulo backend JS intacto
import { obtenerEstadisticasFeed } from '../../../../api/meta/actualizacion-automatica.js'
import { ipDe, permitir } from '../../_lib/rateLimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// PORT de GET /api/meta/estado-servicio (server.js).
export async function GET(req: Request) {
  if (!permitir(ipDe(req), 60)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta en un minuto.' },
      { status: 429 }
    )
  }
  try {
    const estadisticas = await obtenerEstadisticasFeed()
    return NextResponse.json({
      servicio: 'Feed Meta - Actualización Automática',
      estado: 'activo',
      configuracion: { frecuencia: '60 minutos' },
      estadisticas,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Error al obtener estado', mensaje: error?.message },
      { status: 500 }
    )
  }
}
