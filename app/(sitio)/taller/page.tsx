// /taller — landing SEO "Taller de acordeones en Bogotá". page.tsx = SERVER component con
// metadata estática + JSON-LD (Service, FAQPage, BreadcrumbList). El body vive en
// src/paginas/Taller/PaginaTaller.tsx (client) y comparte FAQ/servicios desde ahí.
import type { Metadata } from 'next'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import PaginaTaller, { FAQ_TALLER, SERVICIOS_TALLER } from '@/paginas/Taller/PaginaTaller'
import { NUMERO_WA, SITIO } from '@/datos/clusters'

const TITULO = 'Taller de Acordeones en Bogotá: Afinación, Cambio de Pitos y Mantenimiento | VentaDeAcordeones.com'
const DESCRIPCION =
  'Taller de acordeones en Bogotá: afinación, cambio de pitos Hohner, fuelles, parrillas y mantenimiento. Maestros de Valledupar. Recibimos envíos de todo el país.'
const CANONICAL = `${SITIO}/taller`
const IMAGEN = `${SITIO}/images/hero/rojo-xtreme.webp`
const TELEFONO = `+${NUMERO_WA}`

export const metadata: Metadata = {
  title: { absolute: TITULO },
  description: DESCRIPCION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'website',
    url: CANONICAL,
    title: TITULO,
    description: DESCRIPCION,
    images: [{ url: IMAGEN, width: 1200, height: 1200, alt: 'Taller de acordeones VentaDeAcordeones en Bogotá' }],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
  twitter: { card: 'summary_large_image', title: TITULO, description: DESCRIPCION, images: [IMAGEN] },
  keywords: ['taller de acordeones Bogotá', 'afinación de acordeón', 'cambio de pitos acordeón', 'mantenimiento de acordeón', 'reparación de acordeón Hohner', 'cambio de fuelle acordeón'],
}

const PROVEEDOR = {
  '@type': 'LocalBusiness',
  '@id': `${SITIO}/#taller`,
  name: 'VentaDeAcordeones',
  url: SITIO,
  telephone: TELEFONO,
  image: IMAGEN,
  priceRange: '$$',
  areaServed: [
    { '@type': 'City', name: 'Bogotá' },
    { '@type': 'Country', name: 'Colombia' },
  ],
  address: { '@type': 'PostalAddress', addressLocality: 'Bogotá', addressRegion: 'Cundinamarca', addressCountry: 'CO' },
  sameAs: ['https://www.instagram.com/ventadeacordeones1'],
}

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'Service',
    '@id': `${CANONICAL}#servicio`,
    name: 'Taller de acordeones en Bogotá',
    serviceType: 'Reparación y afinación de acordeones',
    description: DESCRIPCION,
    url: CANONICAL,
    image: IMAGEN,
    provider: PROVEEDOR,
    areaServed: PROVEEDOR.areaServed,
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: `https://wa.me/${NUMERO_WA}`,
      servicePhone: { '@type': 'ContactPoint', telephone: TELEFONO, contactType: 'customer service', availableLanguage: 'es' },
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Servicios del taller',
      itemListElement: SERVICIOS_TALLER.map((s) => ({
        '@type': 'Offer',
        itemOffered: { '@type': 'Service', name: s.titulo, description: s.incluye.join('. ') + '.' },
      })),
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_TALLER.map((f) => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
      { '@type': 'ListItem', position: 2, name: 'Taller de acordeones', item: CANONICAL },
    ],
  },
]

export default function PaginaTallerRoute() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }} />
      <PaginaTaller />
    </>
  )
}
