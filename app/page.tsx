import type { Metadata } from 'next'
import InicioCliente from './InicioCliente'

export const metadata: Metadata = {
  title: { absolute: 'Acordeones Hohner en Colombia: Venta, Personalizados y Taller | VentaDeAcordeones.com' },
  description:
    'Compra acordeones Hohner Rey Vallenato y Corona III, diseña el tuyo personalizado, consigue parrillas, fuelles, correas y audio, y repara en nuestro taller en Bogotá. Envíos a toda Colombia y 42 países.',
  alternates: { canonical: 'https://ventadeacordeones.com/' },
  openGraph: {
    type: 'website',
    url: 'https://ventadeacordeones.com/',
    title: 'Acordeones Hohner en Colombia: Venta, Personalizados y Taller',
    description:
      'Acordeones Hohner, personalizados con tu nombre, accesorios, audio y taller de acordeones en Bogotá. Distribuidor autorizado.',
    images: [{ url: 'https://ventadeacordeones.com/images/og/portada.jpg', width: 1200, height: 630, alt: 'Acordeones Hohner en VentaDeAcordeones.com' }],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

export default function HomePage() {
  return <InicioCliente />
}
