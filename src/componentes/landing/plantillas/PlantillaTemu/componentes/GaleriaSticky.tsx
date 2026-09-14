'use client'

import React, { useEffect, useRef, useState } from 'react'

interface GaleriaProps {
  distanciaTop?: number
  className?: string
  children: React.ReactNode
  atributoContenedor?: string
}

export default function GaleriaSticky({
  distanciaTop = 20,
  className = '',
  children,
  atributoContenedor = 'data-contenedor-hero-temu'
}: GaleriaProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [estilos, setEstilos] = useState<React.CSSProperties>({})
  const [modo, setModo] = useState<'estatico' | 'fijo' | 'abajo'>('estatico')

  const alturaHeader = () => {
    const valor = getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '0px'
    return parseInt(valor, 10) || 0
  }

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    const columnaIzquierda = elemento.parentElement as HTMLElement
    let contenedorRaiz: HTMLElement = (columnaIzquierda?.closest(`[${atributoContenedor}]`) as HTMLElement)
      || columnaIzquierda?.parentElement
      || document.body

    const estiloContenedor = getComputedStyle(contenedorRaiz)
    if (estiloContenedor.position === 'static') contenedorRaiz.style.position = 'relative'

    const medir = () => {
      const topSticky = alturaHeader() + distanciaTop
      const rectContenedor = contenedorRaiz.getBoundingClientRect()
      const topContenedor = window.scrollY + rectContenedor.top
      const bottomContenedor = window.scrollY + rectContenedor.bottom
      const rectIzquierda = columnaIzquierda.getBoundingClientRect()
      const alturaElemento = elemento.offsetHeight
      const posicionActual = window.scrollY + topSticky

      if (posicionActual >= topContenedor && posicionActual <= bottomContenedor - alturaElemento) {
        setModo('fijo')
        setEstilos({
          position: 'fixed',
          top: `${topSticky}px`,
          left: `${rectIzquierda.left + window.scrollX}px`,
          width: `${rectIzquierda.width}px`,
          boxSizing: 'border-box',
          zIndex: 1000
        })
      } else if (posicionActual > bottomContenedor - alturaElemento) {
        setModo('abajo')
        const paddingTop = parseFloat(getComputedStyle(contenedorRaiz).paddingTop) || 0
        setEstilos({
          position: 'absolute',
          top: `${contenedorRaiz.scrollHeight - elemento.offsetHeight - paddingTop}px`,
          left: '0',
          right: '0',
          width: '100%',
          boxSizing: 'border-box'
        })
      } else {
        setModo('estatico')
        setEstilos({})
      }
    }

    medir()
    window.addEventListener('scroll', medir, { passive: true })
    window.addEventListener('resize', medir)

    const observadorRedimension = new ResizeObserver(medir)
    observadorRedimension.observe(elemento)
    observadorRedimension.observe(contenedorRaiz)
    observadorRedimension.observe(columnaIzquierda)

    return () => {
      window.removeEventListener('scroll', medir)
      window.removeEventListener('resize', medir)
      observadorRedimension.disconnect()
    }
  }, [distanciaTop, atributoContenedor])

  return (
    <div ref={ref} className={className} style={estilos} data-modo-hero-temu={modo}>
      {children}
    </div>
  )
}
