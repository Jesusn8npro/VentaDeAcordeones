// Artículo de blog — Server Component:
//   • generateMetadata({ params }) → await params (Next 16), fetch server-side
//     a Supabase (articulos_web) → title/description/canonical/OG REALES.
//   • JSON-LD Article renderizado en el HTML server (rastreable por Google).
//   • Body client-side (ssr:false), idéntico al SPA, lee el slug vía
//     @/compat/router.useParams() (param `slug` = carpeta [slug]).
import { cache } from 'react'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import ArticuloCliente from './ArticuloCliente'

const SITIO = 'https://ventadeacordeones.com'

// Sin esto el artículo quedaba cacheado hasta el siguiente deploy: las ediciones y
// el dateModified del JSON-LD no llegaban a Google.
export const revalidate = 900

const getArticulo = cache(async (slug: string) => {
  const { data, error } = await supabaseServidor
    .from('articulos_web')
    // Select completo: este mismo registro es el que pinta el articulo en el servidor
    // (antes solo servia para la metadata y el cuerpo se pedia otra vez desde el navegador,
    // asi que Google recibia un "Cargando...").
    .select('*')
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

function recortar(texto?: unknown, max = 160): string {
  if (!texto) return ''
  // resumen/descripcion pueden venir como JSONB objeto ({contenido})
  let s: string
  if (typeof texto === 'string') s = texto
  else if (
    typeof texto === 'object' &&
    texto !== null &&
    typeof (texto as any).contenido === 'string'
  )
    s = (texto as any).contenido
  else if (typeof texto === 'object') return ''
  else s = String(texto)
  const t = s.replace(/\s+/g, ' ').trim()
  return t.length > max ? `${t.slice(0, max - 1)}…` : t
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const a = await getArticulo(slug)

  // Aquí NO se lanza notFound(): sólo metadata noindex. El 404 real lo emite la página.
  if (!a) {
    return {
      title: 'Artículo no encontrado',
      robots: { index: false, follow: true },
    }
  }

  // El layout raíz ya aplica la plantilla «%s | VentaDeAcordeones.com»: no se repite el sufijo aquí.
  // meta_titulo / meta_descripcion (≤60 / ≤160) mandan si existen; si no, título y resumen.
  const titulo = recortar(a.meta_titulo, 70) || a.titulo
  const descripcion =
    recortar(a.meta_descripcion) ||
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

/** Nombre visible del autor: la columna `autor` puede traer un uuid en filas antiguas. */
function nombreAutor(autor?: string | null): string {
  if (!autor || /^[0-9a-f-]{36}$/i.test(autor)) return 'Jesús González'
  return autor
}

/** FAQPage a partir de la sección tipo "faq" ({ tipo:'faq', preguntas:[{pregunta, respuesta}] }). */
function faqJsonLd(secciones: unknown) {
  const lista = typeof secciones === 'string' ? safeJson(secciones) : secciones
  if (!Array.isArray(lista)) return null
  const faq = lista.find((s: any) => s?.tipo === 'faq' && Array.isArray(s.preguntas) && s.preguntas.length)
  if (!faq) return null
  const limpiar = (t: unknown) =>
    String(t ?? '').replace(/\*\*|\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim()
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (faq as any).preguntas
      .filter((p: any) => p?.pregunta && p?.respuesta)
      .map((p: any) => ({
        '@type': 'Question',
        name: limpiar(p.pregunta),
        acceptedAnswer: { '@type': 'Answer', text: limpiar(p.respuesta) },
      })),
  }
}
function safeJson(s: string) {
  try { return JSON.parse(s) } catch { return null }
}

export default async function ArticuloBlogRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const a = await getArticulo(slug)

  // Antes un slug inexistente devolvía 200 con noindex: Google lo trataba como soft-404.
  if (!a) notFound()

  // Tras notFound() el artículo existe seguro: se eliminan los ternarios `a ? … : null`.
  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Article',
    headline: a.titulo,
    description: recortar(a.resumen_breve || a.resumen_completo, 500),
    image: imagenAbsoluta(a.portada_url),
    ...(a.fecha_publicacion ? { datePublished: a.fecha_publicacion } : {}),
    ...(a.actualizado_en ? { dateModified: a.actualizado_en } : {}),
    author: { '@type': 'Person', name: nombreAutor(a.autor) },
    publisher: {
      '@type': 'Organization',
      name: 'VentaDeAcordeones.com',
      logo: { '@type': 'ImageObject', url: `${SITIO}/logo.svg` },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITIO}/blog/${a.slug}`,
    },
  }
  const faqLd = faqJsonLd(a.secciones)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializarJsonLd(faqLd) }}
        />
      )}
      <ArticuloCliente initialData={a} />
    </>
  )
}
