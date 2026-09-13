// Publica los acordeones personalizados del archivo de fotos como productos por encargo.
//
//   node scripts/publicar-acordeones-personalizados.mjs --revisar   → tabla de precios, no escribe
//   node scripts/publicar-acordeones-personalizados.mjs             → crea/actualiza en Supabase
//
// PRECIO (reglas de Jesús, 13-sep-2026). Todo parte del Corona III con diapasón negro de fábrica
// y se suma por cada personalización que se le vea al acordeón en la foto:
//   base ................................. 5.290.000
//   diapasón en nácar de color ........... +130.000
//   botones personalizados ............... +130.000
//   parrilla personalizada ............... +150.000
//   fuelle con diseño .................... +100.000
// Las correas NO entran: se acuerdan con el cliente para no cargar el precio de salida.
//
// Cada uno se publica POR ENCARGO: el acordeón de la foto ya se entregó, lo que se vende es
// repetir el diseño. Ojo con el cobro: todos pasan de 5.000.000, el techo de ePayco, así que
// /api/pedidos/crear los marca 'monto_alto' y la venta se cierra por WhatsApp. Está previsto.
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'

const BASE = 5290000
const EXTRA = { diapason: 130000, botones: 130000, parrilla: 150000, fuelle: 100000 }
const CATEGORIA = 'acordeones-hohner-personalizados'
const STORAGE = 'acordeones-personalizados'
const DIR = 'public/images/acordeones-sin-fondo'

const args = process.argv.slice(2)
const REVISAR = args.includes('--revisar')

const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split(/\r?\n/)
  .filter((l) => l.includes('=') && !l.startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Nombres comerciales por diseño. A propósito NO llevan el nombre del cliente que aparece en la
// carpeta (Marco Lara, Juan Carlos, Sergio, Eduardo…): en una ficha pública describe el diseño,
// no a quién se le vendió.
const NOMBRES = {
  'acordeon-azul-blanco': 'Azul y Blanco con Botones Azules',
  'acordeon-azul-xtreme': 'Azul Xtreme Nácar',
  'acordeon-blanco-con-corona-bello': 'Blanco con Corona en el Fuelle',
  'acordeon-blanco-de-los-primeros-que-vendimos': 'Blanco con Fuelle Tricolor y Dorado',
  'acordeon-blanco-para-ecuador': 'Blanco con Botones y Parrilla Dorados',
  'acordeon-blanco-premium-barranca-guajira': 'Blanco Premium con Parrilla Dorada',
  'acordeon-de-los-primeros-vendidos': 'Azul Oscuro con Botones Vinotinto',
  'acordeon-estilo-fuego': 'Rojo Estilo Fuego',
  'acordeon-gris-eduardo': 'Gris Clásico',
  'acordeon-gris-tricolor': 'Gris con Fuelle Tricolor',
  'acordeon-marron-juancho': 'Marrón Nácar',
  'acordeon-morado': 'Morado Nácar',
  'acordeon-naranja': 'Naranja con Fuelle Dorado',
  'acordeon-panama': 'Negro con Bandera de Panamá',
  'acordeon-premium-con-corona': 'Blanco Premium con Corona Dorada',
  'acordeon-premium-espana-armonizado': 'Blanco Premium Armonizado',
  'acordeon-rojo-con-corona-original': 'Rojo con Corona Dorada',
  'acordeon-rojo-fondo-negro-peru': 'Rojo con Diapasón Negro',
  'acordeon-rojo-xtreme': 'Rojo Xtreme Nácar',
  'acordeon-sergio': 'Azul Clásico',
  'acordeon-verde': 'Verde Nácar',
  'acordeon-verde-letras-originales': 'Verde con Letras Originales',
  'acordeon-verde-negrito-asadero': 'Verde Nácar con Fuelle Dorado',
  'acordeon-verde-personalizado-original': 'Verde con Fuelle Dorado y Diapasón Negro',
  'acordeon-verde-tricolor': 'Verde con Fuelle Tricolor',
  'acordeon-verde-tricolor-original': 'Verde Tricolor Original',
  'acordeon-xtreme-l-duque-vacano': 'Azul Xtreme con Parrilla Grabada',
  'acordeon-xtreme-tricolor-la-monda': 'Blanco Xtreme con Fuelle Tricolor',
  'azul-armonizado-lluvia': 'Azul Armonizado con Fuelle Dorado',
  'azul-con-blanco': 'Azul con Fuelle Blanco y Azul',
  'azul-con-corona-blanca': 'Azul con Corona Blanca',
  'azul-popayan': 'Azul con Fuelle Tricolor',
  'blanco-armonizado-img-53': 'Blanco Armonizado',
  'blanco-con-perlado': 'Blanco Perlado con Botones Dorados',
  'blanco-marco-lara': 'Blanco con Parrilla Personalizada',
  'blanco-total': 'Blanco Total',
  'blanco-total-3-coronas': 'Blanco Total Tres Coronas',
  'blanco-tricolor-jvier-beltran': 'Blanco Nácar con Fuelle Tricolor',
  'fotos-nuevas-a-publicar': 'Rojo con Fuelle Dorado',
  'gris-xtreme': 'Gris Xtreme con Botones Rojos',
  'juan-carlos-usa': 'Rojo con Fuelle Naranja y Parrilla Grabada',
  'negro-charoll': 'Negro Charol con Fuelle Tricolor',
  'negro-con-dorado': 'Negro con Corona Dorada',
  'rojo-tricolor': 'Rojo con Fuelle Tricolor',
  'verde-original': 'Verde Clásico con Fuelle Dorado',
  'verde-xtreme': 'Verde Xtreme Nácar',
  'xtreme-con-corona': 'Rojo Xtreme con Corona Dorada',
  'xtreme-para-chile': 'Rojo Xtreme con Botones Negros',
  'xx': 'Azul Nácar con Fuelle Tricolor',
}

const urlDe = (f) => `${env.SUPABASE_URL}/storage/v1/object/public/imagenes_tienda/${STORAGE}/${f}`

function detalle(d) {
  const partes = []
  if (!d.diapason_negro) partes.push(`diapasón en nácar ${d.color.toLowerCase()}`)
  if (d.botones) partes.push('botones personalizados')
  if (d.parrilla) partes.push('parrilla personalizada')
  if (d.fuelle) partes.push('fuelle con diseño')
  return partes
}

function precioDe(d) {
  let p = BASE
  if (!d.diapason_negro) p += EXTRA.diapason
  if (d.botones) p += EXTRA.botones
  if (d.parrilla) p += EXTRA.parrilla
  if (d.fuelle) p += EXTRA.fuelle
  return p
}

const { disenos } = JSON.parse(fs.readFileSync('.tmp-analisis/clasificacion-acordeones.json', 'utf8'))
const archivos = fs.readdirSync(DIR).filter((f) => f.endsWith('.webp') && !f.endsWith('-sm.webp'))

if (REVISAR) {
  console.log('DISEÑO'.padEnd(46) + 'PRECIO'.padStart(12) + '   PERSONALIZACIONES')
  let suma = 0
  for (const d of disenos) {
    const p = precioDe(d); suma += p
    console.log((NOMBRES[d.slug] || d.nombre || d.slug).slice(0, 44).padEnd(46) + ('$' + p.toLocaleString('es-CO')).padStart(12) + '   ' + (detalle(d).join(', ') || 'de fábrica'))
  }
  console.log(`\n${disenos.length} diseños · precio medio $${Math.round(suma / disenos.length).toLocaleString('es-CO')}`)
  console.log(`rango: $${Math.min(...disenos.map(precioDe)).toLocaleString('es-CO')} — $${Math.max(...disenos.map(precioDe)).toLocaleString('es-CO')}`)
  process.exit(0)
}

const { data: cat } = await sb.from('categorias').select('id').eq('slug', CATEGORIA).single()
if (!cat) { console.error('No existe la categoría', CATEGORIA); process.exit(1) }

let creados = 0, actualizados = 0, fallos = 0
for (const d of disenos) {
  // Los diseños sueltos de 'xx' traen su nombre en la propia clasificación.
  const nombreCorto = NOMBRES[d.slug] || d.nombre || d.slug
  const nombre = `Acordeón Hohner Corona III ${nombreCorto}`
  const slug = `acordeon-hohner-corona-iii-${d.slug}`.replace(/-+/g, '-')
  const precio = precioDe(d)
  const extras = detalle(d)

  // Por defecto se agrupan todas las tomas de la carpeta. Pero "xx" y "fotos nuevas a publicar"
  // no son una carpeta por acordeón: son cajones con acordeones distintos dentro, así que esas
  // entradas traen sus archivos escritos uno a uno en "archivos".
  const tomas = d.archivos
    ? d.archivos.filter((f) => archivos.includes(f))
    : archivos.filter((f) => f.replace(/-\d+\.webp$/, '') === d.slug).sort()
  if (!tomas.length) { console.log(`  SIN FOTO  ${d.slug}`); fallos++; continue }

  const descripcion = [
    `Acordeón Hohner Corona III personalizado en nuestro taller de Bogotá${extras.length ? `, con ${extras.join(', ')}` : ''}.`,
    '',
    'Este diseño ya se fabricó y se entregó a su dueño. Lo repetimos por encargo sobre un Corona III nuevo: mismo acabado, mismos colores, y si quieres le cambiamos lo que necesites.',
    '',
    'Se arma y se afina aquí antes de despachar. Entrega en 6 a 8 semanas. Envío asegurado a toda Colombia y al exterior.',
  ].join('\n')

  const producto = {
    nombre, slug, precio,
    // 'por_encargo' hace que la ficha diga "se fabrica por pedido" en vez de inventarse
    // unidades en bodega. El stock sigue existiendo porque los listados filtran por stock > 0.
    estado: 'por_encargo',
    categoria_id: cat.id,
    stock: 10,
    stock_minimo: 0,
    activo: true,
    destacado: false,
    marca: 'HOHNER',
    modelo: 'Corona III',
    color: d.color,
    garantia_meses: 12,
    origen_pais: 'Alemania',
    descripcion,
    ganchos: [
      'Se fabrica por pedido · 6 a 8 semanas',
      ...(extras.length ? [extras[0].charAt(0).toUpperCase() + extras[0].slice(1)] : []),
      'Armado y afinado en nuestro taller de Bogotá',
      'Envío asegurado a Colombia y al exterior',
    ],
    meta_title: `${nombre} | VentaDeAcordeones.com`.slice(0, 60),
    meta_description: `${nombre} hecho por encargo en Bogotá${extras.length ? `: ${extras.join(', ')}` : ''}. Entrega en 6 a 8 semanas, envío a toda Colombia.`.slice(0, 158),
    palabras_clave: [
      'acordeon personalizado', 'acordeon hohner corona iii', `acordeon ${d.color.toLowerCase()}`,
      'acordeon vallenato personalizado', 'acordeon a la medida bogota',
    ],
  }

  const { data: existe } = await sb.from('productos').select('id').eq('slug', slug).maybeSingle()
  let id
  if (existe) {
    const { error } = await sb.from('productos').update(producto).eq('id', existe.id)
    if (error) { console.log(`  ERROR ${slug}: ${error.message}`); fallos++; continue }
    id = existe.id; actualizados++
  } else {
    const { data, error } = await sb.from('productos').insert(producto).select('id').single()
    if (error) { console.log(`  ERROR ${slug}: ${error.message}`); fallos++; continue }
    id = data.id; creados++
  }

  // La principal es la primera toma; las demás entran como secundarias (hay hasta 4).
  const imagenes = { producto_id: id, imagen_principal: urlDe(tomas[0]) }
  tomas.slice(1, 5).forEach((t, i) => { imagenes[`imagen_secundaria_${i + 1}`] = urlDe(t) })
  const { data: imgExiste } = await sb.from('producto_imagenes').select('id').eq('producto_id', id).maybeSingle()
  if (imgExiste) await sb.from('producto_imagenes').update(imagenes).eq('id', imgExiste.id)
  else await sb.from('producto_imagenes').insert(imagenes)

  console.log(`  ${existe ? 'act' : 'NUEVO'}  ${nombre.slice(0, 52).padEnd(54)} $${precio.toLocaleString('es-CO').padStart(9)}  ${tomas.length} foto(s)`)
}

console.log(`\ncreados: ${creados}   actualizados: ${actualizados}   fallos: ${fallos}`)
