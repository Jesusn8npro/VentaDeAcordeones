// /guia-tonalidades — guía de compra que resuelve LA duda que frena la primera compra:
// qué tonalidad pedir. page.tsx = SERVER component con metadata estática + JSON-LD
// (FAQPage, BreadcrumbList, Article). El cuerpo vive en src/paginas/guias/ (client) y
// comparte los datos desde datosTonalidades.ts para no duplicar el contenido del FAQ.
import type { Metadata } from 'next'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import { SITIO } from '@/datos/clusters'
import GuiaTonalidades from '@/paginas/guias/GuiaTonalidades'
import { FAQ_TONALIDADES } from '@/paginas/guias/datosTonalidades'

const TITULO = 'Tonalidades de Acordeón Vallenato: GCF, ADG y FBbEb'
const DESCRIPCION =
  'Guía para elegir la tonalidad de tu acordeón vallenato: qué significan GCF, ADG, FBbEb y Do/Fa/Sib, cuál conviene a un principiante y cuál para acompañar.'
const CANONICAL = `${SITIO}/guia-tonalidades`
const IMAGEN = `${SITIO}/images/hero/rey-vallenato-negro.webp`

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'article',
    url: CANONICAL,
    title: TITULO,
    description: DESCRIPCION,
    images: [{ url: IMAGEN, width: 1200, height: 1200, alt: 'Acordeón Hohner Rey Vallenato' }],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
  twitter: { card: 'summary_large_image', title: TITULO, description: DESCRIPCION, images: [IMAGEN] },
  keywords: [
    'tonalidades de acordeón', 'tonalidades de acordeón vallenato', 'qué tonalidad de acordeón comprar',
    'acordeón GCF', 'acordeón ADG', 'acordeón FBbEb', 'acordeón Do Fa Sib',
    'diferencia entre GCF y ADG', 'acordeón para principiantes tonalidad',
    'qué acordeón comprar para empezar', 'acordeón diatónico tonalidad',
    'acordeón 5 letras', 'tonalidad acordeón para cantante',
  ],
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${CANONICAL}#faq`,
    mainEntity: FAQ_TONALIDADES.map((f) => ({
      '@type': 'Question',
      name: f.p,
      acceptedAnswer: { '@type': 'Answer', text: f.r },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `${CANONICAL}#articulo`,
    headline: '¿Qué tonalidad de acordeón elegir para tocar vallenato?',
    description: DESCRIPCION,
    url: CANONICAL,
    image: IMAGEN,
    inLanguage: 'es-CO',
    about: { '@type': 'Thing', name: 'Acordeón diatónico vallenato' },
    author: { '@id': `${SITIO}/#organization` },
    publisher: { '@id': `${SITIO}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': CANONICAL },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITIO}/tienda` },
      { '@type': 'ListItem', position: 3, name: 'Guía de tonalidades', item: CANONICAL },
    ],
  },
]

export default function PaginaGuiaTonalidadesRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }} />
      <GuiaTonalidades />
    </>
  )
}
