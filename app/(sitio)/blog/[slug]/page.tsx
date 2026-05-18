// Artículo de blog — Server Component:
//   • generateMetadata({ params }) → await params (Next 16), fetch server-side
//     a Supabase (articulos_web) → title/description/canonical/OG REALES.
//   • JSON-LD Article renderizado en el HTML server (rastreable por Google).
//   • Body client-side (ssr:false), idéntico al SPA, lee el slug vía
//     @/compat/router.useParams() (param `slug` = carpeta [slug]).
import { cache } from 'react'
import type { Metadata } from 'next'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import ArticuloCliente from './ArticuloCliente'

const SITIO = 'https://ventadeacordeones.com'

const getArticulo = cache(async (slug: string) => {
  const { data, error } = await supabaseServidor
    .from('articulos_web')
    .select(
      'titulo, slug, resumen_breve, resumen_completo, portada_url, fecha_publicacion, autor'
    )
    .eq('slug', slug)
    .eq('estado_publicacion', 'publicado')
    .limit(1)
    .maybeSingle()
  if (error) console.error('[blog SEO] Supabase:', error.message)
  return data
})

function imagenAbsoluta(img?: string | null): string {
  if (!img) return `${SITIO}/logo.svg`
  return img.startsWith('http') ? img : `${SITIO}/${img.replace(/^\/+/, '')}`
}

function recortar(texto?: string | null, max = 160): string {
  if (!texto) return ''
  const t = texto.replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const a = await getArticulo(slug)

  if (!a) {
    return {
      title: 'Artículo no encontrado — VentaDeAcordeones.com',
      robots: { index: false, follow: true },
    }
  }

  const titulo = `${a.titulo} — VentaDeAcordeones.com`
  const descripcion =
    recortar(a.resumen_breve || a.resumen_completo) ||
    'Guías y consejos de compra de acordeones y accesorios musicales en Colombia.'
  const canonical = `${SITIO}/blog/${a.slug}`
  const img = imagenAbsoluta(a.portada_url)

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: titulo,
      description: descripcion,
      images: [img],
      siteName: 'VentaDeAcordeones.com',
      locale: 'es_CO',
    },
    twitter: {
      card: 'summary_large_image',
      title: titulo,
      description: descripcion,
      images: [img],
    },
  }
}

export default async function ArticuloBlogRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const a = await getArticulo(slug)

  const jsonLd = a
    ? {
        '@context': 'https://schema.org/',
        '@type': 'Article',
        headline: a.titulo,
        description: recortar(a.resumen_breve || a.resumen_completo, 500),
        image: imagenAbsoluta(a.portada_url),
        ...(a.fecha_publicacion
          ? { datePublished: a.fecha_publicacion }
          : {}),
        author: { '@type': 'Person', name: a.autor || 'JESUS GONZALEZ' },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${SITIO}/blog/${a.slug}`,
        },
      }
    : null

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ArticuloCliente />
    </>
  )
}
