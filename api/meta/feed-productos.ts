import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

const URL_BASE = process.env.NEXT_PUBLIC_URL_BASE || 'https://ventadeacordeones.com'

export async function generarFeedXML(): Promise<string> {
  if (!supabase) throw new Error('Variables de entorno de Supabase no configuradas')

  const { data: productos, error } = await supabase
    .from('productos')
    .select('*, categorias!inner(nombre, slug), producto_imagenes!inner(*), producto_videos(*)')
    .eq('activo', true)
    .gt('stock', 0)

  if (error) throw new Error(`Error al obtener productos: ${error.message}`)
  if (!productos || productos.length === 0) return generarXMLVacio()

  return generarXMLCompleto(productos)
}

function generarXMLCompleto(productos: any[]): string {
  const fecha = new Date().toISOString()
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>VentaDeAcordeones.com - Catálogo de Productos</title>
    <link>${URL_BASE}</link>
    <description>Catálogo completo de acordeones y accesorios para Facebook Commerce</description>
    <language>es-CO</language>
    <lastBuildDate>${fecha}</lastBuildDate>
    <atom:link href="${URL_BASE}/api/meta/feed-productos" rel="self" type="application/rss+xml" />
`
  for (const producto of productos) xml += generarItemXML(producto)
  xml += `  </channel>\n</rss>`
  return xml
}

function generarItemXML(p: any): string {
  const desc = procesarDescripcion(p.descripcion)
  const { precioFinal, precioOferta } = calcularPrecios(p.precio, p.precio_original, p.descuento)
  const imagenes = obtenerImagenes(p.producto_imagenes)
  const videoUrl = obtenerVideo(p.producto_videos)
  const categoriaNombre = obtenerCategoriaNombre(p.categorias)
  const disponibilidad = (p.stock || 0) > 0 ? 'in stock' : 'out of stock'
  const link = p.slug ? `${URL_BASE}/landing/${p.slug}` : URL_BASE

  let xml = `    <item>
      <g:id>${p.id}</g:id>
      <g:title>${x(p.nombre)}</g:title>
      <g:description>${x(desc)}</g:description>
      <g:link>${link}</g:link>
      <g:image_link>${imagenes.principal}</g:image_link>
`
  for (const img of imagenes.adicionales) xml += `      <g:additional_image_link>${img}</g:additional_image_link>\n`
  xml += `      <g:price>${precioFinal} COP\n`
  if (precioOferta) xml += `      <g:sale_price>${precioOferta} COP\n`
  xml += `      <g:availability>${disponibilidad}</g:availability>\n      <g:condition>new</g:condition>\n`
  if (p.marca) xml += `      <g:brand>${x(p.marca)}</g:brand>\n`
  if (p.modelo) xml += `      <g:mpn>${x(p.modelo)}</g:mpn>\n`
  if (categoriaNombre) xml += `      <g:product_type>${x(categoriaNombre)}</g:product_type>\n`
  if (p.color) xml += `      <g:color>${x(p.color)}</g:color>\n`
  if (p.talla) xml += `      <g:size>${x(p.talla)}</g:size>\n`
  if (p.material) xml += `      <g:material>${x(p.material)}</g:material>\n`
  if (videoUrl) xml += `      <g:video_link>${videoUrl}</g:video_link>\n`
  xml += `    </item>\n`
  return xml
}

function procesarDescripcion(d: any): string {
  if (!d) return 'Producto sin descripción'
  if (typeof d === 'object' && d.contenido) return String(d.contenido).substring(0, 5000)
  if (typeof d === 'string') return d.substring(0, 5000)
  return 'Producto sin descripción'
}

function calcularPrecios(precio: any, precio_original: any, descuento: any) {
  let precioFinal = parseFloat(precio) || 0
  let precioOferta: string | null = null
  if (precio_original && parseFloat(precio_original) > precioFinal) {
    precioOferta = String(Math.round(precioFinal))
    precioFinal = parseFloat(precio_original)
  } else if (descuento && parseFloat(descuento) > 0) {
    const pct = parseFloat(descuento) / 100
    precioOferta = String(Math.round(precioFinal))
    precioFinal = precioFinal / (1 - pct)
  }
  return { precioFinal: String(Math.round(precioFinal)), precioOferta }
}

function obtenerImagenes(imgs: any) {
  const resultado = { principal: '', adicionales: [] as string[] }
  const img = Array.isArray(imgs) ? imgs[0] : imgs
  if (!img) return resultado
  if (img.imagen_principal) resultado.principal = img.imagen_principal
  for (const campo of ['imagen_secundaria_1','imagen_secundaria_2','imagen_secundaria_3','imagen_secundaria_4','imagen_caracteristicas','imagen_garantias','imagen_cta_final']) {
    if (img[campo]) resultado.adicionales.push(img[campo])
  }
  return resultado
}

function obtenerVideo(vids: any): string | null {
  const v = Array.isArray(vids) ? vids[0] : vids
  return v?.video_producto || null
}

function obtenerCategoriaNombre(cats: any): string | null {
  if (!cats) return null
  if (Array.isArray(cats)) return cats[0]?.nombre || null
  return cats.nombre || null
}

function x(s: any): string {
  if (!s) return ''
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;').trim()
}

function generarXMLVacio(): string {
  const fecha = new Date().toISOString()
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>VentaDeAcordeones.com - Catálogo de Productos</title>
    <link>${URL_BASE}</link>
    <description>Sin productos disponibles</description>
    <language>es-CO</language>
    <lastBuildDate>${fecha}</lastBuildDate>
  </channel>
</rss>`
}
