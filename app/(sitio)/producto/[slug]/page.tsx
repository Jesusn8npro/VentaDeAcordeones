// ───────────────────────────────────────────────────────────────────────────
// PATRÓN CANÓNICO — página pública migrada a App Router real.
// Esto es lo que replican los agentes de Fase 1 para producto/categoría/landing.
//
//  • page.tsx = SERVER component:
//      - generateMetadata({ params }) → await params (Next 16), fetch server-side
//        a Supabase → title/description/canonical/OG REALES por producto.
//      - JSON-LD Product+Offer (precio/stock/COP) renderizado en el HTML server
//        (rastreable por Google). ESTE es el salto de SEO.
//  • El body es un Client Component ssr:false (idéntico al SPA, nada roto).
//  • Navegación interna delegada a Next vía @/compat/router (sin BrowserRouter).
// ───────────────────────────────────────────────────────────────────────────
import { cache } from 'react'
import type { Metadata } from 'next'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import ProductoCliente from './ProductoCliente'

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
  if (error) console.error('[producto SEO] Supabase:', error.message)
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
      title: 'Producto no encontrado — VentaDeAcordeones.com',
      robots: { index: false, follow: true },
    }
  }

  const titulo = p.meta_title || `${p.nombre} — VentaDeAcordeones.com`
  const descripcion =
    recortar(p.meta_description || p.descripcion) ||
    'Acordeones y accesorios en Colombia. Envíos a todo el país.'
  const canonical = `${SITIO}/producto/${p.slug}`
  const img = imagenAbsoluta(p.producto_imagenes?.[0]?.imagen_principal)

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

export default async function PaginaProductoRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const p = await getProducto(slug)

  const jsonLd = p
    ? {
        '@context': 'https://schema.org/',
        '@type': 'Product',
        name: p.nombre,
        description: recortar(p.meta_description || p.descripcion, 500),
        image: imagenAbsoluta(p.producto_imagenes?.[0]?.imagen_principal),
        ...(p.marca ? { brand: { '@type': 'Brand', name: p.marca } } : {}),
        sku: p.slug,
        offers: {
          '@type': 'Offer',
          url: `${SITIO}/producto/${p.slug}`,
          priceCurrency: 'COP',
          price: Number(p.precio) || 0,
          availability:
            Number(p.stock) > 0
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
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
      <ProductoCliente />
    </>
  )
}
