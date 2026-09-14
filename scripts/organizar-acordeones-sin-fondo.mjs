// Ordena los recortes ya generados dentro de W:\, por categoría y por año.
//
//   node scripts/organizar-acordeones-sin-fondo.mjs --revisar   → enseña el reparto, no copia
//   node scripts/organizar-acordeones-sin-fondo.mjs             → copia y organiza
//
// Los recortes salían todos revueltos en una carpeta plana, con el nombre de la carpeta de
// origen como único dato. Aquí se reparten en  <CATEGORÍA>/<AÑO>/  para poder buscarlos por
// color y por época, que es como se buscan de verdad ("el verde tricolor de 2021").
//
// La CATEGORÍA sale del nombre del recorte, que a su vez viene de la carpeta original. El AÑO
// sale de la fecha del archivo de la FOTO ORIGINAL, no del recorte: el recorte se generó hoy y
// esa fecha no dice nada.
import fs from 'node:fs'
import path from 'node:path'

const ORIGEN = 'public/images/acordeones-sin-fondo'
const FOTOS = 'W:/1. Venta de acordeones/Acordeones fondo blanco'
const DESTINO = path.join(FOTOS, '0. SIN FONDO (generadas)', 'por categoria y año')
const REVISAR = process.argv.includes('--revisar')

// Orden importante: gana la primera que coincida. Los accesorios van antes que los colores,
// porque "fuelle-verde-marino" es un fuelle, no un acordeón verde.
const CATEGORIAS = [
  [/fuelle/i,                         'Fuelles'],
  [/parrilla/i,                       'Parrillas'],
  [/estuche|maleta|funda/i,           'Estuches'],
  [/correa/i,                         'Correas'],
  [/broche/i,                         'Broches'],
  [/pechera/i,                        'Pecheras'],
  [/tricolor|colombia|bandera|panama/i, 'Acordeones tricolor'],
  [/premium|nacar|perlado|corona/i,   'Acordeones premium'],
  [/xtreme/i,                         'Acordeones Xtreme'],
  [/blanco/i,                         'Acordeones blancos'],
  [/negro|charol|gris/i,              'Acordeones negros y grises'],
  [/azul/i,                           'Acordeones azules'],
  [/verde/i,                          'Acordeones verdes'],
  [/rojo|fuego|vinotinto/i,           'Acordeones rojos'],
  [/morado|lila/i,                    'Acordeones morados'],
  [/naranja|amarillo|dorado/i,        'Acordeones naranjas y dorados'],
  [/marron|cafe/i,                    'Acordeones marrones'],
]
// Los recortes de "xx" y "fotos nuevas a publicar" no llevan el color en el nombre, pero ya se
// clasificaron uno a uno al ponerles precio. Se reaprovecha ese trabajo en vez de adivinar.
const COLOR_POR_ARCHIVO = (() => {
  const mapa = {}
  try {
    const { disenos } = JSON.parse(fs.readFileSync('.tmp-analisis/clasificacion-acordeones.json', 'utf8'))
    for (const d of disenos) for (const f of d.archivos || []) mapa[f.replace(/\.webp$/, '')] = d.color || ''
  } catch { /* sin clasificación, se cae al nombre */ }
  return mapa
})()

const categoriaDe = (n) => {
  const porColor = COLOR_POR_ARCHIVO[n]
  const texto = porColor ? `${porColor} ${n}` : n
  return (CATEGORIAS.find(([re]) => re.test(texto)) || [null, 'Otros'])[1]
}

// Año de la foto original: se busca la que dio origen al recorte recorriendo las carpetas.
const indiceFechas = (() => {
  const idx = {}
  const norm = (s) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  const walk = (d, raiz) => {
    let entradas = []
    try { entradas = fs.readdirSync(d, { withFileTypes: true }) } catch { return }
    for (const e of entradas) {
      const p = path.join(d, e.name)
      if (e.isDirectory()) walk(p, raiz || norm(e.name.replace(/^\d+\.?\s*/, '')))
      else if (/\.(jpe?g|png)$/i.test(e.name) && raiz) {
        const y = fs.statSync(p).mtime.getFullYear()
        // Se guarda el año MÁS ANTIGUO de la carpeta: es cuando se hizo el acordeón.
        idx[raiz] = idx[raiz] ? Math.min(idx[raiz], y) : y
      }
    }
  }
  for (const e of fs.readdirSync(FOTOS, { withFileTypes: true })) {
    if (!e.isDirectory() || e.name.startsWith('0. SIN FONDO')) continue
    walk(path.join(FOTOS, e.name), norm(e.name.replace(/^\d+\.?\s*/, '')))
  }
  return idx
})()

const añoDe = (nombre) => {
  const base = nombre.replace(/-\d+$/, '')
  if (indiceFechas[base]) return indiceFechas[base]
  // Coincidencia parcial: el recorte lleva el nombre de la carpeta más un sufijo.
  const clave = Object.keys(indiceFechas).find((k) => base.startsWith(k) || k.startsWith(base))
  return clave ? indiceFechas[clave] : 'sin fecha'
}

const archivos = fs.readdirSync(ORIGEN).filter((f) => f.endsWith('.webp') && !f.endsWith('-sm.webp'))
const reparto = {}
for (const f of archivos) {
  const nombre = f.replace(/\.webp$/, '')
  const cat = categoriaDe(nombre)
  const año = añoDe(nombre)
  ;((reparto[cat] ||= {})[año] ||= []).push(f)
}

console.log(`recortes: ${archivos.length}\n`)
console.log('CATEGORÍA'.padEnd(32) + 'AÑOS')
let total = 0
for (const [cat, años] of Object.entries(reparto).sort((a, b) => a[0].localeCompare(b[0]))) {
  const detalle = Object.entries(años).sort().map(([y, v]) => `${y}:${v.length}`).join('  ')
  const n = Object.values(años).reduce((a, b) => a + b.length, 0)
  total += n
  console.log(`  ${cat.padEnd(30)} ${String(n).padStart(3)}   ${detalle}`)
}
console.log(`\ntotal repartido: ${total}`)

if (REVISAR) { console.log('\n(--revisar: no se copió nada)'); process.exit(0) }

let copiados = 0
for (const [cat, años] of Object.entries(reparto)) {
  for (const [año, lista] of Object.entries(años)) {
    const dir = path.join(DESTINO, cat, String(año))
    fs.mkdirSync(dir, { recursive: true })
    for (const f of lista) {
      fs.copyFileSync(path.join(ORIGEN, f), path.join(dir, f))
      const sm = f.replace(/\.webp$/, '-sm.webp')
      if (fs.existsSync(path.join(ORIGEN, sm))) fs.copyFileSync(path.join(ORIGEN, sm), path.join(dir, sm))
      copiados++
    }
  }
}
console.log(`\ncopiados: ${copiados}`)
console.log(`destino: ${DESTINO}`)
