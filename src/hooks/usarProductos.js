import { useState, useEffect } from 'react'
import { clienteSupabase } from '../configuracion/supabase'

export function usarProductos(filtros = {}) {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarProductos()
  }, [filtros])

  const cargarProductos = async () => {
    setCargando(true)
    setError(null)

    try {
      let consulta = clienteSupabase
        .from('productos')
        .select(`
          *,
          categorias (
            id,
            nombre,
            slug
          ),
          producto_imagenes (
            imagen_principal,
            imagen_secundaria_1
          )
        `)
        .eq('activo', true)
        // Solo productos con stock disponible en tienda pública
        .gt('stock', 0)

      // Aplicar filtros
      if (filtros.categoria) {
        consulta = consulta.eq('categoria_id', filtros.categoria)
      }

      if (filtros.busqueda) {
        consulta = consulta.ilike('nombre', `%${filtros.busqueda}%`)
      }

      if (filtros.precioMin) {
        consulta = consulta.gte('precio', filtros.precioMin)
      }

      if (filtros.precioMax) {
        consulta = consulta.lte('precio', filtros.precioMax)
      }

      // Ordenamiento
      if (filtros.ordenar) {
        consulta = consulta.order(filtros.ordenar.campo, { ascending: filtros.ordenar.ascendente })
      } else {
        // La columna correcta según el esquema es 'creado_el'
        consulta = consulta.order('creado_el', { ascending: false })
      }

      // Paginación
      if (filtros.limite) {
        consulta = consulta.limit(filtros.limite)
      }

      const { data, error: errorConsulta } = await consulta

      if (errorConsulta) {
        throw errorConsulta
      }

      setProductos(data || [])
    } catch (err) {
      console.error('Error al cargar productos:', err)
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return {
    productos,
    cargando,
    error,
    recargar: cargarProductos
  }
}




























