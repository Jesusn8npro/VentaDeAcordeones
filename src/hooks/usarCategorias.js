import { useState, useEffect } from 'react'
import { clienteSupabase } from '../configuracion/supabase'

export function usarCategorias() {
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarCategorias = async () => {
    setCargando(true)
    setError(null)

    try {
      const { data, error: errorConsulta } = await clienteSupabase
        .from('categorias')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })

      if (errorConsulta) {
        throw errorConsulta
      }

      setCategorias(data || [])
    } catch (err) {
      console.error('Error al cargar categorías:', err)
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return {
    categorias,
    cargando,
    error,
    recargar: cargarCategorias
  }
}




























