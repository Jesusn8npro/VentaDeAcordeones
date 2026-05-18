// Centro de Ayuda — Server Component: metadata estática SEO.
// El cuerpo es client-side (ssr:false) vía AyudaCliente.
import type { Metadata } from 'next'
import AyudaCliente from './AyudaCliente'

const SITIO = 'https://ventadeacordeones.com'

const TITULO = 'Centro de Ayuda — VentaDeAcordeones.com'
const DESCRIPCION =
  'Encuentra respuestas rápidas, guía de compras y soporte. Estamos aquí para ayudarte con tu compra de acordeones y accesorios.'

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: `${SITIO}/ayuda` },
  openGraph: {
    type: 'website',
    url: `${SITIO}/ayuda`,
    title: TITULO,
    description: DESCRIPCION,
    images: [`${SITIO}/logo.svg`],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRIPCION,
    images: [`${SITIO}/logo.svg`],
  },
}

export default function PaginaAyudaRoute() {
  return <AyudaCliente />
}
