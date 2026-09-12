'use client'

import React from 'react'
import Link from 'next/link'
import { Wrench, ShieldCheck, Lock, Truck, Undo2 } from 'lucide-react'
import './FranjaConfianza.css'

/**
 * Franja de confianza — solo hechos verificables.
 *
 * POR QUE EXISTE: en un producto de varios millones el freno no es el precio, es
 * "¿y si me estafan?". Cada punto de esta franja enlaza a la pagina del propio sitio
 * que lo respalda, para que el comprador pueda comprobarlo en dos clics.
 *
 * POR QUE NO HAY SELLOS INVENTADOS: un sello sin respaldo ("100% satisfaccion",
 * "compra 100% segura") es ruido y resta credibilidad. Aqui todo punto es auditable:
 *  - Taller y maestros de Valledupar  -> /taller
 *  - Garantia 6 meses acordeones nuevos -> /quienes-somos
 *  - ePayco (tarjetas, PSE, efectivo) y factura -> /preguntas-frecuentes (categoria Pagos)
 *  - Envios asegurados + gratis desde $50.000 -> /politica-envio
 *  - Retracto 5 dias habiles (Art. 47 Ley 1480/2011) -> /cambios-devoluciones
 */

// El umbral vive de verdad en src/contextos/carritoReducer.ts (subtotal >= 50000 -> envio 0).
// Se repite aqui como texto para no acoplar la franja al estado del carrito; si cambia alla,
// cambia esta linea.
const UMBRAL_ENVIO_GRATIS = '$50.000'

type Punto = {
  clave: string
  Icono: typeof Wrench
  titulo: string
  detalle: string
  href: string
  prueba: string
}

const PUNTOS: Punto[] = [
  {
    clave: 'taller',
    Icono: Wrench,
    titulo: 'Taller propio en Bogotá',
    detalle: 'Maestros afinadores formados en Valledupar',
    href: '/taller',
    prueba: 'Ver el taller y el proceso de afinación',
  },
  {
    clave: 'garantia',
    Icono: ShieldCheck,
    titulo: 'Garantía de 6 meses',
    detalle: 'En acordeones nuevos, contra defectos de fábrica',
    href: '/quienes-somos',
    prueba: 'Ver los términos de la garantía',
  },
  {
    clave: 'pago',
    Icono: Lock,
    titulo: 'Pago seguro con ePayco',
    detalle: 'Tarjetas, PSE y efectivo · Factura a tu nombre',
    href: '/preguntas-frecuentes',
    prueba: 'Ver los métodos de pago aceptados',
  },
  {
    clave: 'envio',
    Icono: Truck,
    titulo: 'Envíos asegurados',
    detalle: `Colombia y exterior · Gratis desde ${UMBRAL_ENVIO_GRATIS}`,
    href: '/politica-envio',
    prueba: 'Ver tiempos, costos y cobertura de envío',
  },
  {
    clave: 'retracto',
    Icono: Undo2,
    titulo: 'Retracto: 5 días hábiles',
    detalle: 'Estatuto del Consumidor · Ley 1480 de 2011',
    href: '/cambios-devoluciones',
    prueba: 'Ver cómo ejercer el derecho de retracto',
  },
]

interface Props {
  /** 'pdp' = columna de la ficha de producto · 'carrito' = resumen del carrito o su cajón */
  variante?: 'pdp' | 'carrito'
  /** Titulo opcional encima de la franja (el PDP ya tiene contexto, el carrito no tanto) */
  titulo?: string
  className?: string
}

export default function FranjaConfianza({ variante = 'pdp', titulo, className = '' }: Props) {
  return (
    <section
      className={`vda-confianza vda-confianza--${variante} ${className}`.trim()}
      aria-label="Garantías y respaldo de la compra"
    >
      {titulo && <h3 className="vda-confianza__titulo">{titulo}</h3>}

      <ul className="vda-confianza__lista">
        {PUNTOS.map(({ clave, Icono, titulo: t, detalle, href, prueba }) => (
          <li key={clave} className="vda-confianza__item">
            {/* Todo el punto es el enlace: el comprador desconfiado quiere comprobar, no leer */}
            <Link href={href} className="vda-confianza__enlace" title={prueba}>
              <span className="vda-confianza__icono" aria-hidden="true">
                <Icono size={18} strokeWidth={1.75} />
              </span>
              <span className="vda-confianza__texto">
                <strong className="vda-confianza__punto-titulo">{t}</strong>
                <span className="vda-confianza__punto-detalle">{detalle}</span>
              </span>
              <span className="sr-only-vda">{prueba}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
