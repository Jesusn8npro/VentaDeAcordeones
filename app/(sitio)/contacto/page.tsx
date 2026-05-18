import type { Metadata } from 'next'
import ContactoCliente from './ContactoCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/contacto`

export const metadata: Metadata = {
  title: 'Contacto — VentaDeAcordeones.com',
  description:
    'Contáctanos para resolver dudas sobre acordeones, accesorios, envíos o tu pedido. Atención por WhatsApp, correo y formulario. Envíos a toda Colombia.',
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Contacto — VentaDeAcordeones.com',
    description:
      'Contáctanos para resolver dudas sobre acordeones, accesorios, envíos o tu pedido. Atención por WhatsApp, correo y formulario.',
    images: [`${SITIO}/logo.svg`],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contacto — VentaDeAcordeones.com',
    description:
      'Contáctanos para resolver dudas sobre acordeones, accesorios, envíos o tu pedido. Atención por WhatsApp, correo y formulario.',
    images: [`${SITIO}/logo.svg`],
  },
}

export default function PaginaContactoRoute() {
  return <ContactoCliente />
}
