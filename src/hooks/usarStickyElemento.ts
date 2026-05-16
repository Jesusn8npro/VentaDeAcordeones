import { useEffect, useRef, useState } from 'react'

/**
 * usarStickyElemento - Hook para elementos sticky avanzados
 * 
 * Basado en la lógica de la plantilla Temu
 * Maneja 3 estados: estatico | fijo | abajo
 * 
 * @param {number} distanciaTop - Distancia desde el top cuando está fijo
 * @param {string} atributoContenedor - Atributo del contenedor padre
 */

export function usarStickyElemento({
  distanciaTop = 20,
  atributoContenedor = "data-contenedor-tienda"
} = {}) {
  const ref = useRef(null)
  const [estilos, setEstilos] = useState({})
  const [modo, setModo] = useState("estatico") // estatico | fijo | abajo

  const alturaHeader = () => {
    // Obtener altura del header desde CSS custom property o calculada
    const headerElement = document.querySelector('header') || document.querySelector('.header-principal')
    if (headerElement) {
      return headerElement.offsetHeight
    }
    
    const valor = getComputedStyle(document.documentElement).getPropertyValue("--header-h") || "0px"
    return parseInt(valor, 10) || 80 // Fallback a 80px
  }

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    // Contenedor padre del sidebar (columna izquierda)
    const contenedorSidebar = elemento.parentElement

    // Contenedor raíz = el ancestro más cercano con el atributo especificado
    let contenedorRaiz = contenedorSidebar?.closest(`[${atributoContenedor}]`)
    if (!contenedorRaiz) {
      // Fallback: buscar el contenedor de layout
      contenedorRaiz = contenedorSidebar?.closest('.layout-contenedor') || 
                      contenedorSidebar?.parentElement || 
                      document.body
    }

    // Asegurar contexto para el modo "abajo"
    const estiloContenedor = getComputedStyle(contenedorRaiz)
    if (estiloContenedor.position === "static") {
      contenedorRaiz.style.position = "relative"
    }

    const medir = () => {
      const topSticky = alturaHeader() + distanciaTop

      // Geometría del contenedor raíz
      const rectContenedor = contenedorRaiz.getBoundingClientRect()
      const topContenedor = window.scrollY + rectContenedor.top
      const bottomContenedor = window.scrollY + rectContenedor.bottom

      // Geometría del contenedor del sidebar
      const rectSidebar = contenedorSidebar.getBoundingClientRect()

      // Altura real del elemento sticky
      const alturaElemento = elemento.offsetHeight

      // Posición actual del scroll
      const scrollActual = window.scrollY

      // El elemento se vuelve sticky cuando el scroll pasa su posición original
      if (scrollActual >= topContenedor && scrollActual <= bottomContenedor - alturaElemento) {
        // Modo FIJO: pegado exactamente al top del viewport
        setModo("fijo")
        setEstilos({
          position: "fixed",
          top: "0px", // Pegado al top del viewport
          left: `${rectSidebar.left}px`,
          width: `${rectSidebar.width}px`,
          boxSizing: "border-box",
          zIndex: 1000,
          maxHeight: "100vh",
          overflowY: "auto"
        })
      } else if (scrollActual > bottomContenedor - alturaElemento) {
        // Modo ABAJO: pegado al fondo del contenedor
        setModo("abajo")
        setEstilos({
          position: "absolute",
          top: `${bottomContenedor - alturaElemento - topContenedor}px`,
          left: "0",
          right: "0",
          width: "100%",
          boxSizing: "border-box",
          maxHeight: "none",
          overflowY: "auto"
        })
      } else {
        // Modo ESTÁTICO: posición normal
        setModo("estatico")
        setEstilos({
          position: "static",
          maxHeight: "none",
          overflowY: "visible"
        })
      }
    }

    // Medir en arranque y cambios
    const medirConDelay = () => {
      // Pequeño delay para asegurar que el DOM esté listo
      requestAnimationFrame(() => {
        setTimeout(medir, 10)
      })
    }

    medirConDelay()

    // Event listeners
    const alHacerScroll = () => medir()
    const alRedimensionar = () => medirConDelay()

    window.addEventListener("scroll", alHacerScroll, { passive: true })
    window.addEventListener("resize", alRedimensionar)

    // Observer para cambios en el tamaño de elementos
    const observadorRedimension = new ResizeObserver(() => {
      medirConDelay()
    })

    observadorRedimension.observe(elemento)
    observadorRedimension.observe(contenedorRaiz)
    if (contenedorSidebar) {
      observadorRedimension.observe(contenedorSidebar)
    }

    // Cleanup
    return () => {
      window.removeEventListener("scroll", alHacerScroll)
      window.removeEventListener("resize", alRedimensionar)
      observadorRedimension.disconnect()
    }
  }, [distanciaTop, atributoContenedor])

  return {
    ref,
    estilos,
    modo,
    isSticky: modo === "fijo",
    isBottom: modo === "abajo",
    isStatic: modo === "estatico"
  }
}

export default usarStickyElemento
