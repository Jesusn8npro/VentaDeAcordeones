// Reemplaza el arranque de server.js (app.listen callback):
//   asegurarBucketFeedsMeta() → iniciarServicioActualizacion() (setInterval
//   60min + actualización inicial) → configurarWebhookProductos().
// Next ejecuta register() UNA vez por proceso de servidor. EasyPanel corre
// `next start` como proceso persistente → el setInterval sobrevive igual que
// con `node server.js` (mismo modelo, cero infra nueva).
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return

  try {
    // @ts-ignore — módulo backend JS intacto (no se reescribe)
    const mod = await import('./api/meta/actualizacion-automatica.js')
    const bucket = await mod.asegurarBucketFeedsMeta()
    if (bucket?.error) {
      console.log('⚠️ No se pudo asegurar el bucket feeds-meta:', bucket.error)
    } else if (bucket?.creado) {
      console.log('✅ Bucket feeds-meta creado')
    } else {
      console.log('✅ Bucket feeds-meta disponible')
    }
    mod.iniciarServicioActualizacion()
    mod.configurarWebhookProductos()
  } catch (e: any) {
    console.error('[instrumentation] Error iniciando servicio feed Meta:', e?.message || e)
  }
}
