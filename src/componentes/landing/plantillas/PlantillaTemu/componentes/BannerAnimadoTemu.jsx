import React from 'react'
import './BannerAnimadoTemu.css'

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

export default BannerAnimadoTemu
