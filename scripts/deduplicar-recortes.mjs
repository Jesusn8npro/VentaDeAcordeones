// Quita las copias repetidas de los recortes, en disco y en Supabase Storage.
//
//   node scripts/deduplicar-recortes.mjs --revisar   → enseña qué se iría, no toca nada
//   node scripts/deduplicar-recortes.mjs             → borra las copias sobrantes
//
// El recorte se generó carpeta a carpeta, y varias carpetas de W: contienen la MISMA foto
// (la de "xx" repetía tomas que ya estaban en su carpeta con nombre, por ejemplo). Comparar
// bytes no sirve: son ficheros distintos aunque muestren lo mismo. Se comparan huellas
// perceptuales (dHash), que sí reconocen la misma imagen.
//
// REGLA DE ORO: si una de las copias está enlazada a un producto, esa se queda y se borran las
// otras. Nunca se borra algo que una ficha esté usando.
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const DIR = 'public/images/acordeones-sin-fondo'
const BUCKET = 'imagenes_tienda'
const PREFIJO = 'acordeones-personalizados'
const UMBRAL = 24          // bits de forma (de 256) por debajo de los cuales la silueta coincide
// Calibrado con casos reales: dos tomas del MISMO fuelle dan 0,1-0,4; un fuelle azul frente
// a uno morado da 9,5. El 3 separa los dos mundos con margen de sobra.
const UMBRAL_COLOR = 3
const REVISAR = process.argv.includes('--revisar')

const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split(/\r?\n/)
  .filter((l) => l.includes('=') && !l.startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// ── Qué piezas usa algún producto: esas son intocables.
const COLS = ['imagen_principal', 'imagen_secundaria_1', 'imagen_secundaria_2', 'imagen_secundaria_3', 'imagen_secundaria_4']
const { data: filas } = await sb.from('producto_imagenes').select(COLS.join(','))
const enUso = new Set()
for (const r of filas || []) for (const c of COLS) {
  const u = r[c]
  if (u?.includes(`/${PREFIJO}/`)) enUso.add(u.split('/').pop().replace(/\.webp$/, ''))
}

// ── Huella perceptual: forma + color.
// El dHash solo no vale aquí. Se calcula sobre el gris, y un fuelle azul y uno morado tienen
// exactamente la misma forma de abanico: en gris son idénticos. Comparando sólo forma, el
// script proponía borrar fuelles de colores distintos. Por eso la huella lleva también una
// rejilla de color 4x4, y para considerar dos piezas la misma foto tienen que parecerse en
// LAS DOS cosas.
async function huella(f) {
  const ruta = path.join(DIR, f)
  const gris = await sharp(ruta).flatten({ background: '#ffffff' }).greyscale()
    .resize(17, 16, { fit: 'fill' }).raw().toBuffer()
  const bits = []
  for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) bits.push(gris[y * 17 + x] > gris[y * 17 + x + 1] ? 1 : 0)

  const { data: rgb } = await sharp(ruta).flatten({ background: '#ffffff' })
    .resize(4, 4, { fit: 'fill' }).removeAlpha().raw().toBuffer({ resolveWithObject: true })
  const color = [...rgb]                      // 4×4×3 = 48 valores de 0 a 255

  return { bits, color }
}

const distForma = (a, b) => a.bits.reduce((n, v, i) => n + (v !== b.bits[i] ? 1 : 0), 0)
// Diferencia media por canal. Por encima de ~18 son colores distintos a simple vista.
const distColor = (a, b) =>
  a.color.reduce((n, v, i) => n + Math.abs(v - b.color[i]), 0) / a.color.length

const esMismaFoto = (a, b) => distForma(a, b) < UMBRAL && distColor(a, b) < UMBRAL_COLOR

const piezas = fs.readdirSync(DIR).filter((f) => f.endsWith('-sm.webp')).map((f) => f.replace('-sm.webp', ''))
const hs = []
for (const p of piezas) hs.push({ p, h: await huella(`${p}-sm.webp`) })

// ── Agrupar y elegir cuál se queda.
const usado = new Set()
const sobran = []
let grupos = 0
for (let i = 0; i < hs.length; i++) {
  if (usado.has(i)) continue
  const grupo = [hs[i].p]; usado.add(i)
  for (let j = i + 1; j < hs.length; j++) {
    if (usado.has(j)) continue
    if (esMismaFoto(hs[i].h, hs[j].h)) { grupo.push(hs[j].p); usado.add(j) }
  }
  if (grupo.length === 1) continue
  grupos++
  // Se queda la que use algún producto; si ninguna se usa, la de nombre más descriptivo
  // (las de "xx-7" no dicen nada; "acordeon-verde-tricolor-1" sí).
  const enUsoDelGrupo = grupo.filter((g) => enUso.has(g))
  const superviviente = enUsoDelGrupo[0] || [...grupo].sort((a, b) => {
    const feo = (s) => (/^(xx|ventas-productos|fotos-nuevas)/.test(s) ? 1 : 0)
    return feo(a) - feo(b) || b.length - a.length
  })[0]
  for (const g of grupo) if (g !== superviviente) {
    if (enUso.has(g)) continue          // jamás se borra algo enlazado a una ficha
    sobran.push({ borrar: g, sequeda: superviviente })
  }
}

console.log(`piezas: ${piezas.length}   en uso por productos: ${enUso.size}`)
console.log(`grupos con copias: ${grupos}   copias a borrar: ${sobran.length}\n`)
for (const s of sobran) console.log(`  borrar ${s.borrar.slice(0, 46).padEnd(48)} (se queda ${s.sequeda.slice(0, 40)})`)

if (REVISAR) { console.log('\n(--revisar: no se tocó nada)'); process.exit(0) }
if (!sobran.length) { console.log('\nnada que borrar'); process.exit(0) }

// ── Borrar en disco y en Storage.
const rutas = []
for (const s of sobran) for (const suf of ['.webp', '-sm.webp']) {
  const local = path.join(DIR, s.borrar + suf)
  if (fs.existsSync(local)) fs.rmSync(local)
  rutas.push(`${PREFIJO}/${s.borrar}${suf}`)
}
const { error } = await sb.storage.from(BUCKET).remove(rutas)
console.log(error ? `\nERROR en Storage: ${error.message}` : `\nborradas ${sobran.length} piezas (${rutas.length} archivos) en disco y en Storage`)
