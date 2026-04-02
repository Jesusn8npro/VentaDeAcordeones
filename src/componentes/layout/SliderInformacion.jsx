import React from 'react'
import './SliderInformacion.css'

/**
 * SliderInformacion - Marquee continuo con doble pista
 * Props:
 * - items: array de strings a mostrar
 * - speed: segundos de duración de un ciclo (por defecto 35s)
 */
const SliderInformacion = ({ items = [], speed = 35 }) => {
  const styleVar = { ['--duracion']: `${speed}s` }
  const contenido = [...items, ...items, ...items]

  return (
    <div className="slider-informacion" role="region" aria-label="Información de beneficios y políticas">
      <div className="slider-track" style={styleVar}>
        {contenido.map((texto, idx) => (
          <span key={`s-${idx}`} className="slider-item">{texto}</span>
        ))}
      </div>
    </div>
  )
}

export default SliderInformacion