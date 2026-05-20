import React from 'react'
import PlantillaTemu from './plantillas/PlantillaTemu/PlantillaTemu'
import PlantillaCatalogo from './plantillas/PlantillaCatalogo/PlantillaCatalogo'

/**
 * SelectorPlantilla - Componente principal que decide quÃ© plantilla usar
 * 
 * Este componente actÃºa como selector/router de plantillas
 * SegÃºn el campo 'landing_tipo' del producto, renderiza la plantilla correspondiente
 */

// Mapeo de tipos de plantilla a componentes
const PLANTILLAS_DISPONIBLES = {
  'catalogo': PlantillaCatalogo,
  'temu': PlantillaTemu,
  // TODO: Agregar mÃ¡s plantillas aquÃ­
  // 'lujo': PlantillaLujo,
  // 'oferta_flash': PlantillaOfertaFlash,
  // 'aventura': PlantillaAventura,
}

const SelectorPlantilla = ({ producto, config, reviews, notificaciones }) => {
  // Determinar quÃ© plantilla usar
  const tipoPlantilla = producto?.landing_tipo || 'catalogo' // Default a catÃ¡logo
  
  // Obtener el componente de plantilla
  const PlantillaComponent = PLANTILLAS_DISPONIBLES[tipoPlantilla]
  
  // Si no existe la plantilla, usar catÃ¡logo como fallback
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

export default SelectorPlantilla
