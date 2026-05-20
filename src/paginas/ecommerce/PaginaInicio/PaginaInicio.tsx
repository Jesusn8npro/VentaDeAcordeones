'use client'

import { useEffect } from 'react'
import './inicio-nuevo.css'
import HeroInicio from './HeroInicio/HeroInicio'
import MarqueeBeneficios from './MarqueeBeneficios/MarqueeBeneficios'
import IconosCategorias from './IconosCategorias/IconosCategorias'
import VentaRelampago from './VentaRelampago/VentaRelampago'
import ProductosDestacados from './ProductosDestacados/ProductosDestacados'
import RepuestosTecnicos from './RepuestosTecnicos/RepuestosTecnicos'
import OtrosInstrumentos from './OtrosInstrumentos/OtrosInstrumentos'
import SeccionPersonalizados from './SeccionPersonalizados/SeccionPersonalizados'
import ValoresMarca from './ValoresMarca/ValoresMarca'
import EstadisticasMarca from './EstadisticasMarca/EstadisticasMarca'
import TestimoniosClientes from './TestimoniosClientes/TestimoniosClientes'
import Boletin from './Boletin/Boletin'
import CtaFinalInicio from './CtaFinalInicio/CtaFinalInicio'

export default function PaginaInicio() {
  useEffect(() => {
    const els = document.querySelectorAll<Element>('.reveal')
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      }),
      { threshold: 0.12 }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <>
      <HeroInicio />
      <MarqueeBeneficios />
      <IconosCategorias />
      <VentaRelampago />
      <ProductosDestacados />
      <RepuestosTecnicos />
      <OtrosInstrumentos />
      <SeccionPersonalizados />
      <ValoresMarca />
      <EstadisticasMarca />
      <TestimoniosClientes />
      <Boletin />
      <CtaFinalInicio />
    </>
  )
}
