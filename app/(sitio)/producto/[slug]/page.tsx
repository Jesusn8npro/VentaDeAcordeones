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
import { notFound } from 'next/navigation'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import ProductoCliente from './ProductoCliente'
import { consultarProductoPorSlug } from '@/servicios/consultaProducto'

const SITIO = 'https://ventadeacordeones.com'

// Sin esto la ruta quedaba cacheada hasta el siguiente deploy: precio y stock del
// JSON-LD se servían viejos a Google. 15 min es suficiente para un catálogo así.
export const revalidate = 900

const getProducto = cache(async (slug: string) => {
  // modelo/color/talla/material alimentan el fallback de meta description y el mpn del JSON-LD;
  // categorias(...) da el breadcrumb real; total_resenas/calificacion_promedio sólo se usan si son reales.
  const { data, error } = await supabaseServidor
    .from('productos')
    .select(
      'nombre, descripcion, precio, precio_original, stock, marca, modelo, color, talla, material, slug, meta_title, meta_description, total_resenas, calificacion_promedio, categorias(nombre, slug), producto_imagenes(imagen_principal)'
    )
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle()
  if (error) console.error('[producto SEO] Supabase:', error.message)
  return data
})

// Ficha completa para RENDERIZAR en el servidor. `cache()` evita repetir la consulta entre
// generateMetadata y la página dentro de la misma petición.
const getProductoCompleto = cache(async (slug: string) => {
  try {
    return await consultarProductoPorSlug(supabaseServidor, slug)
  } catch (e: any) {
    console.error('[producto] Supabase:', e?.message)
    return null
  }
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

/** Campos de BD que llegan vacíos o con el relleno "No especificado" del importador. */
function campoUtil(v?: unknown): string {
  const s = String(v ?? '').replace(/\s+/g, ' ').trim()
  if (!s || /^no\s+especificad/i.test(s) || s === '-') return ''
  return s
}

function precioCOP(v?: unknown): string {
  const n = Number(v)
  return n > 0 ? `$${n.toLocaleString('es-CO')} COP` : ''
}

/** El embed `categorias(...)` llega como objeto o como array de uno según infiera PostgREST. */
function categoriaDe(p: any): { nombre?: string; slug?: string } | null {
  const c = p?.categorias
  return (Array.isArray(c) ? c[0] : c) || null
}

/**
 * Meta description de reserva cuando la BD no trae `meta_description` útil.
 * Antes era UNA frase genérica idéntica en decenas de fichas (contenido duplicado para Google);
 * ahora se arma con los datos reales del producto y varía por marca/modelo/color/categoría/precio.
 * Se añaden frases por prioridad mientras quepan en 160 y se rellena hasta pasar de 120.
 */
function descripcionGenerada(p: any): string {
  const marca = campoUtil(p.marca)
  const modelo = campoUtil(p.modelo)
  const color = campoUtil(p.color)
  const material = campoUtil(p.material)
  const categoria = campoUtil(categoriaDe(p)?.nombre)
  const precio = precioCOP(p.precio)
  const hayStock = Number(p.stock) > 0

  const ficha = [
    marca && `Marca ${marca}`,
    modelo && `modelo ${modelo}`,
    color && `color ${color}`,
    material && `en ${material}`,
  ].filter(Boolean)

  const frases = [
    `${campoUtil(p.nombre)}.`,
    ficha.length ? `${ficha.join(', ')}.` : '',
    categoria
      ? `${categoria}${precio ? ` desde ${precio}` : ''}.`
      : precio
        ? `Precio ${precio}.`
        : '',
    hayStock
      ? 'Disponible para envío inmediato a todo el país.'
      : 'Sobre pedido con envío a todo el país.',
    'Garantía y asesoría de expertos.',
  ].filter(Boolean)

  let texto = ''
  for (const f of frases) {
    const siguiente = texto ? `${texto} ${f}` : f
    if (siguiente.length > 160) continue
    texto = siguiente
  }
  // Cierre comercial sólo si la descripción quedó por debajo del mínimo recomendado (120).
  for (const extra of ['Envíos a toda Colombia.', 'Compra segura en VentaDeAcordeones.com.']) {
    if (texto.length >= 120) break
    if (`${texto} ${extra}`.length <= 160) texto = `${texto} ${extra}`
  }
  return texto || recortar(p.nombre)
}

/**
 * Plantilla que dejó el importador en `meta_description` («… de alta calidad para tu acordeón.
 * Envío a toda Colombia y el mundo. Garantía incluida.»): texto idéntico en decenas de fichas,
 * que Google lee como contenido duplicado. Se descarta para que gane la descripción generada
 * con los datos reales del producto.
 */
const META_PLANTILLA =
  /de alta calidad para tu acorde|env[ií]o a toda colombia y el mundo\.?\s*garant[ií]a incluida/i

/** Descripción final: meta de BD si aporta algo, si no la descripción larga, si no la generada. */
function descripcionMeta(p: any, max = 160): string {
  const meta = recortar(p.meta_description, max)
  if (meta && !META_PLANTILLA.test(meta)) return meta
  const larga = recortar(p.descripcion, max)
  if (larga && !META_PLANTILLA.test(larga)) return larga
  return descripcionGenerada(p)
}

/** priceValidUntil que Google exige en Offer: hoy + 1 año en YYYY-MM-DD. */
function validoHastaUnAno(): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString().slice(0, 10)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const p = await getProducto(slug)

  // Aquí NO se lanza notFound(): sólo metadata noindex. El 404 real lo emite la página.
  if (!p) {
    return {
      title: 'Producto no encontrado — VentaDeAcordeones.com',
      robots: { index: false, follow: true },
    }
  }

  const titulo = p.meta_title || `${p.nombre} — VentaDeAcordeones.com`
  const descripcion = descripcionMeta(p)
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

  // Antes un slug inexistente devolvía 200 con noindex: Google lo trataba como soft-404.
  if (!p) notFound()

  const canonical = `${SITIO}/producto/${p.slug}`
  const categoria = categoriaDe(p)
  const resenas = Number(p.total_resenas) || 0
  const calificacion = Number(p.calificacion_promedio) || 0

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    '@id': `${canonical}#product`,
    name: p.nombre,
    description: descripcionMeta(p, 500),
    image: imagenAbsoluta(p.producto_imagenes?.[0]?.imagen_principal),
    ...(campoUtil(p.marca) ? { brand: { '@type': 'Brand', name: campoUtil(p.marca) } } : {}),
    // La tabla `productos` no tiene columna sku: el slug es el identificador estable público.
    sku: p.slug,
    ...(campoUtil(p.modelo) ? { mpn: campoUtil(p.modelo) } : {}),
    ...(campoUtil(p.color) ? { color: campoUtil(p.color) } : {}),
    ...(campoUtil(p.material) ? { material: campoUtil(p.material) } : {}),
    itemCondition: 'https://schema.org/NewCondition',
    offers: {
      '@type': 'Offer',
      url: canonical,
      priceCurrency: 'COP',
      price: Number(p.precio) || 0,
      priceValidUntil: validoHastaUnAno(),
      itemCondition: 'https://schema.org/NewCondition',
      availability:
        Number(p.stock) > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      seller: { '@id': `${SITIO}/#organization` },
    },
    // Sólo si la BD trae valoraciones REALES: Google penaliza reseñas inventadas.
    ...(resenas > 0 && calificacion > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: calificacion,
            reviewCount: resenas,
          },
        }
      : {}),
  }

  // Breadcrumb separado (Inicio › Tienda › Categoría › Producto) para el rich result de ruta.
  const breadcrumbLd = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${SITIO}/tienda` },
      ...(categoria?.slug && categoria?.nombre
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: categoria.nombre,
              item: `${SITIO}/tienda/categoria/${categoria.slug}`,
            },
            { '@type': 'ListItem', position: 4, name: p.nombre, item: canonical },
          ]
        : [{ '@type': 'ListItem', position: 3, name: p.nombre, item: canonical }]),
    ],
  }

  return (
    <>
      {/* serializarJsonLd escapa < > & : una descripción de BD/IA con "</script>" ya no rompe ni inyecta. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(breadcrumbLd) }}
      />
      <ProductoCliente initialData={await getProductoCompleto(slug)} />
    </>
  )
}
