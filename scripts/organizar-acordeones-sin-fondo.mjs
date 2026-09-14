// Deja los recortes sin fondo ordenados dentro de W:\, listos para usar.
//
//   node scripts/organizar-acordeones-sin-fondo.mjs --revisar   → enseña el reparto, no copia
//   node scripts/organizar-acordeones-sin-fondo.mjs             → rehace la carpeta y copia
//
// Estructura que deja, dentro de "Acordeones fondo blanco" y SIN tocar las 66 carpetas de fotos
// originales que ya viven ahí:
//
//   0. SIN FONDO - LISTOS PARA PUBLICAR\
//     01. Acordeones blancos\ 2021\ ...          ← grande (1200 px) y -sm (600 px) juntos
//     02. Acordeones premium\ ...
//     ...
//     90. Accesorios\ Fuelles\ 2019\ ...
//     98. Portadas del blog\
//     99. Revisar a mano\                        ← los que no salieron limpios
//     LEEME.txt
//
// Las categorías van numeradas para que el explorador las ordene por importancia comercial y no
// por alfabeto. El AÑO sale de la FOTO ORIGINAL (el más antiguo de su carpeta, que es cuando se
// hizo el acordeón), nunca del recorte: el recorte se generó hoy y esa fecha no dice nada.
import fs from 'node:fs'
import path from 'node:path'

const ORIGEN = 'public/images/acordeones-sin-fondo'
const PORTADAS = 'public/images/blog'
const FOTOS = 'W:/1. Venta de acordeones/Acordeones fondo blanco'
const DESTINO = path.join(FOTOS, '0. SIN FONDO - LISTOS PARA PUBLICAR')
const REVISAR = process.argv.includes('--revisar')

// Gana la primera que coincida. Los accesorios van antes que los colores, porque
// "fuelle-verde-marino" es un fuelle, no un acordeón verde.
const CATEGORIAS = [
  [/fuelle/i,                           '90. Accesorios/Fuelles'],
  [/parrilla/i,                         '90. Accesorios/Parrillas'],
  [/estuche|maleta|funda/i,             '90. Accesorios/Estuches'],
  [/correa/i,                           '90. Accesorios/Correas'],
  [/broche/i,                           '90. Accesorios/Broches'],
  [/pechera/i,                          '90. Accesorios/Pecheras'],
  [/premium|nacar|perlado|corona/i,     '01. Acordeones premium'],
  [/tricolor|colombia|bandera|panama/i, '02. Acordeones tricolor'],
  [/xtreme/i,                           '03. Acordeones Xtreme'],
  [/blanco/i,                           '04. Acordeones blancos'],
  [/azul/i,                             '05. Acordeones azules'],
  [/verde/i,                            '06. Acordeones verdes'],
  [/rojo|fuego|vinotinto/i,             '07. Acordeones rojos'],
  [/negro|charol|gris/i,                '08. Acordeones negros y grises'],
  [/morado|lila/i,                      '09. Acordeones morados'],
  [/naranja|amarillo|dorado/i,          '10. Acordeones naranjas y dorados'],
  [/marron|cafe/i,                      '11. Acordeones marrones'],
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
  const color = COLOR_POR_ARCHIVO[n]
  const texto = color ? `${color} ${n}` : n
  return (CATEGORIAS.find(([re]) => re.test(texto)) || [null, '12. Sin clasificar'])[1]
}

// Índice de años leyendo las carpetas de fotos originales.
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
  if (indiceFechas[base]) return String(indiceFechas[base])
  const clave = Object.keys(indiceFechas).find((k) => base.startsWith(k) || k.startsWith(base))
  return clave ? String(indiceFechas[clave]) : 'sin fecha'
}

const archivos = fs.readdirSync(ORIGEN).filter((f) => f.endsWith('.webp') && !f.endsWith('-sm.webp'))
const reparto = {}
for (const f of archivos) {
  const nombre = f.replace(/\.webp$/, '')
  ;((reparto[categoriaDe(nombre)] ||= {})[añoDe(nombre)] ||= []).push(f)
}

console.log(`recortes: ${archivos.length}\n`)
console.log('CARPETA'.padEnd(38) + 'N'.padStart(4) + '   AÑOS')
let total = 0
for (const [cat, años] of Object.entries(reparto).sort((a, b) => a[0].localeCompare(b[0]))) {
  const n = Object.values(años).reduce((a, b) => a + b.length, 0)
  total += n
  console.log(`  ${cat.padEnd(36)}${String(n).padStart(4)}   ${Object.entries(años).sort().map(([y, v]) => `${y}:${v.length}`).join('  ')}`)
}
console.log(`\ntotal: ${total}`)

if (REVISAR) { console.log('\n(--revisar: no se copió nada)'); process.exit(0) }

// Se rehace de cero para que no queden restos de repartos anteriores.
fs.rmSync(DESTINO, { recursive: true, force: true })

// Nombre legible para la copia de trabajo. En Storage los ficheros NO se renombran —las fichas
// apuntan a ellos por nombre—, pero aquí sobran los prefijos de la carpeta de origen:
// "ventas-productos-y-clientes-0-1-estuches-de-instrumentos-1-estuche-54" no le dice nada a nadie.
const RUIDO = /^(ventas-productos-y-clientes(-\d+)*(-\d+-\d+)?-|fuelles-listos-(\d+-|\d{4}-)?|acordeon-|fotos-nuevas-a-publicar-?|xx-?)/
const bonito = (n) => {
  let s = n.replace(RUIDO, '').replace(/-?\d+$/, '').replace(/^[-\d]+/, '').replace(/-+/g, '-').replace(/^-|-$/g, '')
  return s || n.replace(/-?\d+$/, '') || n
}

let copiados = 0
for (const [cat, años] of Object.entries(reparto)) {
  for (const [año, lista] of Object.entries(años)) {
    const dir = path.join(DESTINO, cat, año)
    fs.mkdirSync(dir, { recursive: true })
    // Las tomas del mismo producto se numeran juntas (-01, -02) en vez de quedar sueltas con
    // nombres distintos, que es lo que hacía parecer que había copias de todo.
    const contador = {}
    for (const f of lista.sort()) {
      const base = f.replace(/\.webp$/, '')
      const nombre = bonito(base)
      contador[nombre] = (contador[nombre] || 0) + 1
      const n = String(contador[nombre]).padStart(2, '0')
      fs.copyFileSync(path.join(ORIGEN, f), path.join(dir, `${nombre}-${n}.webp`))
      const sm = `${base}-sm.webp`
      if (fs.existsSync(path.join(ORIGEN, sm))) fs.copyFileSync(path.join(ORIGEN, sm), path.join(dir, `${nombre}-${n}-sm.webp`))
      copiados++   // una pieza = dos ficheros (grande y -sm)
    }
  }
}

// Portadas del blog y los que no salieron limpios, cada uno en su sitio.
const extra = (origen, destino) => {
  if (!fs.existsSync(origen)) return 0
  const dir = path.join(DESTINO, destino)
  fs.mkdirSync(dir, { recursive: true })
  let n = 0
  for (const f of fs.readdirSync(origen)) {
    const p = path.join(origen, f)
    if (fs.statSync(p).isFile()) { fs.copyFileSync(p, path.join(dir, f)); n++ }
  }
  return n
}
const nPortadas = extra(PORTADAS, '98. Portadas del blog')
const nRevisar = extra(path.join(ORIGEN, 'revisar'), '99. Revisar a mano')

fs.writeFileSync(path.join(DESTINO, 'LEEME.txt'), [
  'RECORTES SIN FONDO — listos para publicar',
  '',
  `Generado el ${new Date().toLocaleDateString('es-CO')} a partir de las fotos de esta misma carpeta.`,
  '',
  'QUÉ HAY AQUÍ',
  `  ${copiados} piezas, cada una en dos tamaños:`,
  '    nombre.webp      1200 px — para la ficha del producto y las galerías',
  '    nombre-sm.webp    600 px — para las tarjetas del catálogo',
  '',
  'CÓMO ESTÁ ORDENADO',
  '  Por categoría (numeradas por importancia, no por alfabeto) y dentro por AÑO.',
  '  El año es el de la FOTO ORIGINAL, o sea cuando se hizo el acordeón, no el del recorte.',
  '',
  `  98. Portadas del blog  → ${nPortadas} imágenes 16:9 de los artículos`,
  `  99. Revisar a mano     → ${nRevisar} archivos donde el recorte no quedó limpio`,
  '',
  'TODAS ESTAS PIEZAS YA ESTÁN SUBIDAS a Supabase Storage (acordeones-personalizados/).',
  'Esta carpeta es tu copia de trabajo: si borras algo aquí, la web sigue funcionando.',
  '',
  'PARA REGENERARLO TODO',
  '  node scripts/recortar-acordeones-blanco.mjs --todas',
  '  node scripts/organizar-acordeones-sin-fondo.mjs',
].join('\n'), 'utf8')

console.log(`\ncopiadas: ${copiados} piezas (${copiados * 2} archivos: grande + sm)`)
console.log(`portadas del blog: ${nPortadas}   a revisar: ${nRevisar}`)
console.log(`destino: ${DESTINO}`)
