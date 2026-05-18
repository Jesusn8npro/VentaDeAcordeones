import type { Metadata } from 'next'
import SobreLaTiendaCliente from './SobreLaTiendaCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/sobre-la-tienda`

export const metadata: Metadata = {
  title: 'Sobre la tienda — VentaDeAcordeones.com',
  description:
    'Todo sobre VentaDeAcordeones.com: cómo compras seguro, formas de pago, envíos a toda Colombia y garantía en acordeones y accesorios musicales.',
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Sobre la tienda — VentaDeAcordeones.com',
    description:
      'Todo sobre VentaDeAcordeones.com: cómo compras seguro, formas de pago, envíos a toda Colombia y garantía en acordeones y accesorios musicales.',
    images: [`${SITIO}/logo.svg`],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sobre la tienda — VentaDeAcordeones.com',
    description:
      'Todo sobre VentaDeAcordeones.com: cómo compras seguro, formas de pago, envíos a toda Colombia y garantía en acordeones y accesorios musicales.',
    images: [`${SITIO}/logo.svg`],
  },
}

export default function PaginaSobreLaTiendaRoute() {
  return <SobreLaTiendaCliente />
}
