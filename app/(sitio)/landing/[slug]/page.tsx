// ───────────────────────────────────────────────────────────────────────────
// Landing de producto (/landing/[slug]) — MISMO producto que /producto/[slug].
// Eran dos URLs compitiendo por la misma ficha (contenido duplicado), así que:
//   - canonical apunta a /producto/[slug] (la ficha real),
//   - robots noindex/follow (la landing se usa para campañas, no para orgánico),
//   - SIN JSON-LD Product: el único Product válido vive en /producto/[slug].
// El body (LandingProducto) sigue siendo Client Component idéntico al SPA.
// ───────────────────────────────────────────────────────────────────────────
import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import LandingCliente from './LandingCliente'

const SITIO = 'https://ventadeacordeones.com'

const getProducto = cache(async (slug: string) => {
  const { data, error } = await supabaseServidor
    .from('productos')
    .select(
      'nombre, descripcion, precio, precio_original, stock, marca, slug, meta_title, meta_description, producto_imagenes(imagen_principal)'
    )
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle()
  if (error) console.error('[landing SEO] Supabase:', error.message)
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
  const p = await getProducto(slug)

  if (!p) {
    return {
      title: 'Landing no encontrada',
      robots: { index: false, follow: true },
    }
  }

  const titulo = p.meta_title || `${p.nombre} — VentaDeAcordeones.com`
  const descripcion =
    recortar(p.meta_description || p.descripcion) ||
    'Acordeones y accesorios en Colombia. Envíos a todo el país.'
  // La URL canónica es SIEMPRE la ficha de producto: la landing no debe competir con ella.
  const canonical = `${SITIO}/producto/${p.slug}`
  const img = imagenAbsoluta(p.producto_imagenes?.[0]?.imagen_principal)

  return {
    title: titulo,
    description: descripcion,
    alternates: { canonical },
    robots: { index: false, follow: true },
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

export default async function PaginaLandingRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const p = await getProducto(slug)

  // Antes un slug inexistente devolvía 200 con noindex: Google lo trataba como soft-404.
  if (!p) notFound()

  return <LandingCliente initialData={p} />
}
