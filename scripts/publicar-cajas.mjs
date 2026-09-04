// Publica las cajas vallenatas profesionales SANDRO (fotos en W:\…\1000. PENDIENTES\CAJAS SANDRO) y el
// estuche de caja como productos de la categoría `cajas-vallenatas`. Recorta el fondo con Gemini
// (lib/recortar.mjs), guarda copia local en public/images/cajas/, sube a Storage y crea productos +
// producto_imagenes. Idempotente por slug (log en .tmp-analisis/publicar-cajas.json).
//   node scripts/publicar-cajas.mjs [--solo=slug1,slug2] [--dry]
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { recortar, leerEnv } from './lib/recortar.mjs'

const env = leerEnv()
const supa = createClient(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const BUCKET = 'imagenes_tienda'
const SANDRO = 'W:/1. Venta de acordeones/1. Todos los videos y material/1000. PENDIENTES/CAJAS SANDRO'
const ESTUCHE = 'W:/1. Venta de acordeones/Acordeones fondo blanco/Ventas (Productos y clientes)/0.1 Estuches de instrumentos/Estuche caja/Estuche CAJA'
const OUT = 'public/images/cajas'
const LOG = '.tmp-analisis/publicar-cajas.json'
const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const solo = (args.find((a) => a.startsWith('--solo='))?.split('=')[1] || '').split(',').filter(Boolean)

const GANCHOS = ['🥁 Línea profesional de tarima', '🎶 Sonido seco y con cuerpo', '🌍 Envío asegurado a Colombia y el mundo', '🛡️ Garantía 12 meses', '📍 Tienda y taller en Bogotá', '✅ Parche afinable con llave']
const CIERRE =
  ' Es la misma línea que usan los cajeros de los grandes del vallenato: los de Silvestre Dangond, Peter Manjarrés y Elder Dayán. Casco torneado y lacado a mano, aros y tensores cromados, parche acrílico afinable con llave incluida. Fabricada en Colombia por el maestro Sandro. La tienes en Bogotá para entrega inmediata y la enviamos asegurada a cualquier ciudad del país o al exterior. Pídela con estuche acolchado y guacharaca en combo.'

const CAJA_BASE = {
  precio: 750000, stock: 3, marca: 'Sandro', modelo: 'Profesional', categoriaSlug: 'cajas-vallenatas',
  claves: ['caja vallenata', 'caja vallenata profesional', 'caja vallenata sandro', 'comprar caja vallenata', 'caja vallenata bogotá', 'caja vallenata precio', 'percusión vallenata'],
}

const CAJAS = [
  { slug: 'caja-vallenata-profesional-sandro-verde-esmeralda', nombre: 'Caja Vallenata Profesional Sandro Verde Esmeralda', foto: '03d9af95-f184-442e-b2f6-b8837d094a48.jpg', color: 'Verde esmeralda',
    gemini: 'la caja vallenata (tambor cónico) verde esmeralda brillante con aros cromados y parche negro', intro: 'Verde esmeralda lacado a espejo con aros cromados: la caja que se ve desde la última fila.' },
  { slug: 'caja-vallenata-profesional-sandro-madera-veteada', nombre: 'Caja Vallenata Profesional Sandro Madera Veteada', foto: '21f6aed4-7d0d-4984-aab4-9a7ec24617f2.jpg', color: 'Madera veteada natural',
    gemini: 'la caja vallenata (tambor cónico) de madera veteada clara con aros cromados y parche azul', intro: 'Veta natural de la madera sellada con laca transparente: acabado clásico, sonido de siempre.' },
  { slug: 'caja-vallenata-profesional-sandro-degradado-rojo-negro', nombre: 'Caja Vallenata Profesional Sandro Degradado Rojo y Negro', foto: '319b8cce-b9e6-4d8a-878b-afe1d290a7c5.jpg', color: 'Degradado rojo y negro',
    gemini: 'la caja vallenata (tambor cónico) con degradado rojo y negro, aros cromados y parche blanco', intro: 'Degradado rojo sangre a negro, aros cromados y parche blanco. Puro carácter.' },
  { slug: 'caja-vallenata-profesional-sandro-tricolor-colombia', nombre: 'Caja Vallenata Profesional Sandro Tricolor Colombia', foto: 'a26ad0fc-40ec-4ab6-830d-8711837361f3.jpg', color: 'Amarillo, azul y rojo',
    gemini: 'la caja vallenata (tambor cónico) pintada con la bandera de Colombia amarillo azul rojo, aros cromados y parche blanco', intro: 'Amarillo, azul y rojo lacados a franjas: la caja de los festivales y las giras internacionales.' },
  { slug: 'caja-vallenata-profesional-sandro-dorada', nombre: 'Caja Vallenata Profesional Sandro Dorada', foto: '9e286d4a-a618-4ee6-95c6-77cfc9edc0a3.jpg', color: 'Dorado metalizado',
    gemini: 'la caja vallenata (tambor cónico) dorada metalizada con aros cromados y parche negro', intro: 'Dorado metalizado con destello: la elegida para tarima y televisión.' },
  { slug: 'caja-vallenata-profesional-sandro-degradado-verde-azul', nombre: 'Caja Vallenata Profesional Sandro Degradado Verde y Azul', foto: 'ca9fc2b5-d2ec-4189-a60e-73d693e32022.jpg', color: 'Degradado verde y azul',
    gemini: 'la caja vallenata (tambor cónico) con degradado verde y azul, aros cromados y parche blanco', intro: 'Degradado verde a azul océano, brillo profundo y herrajes cromados.' },
  { slug: 'caja-vallenata-profesional-sandro-azul-rey', nombre: 'Caja Vallenata Profesional Sandro Azul Rey', foto: '7d73dbf1-2054-47a6-abb3-47a69073c4fe.jpg', color: 'Azul rey',
    gemini: 'la caja vallenata (tambor cónico) azul rey brillante con aros cromados y parche blanco', intro: 'Azul rey lacado a espejo, sobrio y potente, para el cajero que quiere sonar y verse serio.' },
  { slug: 'caja-vallenata-profesional-sandro-personalizada-con-nombre', nombre: 'Caja Vallenata Profesional Sandro Personalizada con tu Nombre', foto: 'fa5045b6-90c6-4868-8758-8117f24d1a7c.jpg', foto2: '71c7c0bd-184c-493e-af3f-309242cb0e1d.jpg', color: 'Blanco (color a elección)',
    gemini: 'la caja vallenata (tambor cónico) blanca con aros cromados y un nombre pintado en el parche', intro: 'Tu nombre o el de tu agrupación pintado a mano en el parche y el color de casco que elijas.',
    extraClaves: ['caja vallenata personalizada', 'caja vallenata con nombre'] },
]

const ESTUCHE_CAJA = {
  slug: 'estuche-para-caja-vallenata', nombre: 'Estuche Acolchado para Caja Vallenata', precio: 150000, stock: 10, marca: 'VentaDeAcordeones', modelo: 'Acolchado con correas',
  color: 'Negro con rojo (colores a elección)', categoriaSlug: 'cajas-vallenatas',
  fotos: [{ archivo: 'Frente-PNG.png', yaRecortado: true }, { archivo: 'Estuche para caja.jpg', gemini: 'el estuche cilíndrico negro y rojo para caja vallenata' }, { archivo: 'Jehova es mi luz.jpg', gemini: 'el estuche cilíndrico negro con correas de morral para caja vallenata (vista trasera)' }],
  contenido: 'Estuche acolchado a la medida de la caja vallenata: lona impermeable de alta resistencia, espuma de alta densidad en todo el contorno y la tapa, cierre doble, asa superior y correas de morral acolchadas para cargarla en la espalda. Bolsillo frontal para llave de afinar, baquetas y guacharaca. Se fabrica en el color que quieras (negro, rojo, azul, tricolor) y con tu nombre o el de tu agrupación bordado, como el de la foto. Protege tu caja en bus, moto, avión y parranda. Lo tienes en Bogotá y lo enviamos a toda Colombia y al exterior.',
  claves: ['estuche para caja vallenata', 'forro caja vallenata', 'estuche caja vallenata bordado', 'morral caja vallenata', 'accesorios caja vallenata'],
}

fs.mkdirSync(OUT, { recursive: true })
fs.mkdirSync(path.dirname(LOG), { recursive: true })
const log = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, 'utf8')) : {}
const guardarLog = () => fs.writeFileSync(LOG, JSON.stringify(log, null, 2))
const kb = (b) => Math.round(b.length / 1024)

async function categoriaId(slug) {
  const { data, error } = await supa.from('categorias').select('id').eq('slug', slug).maybeSingle()
  if (error || !data) throw new Error(`categoría ${slug} no existe`)
  return data.id
}
async function versionTienda(buf) {
  return sharp(buf).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 88, effort: 5 }).toBuffer()
}
async function subir(slug, nombre, buf) {
  const ruta = `productos/${slug}/${nombre}.webp`
  const { error } = await supa.storage.from(BUCKET).upload(ruta, buf, { contentType: 'image/webp', upsert: true })
  if (error) throw error
  return supa.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl
}
async function recorteCacheado(entrada, salida, descripcion) {
  if (fs.existsSync(salida) && log.recortes?.[salida]) return fs.readFileSync(salida)
  const r = await recortar({ entrada, salida, ancho: 1400, descripcion, intentos: 2, log: (m) => console.log('   ' + m) })
  if (r.suciedad > 0.25) { try { fs.unlinkSync(salida) } catch {} ; throw new Error(`recorte inválido (marco sucio ${(r.suciedad * 100).toFixed(0)}%)`) }
  log.recortes = log.recortes || {}
  log.recortes[salida] = { ancho: r.ancho, alto: r.alto, kb: r.kb, limpio: r.limpio, origen: entrada }
  guardarLog()
  return fs.readFileSync(salida)
}
async function guardarProducto(datos, imagenes) {
  const { data: existe } = await supa.from('productos').select('id').eq('slug', datos.slug).maybeSingle()
  let id = existe?.id
  if (id) { const { error } = await supa.from('productos').update(datos).eq('id', id); if (error) throw error }
  else { const { data, error } = await supa.from('productos').insert(datos).select('id').single(); if (error) throw error; id = data.id }
  const img = { producto_id: id, ...imagenes }
  const { data: imgExiste } = await supa.from('producto_imagenes').select('id').eq('producto_id', id).maybeSingle()
  if (imgExiste) { const { error } = await supa.from('producto_imagenes').update(img).eq('id', imgExiste.id); if (error) throw error }
  else { const { error } = await supa.from('producto_imagenes').insert(img); if (error) throw error }
  return { id, nuevo: !existe }
}
const datosBase = (p, catId, contenido, claves, ganchos) => ({
  nombre: p.nombre, slug: p.slug,
  descripcion: { titulo: p.nombre, contenido },
  ganchos,
  precio: p.precio, precio_original: null, descuento: 0,
  marca: p.marca, modelo: p.modelo, color: p.color,
  categoria_id: catId, estado: 'activo', activo: true, destacado: true,
  stock: p.stock, stock_minimo: 1,
  landing_tipo: 'cinema', plantilla_tarjeta: 'lujo',
  meta_title: p.nombre.length <= 44 ? `${p.nombre} | VentaDeAcordeones` : p.nombre.slice(0, 60),
  meta_description: contenido.replace(/\s+/g, ' ').slice(0, 155),
  palabras_clave: claves,
  garantia_meses: 12, origen_pais: 'Colombia', numero_de_ventas: 0, calificacion_promedio: 0, total_resenas: 0,
})

const catId = await categoriaId('cajas-vallenatas')
let ok = 0, fallos = 0

for (const c of CAJAS) {
  if (solo.length && !solo.includes(c.slug)) continue
  console.log(`\n▶ ${c.nombre} — $${CAJA_BASE.precio.toLocaleString('es-CO')}`)
  if (DRY) continue
  try {
    const fotos = [c.foto, c.foto2].filter(Boolean)
    const urls = []
    for (let i = 0; i < fotos.length; i++) {
      const local = path.join(OUT, `${c.slug}-${i + 1}.webp`)
      const master = await recorteCacheado(path.join(SANDRO, fotos[i]), local, c.gemini)
      const buf = await versionTienda(master)
      fs.writeFileSync(local, buf)
      urls.push(await subir(c.slug, i === 0 ? 'principal' : `secundaria-${i}`, buf))
      console.log(`   imagen ${i + 1}: ${kb(buf)} KB`)
    }
    const contenido = `${c.intro} ${c.nombre.replace('Caja Vallenata Profesional Sandro', 'Caja vallenata profesional Sandro')}: casco de madera torneado y lacado a mano en ${c.color.toLowerCase()}.` + CIERRE
    const p = { ...CAJA_BASE, ...c }
    const { id, nuevo } = await guardarProducto(datosBase(p, catId, contenido, [...CAJA_BASE.claves, ...(c.extraClaves || []), `caja vallenata ${c.color.toLowerCase()}`], GANCHOS), { imagen_principal: urls[0], imagen_secundaria_1: urls[1] || null })
    log[c.slug] = { id, nuevo, nombre: c.nombre, precio: CAJA_BASE.precio, imagenes: urls }
    guardarLog(); ok++
    console.log(`   ✓ ${nuevo ? 'creado' : 'actualizado'} ${id}`)
  } catch (e) { fallos++; console.log(`   ✗ ${e.message}`); log[c.slug] = { error: e.message }; guardarLog() }
}

if (!solo.length || solo.includes(ESTUCHE_CAJA.slug)) {
  console.log(`\n▶ ${ESTUCHE_CAJA.nombre} — $${ESTUCHE_CAJA.precio.toLocaleString('es-CO')}`)
  if (!DRY) {
    try {
      const urls = []
      for (let i = 0; i < ESTUCHE_CAJA.fotos.length; i++) {
        const f = ESTUCHE_CAJA.fotos[i]
        const local = path.join(OUT, `${ESTUCHE_CAJA.slug}-${i + 1}.webp`)
        let master
        if (f.yaRecortado) master = await sharp(path.join(ESTUCHE, f.archivo)).trim({ threshold: 10 }).webp({ quality: 88 }).toBuffer()
        else master = await recorteCacheado(path.join(ESTUCHE, f.archivo), local, f.gemini)
        const buf = await versionTienda(master)
        fs.writeFileSync(local, buf)
        urls.push(await subir(ESTUCHE_CAJA.slug, i === 0 ? 'principal' : `secundaria-${i}`, buf))
        console.log(`   imagen ${i + 1}: ${kb(buf)} KB`)
      }
      const ganchos = ['🎒 Correas de morral acolchadas', '🧵 Bordado con tu nombre', '🌍 Envío a Colombia y el mundo', '📍 Tienda en Bogotá', '🛡️ Garantía 12 meses', '✅ Bolsillo para llave y baquetas']
      const { id, nuevo } = await guardarProducto(datosBase(ESTUCHE_CAJA, catId, ESTUCHE_CAJA.contenido, ESTUCHE_CAJA.claves, ganchos), { imagen_principal: urls[0], imagen_secundaria_1: urls[1] || null, imagen_secundaria_2: urls[2] || null })
      log[ESTUCHE_CAJA.slug] = { id, nuevo, nombre: ESTUCHE_CAJA.nombre, precio: ESTUCHE_CAJA.precio, imagenes: urls }
      guardarLog(); ok++
      console.log(`   ✓ ${nuevo ? 'creado' : 'actualizado'} ${id}`)
    } catch (e) { fallos++; console.log(`   ✗ ${e.message}`); log[ESTUCHE_CAJA.slug] = { error: e.message }; guardarLog() }
  }
}
console.log(`\nFIN publicar-cajas: ${ok} ok, ${fallos} fallos${DRY ? ' (DRY)' : ''}. Log: ${LOG}`)
