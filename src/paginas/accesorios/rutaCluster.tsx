// Fábrica de rutas para clusters: /accesorios/[cluster], /instrumentos/[cluster], /audio/[cluster].
// Cada page.tsx sólo hace `export const { generateStaticParams, generateMetadata, Pagina } = crearRutaCluster('audio')`.
// Productos desde Supabase (por categoría o por palabras en el nombre), JSON-LD de BreadcrumbList,
// ItemList/Product (precio COP) y FAQPage.
import type { Metadata } from 'next'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import { notFound } from 'next/navigation'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import { CLUSTERS, BASES, esAccesorio, SITIO, type BaseCluster, type Cluster } from '@/datos/clusters'
import PaginaCluster from './PaginaCluster'

export async function productosDeCluster(c: Cluster) {
  let q = supabaseServidor
    .from('productos')
    .select('*, producto_imagenes(imagen_principal, imagen_secundaria_1), categorias!inner(slug)')
    .eq('activo', true)
  if (c.categoriaSlug) q = q.eq('categorias.slug', c.categoriaSlug)
  else q = q.or(c.palabras.map((p) => `nombre.ilike.%${p}%`).join(','))
  const { data, error } = await q.order('destacado', { ascending: false }).order('precio', { ascending: true })
  if (error) { console.error('[cluster] Supabase:', error.message); return [] }
  const lista = (data || []) as any[]
  return c.categoriaSlug ? lista : lista.filter((p) => esAccesorio(p.nombre))
}

export function crearRutaCluster(base: BaseCluster) {
  const propios = () => CLUSTERS.filter((c) => c.base === base)
  const buscar = (slug: string) => propios().find((c) => c.slug === slug)

  function generateStaticParams() {
    return propios().map((c) => ({ cluster: c.slug }))
  }

  async function generateMetadata({ params }: { params: Promise<{ cluster: string }> }): Promise<Metadata> {
    const { cluster } = await params
    const c = buscar(cluster)
    if (!c) return { title: 'Página no encontrada', robots: { index: false, follow: true } }
    const url = `${SITIO}/${base}/${c.slug}`
    const img = c.imagen.startsWith('http') ? c.imagen : `${SITIO}${c.imagen}`
    return {
      title: c.titulo,
      description: c.descripcion,
      // Palabras clave: familia + variantes + intención local ("… en Bogotá / Colombia / precio")
      keywords: [
        c.nombre.toLowerCase(), `${c.nombre.toLowerCase()} de acordeón`, ...c.palabras, ...c.chips.map((ch) => ch.toLowerCase()),
        `${c.nombre.toLowerCase()} bogotá`, `${c.nombre.toLowerCase()} colombia`, `comprar ${c.nombre.toLowerCase()}`, `${c.nombre.toLowerCase()} precio`,
      ],
      alternates: { canonical: url },
      openGraph: { type: 'website', url, title: c.titulo, description: c.descripcion, images: [img], siteName: 'VentaDeAcordeones.com', locale: 'es_CO' },
      twitter: { card: 'summary_large_image', title: c.titulo, description: c.descripcion, images: [img] },
    }
  }

  async function Pagina({ params }: { params: Promise<{ cluster: string }> }) {
    const { cluster } = await params
    const c = buscar(cluster)
    if (!c) notFound()
    const productos = await productosDeCluster(c)
    const url = `${SITIO}/${base}/${c.slug}`
    const jsonLd = [
      {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
          { '@type': 'ListItem', position: 2, name: BASES[base].nombre, item: `${SITIO}/${base}` },
          { '@type': 'ListItem', position: 3, name: c.nombre, item: url },
        ],
      },
      {
        '@context': 'https://schema.org', '@type': 'ItemList', name: c.h1.join(' '), url, numberOfItems: productos.length,
        itemListElement: productos.map((p: any, i: number) => ({
          '@type': 'ListItem', position: i + 1,
          item: {
            '@type': 'Product', name: p.nombre, url: `${SITIO}/producto/${p.slug}`,
            image: p.producto_imagenes?.[0]?.imagen_principal || `${SITIO}${c.imagen}`,
            brand: { '@type': 'Brand', name: p.marca || 'VentaDeAcordeones' },
            offers: {
              '@type': 'Offer', priceCurrency: 'COP', price: p.precio, url: `${SITIO}/producto/${p.slug}`,
              availability: (p.stock ?? 0) > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              itemCondition: 'https://schema.org/NewCondition',
            },
          },
        })),
      },
      { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: c.faq.map((f) => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })) },
    ]
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }} />
        <PaginaCluster cluster={c} productos={productos} />
      </>
    )
  }

  return { generateStaticParams, generateMetadata, Pagina }
}
