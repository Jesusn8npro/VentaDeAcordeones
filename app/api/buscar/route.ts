import { NextResponse } from 'next/server'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import { ipDe, permitir } from '../_lib/rateLimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ───────────────────────────────────────────────────────────────────────────
// GET /api/buscar?q=…  →  sugerencias instantáneas del buscador del encabezado.
//
// POR QUÉ EXISTE: hasta ahora el buscador solo redirigía a /tienda?q=… al pulsar
// Enter. El cliente escribía a ciegas en un catálogo de ~174 productos y se caía
// de la compra. Las guías de UX de búsqueda en ecommerce (Baymard, Doofinder)
// coinciden en tres cosas que aquí se aplican: mostrar PRODUCTOS REALES con foto
// y precio dentro del desplegable (se puede decidir sin llegar a la página de
// resultados), agrupar por tipo (productos / categorías / blog) y no pasar de
// ~8-10 sugerencias para no provocar parálisis de elección.
// ───────────────────────────────────────────────────────────────────────────

const MAX_TERMINO = 64 // un término más largo que esto no es una búsqueda real: es un pegado o un abuso
const MIN_TERMINO = 2
const MAX_PRODUCTOS = 6
const MAX_CATEGORIAS = 3
const MAX_ARTICULOS = 2

/** Quita tildes y baja a minúsculas: "Acordeón" y "acordeon" deben ser el mismo término. */
function normalizar(s: unknown): string {
  return String(s ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Deja solo letras, números, espacios y guiones. Los caracteres `,().:"*%` rompen
 * la sintaxis de los filtros `or=(…)` de PostgREST (y `%`/`*` son comodines de ilike),
 * así que quitarlos es a la vez corrección e inyección evitada.
 */
function sanear(s: string): string {
  return s.replace(/[^\p{L}\p{N}\s-]/gu, ' ').replace(/\s+/g, ' ').trim()
}

/**
 * Patrón para ilike insensible a tildes. Postgres no trae `unaccent` aquí, así que
 * cada vocal se sustituye por `_` (comodín de UN carácter): "acorde_n" casa con
 * "acordeon" Y con "acordeón". Solo a partir de 4 caracteres — con términos cortos
 * el comodín devolvería medio catálogo. El filtro fino se hace luego en JS.
 */
function patronIlike(termino: string): string {
  return termino.length >= 4 ? termino.replace(/[aeiou]/g, '_') : termino
}

type ProductoFila = {
  nombre: string
  slug: string
  precio: number | null
  precio_original: number | null
  marca: string | null
  stock: number | null
  categorias: { nombre?: string; slug?: string } | { nombre?: string; slug?: string }[] | null
  producto_imagenes: { imagen_principal?: string | null }[] | null
}

/** El embed de PostgREST llega como objeto o como array de uno según lo infiera. */
function unoDe<T>(v: T | T[] | null | undefined): T | null {
  return (Array.isArray(v) ? v[0] : v) || null
}

/**
 * Relevancia: primero lo que EMPIEZA por el término (lo que el cliente espera al
 * autocompletar), luego lo que empieza una palabra por él, luego lo que solo lo
 * contiene. Sin stock cae al final: mostrar arriba lo que no se puede vender es
 * regalar el clic.
 */
function puntuar(p: ProductoFila, termino: string, palabras: string[]): number | null {
  const nombre = normalizar(p.nombre)
  const marca = normalizar(p.marca)
  const texto = `${nombre} ${marca}`

  let base: number
  if (nombre.startsWith(termino)) base = 0
  else if (new RegExp(`\\b${termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(nombre)) base = 10
  else if (nombre.includes(termino)) base = 20
  else if (marca.startsWith(termino) || marca.includes(termino)) base = 30
  else if (palabras.length > 1 && palabras.every((w) => texto.includes(w))) base = 40
  else return null // la fila venía del comodín `_` pero no casa de verdad: fuera

  if (!(Number(p.stock) > 0)) base += 100
  return base + Math.min(nombre.length, 60) / 1000 // a igualdad, gana el nombre más corto (más específico)
}

export async function GET(req: Request) {
  // 90/min: con 300 ms de retardo en el cliente una persona normal no pasa de ~20.
  if (!permitir(ipDe(req), 90)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes.' }, { status: 429 })
  }

  const cruda = new URL(req.url).searchParams.get('q') || ''
  // Primero normalizar y DESPUÉS sanear: si el navegador manda la tilde descompuesta
  // (o + U+0301), el saneado la vería como carácter no-letra y partiría la palabra
  // ("acordeón" → "acorde n"). Quitando los diacríticos antes, eso no puede pasar.
  const termino = sanear(normalizar(cruda.slice(0, MAX_TERMINO)))

  if (termino.length < MIN_TERMINO) {
    return NextResponse.json(
      { termino, productos: [], categorias: [], articulos: [] },
      { headers: { 'Cache-Control': 'public, max-age=300' } }
    )
  }

  const palabras = termino.split(' ').filter((w) => w.length >= 2)
  const masLarga = palabras.reduce((a, b) => (b.length > a.length ? b : a), '')
  // Patrones únicos: el literal (preciso) y el de comodín (tolerante a tildes).
  const patrones = Array.from(
    new Set([termino, patronIlike(termino), masLarga, patronIlike(masLarga)].filter((p) => p.length >= MIN_TERMINO))
  )
  const orProductos = patrones
    .flatMap((p) => [`nombre.ilike.*${p}*`, `marca.ilike.*${p}*`])
    .join(',')
  const orCategorias = patrones.map((p) => `nombre.ilike.*${p}*`).join(',')
  const orArticulos = patrones.map((p) => `titulo.ilike.*${p}*`).join(',')

  try {
    // En paralelo: tres consultas cortas tardan lo que la más lenta, no lo que la suma.
    const [resProductos, resCategorias, resArticulos] = await Promise.all([
      supabaseServidor
        .from('productos')
        .select('nombre, slug, precio, precio_original, marca, stock, categorias(nombre, slug), producto_imagenes(imagen_principal)')
        .eq('activo', true)
        .or(orProductos)
        // El comodín puede traer ruido; ordenando por stock, si hay que cortar en 60
        // se cortan los agotados y no los vendibles.
        .order('stock', { ascending: false })
        .limit(60),
      supabaseServidor
        .from('categorias')
        .select('nombre, slug')
        .eq('activo', true)
        .or(orCategorias)
        .limit(12),
      supabaseServidor
        .from('articulos_web')
        .select('titulo, slug')
        .eq('estado_publicacion', 'publicado')
        .or(orArticulos)
        .order('fecha_publicacion', { ascending: false })
        .limit(8),
    ])

    const productos = ((resProductos.data as ProductoFila[] | null) || [])
      .map((p) => ({ p, score: puntuar(p, termino, palabras) }))
      .filter((x): x is { p: ProductoFila; score: number } => x.score !== null)
      .sort((a, b) => a.score - b.score)
      .slice(0, MAX_PRODUCTOS)
      .map(({ p }) => ({
        nombre: p.nombre,
        slug: p.slug,
        precio: Number(p.precio) || 0,
        precioOriginal: Number(p.precio_original) > Number(p.precio) ? Number(p.precio_original) : null,
        marca: p.marca || '',
        imagen: unoDe(p.producto_imagenes)?.imagen_principal || null,
        categoria: unoDe(p.categorias)?.nombre || '',
        hayStock: Number(p.stock) > 0,
      }))

    // Las categorías vuelven a filtrarse en JS porque el comodín `_` mete falsos positivos.
    const categorias = ((resCategorias.data as { nombre: string; slug: string }[] | null) || [])
      .filter((c) => normalizar(c.nombre).includes(termino) || (palabras.length > 1 && palabras.every((w) => normalizar(c.nombre).includes(w))))
      .slice(0, MAX_CATEGORIAS)
      .map((c) => ({ nombre: c.nombre, slug: c.slug }))

    const articulos = ((resArticulos.data as { titulo: string; slug: string }[] | null) || [])
      .filter((a) => a?.slug && a?.titulo)
      .filter((a) => normalizar(a.titulo).includes(termino) || (palabras.length > 1 && palabras.every((w) => normalizar(a.titulo).includes(w))))
      .slice(0, MAX_ARTICULOS)
      .map((a) => ({ titulo: a.titulo, slug: a.slug }))

    return NextResponse.json(
      { termino, productos, categorias, articulos },
      {
        headers: {
          // 60 s en el navegador: al borrar y reescribir el mismo término no se vuelve
          // a pegar a la BD. Es catálogo público, no hay nada personal que filtrar.
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (error: any) {
    console.error('[api/buscar]', error?.message)
    return NextResponse.json({ error: 'Error de búsqueda' }, { status: 500 })
  }
}
