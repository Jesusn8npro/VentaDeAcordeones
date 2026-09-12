'use client'

import { MessageCircle } from 'lucide-react'
import { analitica } from '../analitica/GoogleAnalytics'
import './ComprarPorWhatsapp.css'

/**
 * Cierre de venta por WhatsApp desde la ficha del producto.
 *
 * No es el "¿tienes dudas?" de siempre: el mensaje va redactado como una compra ya
 * decidida ("Quiero comprar…"), con el producto, la cantidad, el precio y el enlace.
 * Quien lo pulsa llega al chat listo para cerrar, no para empezar de cero.
 *
 * Por qué hace falta habiendo pasarela:
 *  · ePayco no procesa cobros por encima de 5.000.000, y varios acordeones pasan de ahí.
 *  · En instrumentos de varios millones mucha gente quiere hablar con alguien antes de
 *    soltar la plata, y si no encuentra por dónde, se va.
 *  · Contra entrega y acuerdos de pago solo se pueden cerrar hablando.
 *
 * El clic se registra en Analytics (`contacto_whatsapp`): sin eso, todo el tráfico de
 * Google Ads que termina comprando por WhatsApp se contaría como visita que no compró.
 */

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO || '573144865310'
const SITIO = process.env.NEXT_PUBLIC_URL_BASE || 'https://ventadeacordeones.com'

interface Props {
  nombre: string
  slug?: string
  precio?: number
  cantidad?: number
  /** 'principal' = botón verde sólido; 'suave' = contorno. */
  variante?: 'principal' | 'suave'
  /** Cuando el pago en línea no es posible (importe por encima del tope de la pasarela). */
  motivo?: 'tope' | null
  origen?: string
  className?: string
}

const pesos = (n: number) =>
  '$' + Math.round(n).toLocaleString('es-CO', { maximumFractionDigits: 0 })

export default function ComprarPorWhatsapp({
  nombre,
  slug,
  precio = 0,
  cantidad = 1,
  variante = 'suave',
  motivo = null,
  origen = 'ficha-producto',
  className = '',
}: Props) {
  const url = slug ? `${SITIO}/producto/${slug}` : SITIO
  const importe = precio > 0 ? precio * Math.max(1, cantidad) : 0

  const mensaje =
    `Hola, quiero comprar ${nombre}` +
    (cantidad > 1 ? ` (${cantidad} unidades)` : '') +
    (importe > 0 ? ` — ${pesos(importe)}` : '') +
    `.\n${url}\n\n¿Me confirmas disponibilidad y cómo seguimos?`

  const enlace = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensaje)}`

  return (
    <a
      className={`cwa cwa--${variante} ${className}`}
      href={enlace}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => analitica.contactoWhatsapp(origen, nombre)}
    >
      <MessageCircle size={17} aria-hidden="true" />
      <span className="cwa-texto">
        {motivo === 'tope' ? 'Comprar por WhatsApp' : 'Comprar por WhatsApp'}
        <small>
          {motivo === 'tope'
            ? 'Este instrumento se paga con asesor'
            : 'Te atendemos ahora y cerramos la compra'}
        </small>
      </span>
    </a>
  )
}
