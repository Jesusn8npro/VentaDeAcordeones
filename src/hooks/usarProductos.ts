import { useState, useEffect } from 'react'
import { clienteSupabase } from '../configuracion/supabase'

export function usarProductos(filtros = {}) {
  const [productos, setProductos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  // Se compara por CONTENIDO y no por identidad: los llamadores construyen el objeto de filtros en
  // cada render (spread / literal inline), y con [filtros] el efecto refetchaba en bucle infinito
  // (la página de categoría se quedaba en "Cargando productos..." para siempre).
  const claveFiltros = JSON.stringify(filtros)
  useEffect(() => {
    cargarProductos()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveFiltros])

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




























