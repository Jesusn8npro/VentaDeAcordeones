'use client'

// usarProductosTienda — consulta paginada de productos para /tienda con todos los filtros del sidebar.
// Reinicia a la página 1 cuando cambian los filtros (comparados por contenido) y expone
// cargarMas() para paginación incremental. Las respuestas tardías se descartan (idRef).

import { useCallback, useEffect, useRef, useState } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'
import type { FiltrosTienda, OrdenTienda } from './filtrosTienda'

export const PRODUCTOS_POR_PAGINA = 24

const SELECT = `
  *,
  categorias ( id, nombre, slug ),
  producto_imagenes ( imagen_principal, imagen_secundaria_1, imagen_secundaria_2, imagen_secundaria_3, imagen_secundaria_4 )
`

// Los valores van dentro de la sintaxis or=(...) de PostgREST: fuera comas, paréntesis y comillas.
const limpiarTermino = (s: string) => s.replace(/[,()"\\]/g, ' ').replace(/\s+/g, ' ').trim()

function aplicarFiltros(consulta: any, f: FiltrosTienda, categoriaFija?: string | null) {
  const categorias = categoriaFija ? [categoriaFija] : f.categorias
  if (categorias.length) consulta = consulta.in('categoria_id', categorias)

  const q = limpiarTermino(f.busqueda)
  if (q) consulta = consulta.or(`nombre.ilike.%${q}%,marca.ilike.%${q}%,modelo.ilike.%${q}%`)

  if (f.precioMin != null) consulta = consulta.gte('precio', f.precioMin)
  if (f.precioMax != null) consulta = consulta.lte('precio', f.precioMax)

  // ilike sin comodines = igualdad sin distinguir mayúsculas (HOHNER / Hohner)
  if (f.marcas.length) consulta = consulta.or(f.marcas.map(m => `marca.ilike."${limpiarTermino(m)}"`).join(','))

  if (f.rating > 0) consulta = consulta.gte('calificacion_promedio', f.rating)
  if (f.enStock) consulta = consulta.gt('stock', 0)
  if (f.conDescuento) consulta = consulta.not('precio_original', 'is', null).gt('descuento', 0)
  return consulta
}

// Siempre termina en `id` como desempate: sin un orden total, Postgres puede devolver filas
// repetidas/omitidas entre páginas (aparecían keys duplicadas al "Cargar más").
function aplicarOrden(consulta: any, orden: OrdenTienda) {
  switch (orden) {
    case 'precio-asc': consulta = consulta.order('precio', { ascending: true }); break
    case 'precio-desc': consulta = consulta.order('precio', { ascending: false }); break
    case 'vendidos': consulta = consulta.order('numero_de_ventas', { ascending: false, nullsFirst: false }).order('destacado', { ascending: false }); break
    case 'novedades': consulta = consulta.order('creado_el', { ascending: false }); break
    default: consulta = consulta.order('destacado', { ascending: false }).order('creado_el', { ascending: false })
  }
  return consulta.order('id', { ascending: true })
}

/** Aplana producto_imagenes → fotos_principales para que las tarjetas siempre tengan imagen. */
function conImagenes(p: any) {
  const img = Array.isArray(p.producto_imagenes) ? p.producto_imagenes[0] : null
  const fotos = img
    ? [img.imagen_principal, img.imagen_secundaria_1, img.imagen_secundaria_2, img.imagen_secundaria_3, img.imagen_secundaria_4].filter(Boolean)
    : []
  return { ...p, fotos_principales: fotos.length ? fotos : p.fotos_principales }
}

interface Params {
  filtros: FiltrosTienda
  orden: OrdenTienda
  /** Id de categoría fijado por la ruta /tienda/categoria/[slug] */
  categoriaFija?: string | null
  /** Espera hasta resolver la categoría de la ruta antes de consultar */
  listo?: boolean
}

export function usarProductosTienda({ filtros, orden, categoriaFija = null, listo = true }: Params) {
  const [productos, setProductos] = useState<any[]>([])
  const [total, setTotal] = useState<number | null>(null)
  const [cargando, setCargando] = useState(true)
  const [cargandoMas, setCargandoMas] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const paginaRef = useRef(1)
  const idRef = useRef(0)

  const clave = JSON.stringify({ filtros, orden, categoriaFija })

  const consultar = useCallback(async (pagina: number) => {
    const id = ++idRef.current
    const desde = (pagina - 1) * PRODUCTOS_POR_PAGINA
    let consulta = clienteSupabase
      .from('productos')
      .select(SELECT, { count: 'exact' })
      .eq('activo', true)
      .or('stock.gt.0,estado.eq.vendido')
    consulta = aplicarOrden(aplicarFiltros(consulta, filtros, categoriaFija), orden)
    const { data, error: err, count } = await consulta.range(desde, desde + PRODUCTOS_POR_PAGINA - 1)
    if (id !== idRef.current) return null // llegó tarde: hay una consulta más nueva
    if (err) throw err
    return { items: (data || []).map(conImagenes), total: count ?? 0 }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clave])

  useEffect(() => {
    if (!listo) return
    let cancelado = false
    paginaRef.current = 1
    setCargando(true)
    setError(null)
    consultar(1)
      .then(r => { if (r && !cancelado) { setProductos(r.items); setTotal(r.total) } })
      .catch(e => { if (!cancelado) setError(e?.message || 'No pudimos cargar los productos.') })
      .finally(() => { if (!cancelado) setCargando(false) })
    return () => { cancelado = true }
  }, [consultar, listo])

  const cargarMas = useCallback(async () => {
    if (cargandoMas || cargando || total == null || productos.length >= total) return
    setCargandoMas(true)
    try {
      const r = await consultar(paginaRef.current + 1)
      if (r) {
        paginaRef.current += 1
        setProductos(prev => {
          const vistos = new Set(prev.map(p => p.id))
          return [...prev, ...r.items.filter(p => !vistos.has(p.id))]
        })
        setTotal(r.total)
      }
    } catch (e: any) {
      setError(e?.message || 'No pudimos cargar más productos.')
    } finally {
      setCargandoMas(false)
    }
  }, [consultar, cargandoMas, cargando, total, productos.length])

  const reintentar = useCallback(() => {
    paginaRef.current = 1
    setCargando(true)
    setError(null)
    consultar(1)
      .then(r => { if (r) { setProductos(r.items); setTotal(r.total) } })
      .catch(e => setError(e?.message || 'No pudimos cargar los productos.'))
      .finally(() => setCargando(false))
  }, [consultar])

  return {
    productos,
    total,
    cargando,
    cargandoMas,
    error,
    hayMas: total != null && productos.length < total,
    cargarMas,
    reintentar,
  }
}
