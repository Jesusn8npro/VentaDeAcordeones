// Blog (índice) — Server Component: metadata estática SEO + BreadcrumbList
// + índice de artículos rastreable renderizado en servidor.
// El listado visual sigue siendo client-side (BlogCliente): Google no ejecuta ese
// fetch, así que sin este bloque el HTML de /blog salía con CERO enlaces a /blog/[slug]
// y los artículos sólo eran descubribles por el sitemap.
import type { Metadata } from 'next'
import Link from 'next/link'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import BlogCliente from './BlogCliente'

const SITIO = 'https://ventadeacordeones.com'

// Sin esto el índice quedaba cacheado hasta el siguiente deploy y los artículos
// nuevos no aparecían en el HTML rastreable.
export const revalidate = 900

const TITULO = 'Blog de acordeones: guías, consejos y novedades'
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

async function articulosPublicados() {
  const { data, error } = await supabaseServidor
    .from('articulos_web')
    .select('slug, titulo')
    .eq('estado_publicacion', 'publicado')
    .order('fecha_publicacion', { ascending: false })
    .limit(50)
  if (error) {
    console.error('[blog índice] Supabase:', error.message)
    return []
  }
  return (data || []).filter((a) => a?.slug && a?.titulo)
}

export default async function PaginaBlogRoute() {
  const articulos = await articulosPublicados()

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
      {/* serializarJsonLd escapa < > & para que ningún texto de BD pueda cerrar el <script>. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }}
      />
      <BlogCliente />
      {/* sr-only (no display:none): invisible para el usuario, rastreable por Google y
          navegable con lector de pantalla. prefetch={false} para no disparar egress
          por enlaces que nadie ve. */}
      {articulos.length > 0 && (
        <nav className="sr-only" aria-label="Todos los artículos del blog">
          <h2>Todos los artículos del blog</h2>
          <ul>
            {articulos.map((a) => (
              <li key={a.slug}>
                <Link href={`/blog/${a.slug}`} prefetch={false}>
                  {a.titulo}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  )
}
