// Recomprime public/images/** a webp q80 (alphaQuality 85) y limita el tamaño por carpeta:
// hero 1400px · productos/personalizados/clusters/accesorios 1200px · testimonios 600px · reels 540×960.
// No borra nada: sobrescribe con el mismo nombre (escribe .tmp y renombra; reintenta si está bloqueado).
// Sólo toca webp/jpg/jpeg/png (los avif y otros se dejan). Guarda reporte en .tmp-analisis/optimizar-imagenes.json.
//   node scripts/optimizar-imagenes-public.mjs [--dry] [--desde=<ISO fecha: omite archivos modificados después>]
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const RAIZ = 'public/images'
const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const DESDE = args.find((a) => a.startsWith('--desde='))?.split('=')[1]
const limiteMtime = DESDE ? new Date(DESDE).getTime() : Infinity
const OMITIR = args.find((a) => a.startsWith('--omitir='))?.split('=')[1]
const omitir = OMITIR ? new RegExp(OMITIR, 'i') : null
const LOG = '.tmp-analisis/optimizar-imagenes.json'

const REGLAS = {
  hero: { max: 1400, objetivoKB: 250 }, productos: { max: 1200, objetivoKB: 180 }, personalizados: { max: 1200, objetivoKB: 180 }, clusters: { max: 1200, objetivoKB: 180 }, accesorios: { max: 1200, objetivoKB: 180 },
  testimonios: { max: 600 }, reels: { w: 540, h: 960 }, Home: { max: 1400 },
}
const CALIDAD = { quality: 80, alphaQuality: 85, effort: 5 }

function* archivos(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) yield* archivos(p)
    else if (/\.(webp|jpe?g|png)$/i.test(e.name)) yield p
  }
}

function escribirAtomico(destino, buf) {
  const tmp = destino + '.tmp'
  fs.writeFileSync(tmp, buf)
  for (let i = 0; i < 4; i++) {
    try { fs.renameSync(tmp, destino); return true } catch (e) {
      if (i === 3) { try { fs.unlinkSync(tmp) } catch {} ; throw e }
      const espera = Date.now() + 400 * (i + 1); while (Date.now() < espera) {}
    }
  }
}

const porCarpeta = {}
const bloqueados = [], detalle = []
for (const ruta of archivos(RAIZ)) {
  const rel = path.relative(RAIZ, ruta).replace(/\\/g, '/')
  const carpeta = rel.includes('/') ? rel.split('/')[0] : '(raíz)'
  const regla = REGLAS[carpeta]
  const st = fs.statSync(ruta)
  const acc = (porCarpeta[carpeta] = porCarpeta[carpeta] || { archivos: 0, antesKB: 0, despuesKB: 0, omitidos: 0 })
  acc.archivos++
  acc.antesKB += st.size / 1024
  if (!regla || st.mtimeMs > limiteMtime || (omitir && omitir.test(rel))) { acc.despuesKB += st.size / 1024; acc.omitidos++; continue }
  try {
    const original = fs.readFileSync(ruta) // buffer: con ruta libvips deja el archivo abierto y el rename falla en Windows
    const meta = await sharp(original).metadata()
    let pipe = sharp(original).rotate()
    if (regla.w) pipe = pipe.resize(regla.w, regla.h, { fit: 'cover', withoutEnlargement: true })
    else pipe = pipe.resize(regla.max, regla.max, { fit: 'inside', withoutEnlargement: true })
    // PNG con alpha → webp también (misma ruta se mantiene: el nombre no cambia, sólo el contenido). Los PNG
    // se dejan como PNG optimizado para no romper el tipo MIME esperado por su extensión.
    const esPng = /\.png$/i.test(ruta)
    const esJpg = /\.jpe?g$/i.test(ruta)
    let buf = esPng ? await pipe.png({ compressionLevel: 9, palette: true }).toBuffer()
      : esJpg ? await pipe.jpeg({ quality: 80, mozjpeg: true }).toBuffer()
      : await pipe.webp(CALIDAD).toBuffer()
    // Objetivo de peso por carpeta: si a q80 sigue pesado, baja la calidad de 5 en 5 hasta un piso de 62.
    let q = CALIDAD.quality
    if (!esPng && !esJpg && regla.objetivoKB) {
      while (buf.length > regla.objetivoKB * 1024 && q > 62) {
        q -= 5
        buf = await pipe.webp({ ...CALIDAD, quality: q, alphaQuality: Math.max(q + 5, 70) }).toBuffer()
      }
    }
    const antes = st.size, despues = buf.length
    if (despues >= antes * 0.97 && (meta.width || 0) <= (regla.max || regla.w)) { acc.despuesKB += antes / 1024; detalle.push({ rel, antesKB: Math.round(antes / 1024), despuesKB: Math.round(antes / 1024), nota: 'ya óptimo' }); continue }
    if (!DRY) escribirAtomico(ruta, buf)
    acc.despuesKB += despues / 1024
    const m2 = await sharp(buf).metadata()
    detalle.push({ rel, antesKB: Math.round(antes / 1024), despuesKB: Math.round(despues / 1024), q, dim: `${meta.width}x${meta.height}→${m2.width}x${m2.height}`, ...(regla.objetivoKB && despues > regla.objetivoKB * 1024 ? { nota: `sigue > ${regla.objetivoKB} KB` } : {}) })
  } catch (e) {
    acc.despuesKB += st.size / 1024
    bloqueados.push({ rel, error: e.message })
  }
}

const tabla = Object.entries(porCarpeta).map(([carpeta, v]) => ({ carpeta, archivos: v.archivos, omitidos: v.omitidos, antesKB: Math.round(v.antesKB), despuesKB: Math.round(v.despuesKB), ahorro: `${Math.round((1 - v.despuesKB / Math.max(v.antesKB, 1)) * 100)}%` }))
console.table(tabla)
const tot = tabla.reduce((s, r) => ({ antes: s.antes + r.antesKB, despues: s.despues + r.despuesKB }), { antes: 0, despues: 0 })
console.log(`TOTAL ${tot.antes} KB → ${tot.despues} KB (${Math.round((1 - tot.despues / tot.antes) * 100)}%)${DRY ? ' [DRY]' : ''}`)
if (bloqueados.length) { console.log('\nBloqueados / con error:'); for (const b of bloqueados) console.log(`  ${b.rel}: ${b.error}`) }
fs.mkdirSync(path.dirname(LOG), { recursive: true })
fs.writeFileSync(LOG, JSON.stringify({ fecha: new Date().toISOString(), dry: DRY, tabla, bloqueados, detalle }, null, 2))
