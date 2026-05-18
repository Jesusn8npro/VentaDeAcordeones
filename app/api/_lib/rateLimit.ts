// Rate limiter en memoria — réplica del de server.js (ventana 60s).
// EasyPanel corre un único proceso `next start` persistente → el Map es global
// como antes. Valores: default 60/min; confirmar 20; validar-firma 30.
type Estado = { count: number; inicio: number }
const intentos = new Map<string, Estado>()
const VENTANA_MS = 60_000

export function ipDe(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  return (xff ? xff.split(',')[0]!.trim() : '') || 'desconocida'
}

/** Devuelve true si la petición está permitida; false si excede el límite. */
export function permitir(ip: string, max = 60): boolean {
  const ahora = Date.now()
  const datos = intentos.get(ip) || { count: 0, inicio: ahora }
  if (ahora - datos.inicio > VENTANA_MS) {
    datos.count = 0
    datos.inicio = ahora
  }
  datos.count++
  intentos.set(ip, datos)
  return datos.count <= max
}
