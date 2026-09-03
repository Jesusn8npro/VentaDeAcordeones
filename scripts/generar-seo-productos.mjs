// Genera meta_title, meta_description, palabras_clave y ganchos para productos
// que no los tienen. No usa IA — genera texto determinista de calidad.
import { createClient } from '@supabase/supabase-js'
import { leerEnv } from './lib/recortar.mjs'

// Claves desde .env (nunca hardcodeadas en el repo)
const env = leerEnv()

const client = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY
)

function fmtCOP(n) {
  return n ? `$${new Intl.NumberFormat('es-CO').format(n)}` : null
}

function contenidoDesc(descripcion) {
  if (!descripcion) return ''
  if (typeof descripcion === 'string') return descripcion
  return descripcion.contenido || descripcion.titulo || ''
}

function generarSEO(p) {
  const nombre = p.nombre
  const precio = p.precio
  const marca = p.marca && p.marca !== 'No especificada' ? p.marca : 'HOHNER'
  const desc = contenidoDesc(p.descripcion)
  const precioStr = fmtCOP(precio)
  const esAccesorio = !nombre.toLowerCase().includes('acordeón') && !nombre.toLowerCase().includes('acordeon')
  const esPersonalizado = nombre.toLowerCase().includes('personaliz') || nombre.toLowerCase().includes('xtreme') || nombre.toLowerCase().includes('lujo')

  // META TITLE (max 60 chars)
  let metaTitle
  if (esAccesorio) {
    metaTitle = `${nombre} para Acordeón | VentaDeAcordeones.com`
  } else if (esPersonalizado) {
    metaTitle = `${nombre} | Envío Colombia y el Mundo`
  } else {
    metaTitle = `${nombre} | ${precioStr ? precioStr + ' COP' : 'Precio al mejor valor'}`
  }
  if (metaTitle.length > 60) metaTitle = metaTitle.slice(0, 57) + '...'

  // META DESCRIPTION (max 155 chars)
  let metaDesc = ''
  if (desc) {
    // Usar primeras 2 oraciones de la descripción
    const oraciones = desc.split(/[.!]/).filter(s => s.trim().length > 20)
    metaDesc = oraciones.slice(0, 2).join('. ').trim()
    if (metaDesc && !metaDesc.endsWith('.')) metaDesc += '.'
  }
  if (!metaDesc) {
    if (esAccesorio) {
      metaDesc = `${nombre} de alta calidad para tu acordeón. Envío a toda Colombia y el mundo. Garantía incluida.`
    } else {
      metaDesc = `Compra tu ${nombre} con envío a toda Colombia${precioStr ? ` desde ${precioStr}` : ''}. Acordeones HOHNER originales con garantía y soporte técnico.`
    }
  }
  if (metaDesc.length > 155) metaDesc = metaDesc.slice(0, 152) + '...'

  // PALABRAS CLAVE
  const kws = new Set([
    'acordeones colombia',
    'venta de acordeones',
    nombre.toLowerCase(),
  ])
  if (marca) kws.add(`acordeon ${marca.toLowerCase()}`)
  if (esPersonalizado) {
    kws.add('acordeones personalizados')
    kws.add('acordeon personalizado colombia')
    kws.add('acordeon vallenato personalizado')
  }
  if (!esAccesorio) {
    kws.add('acordeon vallenato')
    kws.add('acordeon diatonico')
    kws.add('comprar acordeon')
  } else {
    kws.add(`accesorios acordeon`)
    kws.add('repuestos acordeon colombia')
  }

  // GANCHOS DE VENTA
  const ganchos = []
  if (!esAccesorio) {
    ganchos.push(
      '🎶 Sonido Vallenato Auténtico',
      '🌍 Envío a Colombia y 42 Países',
      `🛡️ Garantía ${p.garantia_meses || 12} Meses`,
      '✅ Calidad HOHNER Certificada',
      '📦 Empaque Seguro Profesional',
    )
    if (esPersonalizado) ganchos.unshift('🎨 Diseño 100% Personalizado')
  } else {
    ganchos.push(
      '🔧 Compatibilidad Garantizada',
      '📦 Envío Seguro a Todo el País',
      '✅ Calidad y Durabilidad Superior',
      '💬 Soporte Técnico Incluido',
    )
  }

  return {
    meta_title: metaTitle,
    meta_description: metaDesc,
    palabras_clave: [...kws].slice(0, 10),
    ganchos: p.ganchos?.length ? p.ganchos : ganchos,
  }
}

async function main() {
  const { data: productos } = await client
    .from('productos')
    .select('id, nombre, slug, descripcion, precio, marca, garantia_meses, ganchos, meta_title, meta_description, palabras_clave')
    .eq('activo', true)

  const sinMeta = productos.filter(p => !p.meta_title || !p.meta_description || !p.palabras_clave?.length)
  console.log(`\n🔍 Productos sin SEO completo: ${sinMeta.length} / ${productos.length}\n`)

  let ok = 0
  for (const p of sinMeta) {
    const seo = generarSEO(p)
    const { error } = await client
      .from('productos')
      .update({
        meta_title: p.meta_title || seo.meta_title,
        meta_description: p.meta_description || seo.meta_description,
        palabras_clave: p.palabras_clave?.length ? p.palabras_clave : seo.palabras_clave,
        ganchos: seo.ganchos,
      })
      .eq('id', p.id)

    if (error) {
      console.log(`  ❌ ${p.slug}: ${error.message}`)
    } else {
      console.log(`  ✅ ${p.slug}`)
      console.log(`     title: ${seo.meta_title}`)
      console.log(`     desc:  ${seo.meta_description.slice(0, 80)}...`)
      ok++
    }
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅ Actualizados: ${ok} / ${sinMeta.length}`)
}

main().catch(console.error)
