import { useState, useEffect } from 'react'
import { clienteSupabase } from '../configuracion/supabase'
import { consultarProductoPorSlug } from '../servicios/consultaProducto'

/**
 * Ficha de producto. `datosIniciales` viene del Server Component: si llega, la
 * página se pinta con esos datos sin esperar a ninguna petición del navegador
 * (antes se mostraba un spinner y Google indexaba la ficha vacía).
 */
export function usarProducto(slug, datosIniciales = null) {
  const [producto, setProducto] = useState(datosIniciales)
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Con datos del servidor no se vuelve a pedir lo mismo nada más entrar.
    if (slug && !datosIniciales) {
      cargarProducto()
    }
  }, [slug])

  const cargarProducto = async () => {
    setCargando(true)
    setError(null)
    try {
      // Mismo select y misma normalización que usa el servidor (src/servicios/consultaProducto.ts),
      // para que lo pintado en el HTML y lo que refresca el navegador no se contradigan.
      const data = await consultarProductoPorSlug(clienteSupabase, slug)
      setProducto(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return {
    producto,
    cargando,
    error,
    recargar: cargarProducto
  }
}












