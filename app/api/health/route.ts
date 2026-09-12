import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET /api/health — sonda de vida para EasyPanel. Solo dice que el proceso responde:
// NODE_ENV y PORT se quitaron porque describen el despliegue a cualquiera que pregunte.
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
