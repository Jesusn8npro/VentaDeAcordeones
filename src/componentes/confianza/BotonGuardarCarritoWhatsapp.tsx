'use client'

import React from 'react'
import { useCarrito } from '../../contextos/CarritoContext'
import './BotonGuardarCarritoWhatsapp.css'

/**
 * "Guardar mi carrito y seguir por WhatsApp".
 *
 * POR QUE: un acordeon de varios millones casi nunca se compra en la primera visita.
 * El carrito ya sobrevive al cierre del navegador (session_id en localStorage + tabla
 * `carrito`), pero eso solo sirve si el cliente vuelve al MISMO navegador. Este boton
 * traslada el carrito a un canal que el cliente si conserva: su propio WhatsApp, con el
 * resumen escrito dentro del mensaje. Asi la conversacion queda abierta por ambos lados.
 *
 * POR QUE NO HAY POPUP DE SALIDA NI DESCUENTO: los "exit intent" molestan y aqui no hay
 * descuentos reales que ofrecer; un descuento falso destruye la confianza justo donde
 * mas cuesta ganarla.
 */

const NUMERO_WHATSAPP = '573144865310'

const fmtCOP = (n: number) => '$' + new Intl.NumberFormat('es-CO').format(Math.round(n || 0))

interface Props {
  /** 'linea' = enlace discreto (cajon lateral) · 'bloque' = boton con borde (pagina del carrito) */
  variante?: 'linea' | 'bloque'
  /** Permite inyectar el carrito desde fuera; por defecto lo lee del contexto */
  items?: any[]
  subtotal?: number
  envio?: number
  descuentos?: number
  total?: number
  className?: string
}

export function construirMensajeCarrito(
  items: any[],
  totales: { subtotal: number; envio: number; descuentos: number; total: number }
) {
  const lineas = items.map((item) => {
    const nombre = item?.productos?.nombre || 'Producto'
    const cantidad = item?.cantidad || 1
    const precio = item?.precio_unitario || 0
    return `• ${nombre} — ${cantidad} x ${fmtCOP(precio)} = ${fmtCOP(cantidad * precio)}`
  })

  const partes = [
    'Hola, quiero guardar mi carrito de VentaDeAcordeones.com y seguir por aquí:',
    '',
    ...lineas,
    '',
    `Subtotal: ${fmtCOP(totales.subtotal)}`,
    `Envío: ${totales.envio > 0 ? fmtCOP(totales.envio) : 'Gratis'}`,
  ]

  // El descuento solo se nombra si el carrito realmente lo trae: nada de inventar rebajas
  if (totales.descuentos > 0) partes.push(`Descuento: -${fmtCOP(totales.descuentos)}`)

  partes.push(
    `TOTAL: ${fmtCOP(totales.total)}`,
    '',
    '¿Me confirman disponibilidad y cómo seguimos?'
  )

  return partes.join('\n')
}

export default function BotonGuardarCarritoWhatsapp({
  variante = 'linea',
  items: itemsProp,
  subtotal: subtotalProp,
  envio: envioProp,
  descuentos: descuentosProp,
  total: totalProp,
  className = '',
}: Props) {
  const carrito = useCarrito() as any

  const items: any[] = itemsProp ?? carrito?.items ?? []
  const subtotal = subtotalProp ?? carrito?.subtotal ?? 0
  const envio = envioProp ?? carrito?.envio ?? 0
  const descuentos = descuentosProp ?? carrito?.descuentos ?? 0
  const total = totalProp ?? carrito?.total ?? 0

  // Sin productos el boton no dice nada util: no se pinta
  if (!items.length) return null

  const mensaje = construirMensajeCarrito(items, { subtotal, envio, descuentos, total })
  const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`vda-guardar-wa vda-guardar-wa--${variante} ${className}`.trim()}
      aria-label="Guardar mi carrito y seguir la compra por WhatsApp"
    >
      <svg className="vda-guardar-wa__icono" viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.106"/>
      </svg>
      <span className="vda-guardar-wa__texto">Guardar mi carrito y seguir por WhatsApp</span>
    </a>
  )
}
