// Lee el body del request como objeto plano.
//
// server.js usaba express.json() (solo JSON). ePayco normalmente envía la
// confirmación como application/x-www-form-urlencoded. Para NO romper pagos
// reales, este parser acepta JSON **y** form-urlencoded/multipart (superset:
// no altera el caso JSON). El cálculo HMAC posterior es byte-idéntico a
// server.js. (Decisión documentada en MIGRACION_PENDIENTES.md / plan de prueba.)
export async function leerBody(req: Request): Promise<Record<string, any>> {
  const ct = (req.headers.get('content-type') || '').toLowerCase()
  try {
    if (ct.includes('application/json')) {
      return (await req.json()) ?? {}
    }
    if (
      ct.includes('application/x-www-form-urlencoded') ||
      ct.includes('multipart/form-data')
    ) {
      const fd = await req.formData()
      return Object.fromEntries(fd.entries())
    }
    // Sin content-type fiable: intentar JSON y si falla, urlencoded.
    const txt = await req.text()
    if (!txt) return {}
    try {
      return JSON.parse(txt)
    } catch {
      return Object.fromEntries(new URLSearchParams(txt).entries())
    }
  } catch {
    return {}
  }
}
