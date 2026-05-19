'use client'

import { useEffect } from 'react'
import './inicio-nuevo.css'
import HeroInicio from '@/componentes/inicio/HeroInicio/HeroInicio'
import MarqueeBeneficios from '@/componentes/inicio/MarqueeBeneficios/MarqueeBeneficios'
import IconosCategorias from '@/componentes/inicio/IconosCategorias/IconosCategorias'
import VentaRelampago from '@/componentes/inicio/VentaRelampago/VentaRelampago'
import ProductosDestacados from '@/componentes/inicio/ProductosDestacados/ProductosDestacados'
import RepuestosTecnicos from '@/componentes/inicio/RepuestosTecnicos/RepuestosTecnicos'
import OtrosInstrumentos from '@/componentes/inicio/OtrosInstrumentos/OtrosInstrumentos'
import SeccionPersonalizados from '@/componentes/inicio/SeccionPersonalizados/SeccionPersonalizados'
import ValoresMarca from '@/componentes/inicio/ValoresMarca/ValoresMarca'
import EstadisticasMarca from '@/componentes/inicio/EstadisticasMarca/EstadisticasMarca'
import TestimoniosClientes from '@/componentes/inicio/TestimoniosClientes/TestimoniosClientes'
import Boletin from '@/componentes/inicio/Boletin/Boletin'
import CtaFinalInicio from '@/componentes/inicio/CtaFinalInicio/CtaFinalInicio'

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
