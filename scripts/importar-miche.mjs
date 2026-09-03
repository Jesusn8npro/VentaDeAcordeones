// Importa catálogos de Miche (miche.com.co, Shopify) a Supabase. Jesús es distribuidor de la marca:
// se traen nombre, descripción, marca, precio de lista, imágenes → se re-hospedan en nuestro Storage
// (nada de hotlinks al CDN de Shopify) y se crean productos + producto_imagenes en las categorías indicadas.
//   node scripts/importar-miche.mjs --dry          → sólo lista qué crearía
//   node scripts/importar-miche.mjs [--solo=caja-vallenato,audifonos] [--limite=40] [--forzar]
// Los precios son los de lista de Miche: revisar/ajustar en el admin. Productos nuevos entran con
// destacado=false, landing_tipo='cinema', plantilla_tarjeta='lujo' (igual que el resto del catálogo).
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { leerEnv } from './lib/recortar.mjs'

const env = leerEnv()
const supa = createClient(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const BUCKET = 'imagenes_tienda'
const UA = { 'user-agent': 'Mozilla/5.0 (compatible; VentaDeAcordeones importador)' }
const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const FORZAR = args.includes('--forzar')
const LIMITE = Number(args.find((a) => a.startsWith('--limite='))?.split('=')[1] || 60)
const solo = (args.find((a) => a.startsWith('--solo='))?.split('=')[1] || '').split(',').filter(Boolean)
const LOG = '.tmp-analisis/importar-miche.json'

// Colección Miche → categoría nuestra (se crea si no existe)
const MAPA = {
  'caja-vallenato':            { slug: 'cajas-vallenatas',     nombre: 'Cajas Vallenatas',          icono: '🥁', descripcion: 'Cajas vallenatas Miche en madera y acrílico, aros cromados y parche acrílico. El corazón rítmico del paseo, el merengue y la puya.' },
  'audifonos':                 { slug: 'audifonos',            nombre: 'Audífonos',                 icono: '🎧', descripcion: 'Audífonos e in-ears KZ de alta fidelidad para músicos, monitoreo en tarima y estudio.' },
  'baterias':                  { slug: 'baterias',             nombre: 'Baterías',                  icono: '🥁', descripcion: 'Baterías acústicas y electrónicas MPRO, Ludwig y Carlsbro. Junior, intermedias y profesionales.' },
  'interface-de-audio-miche':  { slug: 'equipos-de-grabacion', nombre: 'Equipos de Grabación',      icono: '🎛️', descripcion: 'Interfaces de audio, monitores de estudio y mezcladores para grabar tu acordeón y tu voz con calidad profesional.' },
  'monitores':                 { slug: 'equipos-de-grabacion' },
  'mixer':                     { slug: 'equipos-de-grabacion' },
  'microfono-miche':           { slug: 'microfonos-y-audio',   nombre: 'Micrófonos y Audio',        icono: '🎤', descripcion: 'Micrófonos alámbricos, inalámbricos, de diadema y solapa para acordeoneros y cantantes.' },
}

const slugify = (t) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 90)
const titulo = (t) => t.toLowerCase().replace(/(^|\s|[-/(])([a-záéíóúñ])/g, (m, a, b) => a + b.toUpperCase()).replace(/\b(Kz|Mpro|Lp|Led|Xlr|Usb|Dj|Pa|Hd)\b/g, (m) => m.toUpperCase())
const limpiarHtml = (h) => (h || '').replace(/<br\s*\/?>/gi, '\n').replace(/<\/(p|li|h\d|div)>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n').trim()

const log = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, 'utf8')) : {}
const guardarLog = () => fs.writeFileSync(LOG, JSON.stringify(log, null, 2))

async function categoriaId(def) {
  const { data } = await supa.from('categorias').select('id').eq('slug', def.slug).maybeSingle()
  if (data) return data.id
  if (DRY) return `(nueva:${def.slug})`
  const { data: nueva, error } = await supa.from('categorias').insert({ nombre: def.nombre, slug: def.slug, descripcion: def.descripcion, icono: def.icono, activo: true, destacado: false, orden: 50 }).select('id').single()
  if (error) throw error
  console.log(`+ categoría creada: ${def.nombre}`)
  return nueva.id
}

async function subirImagen(url, slug, nombre) {
  const res = await fetch(url, { headers: UA })
  if (!res.ok) throw new Error(`imagen ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  const webp = await sharp(buf).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 84 }).toBuffer()
  const ruta = `productos/${slug}/${nombre}.webp`
  const { error } = await supa.storage.from(BUCKET).upload(ruta, webp, { contentType: 'image/webp', upsert: true })
  if (error) throw error
  return supa.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl
}

let creados = 0, saltados = 0, fallos = 0
for (const [coleccion, def] of Object.entries(MAPA)) {
  if (solo.length && !solo.includes(coleccion)) continue
  const defCompleta = def.nombre ? def : Object.values(MAPA).find((d) => d.slug === def.slug && d.nombre)
  const catId = await categoriaId(defCompleta)
  const res = await fetch(`https://www.miche.com.co/collections/${coleccion}/products.json?limit=${LIMITE}`, { headers: UA })
  if (!res.ok) { console.log(`✗ colección ${coleccion}: HTTP ${res.status}`); continue }
  const { products } = await res.json()
  console.log(`\n=== ${coleccion} → ${defCompleta.nombre} (${products.length} productos)`)
  for (const p of products) {
    const variante = p.variants?.[0]
    if (!variante || !p.images?.length) { saltados++; continue }
    const nombre = titulo(p.title.trim())
    const slug = slugify(p.handle || nombre)
    const precio = Math.round(Number(variante.price))
    const precioComparacion = variante.compare_at_price ? Math.round(Number(variante.compare_at_price)) : null
    if (DRY) { console.log(`  ${nombre} | $${precio.toLocaleString('es-CO')} | ${p.vendor} | ${p.images.length} img`); continue }
    const { data: existe } = await supa.from('productos').select('id').eq('slug', slug).maybeSingle()
    if (existe && !FORZAR) { saltados++; continue }
    try {
      const descripcion = limpiarHtml(p.body_html) || `${nombre}. Distribuidor autorizado ${p.vendor} en Colombia. Envío a todo el país con garantía.`
      const datos = {
        nombre, slug,
        descripcion: { titulo: nombre, contenido: descripcion },
        precio, precio_original: precioComparacion && precioComparacion > precio ? precioComparacion : null,
        descuento: precioComparacion && precioComparacion > precio ? Math.round((1 - precio / precioComparacion) * 100) : 0,
        marca: p.vendor || null, modelo: null, color: (p.options?.find((o) => /color/i.test(o.name))?.values?.[0]) || null,
        categoria_id: catId, estado: 'activo', activo: true, destacado: false,
        stock: variante.available ? 5 : 0, stock_minimo: 1,
        landing_tipo: 'cinema', plantilla_tarjeta: 'lujo',
        meta_title: `${nombre} | VentaDeAcordeones.com`,
        meta_description: descripcion.replace(/\s+/g, ' ').slice(0, 155),
        palabras_clave: [nombre.toLowerCase(), defCompleta.nombre.toLowerCase(), (p.vendor || '').toLowerCase(), ...(p.tags || []).slice(0, 6).map((t) => t.toLowerCase())].filter(Boolean),
        garantia_meses: 12, origen_pais: 'Colombia', numero_de_ventas: 0, calificacion_promedio: 0, total_resenas: 0,
      }
      let productoId = existe?.id
      if (productoId) { const { error } = await supa.from('productos').update(datos).eq('id', productoId); if (error) throw error }
      else { const { data, error } = await supa.from('productos').insert(datos).select('id').single(); if (error) throw error; productoId = data.id }

      const principal = await subirImagen(p.images[0].src, slug, 'principal')
      const secundaria = p.images[1] ? await subirImagen(p.images[1].src, slug, 'secundaria-1').catch(() => null) : null
      const img = { producto_id: productoId, imagen_principal: principal, imagen_secundaria_1: secundaria }
      const { data: imgExiste } = await supa.from('producto_imagenes').select('id').eq('producto_id', productoId).maybeSingle()
      if (imgExiste) await supa.from('producto_imagenes').update(img).eq('id', imgExiste.id)
      else { const { error } = await supa.from('producto_imagenes').insert(img); if (error) throw error }
      log[slug] = { nombre, coleccion, precio, categoria: defCompleta.slug, origen: `https://www.miche.com.co/products/${p.handle}` }
      guardarLog()
      creados++
      console.log(`  ✓ ${nombre} — $${precio.toLocaleString('es-CO')}`)
    } catch (e) {
      fallos++
      console.log(`  ✗ ${nombre}: ${e.message}`)
    }
  }
}
console.log(`\nFIN importar-miche: ${creados} creados/actualizados, ${saltados} saltados, ${fallos} fallos${DRY ? ' (DRY RUN, nada escrito)' : ''}`)
