// Página legal estática (Política de Envío). Indexable, sin fetch ni JSON-LD.
import type { Metadata } from 'next'
import PoliticaEnvioCliente from './PoliticaEnvioCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/politica-envio`

export const metadata: Metadata = {
  title: 'Política de Envío — VentaDeAcordeones.com',
  description:
    'Conoce los tiempos de entrega, cobertura, costos y condiciones de envío de acordeones en VentaDeAcordeones.com.',
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Política de Envío — VentaDeAcordeones.com',
    description:
      'Conoce los tiempos de entrega, cobertura, costos y condiciones de envío de acordeones en VentaDeAcordeones.com.',
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

export default function PaginaPoliticaEnvioRoute() {
  return <PoliticaEnvioCliente />
}
