import { useState, useEffect } from 'react'

/**
 * Hook personalizado para detectar el scroll y mostrar/ocultar elementos sticky
 * 
 * @param {string} selectorObjetivo - Selector CSS del elemento a observar (ej: '.hero-section')
 * @param {number} umbralScroll - Píxeles adicionales de scroll antes de mostrar el sticky
 * @returns {object} - { mostrarSticky, scrollHaciaAbajo, posicionScroll }
 */
export const useDeteccionScroll = (selectorObjetivo = '.hero-section', umbralScroll = 100) => {
  const [mostrarSticky, setMostrarSticky] = useState(false)
  const [scrollHaciaAbajo, setScrollHaciaAbajo] = useState(true)
  const [posicionScroll, setPosicionScroll] = useState(0)

  useEffect(() => {
    let timeoutId = null
    let scrollAnterior = 0

    const manejarScroll = () => {
      const scrollActual = window.pageYOffset || document.documentElement.scrollTop
      
      // Detectar dirección del scroll
      const esScrollHaciaAbajo = scrollActual > scrollAnterior
      setScrollHaciaAbajo(esScrollHaciaAbajo)
      
      // Actualizar posición
      setPosicionScroll(scrollActual)
      scrollAnterior = scrollActual

      // Buscar el elemento objetivo
      const elementoObjetivo = document.querySelector(selectorObjetivo)
      
      if (elementoObjetivo) {
        try {
          const rectElemento = elementoObjetivo.getBoundingClientRect()
          const posicionInferiorElemento = rectElemento.bottom
          
          // Mostrar sticky cuando el elemento objetivo haya salido del viewport
          // más el umbral adicional
          const deberiasMostrarSticky = posicionInferiorElemento < -umbralScroll
          
          setMostrarSticky(deberiasMostrarSticky)
        } catch (error) {
          // Si hay error al obtener getBoundingClientRect, usar scroll básico
          console.warn('Error al obtener getBoundingClientRect:', error)
          const deberiasMostrarSticky = scrollActual > umbralScroll
          setMostrarSticky(deberiasMostrarSticky)
        }
      } else {
        // Si no encuentra el elemento, usar scroll básico
        const deberiasMostrarSticky = scrollActual > umbralScroll
        setMostrarSticky(deberiasMostrarSticky)
      }
    }

    // Throttle del scroll para mejor performance
    const manejarScrollThrottled = () => {
      if (timeoutId) return
      
      timeoutId = setTimeout(() => {
        manejarScroll()
        timeoutId = null
      }, 16) // ~60fps
    }

    // Agregar listener
    window.addEventListener('scroll', manejarScrollThrottled, { passive: true })
    
    // Ejecutar una vez al montar para estado inicial
    manejarScroll()

    // Cleanup
    return () => {
      window.removeEventListener('scroll', manejarScrollThrottled)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [selectorObjetivo, umbralScroll])

  return {
    mostrarSticky,
    scrollHaciaAbajo,
    posicionScroll,
    estaEnLaParte: (selector) => {
      const elemento = document.querySelector(selector)
      if (!elemento) return false
      
      try {
        const rect = elemento.getBoundingClientRect()
        return rect.top <= window.innerHeight && rect.bottom >= 0
      } catch (error) {
        console.warn('Error al obtener getBoundingClientRect en estaEnLaParte:', error)
        return false
      }
    }
  }
}