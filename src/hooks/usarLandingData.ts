import { useState, useEffect } from 'react'

// Datos mock hasta que existan las tablas landing_configs, resenas, notificaciones_compra en Supabase
const MOCK_CONFIG = {
  mostrar_contador: true,
  mostrar_stock_bajo: true,
  mostrar_garantia: true,
  color_primario: '#ff6b35',
  color_secundario: '#2c3e50'
}

const MOCK_REVIEWS = [
  { id: 1, nombre: 'María González', calificacion: 5, comentario: '¡Excelente producto! Lo recomiendo 100%', fecha: '2024-01-15', verificada: true },
  { id: 2, nombre: 'Carlos Rodríguez', calificacion: 5, comentario: 'Muy buena calidad, llegó rápido', fecha: '2024-01-14', verificada: true }
]

const MOCK_NOTIFICACIONES = [
  { id: 1, mensaje: 'Juan compró hace 2 minutos en Bogotá', tiempo: '2 min', ubicacion: 'Bogotá' },
  { id: 2, mensaje: 'Ana compró hace 5 minutos en Medellín', tiempo: '5 min', ubicacion: 'Medellín' }
]

export function usarLandingData(productoId: string | undefined) {
  const [landingConfig, setLandingConfig] = useState({})
  const [reviews, setReviews] = useState([])
  const [notificaciones, setNotificaciones] = useState([])

  useEffect(() => {
    if (!productoId) return
    // TODO: reemplazar con consultas reales a Supabase cuando existan las tablas
    setLandingConfig(MOCK_CONFIG)
    setReviews(MOCK_REVIEWS)
    setNotificaciones(MOCK_NOTIFICACIONES)
  }, [productoId])

  return { landingConfig, reviews, notificaciones, cargando: false }
}
