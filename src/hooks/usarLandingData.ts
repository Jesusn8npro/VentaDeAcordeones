import { useState, useEffect } from 'react'

// Config de la landing: sigue siendo mock hasta que exista la tabla landing_configs en Supabase.
// Son interruptores de presentación, no promesas al comprador.
const MOCK_CONFIG = {
  mostrar_contador: true,
  mostrar_stock_bajo: true,
  mostrar_garantia: true,
  color_primario: '#ff6b35',
  color_secundario: '#2c3e50'
}

// Reseñas y notificaciones de compra van VACÍAS a propósito.
//
// Antes este hook devolvía reseñas firmadas por "María González" y "Carlos Rodríguez" y avisos
// del tipo "Juan compró hace 2 minutos en Bogotá". Nadie escribió esas reseñas ni hizo esas
// compras: se pintaban en la ficha de cada producto como si fueran opiniones verificadas de
// clientes reales. Eso es publicidad engañosa (SIC, Ley 1480 de 2011 — Estatuto del Consumidor)
// y Google penaliza el contenido de reseñas fabricadas.
//
// Cuando existan las tablas `resenas` y `notificaciones_compra` en Supabase, basta con reemplazar
// los setters de abajo por la consulta real filtrada por `productoId`: el contrato del hook
// (reviews[], notificaciones[]) no cambia y las plantillas ya ocultan sus secciones si llegan
// vacías, así que no queda ningún hueco en la maquetación.
const SIN_RESENAS: any[] = []
const SIN_NOTIFICACIONES: any[] = []

export function usarLandingData(productoId: string | undefined) {
  const [landingConfig, setLandingConfig] = useState({})
  const [reviews, setReviews] = useState<any[]>([])
  const [notificaciones, setNotificaciones] = useState<any[]>([])

  useEffect(() => {
    if (!productoId) return
    // TODO: consultar `resenas` y `notificaciones_compra` por productoId cuando existan las tablas.
    setLandingConfig(MOCK_CONFIG)
    setReviews(SIN_RESENAS)
    setNotificaciones(SIN_NOTIFICACIONES)
  }, [productoId])

  return { landingConfig, reviews, notificaciones, cargando: false }
}
