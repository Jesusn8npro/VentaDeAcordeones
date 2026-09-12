'use client'

import Script from 'next/script'
import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

/**
 * Google Analytics 4.
 *
 * Dos detalles que en Next con App Router se suelen hacer mal:
 *
 * 1. `strategy="afterInteractive"` — la etiqueta NO va en el <head> bloqueando el
 *    render. gtag.js pesa ~90 KB y no pinta nada; cargarlo antes de tiempo le quita
 *    puntos al LCP en PageSpeed sin ganar un solo dato.
 *
 * 2. `send_page_view: false` + el efecto de abajo. Con navegación de cliente, la página
 *    no se recarga al cambiar de ruta, así que el page_view automático solo contaría la
 *    PRIMERA pantalla de cada visita: el resto del recorrido por la tienda no aparecería
 *    en los informes.
 */

const ID = process.env.NEXT_PUBLIC_GA_ID || ''

declare global {
  interface Window {
    dataLayer?: any[]
    gtag?: (...args: any[]) => void
  }
}

function SeguimientoDeRutas() {
  const ruta = usePathname()
  const parametros = useSearchParams()

  useEffect(() => {
    if (!ID || typeof window.gtag !== 'function') return
    const consulta = parametros?.toString()
    window.gtag('event', 'page_view', {
      page_path: consulta ? `${ruta}?${consulta}` : ruta,
      page_location: window.location.href,
      page_title: document.title,
    })
  }, [ruta, parametros])

  return null
}

export default function GoogleAnalytics() {
  if (!ID) return null

  return (
    <>
      <Script
        id="ga-carga"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${ID}`}
      />
      <Script id="ga-config" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}
window.gtag=gtag;gtag('js',new Date());
gtag('config','${ID}',{send_page_view:false});`}
      </Script>
      <SeguimientoDeRutas />
    </>
  )
}

/**
 * Eventos de comercio para los informes de GA4 y para optimizar las campañas de Google Ads.
 * Si la etiqueta no está puesta, no hace nada (ni revienta).
 */
export function evento(nombre: string, datos: Record<string, any> = {}) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return
  window.gtag('event', nombre, datos)
}

export const analitica = {
  verProducto: (p: { id?: string; nombre?: string; precio?: number; categoria?: string }) =>
    evento('view_item', {
      currency: 'COP',
      value: Number(p.precio) || 0,
      items: [{ item_id: p.id, item_name: p.nombre, item_category: p.categoria, price: Number(p.precio) || 0 }],
    }),

  agregarAlCarrito: (p: { id?: string; nombre?: string; precio?: number; cantidad?: number }) =>
    evento('add_to_cart', {
      currency: 'COP',
      value: (Number(p.precio) || 0) * (Number(p.cantidad) || 1),
      items: [{ item_id: p.id, item_name: p.nombre, price: Number(p.precio) || 0, quantity: Number(p.cantidad) || 1 }],
    }),

  iniciarCheckout: (total: number, productos: any[] = []) =>
    evento('begin_checkout', {
      currency: 'COP',
      value: Number(total) || 0,
      items: productos.map((p) => ({
        item_id: p?.producto_id || p?.id,
        item_name: p?.nombre,
        price: Number(p?.precio) || 0,
        quantity: Number(p?.cantidad) || 1,
      })),
    }),

  compra: (pedido: { numero?: string; total?: number; envio?: number; productos?: any[] }) =>
    evento('purchase', {
      transaction_id: pedido.numero,
      currency: 'COP',
      value: Number(pedido.total) || 0,
      shipping: Number(pedido.envio) || 0,
      items: (pedido.productos || []).map((p) => ({
        item_id: p?.producto_id || p?.id,
        item_name: p?.nombre,
        price: Number(p?.precio) || 0,
        quantity: Number(p?.cantidad) || 1,
      })),
    }),

  // La venta por WhatsApp no pasa por la pasarela: sin este evento, todo el tráfico que
  // cierra por ahí se vería en Ads como visitas que no compraron.
  contactoWhatsapp: (origen: string, producto?: string) =>
    evento('contacto_whatsapp', { origen, producto }),
}
