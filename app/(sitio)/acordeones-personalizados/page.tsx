// ───────────────────────────────────────────────────────────────────────────
// /acordeones-personalizados — landing fija (sin datos dinámicos). page.tsx =
// SERVER component con metadata estática SEO (title/description/canonical/OG).
// Sin fetch Supabase. Product/Offer se OMITE a propósito: la landing no expone
// precio ni SKU (la conversión es por WhatsApp) y marcarlo sería inventado.
// Sí se marca FAQPage con las preguntas reales de la sección #preguntas.
// El body (AcordeonesPersonalizados) es Client Component ssr:false.
// ───────────────────────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import { FAQ_PERSONALIZADOS } from '@/paginas/AcordeonesPersonalizados/faqPersonalizados'
import AcordeonesPersonalizadosCliente from './AcordeonesPersonalizadosCliente'

const SITIO = 'https://ventadeacordeones.com'

const TITULO = 'Acordeones Personalizados Hohner: nácar y grabados'
const DESCRIPCION =
  'Acordeones Rey Vallenato personalizados pieza por pieza: acabados nacarados, grillas doradas y grabados a mano. Cada uno irrepetible. Envíos a toda Colombia.'
const CANONICAL = `${SITIO}/acordeones-personalizados`

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'website',
    url: CANONICAL,
    title: TITULO,
    description: DESCRIPCION,
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRIPCION,
  },
}

const JSON_LD = [
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${CANONICAL}#faq`,
    url: CANONICAL,
    inLanguage: 'es-CO',
    mainEntity: FAQ_PERSONALIZADOS.map((f) => ({
      '@type': 'Question',
      name: f.p,
      acceptedAnswer: { '@type': 'Answer', text: f.r },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
      { '@type': 'ListItem', position: 2, name: 'Acordeones personalizados', item: CANONICAL },
    ],
  },
]

export default function PaginaAcordeonesPersonalizadosRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializarJsonLd(JSON_LD) }} />
      <AcordeonesPersonalizadosCliente />
    </>
  )
}
