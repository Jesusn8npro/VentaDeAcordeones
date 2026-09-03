#!/usr/bin/env node
/**
 * Convierte los artículos Markdown de `contenido/blog/*.md` al modelo REAL de la tabla
 * `articulos_web` (secciones jsonb: encabezado / parrafo / lista / imagen / tabla / faq) y los
 * escribe en Supabase de forma IDEMPOTENTE por slug.
 *
 *   node scripts/blog/insertar-articulos.mjs             → genera scripts/blog/articulos.generado.json
 *   node scripts/blog/insertar-articulos.mjs --dry-run   → enseña por pantalla lo que escribiría, SIN
 *                                                          tocar la BD ni escribir archivos.
 *   node scripts/blog/insertar-articulos.mjs --insertar  → escribe en Supabase con
 *                                                          SUPABASE_SERVICE_ROLE_KEY (leída del .env).
 *   node scripts/blog/insertar-articulos.mjs --solo 01,07 → solo esos números de archivo.
 *
 * IDEMPOTENTE: se consulta el slug y
 *   · si NO existe → INSERT (estado_publicacion = `estado` del front-matter, por defecto 'publicado',
 *                    fecha_publicacion = `fecha` del front-matter o now());
 *   · si YA existe → UPDATE del contenido (título, secciones, SEO, imágenes…).
 * El UPDATE **no toca** `estado_publicacion` ni `fecha_publicacion`: re-correr el script para corregir
 * una errata no despublica ni cambia la fecha (y el SEO) de un artículo ya publicado.
 *
 * Formato del Markdown:
 *   · front-matter YAML: title, slug, metaTitle (≤60), description (≤160), keywords[], portada,
 *     portadaAlt, fecha, estado, cta[{texto, href, estilo}]
 *   · `# H1` = título · párrafos antes del primer `## H2` = intro (el 1.º va a resumen_completo)
 *   · `## / ###` → encabezado · párrafo → parrafo · `- ` / `1. ` → lista
 *   · `![alt](url "caption")` en su propia línea → imagen
 *   · tabla markdown → { tipo:'tabla', cabecera, filas } (el renderizador la pinta con React, sin HTML crudo)
 *   · `## Preguntas frecuentes` + `### Pregunta` + párrafo → { tipo:'faq', preguntas:[{pregunta, respuesta}] }
 *   El markdown inline (**negrita**, *cursiva*, [enlace](ruta)) se deja TAL CUAL: lo resuelve
 *   `src/paginas/blog/ArticuloBlog.tsx → formatearInline` sin inyectar HTML.
 *
 * Las claves NUNCA se escriben en este archivo: se leen del .env (misma lectura que
 * scripts/lib/recortar.mjs → leerEnv()).
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const yaml = require('js-yaml')

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const CARPETA_MD = join(RAIZ, 'contenido', 'blog')
const CARPETA_PUBLIC = join(RAIZ, 'public')
const SALIDA_JSON = join(RAIZ, 'scripts', 'blog', 'articulos.generado.json')

const AUTOR = 'Jesús González'
const AUTOR_INICIALES = 'JG'
const SITE_URL = 'https://ventadeacordeones.com'
const NUMERO_WA = '573144865310'

const args = process.argv.slice(2)
const modoInsertar = args.includes('--insertar')
const modoSimulacro = args.includes('--dry-run')
const soloArg = args.find((a) => a.startsWith('--solo'))
const solo = soloArg
  ? (soloArg.split('=')[1] || args[args.indexOf(soloArg) + 1] || '').split(',').map((s) => s.trim()).filter(Boolean)
  : null

function leerEnv() {
  const ruta = join(RAIZ, '.env')
  if (!existsSync(ruta)) return {}
  return Object.fromEntries(
    readFileSync(ruta, 'utf8').split(/\r?\n/)
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }),
  )
}

// ─── Markdown → bloques ────────────────────────────────────────────────────────────────────────

function separarFrontMatter(md) {
  const m = md.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!m) throw new Error('Sin front-matter')
  return { meta: yaml.load(m[1]) || {}, cuerpo: md.slice(m[0].length) }
}

const esTabla = (l) => /^\s*\|.*\|\s*$/.test(l)
const esLista = (l) => /^\s*(?:[-*]|\d+[.)])\s+/.test(l)
const esImagen = (l) => /^\s*!\[[^\]]*\]\([^)]+\)\s*$/.test(l)
const esEncabezado = (l) => /^#{1,6}\s/.test(l)
const partirFila = (l) => l.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
const esSeparadorTabla = (l) => /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(l)

function markdownABloques(cuerpo) {
  const lineas = cuerpo.replace(/\r\n/g, '\n').split('\n')
  const bloques = []
  let i = 0
  while (i < lineas.length) {
    const l = lineas[i]
    if (!l.trim()) { i++; continue }
    const h = l.match(/^(#{1,6})\s+(.*)$/)
    if (h) { bloques.push({ tipo: 'encabezado', nivel: h[1].length, contenido: h[2].trim() }); i++; continue }
    if (esImagen(l)) {
      const m = l.trim().match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/)
      bloques.push({ tipo: 'imagen', url: m[2], alt: m[1], ...(m[3] ? { caption: m[3] } : {}) })
      i++
      continue
    }
    if (esTabla(l)) {
      const filas = []
      while (i < lineas.length && esTabla(lineas[i])) filas.push(lineas[i++])
      const [cab, ...resto] = filas
      const cuerpoTabla = resto.filter((f) => !esSeparadorTabla(f))
      bloques.push({ tipo: 'tabla', cabecera: partirFila(cab), filas: cuerpoTabla.map(partirFila) })
      continue
    }
    if (esLista(l)) {
      const ordenada = /^\s*\d+[.)]/.test(l)
      const items = []
      while (i < lineas.length && (esLista(lineas[i]) || (lineas[i].startsWith('  ') && lineas[i].trim() && items.length))) {
        const t = lineas[i]
        if (esLista(t)) items.push(t.replace(/^\s*(?:[-*]|\d+[.)])\s+/, '').trim())
        else items[items.length - 1] += ' ' + t.trim()
        i++
      }
      bloques.push({ tipo: 'lista', ordenada, items })
      continue
    }
    const p = []
    while (i < lineas.length && lineas[i].trim() && !esEncabezado(lineas[i]) && !esTabla(lineas[i]) && !esLista(lineas[i]) && !esImagen(lineas[i])) p.push(lineas[i++].trim())
    bloques.push({ tipo: 'parrafo', contenido: p.join(' ') })
  }
  return bloques
}

/** Quita el markdown inline: para resumen_completo (se pinta en un <p> sin formateo) y para contar palabras. */
const textoPlano = (t) => String(t || '').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/\*([^*]+)\*/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

function armarArticulo(meta, cuerpo, nombreArchivo) {
  const bloques = markdownABloques(cuerpo)
  const h1 = bloques.find((b) => b.tipo === 'encabezado' && b.nivel === 1)
  const titulo = (h1?.contenido || meta.title || '').trim()
  if (!titulo) throw new Error(`${nombreArchivo}: sin título`)

  // Intro = párrafos entre el H1 y el primer H2. El primero va a resumen_completo y sale del cuerpo.
  const idxH1 = bloques.indexOf(h1)
  const idxPrimerH2 = bloques.findIndex((b, k) => k > idxH1 && b.tipo === 'encabezado' && b.nivel === 2)
  const intro = bloques.slice(idxH1 + 1, idxPrimerH2 === -1 ? undefined : idxPrimerH2)
  const primerParrafo = intro.find((b) => b.tipo === 'parrafo')
  const resumenCompleto = textoPlano(primerParrafo?.contenido || meta.description || '')

  // FAQ: desde «## Preguntas frecuentes» hasta el final.
  const idxFaq = bloques.findIndex((b) => b.tipo === 'encabezado' && b.nivel === 2 && /preguntas frecuentes/i.test(b.contenido))
  const cuerpoSinFaq = idxFaq === -1 ? bloques : bloques.slice(0, idxFaq)
  const preguntas = []
  if (idxFaq !== -1) {
    let actual = null
    for (const b of bloques.slice(idxFaq + 1)) {
      if (b.tipo === 'encabezado') { actual = { pregunta: b.contenido.replace(/\?\?$/, '?'), respuesta: '' }; preguntas.push(actual) }
      else if (actual && b.tipo === 'parrafo') actual.respuesta += (actual.respuesta ? ' ' : '') + b.contenido
    }
  }
  if (!preguntas.length && Array.isArray(meta.faq)) for (const f of meta.faq) preguntas.push({ pregunta: f.q, respuesta: f.a })

  const secciones = []
  for (const b of cuerpoSinFaq) {
    if (b === h1 || b === primerParrafo) continue
    if (b.tipo === 'encabezado') secciones.push({ tipo: 'encabezado', nivel: Math.min(Math.max(b.nivel, 2), 4), contenido: b.contenido })
    else if (b.tipo === 'parrafo') secciones.push({ tipo: 'parrafo', contenido: b.contenido })
    else if (b.tipo === 'lista') secciones.push({ tipo: 'lista', ordenada: b.ordenada, items: b.items })
    else if (b.tipo === 'imagen') secciones.push(b)
    else if (b.tipo === 'tabla') secciones.push(b)
  }
  if (preguntas.length) secciones.push({ tipo: 'faq', preguntas })

  const textoTotal = [resumenCompleto, ...secciones.map((s) => {
    if (s.tipo === 'lista') return s.items.join(' ')
    if (s.tipo === 'faq') return s.preguntas.map((p) => p.pregunta + ' ' + p.respuesta).join(' ')
    if (s.tipo === 'tabla') return [s.cabecera, ...s.filas].flat().join(' ')
    if (s.tipo === 'imagen') return ''
    return s.contenido || ''
  })].join(' ')
  const palabras = textoPlano(textoTotal).split(/\s+/).filter(Boolean).length

  const portada = String(meta.portada || '').trim()
  const keywords = Array.isArray(meta.keywords) ? meta.keywords.join(', ') : String(meta.keywords || '')
  const slug = String(meta.slug || '').trim()
  const metaTitulo = String(meta.metaTitle || meta.title || titulo).trim()
  const descripcion = String(meta.description || '').trim()

  const ctaItems = Array.isArray(meta.cta) && meta.cta.length
    ? meta.cta.map((c) => ({ texto: c.texto, href: c.href, ...(c.estilo ? { estilo: c.estilo } : {}) }))
    : [
        { texto: 'Ver acordeones en la tienda', href: '/tienda' },
        { texto: 'Asesoría por WhatsApp', href: `https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(`Hola, leí el artículo "${titulo}" y quiero asesoría.`)}`, estilo: 'whatsapp' },
      ]

  return {
    titulo,
    slug,
    resumen_breve: descripcion,
    resumen_completo: resumenCompleto,
    lectura_min: Number(meta.readingTime) || Math.max(3, Math.round(palabras / 200)),
    autor: AUTOR,
    autor_iniciales: AUTOR_INICIALES,
    estado_publicacion: String(meta.estado || 'publicado'),
    fecha_publicacion: meta.fecha ? new Date(meta.fecha).toISOString() : null,
    portada_url: portada || null,
    og_imagen_url: portada ? `${SITE_URL}${portada}` : null,
    secciones,
    cta: { items: ctaItems },
    meta_titulo: metaTitulo,
    meta_descripcion: descripcion,
    meta_keywords: keywords,
    canonical_url: `${SITE_URL}/blog/${slug}`,
    og_titulo: metaTitulo,
    og_descripcion: descripcion,
    twitter_card: 'summary_large_image',
    _archivo: nombreArchivo,
    _palabras: palabras,
    _portadaAlt: meta.portadaAlt || '',
  }
}

// ─── Rutas REALES del sitio (para no enlazar a un 404) ─────────────────────────────────────────

function rutasDeLaApp() {
  const rutas = new Set()
  const recorrer = (dir, ruta) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue
      if (e.name === 'api' || e.name.startsWith('_')) continue
      const esGrupo = e.name.startsWith('(') && e.name.endsWith(')')
      const hijo = join(dir, e.name)
      const rutaHija = esGrupo ? ruta : `${ruta}/${e.name}`
      if (!esGrupo && existsSync(join(hijo, 'page.tsx'))) rutas.add(rutaHija)
      recorrer(hijo, rutaHija)
    }
  }
  recorrer(join(RAIZ, 'app'), '')
  rutas.add('/')
  return rutas
}
const RUTAS_APP = rutasDeLaApp()

/** Slugs válidos de los clusters (/accesorios|instrumentos|audio/<slug>) leídos de src/datos/clusters.ts. */
function clustersReales() {
  const src = readFileSync(join(RAIZ, 'src', 'datos', 'clusters.ts'), 'utf8')
  const rutas = new Set()
  const re = /slug:\s*'([^']+)',\s*\n\s*base:\s*'([^']+)'/g
  let m
  while ((m = re.exec(src))) rutas.add(`/${m[2]}/${m[1]}`)
  return rutas
}
const RUTAS_CLUSTER = clustersReales()

function rutaExiste(ruta) {
  const limpia = ruta.split(/[?#]/)[0].replace(/\/$/, '') || '/'
  if (RUTAS_APP.has(limpia)) return true
  const partes = limpia.split('/').filter(Boolean)
  // Los clusters son dinámicos ([cluster]) pero el slug tiene que existir en src/datos/clusters.ts.
  if (['accesorios', 'instrumentos', 'audio'].includes(partes[0]) && partes.length === 2) return RUTAS_CLUSTER.has(limpia)
  return [...RUTAS_APP].some((r) => {
    const p = r.split('/').filter(Boolean)
    return p.length === partes.length && p.every((seg, i) => seg === partes[i] || /^\[.+\]$/.test(seg))
  })
}

// ─── Validaciones ──────────────────────────────────────────────────────────────────────────────

function validar(a) {
  const fallos = []
  const avisos = []
  if (!/^[a-z0-9-]+$/.test(a.slug)) fallos.push(`slug inválido: «${a.slug}»`)
  if (!a.meta_titulo) fallos.push('sin metaTitle')
  if (a.meta_titulo.length > 60) fallos.push(`meta_titulo de ${a.meta_titulo.length} chars (>60)`)
  if (!a.meta_descripcion) fallos.push('sin description')
  if (a.meta_descripcion.length > 160) fallos.push(`meta_descripcion de ${a.meta_descripcion.length} chars (>160)`)
  if (!a.meta_keywords) fallos.push('sin keywords')
  if (a._palabras < 900) fallos.push(`solo ${a._palabras} palabras (<900)`)
  if (a._palabras > 1400) avisos.push(`${a._palabras} palabras (>1400)`)
  const faq = a.secciones.find((s) => s.tipo === 'faq')
  if (!faq) fallos.push('sin FAQ')
  else if (faq.preguntas.length < 4 || faq.preguntas.length > 5) avisos.push(`FAQ con ${faq.preguntas.length} preguntas (se esperan 4–5)`)
  if (!a.secciones.some((s) => s.tipo === 'imagen')) fallos.push('sin sección tipo imagen')
  if (!a.portada_url) fallos.push('sin `portada` en el front-matter')

  // Imágenes locales: tienen que existir en public/.
  const imagenes = [a.portada_url, ...a.secciones.filter((s) => s.tipo === 'imagen').map((s) => s.url)].filter(Boolean)
  for (const img of imagenes) {
    if (/^https?:\/\//.test(img)) continue
    if (!existsSync(join(CARPETA_PUBLIC, img.replace(/^\/+/, '')))) fallos.push(`imagen inexistente en public/: ${img}`)
  }
  for (const s of a.secciones) if (s.tipo === 'imagen' && !s.alt) fallos.push(`imagen sin alt: ${s.url}`)

  // Enlaces internos: cada ruta tiene que existir en app/ (o en los clusters).
  const enlaces = JSON.stringify(a.secciones).match(/\]\((\/[^)\s]*)\)/g) || []
  for (const e of enlaces) {
    const r = e.slice(2, -1)
    if (r.startsWith('/blog/')) continue // se comprueba en revisarEnlacesCruzados
    if (!rutaExiste(r)) avisos.push(`ruta interna que NO existe en app/: ${r}`)
  }
  if (!enlaces.length) fallos.push('sin enlaces internos')
  return { fallos, avisos }
}

function enlacesDeBlog(a) {
  const crudos = JSON.stringify(a.secciones).match(/\]\((\/blog\/[^)\s]*)\)/g) || []
  return crudos.map((e) => e.slice(2, -1).split(/[?#]/)[0].replace(/\/$/, ''))
}

/** Enlaces cruzados: cada /blog/<slug> tiene que existir en la tanda (o ya en la BD, en --insertar). */
function revisarEnlacesCruzados(articulos, slugsExtra = new Set()) {
  const slugs = new Set([...articulos.map((a) => a.slug), ...slugsExtra])
  const entrantes = new Map(articulos.map((a) => [a.slug, 0]))
  let rotos = 0
  for (const a of articulos) {
    for (const ruta of enlacesDeBlog(a)) {
      const destino = ruta.replace(/^\/blog\//, '')
      if (!slugs.has(destino)) { console.error(`✗ ${a._archivo}: enlace a /blog/${destino} — ese slug no existe`); rotos++ }
      else if (destino !== a.slug && entrantes.has(destino)) entrantes.set(destino, entrantes.get(destino) + 1)
    }
  }
  const huerfanos = [...entrantes].filter(([, n]) => n === 0).map(([s]) => s)
  if (huerfanos.length) console.warn(`⚠ Sin enlaces entrantes (huérfanos): ${huerfanos.join(', ')}`)
  return rotos
}

// ─── Main ──────────────────────────────────────────────────────────────────────────────────────

const archivos = readdirSync(CARPETA_MD)
  .filter((f) => /^\d{2}-.*\.md$/.test(f))
  .filter((f) => !solo || solo.includes(f.slice(0, 2)))
  .sort()

const articulos = []
let hayFallos = false
for (const f of archivos) {
  const { meta, cuerpo } = separarFrontMatter(readFileSync(join(CARPETA_MD, f), 'utf8'))
  const a = armarArticulo(meta, cuerpo, f)
  const { fallos, avisos } = validar(a)
  if (fallos.length) { hayFallos = true; console.error(`✗ ${f}: ${fallos.join(' · ')}`) }
  else console.log(`✓ ${f} → ${a.slug} (${a._palabras} palabras, ${a.lectura_min} min, ${a.secciones.length} secciones)`)
  for (const av of avisos) console.warn(`  ⚠ ${av}`)
  articulos.push(a)
}
if (!solo && revisarEnlacesCruzados(articulos) > 0) hayFallos = true
if (hayFallos) { console.error('\nCorrige los fallos de arriba antes de publicar.'); process.exit(1) }

if (modoSimulacro) {
  console.log('\n─── SIMULACRO (--dry-run): no se escribe nada, ni en disco ni en Supabase ───')
  for (const a of articulos) {
    console.log(`\n▸ ${a._archivo} → slug «${a.slug}»`)
    console.log(`  titulo            ${a.titulo}`)
    console.log(`  meta_titulo       ${a.meta_titulo} (${a.meta_titulo.length})`)
    console.log(`  meta_descripcion  ${a.meta_descripcion} (${a.meta_descripcion.length})`)
    console.log(`  meta_keywords     ${a.meta_keywords}`)
    console.log(`  canonical_url     ${a.canonical_url}`)
    console.log(`  portada_url       ${a.portada_url}`)
    console.log(`  og_imagen_url     ${a.og_imagen_url}`)
    console.log(`  lectura_min       ${a.lectura_min}`)
    console.log(`  secciones         ${a.secciones.length} bloques · ${a._palabras} palabras · tipos: ${[...new Set(a.secciones.map((s) => s.tipo))].join(', ')}`)
    console.log(`  cta               ${a.cta.items.map((c) => `${c.texto} → ${c.href}`).join(' | ')}`)
    console.log(`  estado            estado_publicacion='${a.estado_publicacion}' SOLO al insertar (el UPDATE no lo toca)`)
  }
  console.log(`\n${articulos.length} artículos listos. Con --insertar: los slugs que ya existan se ACTUALIZAN, los demás se INSERTAN.`)
  process.exit(0)
}

writeFileSync(SALIDA_JSON, JSON.stringify(articulos, null, 2))
console.log(`\nJSON de revisión: ${SALIDA_JSON}`)

if (modoInsertar) {
  const env = { ...leerEnv(), ...process.env }
  const url = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL
  const clave = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !clave) {
    console.error('\n--insertar necesita NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en .env (o en el entorno). Nunca se escriben claves en este archivo.')
    process.exit(2)
  }
  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(url, clave, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: existentes, error: errorLectura } = await sb.from('articulos_web').select('id, slug, autor_id')
  if (errorLectura) { console.error('No pude leer articulos_web:', errorLectura.message); process.exit(1) }
  const idPorSlug = new Map((existentes || []).map((r) => [r.slug, r.id]))
  // autor_id: se reutiliza el de las filas ya existentes (mismo autor, JG) para no inventar un uuid.
  const autorId = env.BLOG_AUTOR_ID || (existentes || []).find((r) => r.autor_id)?.autor_id || null

  let insertados = 0
  let actualizados = 0
  for (const a of articulos) {
    const { _archivo, _palabras, _portadaAlt, slug, estado_publicacion, fecha_publicacion, ...contenidoFila } = a
    const id = idPorSlug.get(slug)
    if (id) {
      const { error } = await sb.from('articulos_web').update({ ...contenidoFila, actualizado_en: new Date().toISOString() }).eq('id', id)
      if (error) { console.error(`✗ ${slug}: ${error.message}`); process.exit(1) }
      actualizados++
      console.log(`↻ ${slug} actualizado`)
    } else {
      const fila = { ...contenidoFila, slug, estado_publicacion, fecha_publicacion: fecha_publicacion || new Date().toISOString(), ...(autorId ? { autor_id: autorId } : {}) }
      const { error } = await sb.from('articulos_web').insert([fila])
      if (error) { console.error(`✗ ${slug}: ${error.message}`); process.exit(1) }
      insertados++
      console.log(`+ ${slug} insertado (${estado_publicacion})`)
    }
  }
  console.log(`\n${insertados} insertados · ${actualizados} actualizados.`)
}
