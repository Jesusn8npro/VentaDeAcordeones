// Catálogo completo /tienda — metadata estática (catálogo) + BreadcrumbList.
// Body client-side (PaginaTienda) idéntico al SPA vía TiendaCliente.
import type { Metadata } from 'next'
import TiendaCliente from './TiendaCliente'

const SITIO = 'https://ventadeacordeones.com'

const TITULO = 'Tienda de Acordeones — VentaDeAcordeones.com'
const DESCRIPCION =
  'Catálogo completo de acordeones y accesorios en Colombia. Las mejores marcas y precios con envíos a todo el país.'
const CANONICAL = `${SITIO}/tienda`

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'website',
    url: CANONICAL,
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

export default function PaginaTiendaRoute() {
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: CANONICAL },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TiendaCliente />
    </>
  )
}
