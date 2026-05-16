import React from 'react'
import HeroTemu from './componentes/HeroTemu'
import PuntosDeDolorTemu from './componentes/PuntosDeDolorTemu'
import CaracteristicasTemu from './componentes/CaracteristicasTemu'
import TestimoniosTemu from './componentes/TestimoniosTemu'
import { FAQTemu, GarantiasTemu, CTAFinalTemu } from './componentes/SeccionesFinalesTemu'
import StickyProducto from '../../StickyProducto/StickyProducto'
import './estilos/PlantillaTemu.css'

/**
 * BannerAnimadoTemu - Banner de texto animado estilo dropshipping
 *
 * Características:
 * - Animación continua de texto tipo cinta transportadora
 * - Estilo Shopify/Temu ultra vendedor
 * - Ancho completo de pantalla
 * - Responsive y optimizado
 * - Múltiples mensajes promocionales
 */

const BannerAnimadoTemu = ({
  mensajes = null,
  velocidad = 'normal',
  backgroundColor = '#FF4444',
  textColor = '#FFFFFF'
}) => {

  // Mensajes por defecto estilo dropshipping ultra vendedores
  const mensajesPorDefecto = [
    '🚚 ¡ENVÍO GRATIS a toda Colombia en compras mayores a $50.000!',
    '💳 Compra 100% SEGURA - Paga contraentrega sin riesgo',
    '🛡️ GARANTÍA TOTAL o te devolvemos el 100% de tu dinero',
    '⚡ OFERTA LIMITADA - Solo por hoy descuentos hasta 70% OFF',
    '🎁 REGALO SORPRESA en tu primera compra - ¡No te lo pierdas!',
    '📞 SOPORTE 24/7 - Estamos aquí para ayudarte siempre',
    '🏆 +50.000 clientes satisfechos nos respaldan',
    '💎 CALIDAD PREMIUM garantizada en todos nuestros productos'
  ]

  const mensajesFinales = mensajes || mensajesPorDefecto

  // Triplicar mensajes para animación continua perfecta sin saltos
  const mensajesDuplicados = [...mensajesFinales, ...mensajesFinales, ...mensajesFinales]

  // Determinar clase de velocidad
  const claseVelocidad = `banner-animado-temu-${velocidad.replace('-', '-')}`

  return (
    <div
      className={`banner-animado-temu-contenedor ${claseVelocidad}`}
      style={{
        backgroundColor: backgroundColor,
        color: textColor
      }}
    >
      <div className="banner-animado-temu-track">
        {mensajesDuplicados.map((mensaje, index) => (
          <div
            key={index}
            className="banner-animado-temu-item"
          >
            <span className="banner-animado-temu-texto">
              {mensaje}
            </span>
            <span className="banner-animado-temu-separador">
              ★
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

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
