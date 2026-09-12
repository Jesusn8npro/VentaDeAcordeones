/**
 * AUDITORÍA DE LAS FOTOS DEL CATÁLOGO — SOLO LEE, NO ESCRIBE NADA.
 *
 * Por qué existe: en esta tienda un acordeón cuesta millones. Enseñar la foto de otro
 * producto no es un detalle estético, es una venta mal hecha y una devolución. El dueño
 * avisó de que "a algunos instrumentos se les cambiaron las imágenes", así que hace falta
 * una comprobación sistemática de los 174 productos activos, no mirar de a uno.
 *
 * Qué comprueba, y por qué cada cosa:
 *
 *  1) RUTA QUE NO CORRESPONDE AL PRODUCTO
 *     Las fotos viven en Storage como `productos/<slug>/principal-r3.webp`. Si la carpeta
 *     de la ruta no es el slug del producto, la fila apunta a la carpeta de OTRO producto:
 *     ése es el fallo más grave y el más fácil de cometer al subir en lote.
 *     Se compara por PALABRAS, no por igualdad exacta, porque los nombres reales llevan
 *     sufijos (`-r3`, `-v2`, `-recorte`, `principal`, `secundaria-1`) y a veces el slug va
 *     en el nombre del archivo en lugar de en la carpeta.
 *
 *  2) MISMA URL EN DOS PRODUCTOS DISTINTOS
 *     Una URL repetida significa que dos fichas enseñan literalmente la misma foto. En
 *     acordeones (piezas únicas, personalizados) eso es casi seguro un error de copiado.
 *
 *  3) MISMO CONTENIDO CON DISTINTA URL (huella sha1 del archivo descargado)
 *     Éste es el que de verdad caza lo que denunció el dueño: la ruta lleva el slug
 *     correcto, así que el punto 1 no lo ve, pero el ARCHIVO que hay dentro es el mismo
 *     que el de otro producto porque se sobreescribió con la foto equivocada.
 *
 *  4) FOTO CAÍDA (404) O ILEGIBLE
 *     Se descarga entera y se abre con sharp. No vale con el HTTP 200: Storage devuelve
 *     200 con cuerpos vacíos o truncados, y eso en la web sale como hueco gris.
 *     (Mismo motivo por el que `comparar-resolucion-imagenes.mjs` descarga completo en
 *     vez de pedir sólo los primeros bytes con Range.)
 *
 *  5) DOMINIO AJENO AL STORAGE DE SUPABASE
 *     Restos del WordPress viejo: fotos servidas desde fuera que pueden desaparecer
 *     cualquier día, no las controlamos y además rompen la CSP.
 *
 *  6) SIN FOTO
 *     Producto activo, a la venta, sin imagen principal. Se vende mucho peor.
 *
 * Uso:
 *   node scripts/auditar-imagenes-productos.mjs              informe completo
 *   node scripts/auditar-imagenes-productos.mjs --rapido     se salta las descargas (3 y 4)
 *   node scripts/auditar-imagenes-productos.mjs --json=ruta  guarda además el detalle
 */
import fs from 'node:fs'
import crypto from 'node:crypto'
import sharp from 'sharp'

const args = process.argv.slice(2)
const RAPIDO = args.includes('--rapido')
const SALIDA_JSON = args.find((a) => a.startsWith('--json='))?.split('=')[1] || null

// Campos de `producto_imagenes` que se ven en la ficha y en las tarjetas de la tienda.
// Los de landing (punto_dolor, testimonio…) no se auditan: son ilustraciones, no el producto.
const CAMPOS = [
  'imagen_principal',
  'imagen_secundaria_1',
  'imagen_secundaria_2',
  'imagen_secundaria_3',
  'imagen_secundaria_4',
]

/** Lector de .env minimalista: el mismo patrón que el resto de scripts/ del proyecto. */
function leerEnv() {
  const txt = fs.readFileSync('.env', 'utf8')
  return Object.fromEntries(
    txt
      .split(/\r?\n/)
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => [
        l.slice(0, l.indexOf('=')).trim(),
        l.slice(l.indexOf('=') + 1).trim().replace(/^["']|["']$/g, ''),
      ]),
  )
}

const env = leerEnv()
const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const CLAVE = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !CLAVE) {
  console.error('Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env')
  process.exit(1)
}
const cabeceras = { apikey: CLAVE, Authorization: `Bearer ${CLAVE}` }
const HOST_STORAGE = new URL(SUPABASE_URL).hostname

// ─────────────────────────────────────────────────────────────────────────────
// Comparación por palabras
// ─────────────────────────────────────────────────────────────────────────────

// Ruido que aparece en TODOS los nombres de archivo y no dice nada del producto.
// Si no se quitan, cualquier ruta "se parece" a cualquier slug y la auditoría no sirve.
const RUIDO = new Set([
  'principal', 'secundaria', 'secundarias', 'foto', 'fotos', 'imagen', 'imagenes',
  'producto', 'productos', 'recorte', 'recortada', 'r2', 'r3', 'r4', 'r5',
  'v1', 'v2', 'v3', 'v4', 'webp', 'jpg', 'jpeg', 'png', 'final', 'copia', 'new', 'nuevo',
  'de', 'del', 'la', 'el', 'los', 'las', 'con', 'sin', 'y', 'para', 'en', 'a',
  '1', '2', '3', '4', '5', '6',
])

/** Trocea en palabras comparables: sin tildes, sin guiones, sin ruido, sin palabras de 1 letra. */
const palabras = (txt) =>
  new Set(
    String(txt || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((p) => p.length > 1 && !RUIDO.has(p)),
  )

/** Proporción de las palabras del slug que aparecen en la ruta (0 a 1). */
function parecido(slug, ruta) {
  const a = palabras(slug)
  const b = palabras(ruta)
  if (!a.size) return 1
  let comunes = 0
  for (const p of a) if (b.has(p)) comunes++
  return comunes / a.size
}

/** Parte útil de la URL: lo que va detrás del bucket. */
function rutaEnBucket(url) {
  try {
    const p = decodeURIComponent(new URL(url).pathname)
    const m = p.match(/\/imagenes_tienda\/(.+)$/)
    return m ? m[1] : p.replace(/^\//, '')
  } catch {
    return String(url)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Descarga
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Descarga la imagen entera y devuelve huella + dimensiones.
 * Entera a propósito: con `Range` llega un webp truncado que sharp no sabe leer y todo
 * saldría marcado como roto (ya pasó en comparar-resolucion-imagenes.mjs).
 */
async function inspeccionar(url) {
  try {
    const res = await fetch(url, { headers: cabeceras })
    if (!res.ok) return { error: `HTTP ${res.status}` }
    const buf = Buffer.from(await res.arrayBuffer())
    if (!buf.length) return { error: 'archivo vacío (0 bytes)' }
    try {
      const meta = await sharp(buf).metadata()
      return {
        sha: crypto.createHash('sha1').update(buf).digest('hex'),
        bytes: buf.length,
        ancho: meta.width,
        alto: meta.height,
      }
    } catch {
      return { error: 'no se puede abrir como imagen', bytes: buf.length }
    }
  } catch (e) {
    return { error: e.message }
  }
}

/** Descarga en tandas para no abrir 233 conexiones a la vez contra Storage. */
async function enTandas(items, tam, fn) {
  const out = []
  for (let i = 0; i < items.length; i += tam) {
    out.push(...(await Promise.all(items.slice(i, i + tam).map(fn))))
    process.stderr.write(`\r  descargando ${Math.min(i + tam, items.length)}/${items.length}…   `)
  }
  process.stderr.write('\r' + ' '.repeat(40) + '\r')
  return out
}

// ─────────────────────────────────────────────────────────────────────────────

const main = async () => {
  const url =
    `${SUPABASE_URL}/rest/v1/productos` +
    `?select=id,slug,nombre,precio,categorias(nombre,slug),producto_imagenes(${CAMPOS.join(',')})` +
    `&activo=eq.true&order=slug`
  const productos = await (await fetch(url, { headers: cabeceras })).json()
  if (!Array.isArray(productos)) {
    console.error('Respuesta inesperada de Supabase:', productos)
    process.exit(1)
  }

  // Lista plana de todas las fotos a revisar.
  const fotos = []
  const sinFoto = []
  for (const p of productos) {
    const img = p.producto_imagenes?.[0]
    const cat = p.categorias?.nombre || 'Sin categoría'
    if (!img || !img.imagen_principal) {
      sinFoto.push({ slug: p.slug, nombre: p.nombre, cat })
      if (!img) continue
    }
    for (const campo of CAMPOS) {
      if (!img[campo]) continue
      fotos.push({ slug: p.slug, nombre: p.nombre, cat, campo, url: img[campo] })
    }
  }

  if (!RAPIDO) {
    const datos = await enTandas(fotos, 12, (f) => inspeccionar(f.url))
    fotos.forEach((f, i) => Object.assign(f, datos[i]))
  }

  // ── Problema 1: la ruta no corresponde al producto ────────────────────────
  const rutaAjena = []
  for (const f of fotos) {
    const ruta = rutaEnBucket(f.url)
    const carpeta = ruta.includes('/') ? ruta.slice(0, ruta.lastIndexOf('/')) : '(raíz del bucket)'
    const coincide = parecido(f.slug, ruta)
    // Umbral 0.7: tolera que falte alguna palabra suelta del slug (los nombres se acortan
    // al subir), pero no tolera que la ruta hable de otro instrumento.
    if (coincide < 0.7) {
      rutaAjena.push({ ...f, carpeta, ruta, coincide: Math.round(coincide * 100) })
    }
  }

  // ── Problema 2: la misma URL en dos productos distintos ───────────────────
  const porUrl = new Map()
  for (const f of fotos) {
    if (!porUrl.has(f.url)) porUrl.set(f.url, [])
    porUrl.get(f.url).push(f)
  }
  const urlCompartida = [...porUrl.values()].filter(
    (l) => new Set(l.map((x) => x.slug)).size > 1,
  )

  // ── Problema 3: el mismo ARCHIVO en dos productos distintos ───────────────
  const porSha = new Map()
  for (const f of fotos) {
    if (!f.sha) continue
    if (!porSha.has(f.sha)) porSha.set(f.sha, [])
    porSha.get(f.sha).push(f)
  }
  const contenidoCompartido = [...porSha.values()].filter(
    (l) => new Set(l.map((x) => x.slug)).size > 1,
  )

  // ── Problema 4: rota ──────────────────────────────────────────────────────
  const rotas = fotos.filter((f) => f.error)

  // ── Problema 5: fuera del Storage de Supabase ─────────────────────────────
  const fueraDeStorage = fotos.filter((f) => {
    try {
      return new URL(f.url).hostname !== HOST_STORAGE
    } catch {
      return true // ni siquiera es una URL válida
    }
  })

  // ── Informe ───────────────────────────────────────────────────────────────
  const agruparPorCategoria = (lista) => {
    const g = {}
    for (const f of lista) (g[f.cat] ||= []).push(f)
    return g
  }
  const linea = (f) =>
    `      · ${f.nombre}\n        slug: ${f.slug}  [${f.campo}]\n        ${f.url}`

  const bloque = (titulo, porQue, lista, pintar = linea) => {
    console.log(`\n${'─'.repeat(78)}`)
    console.log(`${titulo}  →  ${lista.length}`)
    console.log(`  ${porQue}`)
    if (!lista.length) {
      console.log('  ✔ nada que revisar aquí.')
      return
    }
    for (const [cat, items] of Object.entries(agruparPorCategoria(lista))) {
      console.log(`\n    ${cat}`)
      for (const f of items) console.log(pintar(f))
    }
  }

  console.log(`\n${'='.repeat(78)}`)
  console.log('AUDITORÍA DE IMÁGENES DEL CATÁLOGO')
  console.log(`${'='.repeat(78)}`)
  console.log(`  Productos activos ........ ${productos.length}`)
  console.log(`  Fotos revisadas .......... ${fotos.length}${RAPIDO ? '  (modo --rapido: sin descargar)' : ''}`)
  console.log(`  Storage esperado ......... ${HOST_STORAGE}`)

  bloque(
    '1. LA RUTA NO CORRESPONDE AL PRODUCTO',
    'La carpeta de Storage habla de otro producto: sospecha de foto cruzada.',
    rutaAjena,
    (f) =>
      `      · ${f.nombre}\n        slug del producto: ${f.slug}\n        carpeta de la foto: ${f.carpeta}   (coincide ${f.coincide}%)\n        [${f.campo}] ${f.url}`,
  )

  bloque(
    '5. FOTO FUERA DEL STORAGE DE SUPABASE',
    'Resto del WordPress viejo: no la controlamos y puede caerse cualquier día.',
    fueraDeStorage,
  )

  bloque(
    '4. FOTO ROTA O ILEGIBLE',
    'Devuelve error, viene vacía o no se abre como imagen: en la web sale un hueco.',
    rotas,
    (f) => `      · ${f.nombre}  [${f.campo}]  ⟶ ${f.error}\n        ${f.url}`,
  )

  console.log(`\n${'─'.repeat(78)}`)
  console.log(`2. LA MISMA URL EN PRODUCTOS DISTINTOS  →  ${urlCompartida.length} grupo(s)`)
  console.log('  Dos fichas enseñando literalmente la misma foto: casi seguro un copiado mal hecho.')
  if (!urlCompartida.length) console.log('  ✔ nada que revisar aquí.')
  for (const grupo of urlCompartida) {
    console.log(`\n    ${rutaEnBucket(grupo[0].url)}`)
    for (const f of grupo) console.log(`      · [${f.cat}] ${f.nombre}  (${f.slug} · ${f.campo})`)
  }

  console.log(`\n${'─'.repeat(78)}`)
  console.log(`3. EL MISMO ARCHIVO CON DISTINTA URL  →  ${contenidoCompartido.length} grupo(s)`)
  console.log('  La ruta lleva el slug bueno pero el archivo es idéntico al de otro producto:')
  console.log('  es la huella de una foto sobreescrita con la del producto equivocado.')
  if (RAPIDO) console.log('  (omitido en modo --rapido)')
  else if (!contenidoCompartido.length) console.log('  ✔ nada que revisar aquí.')
  for (const grupo of contenidoCompartido) {
    console.log(`\n    huella ${grupo[0].sha.slice(0, 12)} · ${Math.round(grupo[0].bytes / 1024)} KB · ${grupo[0].ancho}×${grupo[0].alto}`)
    for (const f of grupo) {
      console.log(`      · [${f.cat}] ${f.nombre}  (${f.slug} · ${f.campo})`)
      console.log(`        ${f.url}`)
    }
  }

  console.log(`\n${'─'.repeat(78)}`)
  console.log(`6. PRODUCTO ACTIVO SIN FOTO PRINCIPAL  →  ${sinFoto.length}`)
  for (const p of sinFoto) console.log(`      · [${p.cat}] ${p.nombre}  (${p.slug})`)
  if (!sinFoto.length) console.log('  ✔ todos los productos activos tienen foto.')

  const totalSospechosas = new Set(
    [
      ...rutaAjena,
      ...rotas,
      ...fueraDeStorage,
      ...urlCompartida.flat(),
      ...contenidoCompartido.flat(),
    ].map((f) => `${f.slug}|${f.campo}`),
  ).size

  console.log(`\n${'='.repeat(78)}`)
  console.log(`RESUMEN: ${totalSospechosas} foto(s) sospechosa(s) de ${fotos.length} revisadas.`)
  console.log(`${'='.repeat(78)}\n`)

  if (SALIDA_JSON) {
    fs.writeFileSync(
      SALIDA_JSON,
      JSON.stringify(
        { generado: new Date().toISOString(), fotos, rutaAjena, urlCompartida, contenidoCompartido, rotas, fueraDeStorage, sinFoto },
        null,
        1,
      ),
    )
    console.log(`Detalle guardado en ${SALIDA_JSON}\n`)
  }
}

main().catch((e) => {
  console.error('Error:', e.message)
  process.exit(1)
})
