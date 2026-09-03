// Fábrica de hubs: /accesorios, /instrumentos, /audio → metadata + JSON-LD + <HubAccesorios base/>.
import type { Metadata } from 'next'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import HubAccesorios from './HubAccesorios'
import { CLUSTERS, BASES, SITIO, type BaseCluster } from '@/datos/clusters'

export function crearRutaHub(base: BaseCluster) {
  const b = BASES[base]
  const url = `${SITIO}/${base}`
  const propios = CLUSTERS.filter((c) => c.base === base)
  const imagen = propios[0]?.imagen ? `${SITIO}${propios[0].imagen}` : `${SITIO}/logo.svg`

  const metadata: Metadata = {
    title: b.titulo,
    description: b.descripcion,
    alternates: { canonical: url },
    openGraph: { type: 'website', url, title: b.titulo, description: b.descripcion, images: [imagen], siteName: 'VentaDeAcordeones.com', locale: 'es_CO' },
  }

  function Pagina() {
    const jsonLd = [
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
        { '@type': 'ListItem', position: 2, name: b.nombre, item: url },
      ] },
      { '@context': 'https://schema.org', '@type': 'ItemList', name: b.h1.join(' '),
        itemListElement: propios.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.nombre, url: `${SITIO}/${base}/${c.slug}` })) },
    ]
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }} />
        <HubAccesorios base={base} />
      </>
    )
  }
  return { metadata, Pagina }
}
