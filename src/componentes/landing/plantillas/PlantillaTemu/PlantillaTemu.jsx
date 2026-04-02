import React from 'react'
import HeroTemu from './componentes/HeroTemu'
import BannerAnimadoTemu from './componentes/BannerAnimadoTemu'
import PuntosDeDolorTemu from './componentes/PuntosDeDolorTemu'
import CaracteristicasTemu from './componentes/CaracteristicasTemu'
import TestimoniosTemu from './componentes/TestimoniosTemu'
import FAQTemu from './componentes/FAQTemu'
import GarantiasTemu from './componentes/GarantiasTemu'
import CTAFinalTemu from './componentes/CTAFinalTemu'
import StickyProducto from '../../StickyProducto/StickyProducto'
import './estilos/PlantillaTemu.css'

/**
 * PlantillaTemu - Plantilla optimizada para conversión estilo TEMU
 * 
 * Características:
 * - Galería sticky funcional con JavaScript
 * - Mapeo de datos reales del producto
 * - Diseño profesional estilo Temu/AliExpress
 * - Todo en español y súper vendedor
 * - Código limpio y organizado
 */

const PlantillaTemu = ({ producto, config, reviews, notificaciones }) => {
  return (
    <>
      {/* Hero principal */}
      <HeroTemu 
        producto={producto}
        config={config}
        reviews={reviews}
        notificaciones={notificaciones}
      />
      
      {/* Banner animado después del hero */}
      <BannerAnimadoTemu 
        mensajes={producto?.banner_animado?.mensajes}
        velocidad={producto?.banner_animado?.velocidad || "ultra-rapido"}
        backgroundColor={producto?.banner_animado?.backgroundColor || "#FF4444"}
        textColor={producto?.banner_animado?.textColor || "#FFFFFF"}
      />

      {/* Sección de puntos de dolor */}
      <PuntosDeDolorTemu 
        puntosDeDolorData={producto?.puntos_dolor}
        mostrarAnimaciones={true}
        producto={producto}
      />

      {/* Sección de características del producto */}
      <CaracteristicasTemu 
        caracteristicasData={producto?.caracteristicas}
        mostrarAnimaciones={true}
        producto={producto}
      />

      {/* Sección de testimonios HIJUEPUTAMENTE PODEROSA */}
      <TestimoniosTemu 
        testimoniosData={producto?.testimonios}
        mostrarAnimaciones={true}
        mostrarContador={true}
        producto={producto}
      />

      {/* Sección FAQ - Elimina objeciones */}
      <FAQTemu 
        faqData={producto?.faq}
        mostrarAnimaciones={true}
      />

      {/* Sección de garantías y confianza */}
      <GarantiasTemu 
        garantiasData={producto?.garantias}
        mostrarAnimaciones={true}
      />

      {/* CTA final con urgencia */}
      <CTAFinalTemu 
        ctaData={producto?.cta_final}
        mostrarTimer={true}
        mostrarStock={true}
        producto={producto}
      />

      {/* Componente Sticky del Producto */}
      <StickyProducto 
        producto={producto}
        mostrar={true}
        onComprarAhora={() => {
          // Scroll hacia la sección de compra o abrir modal de pago
          const seccionCompra = document.querySelector('.hero-section, .cta-final-section')
          if (seccionCompra) {
            seccionCompra.scrollIntoView({ behavior: 'smooth' })
          }
        }}
      />

    </>
  )
}

export default PlantillaTemu
