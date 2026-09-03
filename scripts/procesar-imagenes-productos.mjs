// Batch: recorta con Gemini la imagen principal de TODOS los productos, la guarda en
// public/images/productos/<slug>.webp (transparente, optimizada), la sube a Supabase Storage y
// actualiza producto_imagenes.imagen_principal. Guarda un log con la URL anterior para poder revertir.
//   node scripts/procesar-imagenes-productos.mjs [--solo=slug1,slug2] [--sin-subir] [--forzar]
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { recortar, leerEnv } from './lib/recortar.mjs'

const env = leerEnv()
const supa = createClient(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const BUCKET = 'imagenes_tienda'
const OUT = 'public/images/productos'
const LOG = '.tmp-analisis/productos-recortes.json'
const args = process.argv.slice(2)
const solo = (args.find((a) => a.startsWith('--solo'))?.split('=')[1] || '').split(',').filter(Boolean)
const sinSubir = args.includes('--sin-subir')
const forzar = args.includes('--forzar')

fs.mkdirSync(OUT, { recursive: true })
fs.mkdirSync(path.dirname(LOG), { recursive: true })
const log = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, 'utf8')) : {}
const guardarLog = () => fs.writeFileSync(LOG, JSON.stringify(log, null, 2))

const { data: productos, error } = await supa.from('productos')
  .select('id, nombre, slug, activo, producto_imagenes(id, imagen_principal)')
  .order('nombre')
if (error) throw error

function descripcionPara(nombre) {
  const n = nombre.toLowerCase()
  if (n.includes('amplificador')) return 'el amplificador'
  if (n.includes('parrilla')) return 'la parrilla (rejilla metálica) de acordeón'
  if (n.includes('correa')) return 'las correas de acordeón'
  if (n.includes('estuche')) return 'el estuche de acordeón'
  if (n.includes('fuelle')) return 'el fuelle de acordeón'
  if (n.includes('broche')) return 'los broches de acordeón'
  if (n.includes('saxof')) return 'el saxofón'
  if (n.includes('mesa')) return 'la mesa de afinado'
  return `el acordeón (${nombre})`
}

async function obtenerFuente(slug, url) {
  const local = path.join('public/migradas/productos', slug, 'principal.jpg')
  if (fs.existsSync(local)) return { buf: fs.readFileSync(local), origen: local }
  if (!url) return null
  const res = await fetch(url, { headers: { 'user-agent': 'Mozilla/5.0' } })
  if (!res.ok) return null
  return { buf: Buffer.from(await res.arrayBuffer()), origen: url }
}

let ok = 0, fallos = 0
for (const p of productos) {
  if (solo.length && !solo.includes(p.slug)) continue
  const img = p.producto_imagenes?.[0]
  if (!img?.imagen_principal) { console.log(`— ${p.nombre}: SIN imagen, se omite`); continue }
  if (log[p.slug]?.nueva && !forzar) { console.log(`✓ ${p.nombre}: ya procesado`); continue }
  console.log(`\n▶ ${p.nombre} (${p.slug})`)
  try {
    const fuente = await obtenerFuente(p.slug, img.imagen_principal)
    if (!fuente) { console.log('  ✗ fuente no disponible (404)'); log[p.slug] = { nombre: p.nombre, error: 'fuente 404', anterior: img.imagen_principal }; guardarLog(); fallos++; continue }
    const salida = path.join(OUT, `${p.slug}.webp`)
    const r = await recortar({ entrada: fuente.buf, salida, ancho: 1200, descripcion: descripcionPara(p.nombre), intentos: 2 })
    console.log(`  recorte ${r.ancho}x${r.alto} ${r.kb} KB ${r.limpio ? '' : '⚠ marco sucio'}`)
    let nueva = `/images/productos/${p.slug}.webp`
    if (!sinSubir) {
      const ruta = `productos/${p.slug}/principal-recorte.webp`
      const { error: e1 } = await supa.storage.from(BUCKET).upload(ruta, fs.readFileSync(salida), { contentType: 'image/webp', upsert: true })
      if (e1) throw e1
      nueva = supa.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl
      const { error: e2 } = await supa.from('producto_imagenes').update({ imagen_principal: nueva }).eq('id', img.id)
      if (e2) throw e2
      console.log('  ↑ subido y DB actualizada')
    }
    log[p.slug] = { nombre: p.nombre, anterior: img.imagen_principal, nueva, origen: fuente.origen, limpio: r.limpio, kb: r.kb }
    ok++
  } catch (e) {
    console.log(`  ✗ ${e.message}`)
    log[p.slug] = { nombre: p.nombre, error: e.message, anterior: img.imagen_principal }
    fallos++
  }
  guardarLog()
}
console.log(`\nFIN: ${ok} ok, ${fallos} fallos. Log: ${LOG}`)
