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
import ReelsInstagram from '@/componentes/social/ReelsInstagram'

export default function PaginaInicio() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target) }
      }),
      { threshold: 0.08, rootMargin: '0px 0px -4% 0px' }
    )

    // Observa todos los .reveal existentes (y re-observa los que aún no aparecen).
    let raf = 0
    const observarPendientes = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() =>
        document.querySelectorAll<Element>('.reveal:not(.in)').forEach((el) => io.observe(el))
      )
    }
    observarPendientes()

    // Las secciones que cargan datos (flash sale, destacados…) se renderizan
    // DESPUÉS del montaje. Este MutationObserver las detecta y las observa,
    // evitando que se queden invisibles (el bug de los "huecos negros").
    const mo = new MutationObserver(observarPendientes)
    mo.observe(document.body, { childList: true, subtree: true })

    // Red de seguridad: nada debe quedar oculto permanentemente.
    const safety = window.setTimeout(() => {
      document.querySelectorAll<Element>('.reveal:not(.in)').forEach((el) => el.classList.add('in'))
    }, 6000)

    return () => {
      io.disconnect()
      mo.disconnect()
      cancelAnimationFrame(raf)
      clearTimeout(safety)
    }
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
      <div className="section" style={{ paddingTop: 0 }}>
        <ReelsInstagram limite={10} titulo="Acordeones en acción" />
      </div>
      <Boletin />
      <CtaFinalInicio />
    </>
  )
}
