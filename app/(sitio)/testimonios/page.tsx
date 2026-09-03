// ───────────────────────────────────────────────────────────────────────────
// /testimonios — página fija (sin datos dinámicos). page.tsx = SERVER component
// con metadata estática SEO (title/description/canonical/OG) + JSON-LD.
// JSON-LD: BreadcrumbList + Organization. Se OMITE aggregateRating a propósito:
// Google no muestra rich results de valoraciones "auto-servidas" en Organization
// y las 1.200 reseñas viven en Google/Facebook/ML, no en esta página → marcarlas
// aquí sería indefendible ante una revisión manual. Si algún día los testimonios
// se cargan con autor/fecha/rating reales, cambiar a Review + AggregateRating.
// El body (PaginaTestimonios) es Client Component (filtros por chips).
// ───────────────────────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import PaginaTestimonios from '@/paginas/Testimonios/PaginaTestimonios'

const SITIO = 'https://ventadeacordeones.com'

// El layout raíz aplica template '%s | VentaDeAcordeones.com' → el <title> final queda exactamente
// "Testimonios de clientes: acordeones Hohner entregados en Colombia y el mundo | VentaDeAcordeones.com".
const TITULO = 'Testimonios de clientes: acordeones Hohner entregados en Colombia y el mundo'
const TITULO_COMPLETO = `${TITULO} | VentaDeAcordeones.com`
const DESCRIPCION =
  'Fotos y videos reales de clientes con su acordeón Hohner en Colombia, Chile, USA, México y más. 4.9/5 en más de 1.200 reseñas verificadas y envíos a 42 países.'
const CANONICAL = `${SITIO}/testimonios`
const IMAGEN = `${SITIO}/images/testimonios/cliente-1.webp`

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'website',
    url: CANONICAL,
    title: TITULO_COMPLETO,
    description: DESCRIPCION,
    images: [{ url: IMAGEN, width: 600, height: 600, alt: 'Cliente con su acordeón Hohner entregado' }],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO_COMPLETO,
    description: DESCRIPCION,
    images: [IMAGEN],
  },
}

const JSON_LD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
        { '@type': 'ListItem', position: 2, name: 'Testimonios', item: CANONICAL },
      ],
    },
    {
      '@type': 'Organization',
      '@id': `${SITIO}/#organization`,
      name: 'VentaDeAcordeones.com',
      url: SITIO,
      logo: `${SITIO}/logo.svg`,
      sameAs: ['https://www.facebook.com/ventadeacordeones', 'https://www.instagram.com/ventadeacordeones1/'],
    },
    {
      '@type': 'WebPage',
      '@id': CANONICAL,
      url: CANONICAL,
      name: TITULO_COMPLETO,
      description: DESCRIPCION,
      inLanguage: 'es-CO',
      primaryImageOfPage: IMAGEN,
      isPartOf: { '@id': `${SITIO}/#website` },
    },
  ],
}

export default function PaginaTestimoniosRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializarJsonLd(JSON_LD) }} />
      <PaginaTestimonios />
    </>
  )
}
