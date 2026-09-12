// /sobre-la-tienda — página fija de empresa. page.tsx = SERVER component con metadata estática.
// El body (SobreLaTienda) usa hooks, por eso se importa vía wrapper 'use client' (igual que /contacto).
import type { Metadata } from 'next'
import SobreLaTiendaCliente from './SobreLaTiendaCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/sobre-la-tienda`

const DESCRIPCION =
  'Cómo trabajamos: catálogo Hohner y accesorios, taller de afinación en Bogotá, pagos seguros con ePayco, garantía de 6 meses y envío asegurado a toda Colombia.'

export const metadata: Metadata = {
  title: 'Sobre la Tienda: catálogo, taller y envíos',
  description: DESCRIPCION,
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Sobre la Tienda: catálogo, taller y envíos',
    description: DESCRIPCION,
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

export default function PaginaSobreLaTiendaRoute() {
  return <SobreLaTiendaCliente />
}
