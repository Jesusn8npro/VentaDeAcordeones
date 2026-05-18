// Página legal estática (Política de Privacidad). Indexable, sin fetch ni JSON-LD.
import type { Metadata } from 'next'
import PoliticaPrivacidadCliente from './PoliticaPrivacidadCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/politica-privacidad`

export const metadata: Metadata = {
  title: 'Política de Privacidad — VentaDeAcordeones.com',
  description:
    'Política de privacidad y tratamiento de datos personales de VentaDeAcordeones.com conforme a la normativa colombiana.',
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Política de Privacidad — VentaDeAcordeones.com',
    description:
      'Política de privacidad y tratamiento de datos personales de VentaDeAcordeones.com conforme a la normativa colombiana.',
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

export default function PaginaPoliticaPrivacidadRoute() {
  return <PoliticaPrivacidadCliente />
}
