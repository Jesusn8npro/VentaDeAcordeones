import type { Metadata } from 'next'
import InicioCliente from './InicioCliente'

export const metadata: Metadata = {
  title: 'VentaDeAcordeones.com — Acordeones y Accesorios en Colombia',
  description:
    'La tienda online líder en acordeones de Colombia. Hohner, Gabbanelli, Guerrini y más. Envíos a toda Colombia con SERVIENTREGA. Asesoría gratis por WhatsApp.',
  alternates: { canonical: 'https://ventadeacordeones.com/' },
  openGraph: {
    type: 'website',
    url: 'https://ventadeacordeones.com/',
    title: 'VentaDeAcordeones.com — Acordeones en Colombia',
    description:
      'Tienda online de acordeones. Hohner, Gabbanelli, Guerrini. Envíos a toda Colombia. Garantía real.',
    images: ['https://ventadeacordeones.com/logo.svg'],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

export default function HomePage() {
  return <InicioCliente />
}
