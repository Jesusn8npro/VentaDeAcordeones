import { createPortal } from 'react-dom'

/**
 * Componente Portal para renderizar elementos fuera del árbol de componentes actual
 * Útil para modales, tooltips y otros elementos que necesitan escapar del contexto de apilamiento
 */
const Portal = ({ children, containerId = 'portal-root' }) => {
  // Buscar o crear el contenedor del portal
  let portalContainer = document.getElementById(containerId)
  
  if (!portalContainer) {
    portalContainer = document.createElement('div')
    portalContainer.id = containerId
    portalContainer.style.position = 'relative'
    portalContainer.style.zIndex = '999999' // Z-index muy alto para asegurar que esté por encima de todo
    document.body.appendChild(portalContainer)
  }

  return createPortal(children, portalContainer)
}

export default Portal