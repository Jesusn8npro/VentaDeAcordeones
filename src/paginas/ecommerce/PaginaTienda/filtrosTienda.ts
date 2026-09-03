// filtrosTienda.ts — modelo único de filtros de la tienda + (de)serialización a la URL.
// La URL es la fuente de verdad: PaginaTienda lee searchParams → FiltrosTienda y los
// cambios se escriben de vuelta con filtrosAParams. Así sidebar, chips y grid nunca se desincronizan.

export interface FiltrosTienda {
  busqueda: string
  categorias: string[]
  precioMin: number | null
  precioMax: number | null
  /** Claves normalizadas (mayúsculas) — ver normalizarMarca */
  marcas: string[]
  rating: number
  enStock: boolean
  conDescuento: boolean
}

export type OrdenTienda = 'relevancia' | 'precio-asc' | 'precio-desc' | 'vendidos' | 'novedades'
export type VistaTienda = 'grid' | 'lista'

export const FILTROS_VACIOS: FiltrosTienda = {
  busqueda: '',
  categorias: [],
  precioMin: null,
  precioMax: null,
  marcas: [],
  rating: 0,
  enStock: false,
  conDescuento: false,
}

export const OPCIONES_ORDEN: { valor: OrdenTienda; etiqueta: string }[] = [
  { valor: 'relevancia', etiqueta: 'Relevancia' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
  { valor: 'vendidos', etiqueta: 'Más vendidos' },
  { valor: 'novedades', etiqueta: 'Novedades' },
]

const ORDENES = new Set<string>(OPCIONES_ORDEN.map(o => o.valor))

const numeroOnull = (v: string | null): number | null => {
  const n = parseInt(v ?? '', 10)
  return Number.isFinite(n) && n > 0 ? n : null
}
const lista = (v: string | null): string[] => (v ? v.split(',').map(s => s.trim()).filter(Boolean) : [])

export function leerFiltrosDeURL(sp: URLSearchParams): { filtros: FiltrosTienda; orden: OrdenTienda; vista: VistaTienda } {
  const orden = sp.get('orden') ?? ''
  const rating = parseInt(sp.get('rating') ?? '', 10)
  return {
    filtros: {
      busqueda: sp.get('q') ?? '',
      categorias: lista(sp.get('categorias')),
      precioMin: numeroOnull(sp.get('min')),
      precioMax: numeroOnull(sp.get('max')),
      marcas: lista(sp.get('marcas')).map(normalizarMarca),
      rating: rating >= 1 && rating <= 5 ? rating : 0,
      enStock: sp.get('stock') === '1',
      conDescuento: sp.get('oferta') === '1',
    },
    orden: (ORDENES.has(orden) ? orden : 'relevancia') as OrdenTienda,
    vista: sp.get('vista') === 'lista' ? 'lista' : 'grid',
  }
}

export function filtrosAParams(f: FiltrosTienda, orden: OrdenTienda, vista: VistaTienda): URLSearchParams {
  const p = new URLSearchParams()
  if (f.busqueda) p.set('q', f.busqueda)
  if (f.categorias.length) p.set('categorias', f.categorias.join(','))
  if (f.precioMin != null) p.set('min', String(f.precioMin))
  if (f.precioMax != null) p.set('max', String(f.precioMax))
  if (f.marcas.length) p.set('marcas', f.marcas.join(','))
  if (f.rating > 0) p.set('rating', String(f.rating))
  if (f.enStock) p.set('stock', '1')
  if (f.conDescuento) p.set('oferta', '1')
  if (orden !== 'relevancia') p.set('orden', orden)
  if (vista !== 'grid') p.set('vista', vista)
  return p
}

/** Cuenta criterios activos (las categorías se excluyen cuando vienen fijadas por la ruta). */
export function contarFiltrosActivos(f: FiltrosTienda, incluirCategorias = true): number {
  let n = 0
  if (f.busqueda) n++
  if (incluirCategorias && f.categorias.length) n++
  if (f.precioMin != null || f.precioMax != null) n++
  n += f.marcas.length
  if (f.rating > 0) n++
  if (f.enStock) n++
  if (f.conDescuento) n++
  return n
}

const fmtCOP = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })
export const formatearCOP = (n: number): string => fmtCOP.format(n)

/** "HOHNER", "Hohner " y "hohner" son la misma marca. */
export const normalizarMarca = (m: string): string => m.trim().replace(/\s+/g, ' ').toUpperCase()

/** Etiqueta legible: "ELECTRO VOICE" → "Electro Voice"; siglas cortas (KZ, QSC) se conservan. */
export function etiquetaMarca(clave: string): string {
  return clave
    .split(' ')
    .map(p => (p.length <= 3 ? p : p.charAt(0) + p.slice(1).toLowerCase()))
    .join(' ')
}
