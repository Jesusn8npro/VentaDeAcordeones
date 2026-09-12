import type { Metadata } from 'next'
import ContactoCliente from './ContactoCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/contacto`

export const metadata: Metadata = {
  title: 'Contacto: WhatsApp, correo y taller en Bogotá',
  description:
    'Contáctanos para resolver dudas sobre acordeones, accesorios, envíos o tu pedido. Atención por WhatsApp, correo y formulario. Envíos a toda Colombia.',
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Contacto: WhatsApp, correo y taller en Bogotá',
    description:
      'Contáctanos para resolver dudas sobre acordeones, accesorios, envíos o tu pedido. Atención por WhatsApp, correo y formulario.',
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contacto: WhatsApp, correo y taller en Bogotá',
    description:
      'Contáctanos para resolver dudas sobre acordeones, accesorios, envíos o tu pedido. Atención por WhatsApp, correo y formulario.',
  },
}

export default function PaginaContactoRoute() {
  return <ContactoCliente />
}
