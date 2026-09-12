import React from 'react'
import PlantillaCatalogo from './plantillas/PlantillaCatalogo/PlantillaCatalogo'
import PlantillaCinema from './plantillas/PlantillaCinema/PlantillaCinema'

/**
 * SelectorPlantilla - Componente principal que decide qué plantilla usar
 * 
 * Este componente actúa como selector/router de plantillas
 * Según el campo 'landing_tipo' del producto, renderiza la plantilla correspondiente
 */

// Mapeo de tipos de plantilla a componentes
// PlantillaTemu se elimino: no la usaba ningun producto (los 177 del catalogo son 'cinema')
// y estaba llena de datos inventados —testimonios con fotos de banco, "+15.847 clientes",
// "70% OFF", contadores de urgencia—. Bastaba una fila con landing_tipo='temu' para publicar
// todo eso de golpe. Los tipos 'temu' y 'amazon' caen ahora en el catalogo normal.
const PLANTILLAS_DISPONIBLES = {
  'catalogo': PlantillaCatalogo,
  'clasico': PlantillaCatalogo,
  'cinema': PlantillaCinema,
}

const SelectorPlantilla = ({ producto, config, reviews, notificaciones }) => {
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

export default SelectorPlantilla
