import React from 'react'
import { CheckCircle } from 'lucide-react'
import './EtiquetaVendido.css'

/**
 * EtiquetaVendido - Componente para mostrar que un producto fue vendido
 * 
 * Características:
 * - Diseño atractivo que genera confianza
 * - Animación sutil para llamar la atención
 * - Posicionamiento absoluto sobre la imagen del producto
 * - Colores que transmiten éxito y confianza
 */

const EtiquetaVendido = ({ 
  tamaño = 'normal', // 'pequeño', 'normal', 'grande'
  posicion = 'superior-derecha', // 'superior-izquierda', 'superior-derecha', 'inferior-izquierda', 'inferior-derecha'
  mostrarIcono = true,
  texto = 'VENDIDO'
}) => {
  return (
    <div className={`etiqueta-vendido etiqueta-vendido-${tamaño} etiqueta-vendido-${posicion}`}>
      {mostrarIcono && <CheckCircle size={tamaño === 'pequeño' ? 12 : tamaño === 'grande' ? 18 : 14} />}
      <span className="etiqueta-vendido-texto">{texto}</span>
    </div>
  )
}

export default EtiquetaVendido