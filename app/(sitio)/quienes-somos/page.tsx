import type { Metadata } from 'next'
import QuienesSomosCliente from './QuienesSomosCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/quienes-somos`

export const metadata: Metadata = {
  title: 'Quiénes somos — VentaDeAcordeones.com',
  description:
    'Conoce la historia de VentaDeAcordeones.com: pasión por el acordeón vallenato, atención cercana y los mejores instrumentos y accesorios con envíos a toda Colombia.',
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Quiénes somos — VentaDeAcordeones.com',
    description:
      'Conoce la historia de VentaDeAcordeones.com: pasión por el acordeón vallenato, atención cercana y los mejores instrumentos y accesorios.',
    images: [`${SITIO}/logo.svg`],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Quiénes somos — VentaDeAcordeones.com',
    description:
      'Conoce la historia de VentaDeAcordeones.com: pasión por el acordeón vallenato, atención cercana y los mejores instrumentos y accesorios.',
    images: [`${SITIO}/logo.svg`],
  },
}

export default function PaginaQuienesSomosRoute() {
  return <QuienesSomosCliente />
}
