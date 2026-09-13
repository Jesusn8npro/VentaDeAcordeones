// Recorta el fondo blanco de las fotos de W:\...\Acordeones fondo blanco y las deja
// normalizadas: mismo lienzo, mismo margen y WebP transparente, para que el catálogo se vea
// parejo. No hay IA de por medio: la foto no se altera, sólo se le quita el fondo.
//
//   node scripts/recortar-acordeones-blanco.mjs                  → genera en public/images/acordeones-sin-fondo
//   node scripts/recortar-acordeones-blanco.mjs --solo=25,21     → sólo esas carpetas (por su número)
//   node scripts/recortar-acordeones-blanco.mjs --forzar         → rehace las que ya existan
//   node scripts/recortar-acordeones-blanco.mjs --revisar        → no escribe nada, sólo informa
//
// Por qué relleno por inundación desde los bordes y no un umbral global: un acordeón blanco
// tiene botones, fuelle y nácar casi blancos. Un umbral los borraría y dejaría el producto
// agujereado. Inundando desde el marco sólo se va lo que está pegado al borde, y cualquier
// zona clara rodeada de producto se conserva.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const BASE = 'W:/1. Venta de acordeones/Acordeones fondo blanco'
const OUT = 'public/images/acordeones-sin-fondo'
const LIENZO = 1200          // lado del cuadrado final (a más no se gana nitidez en web)
const LIENZO_SM = 600        // versión para las tarjetas del catálogo
const MARGEN = 0.04          // 4% de aire a cada lado, igual para todos
const UMBRAL = 236           // a partir de aquí se considera fondo (0-255)
// q72 y q80 son indistinguibles al doble de aumento; q72 pesa un 15% menos.
const CALIDAD = 72
const CALIDAD_ALFA = 78

const args = process.argv.slice(2)
const FORZAR = args.includes('--forzar')
const REVISAR = args.includes('--revisar')
const solo = (args.find((a) => a.startsWith('--solo='))?.split('=')[1] || '').split(',').filter(Boolean)

const slug = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// ── Máscara de fondo: inundación en 4 direcciones desde todo el marco.
// Pila explícita en vez de recursión: 1400×1400 desborda la pila de Node.
function mascaraFondo(data, w, h, canales) {
  const fondo = new Uint8Array(w * h)
  const pila = []
  const claro = (i) => {
    const p = i * canales
    return data[p] >= UMBRAL && data[p + 1] >= UMBRAL && data[p + 2] >= UMBRAL
  }
  const empujar = (i) => { if (!fondo[i] && claro(i)) { fondo[i] = 1; pila.push(i) } }

  for (let x = 0; x < w; x++) { empujar(x); empujar((h - 1) * w + x) }
  for (let y = 0; y < h; y++) { empujar(y * w); empujar(y * w + w - 1) }

  while (pila.length) {
    const i = pila.pop()
    const x = i % w, y = (i / w) | 0
    if (x > 0) empujar(i - 1)
    if (x < w - 1) empujar(i + 1)
    if (y > 0) empujar(i - w)
    if (y < h - 1) empujar(i + w)
  }
  return fondo
}

async function procesar(entrada, salida) {
  const base = sharp(entrada).removeAlpha()
  const { data, info } = await base.raw().toBuffer({ resolveWithObject: true })
  const { width: w, height: h, channels: c } = info

  const fondo = mascaraFondo(data, w, h, c)
  const cubierto = fondo.reduce((a, b) => a + b, 0) / (w * h)

  // Sin fondo detectable no hay nada que recortar: la foto es una escena, no un producto suelto.
  if (cubierto < 0.02) return { saltada: true, motivo: `sólo ${(cubierto * 100).toFixed(1)}% de fondo` }

  // Alfa a partir de la máscara, y de paso el recuadro que ocupa el producto.
  const alfa = Buffer.alloc(w * h)
  let x0 = w, y0 = h, x1 = -1, y1 = -1
  for (let i = 0; i < w * h; i++) {
    if (fondo[i]) continue
    alfa[i] = 255
    const x = i % w, y = (i / w) | 0
    if (x < x0) x0 = x; if (x > x1) x1 = x
    if (y < y0) y0 = y; if (y > y1) y1 = y
  }
  if (x1 < 0) return { saltada: true, motivo: 'no queda producto' }

  // Un desenfoque mínimo sobre el alfa quita el borde dentado sin comerse el contorno.
  // OJO: sharp devuelve el buffer expandido a 3 canales aunque entre con 1, así que hay que
  // leerlo con su propio paso. Dando por hecho 1 canal, el alfa sale desalineado y el producto
  // entero queda traslúcido y a rayas.
  const suave = await sharp(alfa, { raw: { width: w, height: h, channels: 1 } })
    .blur(0.6).raw().toBuffer({ resolveWithObject: true })
  const pasoAlfa = suave.info.channels

  const rgba = Buffer.alloc(w * h * 4)
  for (let i = 0; i < w * h; i++) {
    const s = i * c, d = i * 4
    rgba[d] = data[s]; rgba[d + 1] = data[s + 1]; rgba[d + 2] = data[s + 2]
    rgba[d + 3] = suave.data[i * pasoAlfa]
  }

  const anchoProd = x1 - x0 + 1
  const altoProd = y1 - y0 + 1
  const util = Math.round(LIENZO * (1 - MARGEN * 2))
  const escala = util / Math.max(anchoProd, altoProd)

  // PNG en el paso intermedio: un toBuffer() sobre entrada raw devuelve raw, y entonces el
  // composite de abajo no sabe leerlo. PNG conserva el alfa sin pérdida.
  const anchoFinal = Math.max(1, Math.round(anchoProd * escala))
  const altoFinal = Math.max(1, Math.round(altoProd * escala))
  const recortado = await sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
    .extract({ left: x0, top: y0, width: anchoProd, height: altoProd })
    .resize(anchoFinal, altoFinal, { fit: 'inside', kernel: 'lanczos3' })
    .png()
    .toBuffer()

  const meta = await sharp(recortado).metadata()
  const lienzo = sharp({
    create: { width: LIENZO, height: LIENZO, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{
      input: recortado,
      left: Math.round((LIENZO - meta.width) / 2),
      top: Math.round((LIENZO - meta.height) / 2),
    }])
    .png()

  // Se materializa el lienzo a PNG y de ahí salen los dos tamaños. Encadenar un resize sobre
  // el mismo pipeline no vale: sharp encoge el lienzo ANTES de componer y el recorte ya no cabe.
  // Partir del PNG evita además comprimir dos veces con pérdida.
  const plano = await lienzo.toBuffer()
  const grande = await sharp(plano).webp({ quality: CALIDAD, alphaQuality: CALIDAD_ALFA, effort: 6 }).toBuffer()
  // Una segunda copia a 600 px para las tarjetas: ahí una de 1200 es peso tirado.
  const chica = await sharp(plano).resize(LIENZO_SM, LIENZO_SM)
    .webp({ quality: CALIDAD, alphaQuality: CALIDAD_ALFA, effort: 6 }).toBuffer()

  if (!REVISAR) {
    fs.writeFileSync(salida, grande)
    fs.writeFileSync(salida.replace(/\.webp$/, '-sm.webp'), chica)
  }
  return {
    kb: Math.round(grande.length / 1024), kbSm: Math.round(chica.length / 1024),
    fondo: Math.round(cubierto * 100), prod: `${anchoProd}x${altoProd}`,
  }
}

// ── Recorrido. Por defecto sólo las carpetas numeradas, que son las de acordeón; con --todas
// entran también las sueltas (xx, Fuelles listos, Parrillas, Estuches…), que traen accesorios
// y tomas antiguas. Lo que no tenga fondo recortable se informa al final en vez de romper.
const TODAS = args.includes('--todas')
const carpetas = fs.readdirSync(BASE, { withFileTypes: true })
  .filter((e) => e.isDirectory() && (TODAS || /^\d/.test(e.name)))
  .filter((e) => !solo.length || solo.some((s) => e.name.startsWith(s + '.') || e.name.startsWith(s)))

fs.mkdirSync(OUT, { recursive: true })
let hechas = 0, saltadas = 0, existian = 0
const informe = []

for (const carpeta of carpetas) {
  const dir = path.join(BASE, carpeta.name)
  const fotos = []
  const recorrer = (d, rel = '') => {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) { if (TODAS) recorrer(path.join(d, e.name), rel + slug(e.name) + '-') }
      else if (/\.(jpe?g|png)$/i.test(e.name)) fotos.push({ ruta: path.join(d, e.name), pre: rel, nombre: e.name })
    }
  }
  recorrer(dir)
  fotos.sort((a, b) => (a.pre + a.nombre).localeCompare(b.pre + b.nombre))
  // El número de carpeta se cae del slug: "25. Blanco total" → "blanco-total".
  const nombre = slug(carpeta.name.replace(/^\d+\.?\s*/, '')) || slug(carpeta.name)

  for (let i = 0; i < fotos.length; i++) {
    const destino = path.join(OUT, `${nombre}-${fotos[i].pre}${i + 1}.webp`.replace(/-+/g, '-'))
    if (fs.existsSync(destino) && !FORZAR && !REVISAR) { existian++; continue }
    try {
      const r = await procesar(fotos[i].ruta, destino)
      if (r.saltada) { saltadas++; informe.push({ carpeta: carpeta.name, foto: fotos[i].nombre, estado: r.motivo }) }
      else { hechas++; console.log(`  ${path.basename(destino).padEnd(46)} ${String(r.kb).padStart(4)} KB + ${String(r.kbSm).padStart(3)} KB(sm)  fondo ${r.fondo}%`) }
    } catch (e) {
      saltadas++; informe.push({ carpeta: carpeta.name, foto: fotos[i].nombre, estado: `ERROR ${e.message.slice(0, 50)}` })
    }
  }
}

console.log(`\ncarpetas: ${carpetas.length}   generadas: ${hechas}   ya existían: ${existian}   saltadas: ${saltadas}`)
if (informe.length) {
  console.log('\n── las que no salieron (requieren mano) ──')
  for (const r of informe) console.log(`  ${r.carpeta.slice(0, 40).padEnd(42)} ${r.foto.slice(0, 34).padEnd(36)} ${r.estado}`)
}
// El listado de las que no salieron es lo que hace falta para repasarlas a mano.
if (informe.length) {
  fs.mkdirSync('.tmp-analisis', { recursive: true })
  fs.writeFileSync('.tmp-analisis/acordeones-pendientes-mano.json', JSON.stringify(informe, null, 1))
  console.log('\nlistado completo → .tmp-analisis/acordeones-pendientes-mano.json')
}
if (REVISAR) console.log('\n(--revisar: no se escribió ninguna imagen)')
else console.log(`\nsalida: ${OUT}`)
