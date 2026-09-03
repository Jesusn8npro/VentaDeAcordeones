// Publica acordeones personalizados (fotos reales de W:) como productos individuales + 2 accesorios.
// Recorta con Gemini (lib/recortar.mjs), guarda copia local en public/images/personalizados/<slug>-N.webp,
// sube a Storage productos/<slug>/principal.webp y secundaria-1.webp (≤1200px, webp q82) y crea
// productos + producto_imagenes. Idempotente: el log .tmp-analisis/publicar-personalizados.json
// recuerda recortes/subidas ya hechas.
//   node scripts/publicar-personalizados.mjs [--solo=slug1,slug2] [--dry] [--sin-recorte]
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'
import { recortar, leerEnv } from './lib/recortar.mjs'

const env = leerEnv()
const supa = createClient(env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const BUCKET = 'imagenes_tienda'
const W = 'W:/1. Venta de acordeones/1. Todos los videos y material/'
const OUT = 'public/images/personalizados'
const LOG = '.tmp-analisis/publicar-personalizados.json'
const args = process.argv.slice(2)
const DRY = args.includes('--dry')
const solo = (args.find((a) => a.startsWith('--solo='))?.split('=')[1] || '').split(',').filter(Boolean)

const CAT_PERSONALIZADOS = '87766c21-0900-47c7-a6c9-2f3886bba885'
const CAT_ACCESORIOS = '9e688ecc-0d03-4130-8d1f-60d31c818255'
const GANCHOS = ['🎨 Diseño 100% personalizado', '🎶 Sonido vallenato auténtico', '🌍 Envío asegurado a Colombia y el mundo', '🛡️ Garantía 12 meses', '✅ Hohner original certificado', '📦 Estuche rígido incluido']
const CIERRE = ' Tonalidad a elección (GCF, ADG o FBbEb), afinación calibrada en nuestro taller de Valledupar. Tiempo de fabricación: 6 a 8 semanas desde la aprobación del diseño. Envío asegurado con embalaje rígido a cualquier ciudad de Colombia o al exterior. Escríbenos por WhatsApp y lo hacemos a tu medida.'

const ACORDEONES = [
  {
    slug: 'acordeon-hohner-blanco-premium-con-corona', nombre: 'Acordeón Hohner Blanco Premium con Corona',
    carpeta: '44. Acordeon blanco premium con corona y 47', fotos: ['D0BA5612-B749-44E5-8DE6-46684A9FF82B.jpg', '2CE4F09B-2953-4A8B-9CCD-4A8DA2C92F2B.jpg'],
    precio: 6200000, modelo: 'Corona III', color: 'Blanco perlado', gemini: 'el acordeón Hohner blanco nacarado con parrilla dorada y fuelle blanco con corona dorada',
    contenido: 'Un Hohner Corona III transformado en pieza de colección: cuerpo blanco perlado de aplicación manual, parrilla de barras en acabado dorado con el rayo característico y botones ámbar que resaltan sobre el nácar. El fuelle blanco lleva bordada una corona dorada, el símbolo del acordeonero que manda en la tarima. Cada herraje, broche y esquinero se cromó y ajustó pieza por pieza en el taller antes de afinar el instrumento a mano. Es el diseño favorito de los artistas que buscan elegancia sin perder la fuerza del sonido vallenato original.' + CIERRE,
    claves: ['acordeón personalizado', 'hohner corona iii personalizado', 'acordeón blanco', 'acordeón blanco premium', 'acordeón con corona', 'acordeón nacarado', 'acordeón vallenato personalizado'],
    meta_description: 'Acordeón Hohner Corona III blanco premium con fuelle corona dorada y parrilla dorada. Personalizado a tu medida en Valledupar. Envío asegurado.',
  },
  {
    slug: 'acordeon-hohner-azul-tricolor-trueno-kolombiano', nombre: 'Acordeón Hohner Azul Tricolor Trueno Kolombiano',
    carpeta: '36. y 44 Gabriel Azul tricolor', fotos: ['IMG_2417.JPG', 'IMG_2437.JPG', 'IMG_2430.JPG'],
    precio: 6200000, modelo: 'Corona III', color: 'Azul nácar', gemini: 'el acordeón Hohner azul nacarado con parrilla plateada y fuelle tricolor amarillo azul rojo',
    contenido: 'El Trueno Kolombiano nació para sonar en tarima: cuerpo azul nácar profundo, parrilla cromada con el nombre de la agrupación cortado a láser y un fuelle tricolor con los colores de la bandera de Colombia que se despliega como un abanico patrio. Los botones negros brillantes y las correas Hohner a juego completan un instrumento que se reconoce desde la primera fila. Construido sobre un Hohner Corona III nuevo, desarmado, nacarado, grabado y reensamblado por nuestros maestros; se afina y se prueba antes de viajar. Personalizamos el nombre de la parrilla con el tuyo o el de tu grupo.' + CIERRE,
    claves: ['acordeón personalizado', 'hohner corona iii personalizado', 'acordeón azul', 'acordeón tricolor', 'acordeón bandera colombia', 'parrilla grabada acordeón', 'acordeón vallenato personalizado'],
    meta_description: 'Acordeón Hohner Corona III azul nácar con fuelle tricolor Colombia y parrilla grabada con tu nombre. Fabricado a medida en Valledupar, envío asegurado.',
  },
  {
    slug: 'acordeon-hohner-negro-xtreme-virgen-fuelle-corona', nombre: 'Acordeón Hohner Negro Xtreme con Virgen y Fuelle Corona',
    carpeta: '46. Acordeon Negreo xtreeme con virgen y fuelle con corona', fotos: ['IMG_1911.JPG', 'IMG_1914.JPG'],
    precio: 6200000, modelo: 'Corona III', color: 'Negro brillante', gemini: 'el acordeón Hohner negro brillante con parrilla plateada y fuelle negro con corona dorada',
    contenido: 'Negro Xtreme: sobriedad total con detalles que hablan. El cuerpo negro de brillo profundo se combina con una parrilla cromada donde va grabada la imagen de la Virgen, protectora del acordeonero, y con un fuelle negro que lleva la corona dorada al frente. Botones negros, herrajes cromados y correas Hohner amarillas de alto contraste rematan el conjunto. Es un Hohner Corona III nuevo, desarmado y personalizado en nuestro taller de Valledupar, con afinación a mano y prueba de sonido antes de la entrega. Podemos cambiar la imagen de la parrilla por tu nombre, escudo o el diseño que nos envíes.' + CIERRE,
    claves: ['acordeón personalizado', 'hohner corona iii personalizado', 'acordeón negro', 'acordeón xtreme', 'acordeón con virgen', 'fuelle con corona', 'acordeón vallenato personalizado'],
    meta_description: 'Acordeón Hohner Corona III negro Xtreme con Virgen grabada en la parrilla y fuelle con corona dorada. Personalizado en Valledupar, envío asegurado.',
  },
  {
    slug: 'acordeon-hohner-azul-con-corona', nombre: 'Acordeón Hohner Azul con Corona',
    // Con las frontales (CDA1AAF3, IMG_1457) Gemini devolvía fondo negro/compuestos raros; las 3/4 salen limpias.
    carpeta: '40. Azul con corona', fotos: ['IMG_1458.JPG', 'IMG_1464.JPG'],
    precio: 5900000, modelo: 'Corona III', color: 'Azul nácar', gemini: 'el acordeón Hohner azul nacarado con parrilla plateada, botones blancos y fuelle negro con corona blanca',
    extraLocal: 'azul-corona.webp',
    contenido: 'Azul nácar con corona blanca: un clásico de nuestro taller. El cuerpo azul marmolado brilla con el nácar aplicado a mano, la parrilla cromada de barras deja pasar el sonido con toda su fuerza y el fuelle negro lleva al frente una corona blanca que lo hace inconfundible. Botones blancos, herrajes cromados y correas Hohner azules a juego. Fabricado sobre un Hohner Corona III nuevo, desarmado y nacarado pieza por pieza, afinado a mano en Valledupar y probado antes de salir. Si lo prefieres, grabamos tu nombre en la parrilla o cambiamos el color del fuelle.' + CIERRE,
    claves: ['acordeón personalizado', 'hohner corona iii personalizado', 'acordeón azul', 'acordeón azul con corona', 'acordeón nacarado', 'acordeón vallenato personalizado'],
    meta_description: 'Acordeón Hohner Corona III azul nácar con corona blanca en el fuelle y botones blancos. Personalizado en Valledupar, 6 a 8 semanas, envío asegurado.',
  },
  {
    slug: 'acordeon-hohner-verde-esmeralda', nombre: 'Acordeón Hohner Verde Esmeralda',
    carpeta: '35. Acordon verde original', fotos: ['IMG_2377.JPG', 'IMG_2384.JPEG'],
    precio: 5400000, modelo: 'Corona III', color: 'Verde esmeralda', gemini: 'el acordeón Hohner verde nacarado con parrilla plateada, botones blancos y fuelle dorado',
    contenido: 'Verde esmeralda como las montañas del Cesar. El cuerpo verde nácar de veta profunda se combina con la parrilla cromada original Hohner, botones blancos y un fuelle dorado que le da calidez al conjunto. Es la entrada perfecta al mundo de los acordeones personalizados: un Hohner Corona III nuevo, nacarado a mano en nuestro taller de Valledupar y afinado por nuestros maestros, sin grabados adicionales para mantener el precio más accesible. Si quieres, agregamos parrilla grabada, corona o fuelle tricolor.' + CIERRE,
    claves: ['acordeón personalizado', 'hohner corona iii personalizado', 'acordeón verde', 'acordeón verde esmeralda', 'acordeón nacarado', 'acordeón vallenato personalizado'],
    meta_description: 'Acordeón Hohner Corona III verde esmeralda nacarado con fuelle dorado y botones blancos. Personalizado en Valledupar desde $5.400.000, envío asegurado.',
  },
  {
    slug: 'acordeon-hohner-morado-edicion-unica', nombre: 'Acordeón Hohner Morado Edición Única',
    carpeta: '61. Acordeon Morado', fotos: ['Frente.JPG', 'Otra.JPG'],
    precio: 6200000, modelo: 'Corona III', color: 'Morado nácar', gemini: 'el acordeón Hohner morado nacarado con parrilla blanca y morada grabada y fuelle morado y blanco',
    contenido: 'Una edición que no se repite. Cuerpo morado nácar con vetas violeta, parrilla en blanco y morado con grabado láser de sirenas y el nombre de la agrupación, y un fuelle a rayas morado y blanco que acompaña el diseño de la parrilla. Botones blancos y morados alternados, herrajes cromados. Todo se construye sobre un Hohner Corona III nuevo, se desarma, se nacara, se graba y se reensambla en nuestro taller de Valledupar, con afinación a mano y prueba final. Diseñamos la parrilla contigo: tu nombre, tu logo o el motivo que quieras.' + CIERRE,
    claves: ['acordeón personalizado', 'hohner corona iii personalizado', 'acordeón morado', 'acordeón violeta', 'parrilla grabada acordeón', 'acordeón vallenato personalizado'],
    meta_description: 'Acordeón Hohner Corona III morado nácar con parrilla grabada a láser y fuelle a rayas. Edición única personalizada en Valledupar, envío asegurado.',
  },
  {
    slug: 'acordeon-hohner-premium-nacar-botones-nacarados', nombre: 'Acordeón Hohner Premium Nácar con Botones Nacarados',
    carpeta: '52. Acordeon premium barrancas, botones nacarados', fotos: ['IMG_6327.JPG', 'IMG_6330.JPG'],
    precio: 6500000, modelo: 'Corona III', color: 'Blanco nácar', gemini: 'el acordeón Hohner blanco nacarado con parrilla dorada, botones dorados nacarados y fuelle dorado',
    contenido: 'Nuestro nivel Premium. Cuerpo blanco nácar de máxima profundidad, parrilla dorada en malla fina, fuelle dorado con esquineros a juego y botones nacarados en tono ámbar que atrapan la luz en cada nota. Hasta las correas van tapizadas en el mismo blanco perlado. Es el acordeón que entregamos a los artistas que quieren que el instrumento hable antes de sonar. Base Hohner Corona III nueva, desarmada y trabajada pieza por pieza en Valledupar, afinada a mano y probada por nuestros maestros antes de viajar en su estuche rígido.' + CIERRE,
    claves: ['acordeón personalizado', 'hohner corona iii personalizado', 'acordeón premium', 'acordeón nácar', 'botones nacarados', 'acordeón blanco dorado', 'acordeón vallenato personalizado'],
    meta_description: 'Acordeón Hohner Corona III Premium blanco nácar con parrilla y fuelle dorados y botones nacarados. Lo más exclusivo del taller de Valledupar.',
  },
]

const ACCESORIOS = [
  {
    slug: 'correas-acordeon-personalizadas-bordadas', nombre: 'Correas de Acordeón Personalizadas Bordadas con tu Nombre',
    fuente: path.join(W, '64. Acordeon Diomedes Taborda/IMG_0833.JPEG'), secundariaLocal: 'public/images/accesorios/correas-personalizadas.webp',
    precio: 180000, stock: 10, color: 'A elección', modelo: 'Bordadas', gemini: 'el par de correas de acordeón negras acolchadas con nombre bordado en verde (sin la mano ni la persona)',
    contenido: 'Correas de acordeón acolchadas, hechas a medida y bordadas a máquina con tu nombre, el de tu agrupación o el diseño que nos envíes. Fabricadas en material sintético resistente con relleno de alta densidad que reparte el peso del acordeón en los hombros, ideales para tocar horas sin cansancio. Elige el color de la correa y del bordado para que combinen con tu acordeón. Herrajes metálicos reforzados compatibles con Hohner Corona II, Corona III, Rey Vallenato y la mayoría de acordeones de botones. Entrega en 3 a 5 días hábiles y envío a todo el país.',
    claves: ['correas de acordeón', 'correas personalizadas acordeón', 'correas bordadas', 'correas hohner', 'accesorios acordeón'],
    meta_title: 'Correas de Acordeón Personalizadas Bordadas | VentaDeAcordeones',
    meta_description: 'Correas de acordeón acolchadas y bordadas a máquina con tu nombre. Color a elección, compatibles con Hohner. Entrega en 3 a 5 días a toda Colombia.',
  },
  {
    slug: 'cinta-para-fuelles-de-acordeon', nombre: 'Cinta para Fuelles de Acordeón (rollo)',
    fuente: path.join(W, '0. Accesorios y fotos importantes productos/Fuelles para acordeon/Cinta negra.jpg'),
    precio: 60000, stock: 20, color: 'Negro, dorado o a elección', modelo: 'Rollo', gemini: 'el fuelle de acordeón negro con cinta',
    precioOrientativo: true,
    contenido: 'Cinta para fuelles de acordeón en rollo, la misma que usamos en nuestro taller para renovar o personalizar fuelles Hohner. Material flexible y resistente al roce que se adhiere sobre los pliegues y protege el cartón del fuelle, alargando su vida y devolviéndole el aspecto de nuevo. Disponible en negro clásico, dorado, blanco y colores para fuelles tricolor. Ideal para técnicos, talleres y acordeoneros que quieren renovar su fuelle en casa. Si prefieres que lo hagamos nosotros, también vendemos fuelles terminados y ofrecemos el servicio de encintado.',
    claves: ['cinta para fuelle', 'cinta fuelle acordeón', 'repuestos acordeón', 'fuelle hohner', 'accesorios acordeón'],
    meta_title: 'Cinta para Fuelles de Acordeón en Rollo | VentaDeAcordeones',
    meta_description: 'Cinta en rollo para renovar y personalizar fuelles de acordeón Hohner. Negra, dorada o de colores. Uso profesional de taller. Envío a toda Colombia.',
  },
]

fs.mkdirSync(OUT, { recursive: true })
fs.mkdirSync(path.dirname(LOG), { recursive: true })
const log = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, 'utf8')) : {}
const guardarLog = () => fs.writeFileSync(LOG, JSON.stringify(log, null, 2))
const kb = (b) => Math.round(b.length / 1024)

// ≤1200px, webp q82. Recibe ruta a un webp transparente ya recortado.
async function versionTienda(rutaWebp) {
  // Se lee a buffer: con ruta, libvips deja el archivo abierto y en Windows falla al sobrescribirlo después.
  return sharp(fs.readFileSync(rutaWebp)).resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 88, effort: 5 }).toBuffer()
}

async function subir(slug, nombre, buf) {
  const ruta = `productos/${slug}/${nombre}.webp`
  const { error } = await supa.storage.from(BUCKET).upload(ruta, buf, { contentType: 'image/webp', upsert: true })
  if (error) throw error
  return supa.storage.from(BUCKET).getPublicUrl(ruta).data.publicUrl
}

async function recorteCacheado(entrada, salida, descripcion, ancho = 1400) {
  if (fs.existsSync(salida) && log.recortes?.[salida]) return log.recortes[salida]
  const r = await recortar({ entrada, salida, ancho, descripcion, intentos: 2, log: (m) => console.log('   ' + m) })
  // >25% del marco con píxeles = Gemini devolvió fondo no magenta (negro/gris): no se publica ese recorte.
  if (r.suciedad > 0.25) { try { fs.unlinkSync(salida) } catch {} ; throw new Error(`recorte inválido (marco sucio ${(r.suciedad * 100).toFixed(0)}%) para ${path.basename(salida)}`) }
  log.recortes = log.recortes || {}
  log.recortes[salida] = { ancho: r.ancho, alto: r.alto, kb: r.kb, limpio: r.limpio, origen: typeof entrada === 'string' ? entrada : '(buffer)' }
  guardarLog()
  return log.recortes[salida]
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

for (const a of ACORDEONES) {
  if (solo.length && !solo.includes(a.slug)) continue
  console.log(`\n▶ ${a.nombre} (${a.slug}) $${a.precio.toLocaleString('es-CO')}`)
  if (DRY) continue
  try {
    const urls = []
    const locales = []
    for (let i = 0; i < a.fotos.length; i++) {
      const entrada = path.join(W, a.carpeta, a.fotos[i])
      const local = path.join(OUT, `${a.slug}-${i + 1}.webp`)
      // El recorte maestro se guarda a 1400 (misma medida que el resto de personalizados) y de ahí sale la versión tienda.
      const r = await recorteCacheado(entrada, local, a.gemini)
      console.log(`   recorte ${i + 1}: ${r.ancho}x${r.alto} ${r.kb} KB${r.limpio ? '' : ' ⚠ marco sucio'}`)
      const buf = await versionTienda(local)
      fs.writeFileSync(local, buf) // copia local ya en formato tienda (≤1200, q82)
      locales.push({ local, kb: kb(buf) })
      urls.push(await subir(a.slug, i === 0 ? 'principal' : `secundaria-${i}`, buf))
    }
    if (a.extraLocal) {
      // Regenera el recorte usado por la landing /acordeones-personalizados (a 1400 como sus hermanos).
      const master = path.join(OUT, `${a.slug}-1.webp`)
      const buf = await sharp(fs.readFileSync(master)).resize(1400, 1400, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 84, alphaQuality: 88 }).toBuffer()
      fs.writeFileSync(path.join(OUT, a.extraLocal), buf)
      console.log(`   → ${a.extraLocal} regenerado (${kb(buf)} KB)`)
    }
    const datos = {
      nombre: a.nombre, slug: a.slug,
      descripcion: { titulo: a.nombre, contenido: a.contenido },
      ganchos: GANCHOS,
      precio: a.precio, precio_original: null, descuento: 0,
      marca: 'HOHNER', modelo: a.modelo, color: a.color,
      categoria_id: CAT_PERSONALIZADOS, estado: 'activo', activo: true, destacado: true,
      stock: 2, stock_minimo: 1,
      landing_tipo: 'cinema', plantilla_tarjeta: 'lujo',
      meta_title: a.nombre.length <= 40 ? `${a.nombre} | VentaDeAcordeones` : a.nombre.slice(0, 60),
      meta_description: a.meta_description.slice(0, 155),
      palabras_clave: [...a.claves, 'acordeón hohner', 'acordeones personalizados colombia', 'comprar acordeón personalizado'],
      garantia_meses: 12, origen_pais: 'Colombia', numero_de_ventas: 0, calificacion_promedio: 0, total_resenas: 0,
    }
    const imagenes = { imagen_principal: urls[0], imagen_secundaria_1: urls[1] || null, imagen_secundaria_2: urls[2] || null }
    const { id, nuevo } = await guardarProducto(datos, imagenes)
    log[a.slug] = { id, nuevo, nombre: a.nombre, precio: a.precio, modelo: a.modelo, categoria: 'acordeones-hohner-personalizados', imagenes: urls, locales, fuentes: a.fotos.map((f) => path.join(a.carpeta, f)) }
    guardarLog()
    console.log(`   ✓ ${nuevo ? 'creado' : 'actualizado'} ${id}`)
  } catch (e) {
    console.log(`   ✗ ${e.message}`)
    log[a.slug] = { ...(log[a.slug] || {}), error: e.message }
    guardarLog()
  }
}

for (const c of ACCESORIOS) {
  if (solo.length && !solo.includes(c.slug)) continue
  console.log(`\n▶ ${c.nombre} (${c.slug}) $${c.precio.toLocaleString('es-CO')}${c.precioOrientativo ? ' [PRECIO ORIENTATIVO: revisar]' : ''}`)
  if (DRY) continue
  try {
    const local = path.join('public/images/accesorios', `${c.slug}.webp`)
    const r = await recorteCacheado(c.fuente, local, c.gemini, 1200)
    console.log(`   recorte: ${r.ancho}x${r.alto} ${r.kb} KB${r.limpio ? '' : ' ⚠ marco sucio'}`)
    const principalBuf = await versionTienda(local)
    fs.writeFileSync(local, principalBuf)
    const principal = await subir(c.slug, 'principal', principalBuf)
    let secundaria = null
    if (c.secundariaLocal && fs.existsSync(c.secundariaLocal)) secundaria = await subir(c.slug, 'secundaria-1', await versionTienda(c.secundariaLocal))
    const datos = {
      nombre: c.nombre, slug: c.slug,
      descripcion: { titulo: c.nombre, contenido: c.contenido },
      precio: c.precio, precio_original: null, descuento: 0,
      marca: 'Taller VentaDeAcordeones', modelo: c.modelo, color: c.color,
      categoria_id: CAT_ACCESORIOS, estado: 'activo', activo: true, destacado: false,
      stock: c.stock, stock_minimo: 2,
      landing_tipo: 'cinema', plantilla_tarjeta: 'lujo',
      meta_title: c.meta_title.slice(0, 60), meta_description: c.meta_description.slice(0, 155),
      palabras_clave: c.claves,
      garantia_meses: 6, origen_pais: 'Colombia', numero_de_ventas: 0, calificacion_promedio: 0, total_resenas: 0,
    }
    const { id, nuevo } = await guardarProducto(datos, { imagen_principal: principal, imagen_secundaria_1: secundaria })
    log[c.slug] = { id, nuevo, nombre: c.nombre, precio: c.precio, precioOrientativo: !!c.precioOrientativo, categoria: 'accesorios-acordeon', imagenes: [principal, secundaria].filter(Boolean), local, kb: kb(principalBuf), fuente: c.fuente }
    guardarLog()
    console.log(`   ✓ ${nuevo ? 'creado' : 'actualizado'} ${id}`)
  } catch (e) {
    console.log(`   ✗ ${e.message}`)
    log[c.slug] = { ...(log[c.slug] || {}), error: e.message }
    guardarLog()
  }
}
console.log('\nFIN publicar-personalizados → ' + LOG)
