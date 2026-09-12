// /tienda/categoria/[slug] — SEO server-side por categoría (tabla `categorias`).
// Reutiliza PaginaTienda (igual que el App.tsx original mapeaba esta ruta).
import { cache, Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import TiendaCategoriaCliente from './TiendaCategoriaCliente'

const SITIO = 'https://ventadeacordeones.com'

// Sin esto la ruta quedaba cacheada hasta el siguiente deploy y servía datos viejos.
export const revalidate = 900

const getCategoria = cache(async (slug: string) => {
  const { data, error } = await supabaseServidor
    .from('categorias')
    .select('id, nombre, descripcion, slug, imagen_url')
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle()
  if (error) console.error('[tienda/categoria SEO] Supabase:', error.message)
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

  // Aquí NO se lanza notFound(): sólo metadata noindex. El 404 real lo emite la página.
  if (!c) {
    return {
      title: 'Categoría no encontrada',
      robots: { index: false, follow: true },
    }
  }

  // El layout ya añade "| VentaDeAcordeones.com" con title.template: aquí solo va el nombre
  // de la categoría, con una cola que aporta keyword sin repetir la marca.
  const titulo = `${c.nombre} en Colombia`
  const descripcion =
    recortar(c.descripcion) ||
    `Explora nuestra selección de ${c.nombre.toLowerCase()}. Acordeones y accesorios en Colombia con envíos a todo el país.`
  const canonical = `${SITIO}/tienda/categoria/${c.slug}`
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

export default async function PaginaTiendaCategoriaRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const c = await getCategoria(slug)

  // Antes una categoría inexistente devolvía 200 con noindex: Google lo trataba como soft-404.
  if (!c) notFound()

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITIO}/tienda` },
      {
        '@type': 'ListItem',
        position: 3,
        name: c.nombre,
        item: `${SITIO}/tienda/categoria/${c.slug}`,
      },
    ],
  }

  return (
    <>
      {/* serializarJsonLd escapa < > & : un nombre/descripción de BD con "</script>" ya no rompe ni inyecta. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }}
      />
      <Suspense fallback={null}>
        {/* La categoría ya se consultó arriba para el <title>: se reaprovecha en vez de
            dejar que el navegador la vuelva a pedir. Así el H1 correcto ya viaja en el
            HTML de la primera respuesta. */}
        <TiendaCategoriaCliente
          categoriaInicial={{
            id: c.id,
            nombre: c.nombre,
            slug: c.slug,
            descripcion: typeof c.descripcion === 'string' ? c.descripcion : '',
            enOferta: 0,
          }}
        />
      </Suspense>
    </>
  )
}
