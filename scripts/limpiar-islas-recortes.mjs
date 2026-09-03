// Post-proceso de los recortes de publicar-personalizados: elimina "islas" (restos del fondo que Gemini dejó
// flotando, p. ej. manchas rojas del banner) conservando sólo el componente conexo más grande del canal alpha
// (+ los que midan ≥ 4% de él, por si el fuelle abierto quedara separado). Re-guarda la copia local (≤1200, q82),
// vuelve a subir al mismo path de Storage y regenera azul-corona.webp. Usa el log de publicar-personalizados.
//   node scripts/limpiar-islas-recortes.mjs [--solo=slug] [--sin-subir]
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { leerEnv } from './lib/recortar.mjs'

const env = leerEnv()
const supa = createClient(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const BUCKET = 'imagenes_tienda'
const LOG = '.tmp-analisis/publicar-personalizados.json'
const args = process.argv.slice(2)
const solo = (args.find((a) => a.startsWith('--solo='))?.split('=')[1] || '').split(',').filter(Boolean)
const sinSubir = args.includes('--sin-subir')
const log = JSON.parse(fs.readFileSync(LOG, 'utf8'))

/** Devuelve { buf, islas } — buf webp ya limpio (mismo tamaño), islas = nº de componentes eliminados. */
export async function limpiarIslas(entrada) {
  const { data: px, info } = await sharp(entrada).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  const etiqueta = new Int32Array(W * H).fill(-1)
  const tam = []
  const pila = []
  for (let i = 0; i < W * H; i++) {
    if (etiqueta[i] !== -1 || px[i * 4 + 3] <= 40) continue
    const id = tam.length; tam.push(0); pila.push(i); etiqueta[i] = id
    while (pila.length) {
      const p = pila.pop(); tam[id]++
      const x = p % W, y = (p - x) / W
      const vecinos = [x > 0 && p - 1, x < W - 1 && p + 1, y > 0 && p - W, y < H - 1 && p + W]
      for (const v of vecinos) if (v !== false && etiqueta[v] === -1 && px[v * 4 + 3] > 40) { etiqueta[v] = id; pila.push(v) }
    }
  }
  const mayor = Math.max(...tam)
  const conservar = new Set(tam.map((t, i) => (t >= mayor * 0.04 ? i : -1)).filter((i) => i >= 0))
  let islas = 0
  for (let i = 0; i < W * H; i++) {
    const e = etiqueta[i]
    if (e === -1) { if (px[i * 4 + 3] > 0) px[i * 4 + 3] = 0; continue } // pelusa semitransparente suelta
    if (!conservar.has(e)) px[i * 4 + 3] = 0
  }
  islas = tam.length - conservar.size
  const buf = await sharp(px, { raw: { width: W, height: H, channels: 4 } }).trim({ threshold: 10 }).webp({ quality: 100, lossless: true }).toBuffer()
  return { buf, islas, componentes: tam.length }
}

const tienda = (buf) => sharp(buf).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 88, effort: 5 }).toBuffer()

for (const [slug, e] of Object.entries(log)) {
  if (slug === 'recortes' || !e.id) continue
  if (solo.length && !solo.includes(slug)) continue
  const locales = e.locales ? e.locales.map((l) => l.local) : [e.local]
  for (let i = 0; i < locales.length; i++) {
    const local = locales[i]
    if (!local || !fs.existsSync(local)) continue
    const { buf, islas, componentes } = await limpiarIslas(fs.readFileSync(local))
    const final = await tienda(buf)
    fs.writeFileSync(local, final)
    const nombre = i === 0 ? 'principal' : `secundaria-${i}`
    if (!sinSubir) {
      const { error } = await supa.storage.from(BUCKET).upload(`productos/${slug}/${nombre}.webp`, final, { contentType: 'image/webp', upsert: true })
      if (error) throw error
    }
    if (e.locales) e.locales[i].kb = Math.round(final.length / 1024)
    console.log(`${slug} ${nombre}: ${componentes} componentes, ${islas} islas eliminadas → ${Math.round(final.length / 1024)} KB`)
    if (slug === 'acordeon-hohner-azul-con-corona' && i === 0) {
      const b = await sharp(buf).resize(1400, 1400, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 84, alphaQuality: 88 }).toBuffer()
      fs.writeFileSync('public/images/personalizados/azul-corona.webp', b)
      console.log(`  → azul-corona.webp regenerado (${Math.round(b.length / 1024)} KB)`)
    }
  }
}
log.islasLimpiadas = new Date().toISOString()
fs.writeFileSync(LOG, JSON.stringify(log, null, 2))
console.log('FIN limpiar-islas')
