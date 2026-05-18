// Blog (índice) — Server Component: metadata estática SEO + BreadcrumbList.
// El listado real es client-side (ssr:false) vía BlogCliente.
import type { Metadata } from 'next'
import BlogCliente from './BlogCliente'

const SITIO = 'https://ventadeacordeones.com'

const TITULO = 'Blog — VentaDeAcordeones.com'
const DESCRIPCION =
  'Guías expertas de compra, tendencias y consejos para elegir tu acordeón y accesorios musicales en Colombia.'

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: `${SITIO}/blog` },
  openGraph: {
    type: 'website',
    url: `${SITIO}/blog`,
    title: TITULO,
    description: DESCRIPCION,
    images: [`${SITIO}/logo.svg`],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRIPCION,
    images: [`${SITIO}/logo.svg`],
  },
}

export default function PaginaBlogRoute() {
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITIO}/blog` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogCliente />
    </>
  )
}
