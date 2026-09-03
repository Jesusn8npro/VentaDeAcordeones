// Trae los reels de Instagram de @ventadeacordeones1 (Apify: apify/instagram-reel-scraper), descarga
// las miniaturas a public/images/reels/<codigo>.webp (las URLs del CDN de Instagram caducan) y escribe
// src/datos/reels.json para <ReelsInstagram/>.
//   node scripts/actualizar-reels.mjs            → corre el scraper (requiere `apify login`)
//   node scripts/actualizar-reels.mjs <dataset>  → reutiliza un dataset ya existente
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
import sharp from 'sharp'

const UA = 'apify-agent-skills/apify-ultimate-scraper'
const PERFIL = 'ventadeacordeones1'
const LIMITE = 30
const OUT_IMG = 'public/images/reels'
// Módulo TS (no .json): Turbopack no expone default export de JSON en client components.
const OUT_JSON = 'src/datos/reels.ts'

let datasetId = process.argv[2]
if (!datasetId) {
  const input = JSON.stringify({ username: [PERFIL], resultsLimit: LIMITE })
  const salida = execFileSync('apify', ['actors', 'call', 'apify/instagram-reel-scraper', '--input', input, '--user-agent', UA, '--json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], shell: true })
  datasetId = JSON.parse(salida).storage?.defaultDatasetId || JSON.parse(salida).defaultDatasetId
  console.log('dataset', datasetId)
}
const crudo = execFileSync('apify', ['datasets', 'get-items', datasetId, '--user-agent', UA, '--format', 'json'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], shell: true, maxBuffer: 64 * 1024 * 1024 })
const items = JSON.parse(crudo)

fs.mkdirSync(OUT_IMG, { recursive: true })
const reels = []
for (const it of items) {
  const codigo = it.shortCode || it.shortcode || (it.url || '').match(/\/(?:reel|p)\/([^/?]+)/)?.[1]
  if (!codigo) continue
  const miniaturaUrl = it.displayUrl || it.thumbnailUrl || it.images?.[0]
  let miniatura = null
  if (miniaturaUrl) {
    try {
      const res = await fetch(miniaturaUrl)
      if (res.ok) {
        const buf = Buffer.from(await res.arrayBuffer())
        // 9:16 a 540x960: suficiente para tarjetas y ligero (~40 KB)
        await sharp(buf).resize(540, 960, { fit: 'cover' }).webp({ quality: 78 }).toFile(`${OUT_IMG}/${codigo}.webp`)
        miniatura = `/images/reels/${codigo}.webp`
      }
    } catch (e) { console.warn('miniatura falló', codigo, e.message) }
  }
  reels.push({
    codigo,
    url: `https://www.instagram.com/reel/${codigo}/`,
    miniatura,
    // Array.from corta por code points: un slice() de string puede partir un emoji y dejar un
    // surrogate suelto → el HTML del servidor y el del cliente difieren (error de hidratación).
    titulo: Array.from((it.caption || '').replace(/\s+/g, ' ').trim()).slice(0, 120).join(''),
    vistas: it.videoPlayCount ?? it.videoViewCount ?? null,
    likes: it.likesCount ?? null,
    fecha: it.timestamp || null,
    duracion: it.videoDuration ?? null,
  })
}
reels.sort((a, b) => (b.vistas || 0) - (a.vistas || 0))
const contenido = JSON.stringify({ perfil: PERFIL, actualizado: new Date().toISOString(), reels }, null, 2)
fs.writeFileSync(OUT_JSON, `// Generado por scripts/actualizar-reels.mjs — no editar a mano.\nexport const datos = ${contenido}\n`)
console.log(`OK ${reels.length} reels → ${OUT_JSON} (${reels.filter((r) => r.miniatura).length} miniaturas)`)
