import { useState, useEffect } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'

export function useCategorias(registrarActualizacion: (fn: () => void) => void) {
  const [categorias, setCategorias] = useState<any[]>([])
  const [productos, setProductos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)
  const [cargandoProductos, setCargandoProductos] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [estadisticas, setEstadisticas] = useState({
    totalCategorias: 0,
    categoriasActivas: 0,
    categoriasConProductos: 0,
    categoriasSinProductos: 0
  })
  const [busquedaProductos, setBusquedaProductos] = useState('')
  const [soloSinCategoria, setSoloSinCategoria] = useState(false)

  const cargarCategorias = async () => {
    try {
      setCargando(true)
      const { data, error } = await clienteSupabase
        .from('categorias')
        .select('id,nombre,slug,descripcion,icono,imagen_url,destacado,orden,activo,total_productos')
        .order('orden', { ascending: true })
      if (error) throw error
      setCategorias(data || [])
    } catch {
      setError('Error al cargar las categorías')
    } finally {
      setCargando(false)
    }
  }

  const cargarEstadisticas = async () => {
    try {
      const { count: total } = await clienteSupabase
        .from('categorias')
        .select('*', { count: 'exact', head: true })
      const { count: activas } = await clienteSupabase
        .from('categorias')
        .select('*', { count: 'exact', head: true })
        .eq('activo', true)
      const { data: categoriasConProductos } = await clienteSupabase
        .from('categorias')
        .select('id,total_productos')
      const conProductos = categoriasConProductos?.filter(cat => (cat.total_productos || 0) > 0).length || 0
      setEstadisticas({
        totalCategorias: total || 0,
        categoriasActivas: activas || 0,
        categoriasConProductos: conProductos,
        categoriasSinProductos: (total || 0) - conProductos
      })
    } catch { /* silencioso */ }
  }

  const cargarProductos = async () => {
    try {
      setCargandoProductos(true)
      let query = clienteSupabase
        .from('productos')
        .select('id, nombre, categoria_id')
        .order('nombre')
      if (soloSinCategoria) query = query.is('categoria_id', null)
      if (busquedaProductos.trim()) query = query.ilike('nombre', `%${busquedaProductos.trim()}%`)
      const { data, error } = await query
      if (error) throw error
      setProductos(data || [])
    } catch { /* silencioso */ } finally {
      setCargandoProductos(false)
    }
  }

  const cargarDatos = async () => {
    await Promise.all([cargarCategorias(), cargarEstadisticas(), cargarProductos()])
  }

  useEffect(() => {
    registrarActualizacion(cargarDatos)
    cargarDatos()
  }, [])

  return {
    categorias, productos, cargando, cargandoProductos,
    error, setError, estadisticas,
    busquedaProductos, setBusquedaProductos,
    soloSinCategoria, setSoloSinCategoria,
    cargarDatos
  }
}
