'use client'

import React from 'react'
import { Truck, PartyPopper } from 'lucide-react'
import { calcularProgresoEnvio, UMBRAL_ENVIO_GRATIS } from './reglasEnvio'
import { formatearPrecioCOP } from '../../utilidades/formatoPrecio'
import './BarraEnvioGratis.css'

interface Props {
  subtotal: number
  /** Coste de envío ya calculado por carritoReducer: es la fuente de verdad. */
  envio: number
  /** 'cajon' quita la caja propia para integrarse en el drawer del carrito. */
  variante?: 'pagina' | 'cajon'
  className?: string
}

/**
 * Barra de progreso hacia el envío gratis.
 *
 * Por qué existe: es el único empujón honesto al ticket medio que no inventa nada —
 * el umbral ($50.000) y el coste ($5.000) son los que el carrito ya aplica. Se le
 * dice al cliente exactamente cuánto le falta en pesos, que es una acción concreta,
 * en vez del clásico cartel fijo "envío gratis desde $50.000" que nadie mira.
 *
 * El mensaje cambia en tres estados (lejos / casi / conseguido) porque un texto fijo
 * deja de leerse; el cambio es lo que vuelve a captar la atención al añadir productos.
 */
export default function BarraEnvioGratis({ subtotal, envio, variante = 'pagina', className = '' }: Props) {
  const { falta, porcentaje, conseguido, cerca } = calcularProgresoEnvio(subtotal, envio)

  const clases = [
    'vda-envio',
    variante === 'cajon' ? 'es-cajon' : '',
    conseguido ? 'es-conseguido' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={clases}>
      {/* aria-live: quien navega con lector de pantalla se entera de que el envío
          cambió al añadir un producto, sin tener que volver a recorrer el carrito. */}
      <p className="vda-envio-mensaje" aria-live="polite">
        {conseguido ? (
          <>
            <PartyPopper size={16} className="vda-envio-icono" aria-hidden="true" />
            <span className="vda-envio-texto">¡Envío gratis conseguido!</span>
          </>
        ) : (
          <>
            <Truck size={16} className="vda-envio-icono" aria-hidden="true" />
            <span className="vda-envio-texto">
              {cerca ? '¡Ya casi! Te faltan ' : 'Te faltan '}
              <span className="vda-envio-monto">{formatearPrecioCOP(falta)}</span>
              {' '}para el envío gratis
            </span>
          </>
        )}
      </p>

      <div
        className="vda-envio-pista"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(porcentaje)}
        aria-label={`Progreso hacia el envío gratis desde ${formatearPrecioCOP(UMBRAL_ENVIO_GRATIS)}`}
      >
        <div className="vda-envio-relleno" style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  )
}
