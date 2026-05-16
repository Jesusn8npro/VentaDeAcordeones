import { useState, useCallback, useEffect, useMemo } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'

interface ArchivoSeleccionado {
  key?: string
  path: string
  name: string
}

interface Uso {
  producto_id: string | number
  producto?: { id: string | number; nombre?: string; slug?: string }
  campo: string
  valor?: string
}

interface PreviewProducto {
  producto?: { id: string | number; nombre?: string; slug?: string; precio?: number }
  imagenes?: { imagen_principal?: string; imagen_secundaria_1?: string }
}

const CAMPOS_IMAGEN = [
  'imagen_principal','imagen_secundaria_1','imagen_secundaria_2','imagen_secundaria_3','imagen_secundaria_4',
  'imagen_punto_dolor_1','imagen_punto_dolor_2','imagen_solucion_1','imagen_solucion_2',
  'imagen_testimonio_persona_1','imagen_testimonio_persona_2','imagen_testimonio_persona_3',
  'imagen_testimonio_producto_1','imagen_testimonio_producto_2','imagen_testimonio_producto_3',
  'imagen_caracteristicas','imagen_garantias','imagen_cta_final'
]

export function useConsultarUsos(
  obtenerUrlPublica: (key: string) => string,
  setModalAbierto: (v: boolean) => void,
  setImagenModal: (v: string) => void,
  setArchivoSeleccionado: (v: ArchivoSeleccionado | null) => void,
  setProductoSeleccionadoId: (v: string | null) => void,
  setCampoSeleccionado: (v: string) => void,
  modalAbierto: boolean
) {
  const [usos, setUsos] = useState<Uso[]>([])
  const [mostrandoUsos, setMostrandoUsos] = useState<string | null>(null)
  const [previewsProductos, setPreviewsProductos] = useState<PreviewProducto[]>([])
  const [productosDisponibles, setProductosDisponibles] = useState<any[]>([])
  const [busquedaProducto, setBusquedaProducto] = useState('')
  const [cargandoProductos, setCargandoProductos] = useState(false)

  const consultarUsos = useCallback(async (file: ArchivoSeleccionado) => {
    try {
      const key = `${file.path}${file.name}`
      setMostrandoUsos(key)
      setImagenModal(obtenerUrlPublica(key))
      setModalAbierto(true)
      setProductoSeleccionadoId(null)
      setCampoSeleccionado('')
      setArchivoSeleccionado(file)
      setUsos([])
      const url = obtenerUrlPublica(key)
      const { data: registros, error } = await clienteSupabase
        .from('producto_imagenes')
        .select(['producto_id', ...CAMPOS_IMAGEN].join(','))
      if (error) throw error
      const coincidencias: Array<{ producto_id: any; campo: string; valor: string }> = []
      for (const r of (registros || [])) {
        for (const campo of CAMPOS_IMAGEN) {
          const val = r[campo]
          if (typeof val === 'string' && (val.includes(url) || val.includes(file.name))) {
            coincidencias.push({ producto_id: r.producto_id, campo, valor: val })
          }
        }
      }
      const ids = Array.from(new Set(coincidencias.map(c => c.producto_id).filter(Boolean)))
      let productos: any[] = []
      if (ids.length > 0) {
        const { data: prods } = await clienteSupabase.from('productos').select('id, nombre, slug').in('id', ids)
        productos = prods || []
      }
      const mapa = new Map(productos.map(p => [p.id, p]))
      setUsos(coincidencias.map(c => ({ producto_id: c.producto_id, producto: mapa.get(c.producto_id), campo: c.campo, valor: c.valor })))
      if (coincidencias.length > 0) {
        setProductoSeleccionadoId(coincidencias[0].producto_id)
        setCampoSeleccionado(coincidencias[0].campo)
      }
      const { data: imgs } = ids.length > 0 ? await clienteSupabase
        .from('producto_imagenes')
        .select('producto_id, imagen_principal, imagen_secundaria_1')
        .in('producto_id', ids) : { data: [] }
      const mapaImgs = new Map((imgs || []).map(i => [i.producto_id, i]))
      setPreviewsProductos(ids.map(pid => ({ producto: mapa.get(pid), imagenes: mapaImgs.get(pid) || {} })))
      setBusquedaProducto('')
      setCargandoProductos(true)
      try {
        const { data: prodsTodos } = await clienteSupabase
          .from('productos')
          .select('id, nombre, slug, precio')
          .eq('activo', true)
          .order('nombre', { ascending: true })
          .limit(200)
        setProductosDisponibles(prodsTodos || [])
      } finally {
        setCargandoProductos(false)
      }
    } catch {
      setUsos([])
      setPreviewsProductos([])
    }
  }, [obtenerUrlPublica, setModalAbierto, setImagenModal, setArchivoSeleccionado, setProductoSeleccionadoId, setCampoSeleccionado])

  const cargarProductosFiltrados = useCallback(async (q: string) => {
    try {
      setCargandoProductos(true)
      let consulta = clienteSupabase
        .from('productos')
        .select('id, nombre, slug, precio')
        .eq('activo', true)
        .order('nombre', { ascending: true })
        .limit(200)
      if (q && q.trim().length >= 2) {
        const like = `%${q.trim()}%`
        consulta = consulta.or(`nombre.ilike.${like},slug.ilike.${like}`)
      }
      const { data } = await consulta
      setProductosDisponibles(data || [])
    } finally {
      setCargandoProductos(false)
    }
  }, [])

  useEffect(() => {
    if (modalAbierto) {
      const t = setTimeout(() => cargarProductosFiltrados(busquedaProducto), 250)
      return () => clearTimeout(t)
    }
  }, [modalAbierto, busquedaProducto, cargarProductosFiltrados])

  const productosSelector = useMemo(() => {
    const lista = [...productosDisponibles]
    const ids = new Set(lista.map(p => p.id))
    previewsProductos.forEach(pv => {
      const p = pv.producto
      if (p && !ids.has(p.id)) { lista.push(p); ids.add(p.id) }
    })
    return lista
  }, [productosDisponibles, previewsProductos])

  return {
    usos, mostrandoUsos, previewsProductos, busquedaProducto, setBusquedaProducto,
    cargandoProductos, productosSelector, consultarUsos
  }
}
