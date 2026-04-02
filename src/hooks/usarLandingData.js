import { useState, useEffect } from 'react'
import { clienteSupabase } from '../configuracion/supabase'

/**
 * Hook para cargar datos específicos de landing pages
 * @param {string} productoId - ID del producto
 * @returns {Object} - { landingConfig, reviews, notificaciones, cargando }
 */
export function usarLandingData(productoId) {
  const [landingConfig, setLandingConfig] = useState({})
  const [reviews, setReviews] = useState([])
  const [notificaciones, setNotificaciones] = useState([])
  const [cargando, setCargando] = useState(false) // ⚡ Cambiado a false para carga instantánea

  useEffect(() => {
    if (productoId) {
      cargarDatosLanding()
    }
  }, [productoId])

  const cargarDatosLanding = async () => {
    // ⚡ NO ponemos cargando en true para datos simulados
    
    try {
      // Por ahora, simulamos datos hasta que implementemos las tablas reales
      
      // TODO: Implementar carga real de configuración de landing
      // const { data: config } = await clienteSupabase
      //   .from('landing_configs')
      //   .select('*')
      //   .eq('producto_id', productoId)
      //   .single()
      
      // TODO: Implementar carga real de reviews
      // const { data: reviewsData } = await clienteSupabase
      //   .from('resenas')
      //   .select('*')
      //   .eq('producto_id', productoId)
      //   .eq('activo', true)
      //   .order('creado_el', { ascending: false })
      
      // TODO: Implementar carga real de notificaciones
      // const { data: notificacionesData } = await clienteSupabase
      //   .from('notificaciones_compra')
      //   .select('*')
      //   .eq('producto_id', productoId)
      //   .eq('activo', true)
      //   .order('creado_el', { ascending: false })
      //   .limit(10)

      // ⚡ Datos simulados cargados instantáneamente
      setLandingConfig({
        mostrar_contador: true,
        mostrar_stock_bajo: true,
        mostrar_garantia: true,
        color_primario: '#ff6b35',
        color_secundario: '#2c3e50'
      })

      setReviews([
        {
          id: 1,
          nombre: 'María González',
          calificacion: 5,
          comentario: '¡Excelente producto! Lo recomiendo 100%',
          fecha: '2024-01-15',
          verificada: true
        },
        {
          id: 2,
          nombre: 'Carlos Rodríguez',
          calificacion: 5,
          comentario: 'Muy buena calidad, llegó rápido',
          fecha: '2024-01-14',
          verificada: true
        }
      ])

      setNotificaciones([
        {
          id: 1,
          mensaje: 'Juan compró hace 2 minutos en Bogotá',
          tiempo: '2 min',
          ubicacion: 'Bogotá'
        },
        {
          id: 2,
          mensaje: 'Ana compró hace 5 minutos en Medellín',
          tiempo: '5 min',
          ubicacion: 'Medellín'
        }
      ])

    } catch (error) {
      console.error('Error cargando datos de landing:', error)
    }
    // ⚡ NO ponemos finally con setCargando(false) porque nunca fue true
  }

  return {
    landingConfig,
    reviews,
    notificaciones,
    cargando
  }
}
