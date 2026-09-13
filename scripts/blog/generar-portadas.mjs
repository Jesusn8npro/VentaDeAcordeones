// Portadas propias para los artículos del blog.
//
//   node scripts/blog/generar-portadas.mjs            → genera en public/images/blog/
//   node scripts/blog/generar-portadas.mjs --subir    → sube a Storage y apunta articulos_web
//
// Antes cada artículo reutilizaba una foto suelta de producto (10 de 17 salían de /images/hero):
// se veían descuadradas, repetidas entre sí y sin nada que las identificara como portada. Aquí se
// compone una imagen editorial 16:9 con la pieza recortada sobre el fondo de la marca, para que
// el blog se lea como una sección del sitio y no como un tablón de fotos sobrantes.
import sharp from 'sharp'
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const W = 1200, H = 675            // 16:9, que es el hueco que reserva la tarjeta (480×270)
const PIEZAS = 'public/images/acordeones-sin-fondo'
const OUT = 'public/images/blog'
const args = process.argv.slice(2)
const SUBIR = args.includes('--subir')

const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split(/\r?\n/)
  .filter((l) => l.includes('=') && !l.startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))

// Cada artículo con la pieza que ilustra su tema, y un tono que los distingue de un vistazo
// en el listado (si todos fueran iguales daría igual haberlos hecho).
const MAPA = {
  'cuanto-cuesta-un-acordeon-hohner-en-colombia':   { pieza: 'acordeon-premium-con-corona-1',        tono: 'oro' },
  'que-acordeon-comprar-hohner-corona-rey-vallenato': { pieza: 'acordeon-rojo-fondo-negro-peru-1',   tono: 'rojo' },
  'acordeon-para-principiantes-cual-comprar':       { pieza: 'acordeon-sergio-1',                    tono: 'azul' },
  'acordeon-nuevo-o-usado-que-conviene':            { pieza: 'acordeon-gris-eduardo-1',              tono: 'gris' },
  'acordeon-personalizado-cuanto-cuesta-colombia':  { pieza: 'acordeon-verde-personalizado-original-1', tono: 'verde' },
  'comprar-acordeon-desde-tu-ciudad-envios-colombia': { pieza: 'estuches-1',                         tono: 'gris' },
  'formas-de-pago-acordeon-colombia':               { pieza: 'blanco-total-1',                       tono: 'oro' },
  'como-comprar-en-ventadeacordeones':              { pieza: 'acordeon-azul-xtreme-1',               tono: 'azul' },
  'caja-vallenata-y-guacharaca-conjunto-completo':  { pieza: 'acordeon-xtreme-tricolor-la-monda-1',  tono: 'oro' },
  'como-grabar-acordeon-en-casa':                   { pieza: 'acordeon-morado-1',                    tono: 'morado' },
  'cuidado-del-fuelle-y-cinta-para-fuelles':        { pieza: 'fuelles-listos-3-fuelle-colombia-76',  tono: 'rojo' },
  'mantenimiento-de-acordeon-guia-completa':        { pieza: 'acordeon-original-con-fuelle-de-corona-1', tono: 'oro' },
  'como-afinar-y-limpiar-tu-acordeon-en-casa':      { pieza: 'blanco-con-perlado-1',                 tono: 'gris' },
  'donde-reparar-acordeon-en-bogota':               { pieza: 'acordeon-marron-juancho-1',            tono: 'marron' },
  'cambio-de-pitos-acordeon-bogota':                { pieza: 'negro-charoll-1',                      tono: 'gris' },
  'el-precio-de-la-pasion-desentraniando-el-valor-y-el-alma-de-los-acordeones-hohner': { pieza: 'blanco-premium-parrilla-dorada-rudy-dallas-texas-1', tono: 'oro' },
  'la-crisis-del-acordeon-por-que-los-jovenes-ya-no-quieren-estudiarlo': { pieza: 'acordeon-naranja-1', tono: 'naranja' },
}

// El halo detrás de la pieza. Oscuro siempre: el texto de la tarjeta va encima en claro.
const TONOS = {
  oro:     ['#2a1f08', '#0d0b06', '#d4a437'],
  rojo:    ['#2a0f0f', '#0d0606', '#c94a3a'],
  azul:    ['#0d1a2a', '#06090d', '#3b7fc4'],
  verde:   ['#0f2a18', '#060d08', '#3ba05e'],
  morado:  ['#1f0f2a', '#0a060d', '#8b5cc4'],
  gris:    ['#1a1a1c', '#080809', '#9aa0a6'],
  marron:  ['#2a1c0f', '#0d0906', '#b07a3a'],
  naranja: ['#2a180a', '#0d0806', '#d4813a'],
}

function fondo(tono) {
  const [a, b, acento] = TONOS[tono] || TONOS.oro
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${a}"/><stop offset="100%" stop-color="${b}"/>
      </linearGradient>
      <radialGradient id="halo" cx="66%" cy="50%" r="42%">
        <stop offset="0%" stop-color="${acento}" stop-opacity="0.42"/>
        <stop offset="100%" stop-color="${acento}" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="vin" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#000" stop-opacity="0.28"/>
        <stop offset="45%" stop-color="#000" stop-opacity="0"/>
        <stop offset="100%" stop-color="#000" stop-opacity="0.42"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect width="${W}" height="${H}" fill="url(#halo)"/>
    <rect width="${W}" height="${H}" fill="url(#vin)"/>
    <rect x="0" y="${H - 5}" width="${W}" height="5" fill="${acento}" opacity="0.85"/>
  </svg>`)
}

fs.mkdirSync(OUT, { recursive: true })
const hechas = []

for (const [slug, cfg] of Object.entries(MAPA)) {
  const origen = path.join(PIEZAS, `${cfg.pieza}.webp`)
  if (!fs.existsSync(origen)) { console.log(`  FALTA la pieza ${cfg.pieza} (${slug})`); continue }

  // La pieza ocupa el lado derecho y se sale un poco del alto: da sensación de profundidad y
  // deja el tercio izquierdo despejado para el título de la tarjeta.
  const alto = Math.round(H * 0.86)
  const pieza = await sharp(origen).resize({ height: alto, fit: 'inside' }).png().toBuffer()
  const m = await sharp(pieza).metadata()

  const buf = await sharp(fondo(cfg.tono), { density: 96 })
    .composite([{ input: pieza, left: Math.round(W * 0.60 - m.width / 2), top: Math.round((H - m.height) / 2) }])
    .webp({ quality: 80, effort: 6 })
    .toBuffer()

  const destino = path.join(OUT, `${slug}.webp`)
  fs.writeFileSync(destino, buf)
  hechas.push({ slug, kb: Math.round(buf.length / 1024) })
  console.log(`  ${slug.slice(0, 52).padEnd(54)} ${String(Math.round(buf.length / 1024)).padStart(3)} KB`)
}

console.log(`\nportadas: ${hechas.length}   media ${Math.round(hechas.reduce((a, b) => a + b.kb, 0) / hechas.length)} KB`)

if (!SUBIR) { console.log(`\nsalida: ${OUT}   (usa --subir para publicarlas)`); process.exit(0) }

const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
let ok = 0
for (const h of hechas) {
  const ruta = `blog/${h.slug}.webp`
  const { error } = await sb.storage.from('imagenes_tienda')
    .upload(ruta, fs.readFileSync(path.join(OUT, `${h.slug}.webp`)), { contentType: 'image/webp', upsert: true, cacheControl: '31536000' })
  if (error) { console.log(`  ERROR subiendo ${h.slug}: ${error.message}`); continue }
  const url = `${env.SUPABASE_URL}/storage/v1/object/public/imagenes_tienda/${ruta}`
  const { error: e2 } = await sb.from('articulos_web')
    .update({ portada_url: url, og_imagen_url: url }).eq('slug', h.slug)
  if (e2) { console.log(`  ERROR actualizando ${h.slug}: ${e2.message}`); continue }
  ok++
}
console.log(`\nsubidas y enlazadas: ${ok} de ${hechas.length}`)
