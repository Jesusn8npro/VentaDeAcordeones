import React from 'react'
import PlantillaTemu from './plantillas/PlantillaTemu/PlantillaTemu'
import PlantillaCatalogo from './plantillas/PlantillaCatalogo/PlantillaCatalogo'

/**
 * LandingPage - Componente principal que decide qué plantilla usar
 * 
 * Este componente actúa como selector/router de plantillas
 * Según el campo 'landing_tipo' del producto, renderiza la plantilla correspondiente
 */

// Mapeo de tipos de plantilla a componentes
const PLANTILLAS_DISPONIBLES = {
  'catalogo': PlantillaCatalogo,
  'temu': PlantillaTemu,
  // TODO: Agregar más plantillas aquí
  // 'lujo': PlantillaLujo,
  // 'oferta_flash': PlantillaOfertaFlash,
  // 'aventura': PlantillaAventura,
}

const LandingPage = ({ producto, config, reviews, notificaciones }) => {
  // Determinar qué plantilla usar
  const tipoPlantilla = producto?.landing_tipo || 'catalogo' // Default a catálogo
  
  // Obtener el componente de plantilla
  const PlantillaComponent = PLANTILLAS_DISPONIBLES[tipoPlantilla]
  
  // Si no existe la plantilla, usar catálogo como fallback
  if (!PlantillaComponent) {
    const FallbackComponent = PLANTILLAS_DISPONIBLES['catalogo']
    return (
      <FallbackComponent 
        producto={producto}
        config={config}
        reviews={reviews}
        notificaciones={notificaciones}
      />
    )
  }

  return (
    <PlantillaComponent 
      producto={producto}
      config={config}
      reviews={reviews}
      notificaciones={notificaciones}
    />
  )
}

export default LandingPage
