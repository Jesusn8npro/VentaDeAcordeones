// Auditoría de los datos que necesita la ficha de producto (PlantillaCatalogo / PlantillaCinema).
//
// POR QUÉ: la ficha sólo pinta lo que existe en la base —no inventa descripciones, garantías ni
// especificaciones—, así que un campo vacío se traduce en una sección que desaparece y en una
// ficha más pobre. Este script NO escribe nada: sólo dice qué falta y en qué categorías, para
// que Jesús sepa dónde vale la pena invertir el rato de escribir.
//
//   node scripts/auditar-datos-productos.mjs            → resumen + los peores 40 productos
//   node scripts/auditar-datos-productos.mjs --todos    → lista completa producto por producto
//   node scripts/auditar-datos-productos.mjs --csv      → CSV a stdout (para abrirlo en Excel)
//
// Lee las credenciales del .env de la raíz con un parser mínimo (mismo patrón que el resto de
// scripts/) y usa la service role key, que es la única que ve los productos sin filtros de RLS.
import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

/** Parser .env mínimo: sin dependencias, ignora comentarios y comillas. */
function leerEnv() {
  const ruta = new URL('../.env', import.meta.url)
  return Object.fromEntries(
    fs
      .readFileSync(ruta, 'utf8')
      .split(/\r?\n/)
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => {
        const i = l.indexOf('=')
        return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')]
      })
  )
}

const env = leerEnv()
const URL_SUPA = env.NEXT_PUBLIC_SUPABASE_URL || env.SUPABASE_URL
const CLAVE = env.SUPABASE_SERVICE_ROLE_KEY
if (!URL_SUPA || !CLAVE) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY en .env')
  process.exit(1)
}
const supa = createClient(URL_SUPA, CLAVE)

const args = process.argv.slice(2)
const TODOS = args.includes('--todos')
const CSV = args.includes('--csv')

/**
 * El importador dejó literales "No especificado" en talla/material/dimensiones/origen: para la
 * ficha eso es exactamente igual de vacío que un NULL, así que se cuenta como hueco.
 * Misma regla que `campoUtil()` en app/(sitio)/producto/[slug]/page.tsx.
 */
const vacio = (v) => {
  if (v === null || v === undefined) return true
  // `descripcion` es JSONB: puede llegar como objeto {titulo, contenido}.
  if (typeof v === 'object' && !Array.isArray(v)) {
    const t = v.contenido || v.texto || v.titulo || ''
    return vacio(t)
  }
  if (Array.isArray(v)) return v.length === 0
  const s = String(v).replace(/\s+/g, ' ').trim()
  return !s || /^no\s+especificad/i.test(s) || s === '-' || s === '0'
}

/**
 * Campos auditados. `critico` = sin esto la ficha se ve rota o no se puede comprar;
 * el resto son secciones que simplemente no se pintan (peor SEO y menos confianza).
 */
const CAMPOS = [
  { clave: 'imagen', etiqueta: 'Imagen principal', critico: true, falta: (p) => vacio(p.producto_imagenes?.[0]?.imagen_principal) },
  { clave: 'precio', etiqueta: 'Precio', critico: true, falta: (p) => !(Number(p.precio) > 0) },
  { clave: 'stock', etiqueta: 'Stock (0 unidades)', critico: true, falta: (p) => !(Number(p.stock) > 0) },
  { clave: 'categoria', etiqueta: 'Categoría', critico: true, falta: (p) => !p.categoria_id || vacio(p.categorias?.nombre) },
  { clave: 'descripcion', etiqueta: 'Descripción', critico: false, falta: (p) => vacio(p.descripcion) },
  { clave: 'marca', etiqueta: 'Marca', critico: false, falta: (p) => vacio(p.marca) },
  { clave: 'modelo', etiqueta: 'Modelo', critico: false, falta: (p) => vacio(p.modelo) },
  { clave: 'garantia_meses', etiqueta: 'Garantía (meses)', critico: false, falta: (p) => vacio(p.garantia_meses) },
  { clave: 'color', etiqueta: 'Color', critico: false, falta: (p) => vacio(p.color) },
  { clave: 'material', etiqueta: 'Material', critico: false, falta: (p) => vacio(p.material) },
  { clave: 'meta_description', etiqueta: 'Meta description', critico: false, falta: (p) => vacio(p.meta_description) },
  { clave: 'fotos_extra', etiqueta: 'Fotos secundarias', critico: false, falta: (p) => {
    const i = p.producto_imagenes?.[0] || {}
    return [i.imagen_secundaria_1, i.imagen_secundaria_2, i.imagen_secundaria_3, i.imagen_secundaria_4].every(vacio)
  } },
]

const { data, error } = await supa
  .from('productos')
  .select(
    'id, nombre, slug, precio, stock, marca, modelo, color, material, garantia_meses, descripcion, meta_description, categoria_id, categorias(nombre), producto_imagenes(imagen_principal, imagen_secundaria_1, imagen_secundaria_2, imagen_secundaria_3, imagen_secundaria_4)'
  )
  .eq('activo', true)
  .order('nombre')

if (error) {
  console.error('Supabase:', error.message)
  process.exit(1)
}

const productos = data.map((p) => ({
  ...p,
  categoria: p.categorias?.nombre || '(sin categoría)',
  huecos: CAMPOS.filter((c) => c.falta(p)),
}))

if (CSV) {
  console.log(['slug', 'nombre', 'categoria', ...CAMPOS.map((c) => c.clave)].join(','))
  for (const p of productos) {
    const faltan = new Set(p.huecos.map((h) => h.clave))
    console.log(
      [`"${p.slug}"`, `"${(p.nombre || '').replace(/"/g, "'")}"`, `"${p.categoria}"`, ...CAMPOS.map((c) => (faltan.has(c.clave) ? 'FALTA' : 'ok'))].join(',')
    )
  }
  process.exit(0)
}

const n = productos.length
console.log(`\n═══ AUDITORÍA DE DATOS · ${n} productos activos ═══\n`)

// ── 1. Ranking de campos por cuántos productos afecta ─────────────────────────
console.log('CAMPOS VACÍOS (ordenados por productos afectados)\n')
const ranking = CAMPOS.map((c) => ({ ...c, total: productos.filter((p) => c.falta(p)).length }))
  .filter((c) => c.total > 0)
  .sort((a, b) => b.total - a.total)

for (const c of ranking) {
  const pct = Math.round((c.total / n) * 100)
  const barra = '█'.repeat(Math.round(pct / 3)).padEnd(34, '·')
  console.log(`  ${c.etiqueta.padEnd(20)} ${String(c.total).padStart(3)}/${n}  ${String(pct).padStart(3)}%  ${barra}${c.critico ? '  ← CRÍTICO' : ''}`)
}

// ── 2. Desglose por categoría ─────────────────────────────────────────────────
console.log('\n\nPOR CATEGORÍA (productos con al menos un hueco)\n')
const porCategoria = {}
for (const p of productos) {
  ;(porCategoria[p.categoria] ||= []).push(p)
}
const cats = Object.entries(porCategoria)
  .map(([nombre, arr]) => ({
    nombre,
    total: arr.length,
    conHuecos: arr.filter((p) => p.huecos.length > 0).length,
    criticos: arr.filter((p) => p.huecos.some((h) => h.critico)).length,
    detalle: ranking
      .map((c) => ({ etiqueta: c.etiqueta, total: arr.filter((p) => c.falta(p)).length }))
      .filter((d) => d.total > 0)
      .sort((a, b) => b.total - a.total),
  }))
  .sort((a, b) => b.conHuecos - a.conHuecos)

for (const c of cats) {
  console.log(`  ${c.nombre}  —  ${c.conHuecos}/${c.total} con huecos${c.criticos ? `, ${c.criticos} con huecos CRÍTICOS` : ''}`)
  console.log(`     ${c.detalle.map((d) => `${d.etiqueta}: ${d.total}`).join(' · ')}`)
}

// ── 3. Productos que no se pueden comprar ─────────────────────────────────────
const rotos = productos.filter((p) => p.huecos.some((h) => h.critico))
console.log(`\n\nPRODUCTOS CON HUECOS CRÍTICOS (${rotos.length})`)
console.log('(sin imagen, sin precio, sin stock o sin categoría: la ficha se ve incompleta o no se puede añadir al carrito)\n')
for (const p of rotos.slice(0, TODOS ? rotos.length : 40)) {
  console.log(`  ${p.slug}`)
  console.log(`     ${p.categoria} · falta: ${p.huecos.filter((h) => h.critico).map((h) => h.etiqueta).join(', ')}`)
}
if (!TODOS && rotos.length > 40) console.log(`  … y ${rotos.length - 40} más (usa --todos)`)

// ── 4. Fichas más pobres ──────────────────────────────────────────────────────
const pobres = [...productos].sort((a, b) => b.huecos.length - a.huecos.length).filter((p) => p.huecos.length >= 4)
console.log(`\n\nFICHAS MÁS POBRES (${pobres.length} productos con 4+ campos vacíos)\n`)
for (const p of pobres.slice(0, TODOS ? pobres.length : 25)) {
  console.log(`  [${p.huecos.length}] ${p.slug}  (${p.categoria})`)
  console.log(`       ${p.huecos.map((h) => h.etiqueta).join(', ')}`)
}
if (!TODOS && pobres.length > 25) console.log(`  … y ${pobres.length - 25} más (usa --todos)`)

const impecables = productos.filter((p) => p.huecos.length === 0).length
console.log(`\n\nRESUMEN: ${impecables}/${n} fichas completas · ${rotos.length} con huecos críticos · ${pobres.length} con 4+ campos vacíos\n`)
