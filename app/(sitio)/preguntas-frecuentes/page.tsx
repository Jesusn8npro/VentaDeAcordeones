// Página legal estática (Preguntas Frecuentes). Indexable, sin fetch ni JSON-LD.
import type { Metadata } from 'next'
import PreguntasFrecuentesCliente from './PreguntasFrecuentesCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/preguntas-frecuentes`

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes — VentaDeAcordeones.com',
  description:
    'Resuelve tus dudas sobre compras, envíos, pagos y garantía de acordeones en VentaDeAcordeones.com.',
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Preguntas Frecuentes — VentaDeAcordeones.com',
    description:
      'Resuelve tus dudas sobre compras, envíos, pagos y garantía de acordeones en VentaDeAcordeones.com.',
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

export default function PaginaPreguntasFrecuentesRoute() {
  return <PreguntasFrecuentesCliente />
}
