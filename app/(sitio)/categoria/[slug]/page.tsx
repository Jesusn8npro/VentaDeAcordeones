// /categoria/[slug] — SEO server-side por categoría (tabla `categorias`).
// Reutiliza PaginaCategoria (igual que el App.tsx original mapeaba esta ruta).
import { cache } from 'react'
import type { Metadata } from 'next'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import CategoriaCliente from './CategoriaCliente'

const SITIO = 'https://ventadeacordeones.com'

const getCategoria = cache(async (slug: string) => {
  const { data, error } = await supabaseServidor
    .from('categorias')
    .select('nombre, descripcion, slug, imagen_url')
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle()
  if (error) console.error('[categoria SEO] Supabase:', error.message)
  return data
})

function imagenAbsoluta(img?: string | null): string {
  if (!img) return `${SITIO}/logo.svg`
  return img.startsWith('http') ? img : `${SITIO}/${img.replace(/^\/+/, '')}`
}

function recortar(texto?: unknown, max = 160): string {
  if (!texto) return ''
  // descripcion/meta_description pueden venir como JSONB objeto ({contenido})
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
  const c = await getCategoria(slug)

  if (!c) {
    return {
      title: 'Categoría no encontrada — VentaDeAcordeones.com',
      robots: { index: false, follow: true },
    }
  }

  const titulo = `${c.nombre} — VentaDeAcordeones.com`
  const descripcion =
    recortar(c.descripcion) ||
    `Explora nuestra selección de ${c.nombre.toLowerCase()}. Acordeones y accesorios en Colombia con envíos a todo el país.`
  const canonical = `${SITIO}/categoria/${c.slug}`
  const img = imagenAbsoluta(c.imagen_url)

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical },
    openGraph: {
      type: 'website',
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

export default async function PaginaCategoriaRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const c = await getCategoria(slug)

  const jsonLd = c
    ? {
        '@context': 'https://schema.org/',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
          { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITIO}/tienda` },
          {
            '@type': 'ListItem',
            position: 3,
            name: c.nombre,
            item: `${SITIO}/categoria/${c.slug}`,
          },
        ],
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
      <CategoriaCliente />
    </>
  )
}
