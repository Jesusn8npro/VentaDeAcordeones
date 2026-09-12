// Página legal estática (Preguntas Frecuentes). Indexable, sin fetch.
// JSON-LD FAQPage con las 18 Q&A reales importadas de preguntasFrecuentesDatos.ts: el mismo texto
// que ve el usuario en pantalla, requisito de Google para el rich result de preguntas frecuentes.
import type { Metadata } from 'next'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import { PREGUNTAS_FAQ } from '@/paginas/legal/PreguntasFrecuentes/preguntasFrecuentesDatos'
import PreguntasFrecuentesCliente from './PreguntasFrecuentesCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/preguntas-frecuentes`

const TITULO = 'Preguntas Frecuentes: envíos, pagos y garantía'
const DESCRIPCION =
  'Envíos a toda Colombia y al exterior, pagos con tarjeta o PSE, garantía Hohner y taller propio en Bogotá. Escríbenos por WhatsApp al +57 314 486 5310.'

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: TITULO,
    description: DESCRIPCION,
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${canonical}#faq`,
    url: canonical,
    inLanguage: 'es-CO',
    mainEntity: PREGUNTAS_FAQ.map((p) => ({
      '@type': 'Question',
      name: p.pregunta,
      acceptedAnswer: { '@type': 'Answer', text: p.respuesta },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
      { '@type': 'ListItem', position: 2, name: 'Preguntas frecuentes', item: canonical },
    ],
  },
]

export default function PaginaPreguntasFrecuentesRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializarJsonLd(JSON_LD) }} />
      <PreguntasFrecuentesCliente />
    </>
  )
}
