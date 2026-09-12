import { Suspense } from 'react'
// Catálogo completo /tienda — metadata estática (catálogo) + BreadcrumbList
// + índice de productos rastreable renderizado en servidor.
// El grid interactivo sigue siendo client-side (PaginaTienda): Google no ejecuta ese
// fetch, así que sin este bloque el HTML de /tienda salía con CERO enlaces a
// /producto/[slug] y las fichas sólo eran descubribles por el sitemap.
import type { Metadata } from 'next'
import Link from 'next/link'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import TiendaCliente from './TiendaCliente'

const SITIO = 'https://ventadeacordeones.com'

// Sin esto el catálogo quedaba cacheado hasta el siguiente deploy y los productos
// nuevos no aparecían en el HTML rastreable.
export const revalidate = 900

const TITULO = 'Tienda de acordeones y accesorios en Colombia'
const DESCRIPCION =
  'Catálogo completo de acordeones y accesorios en Colombia. Las mejores marcas y precios con envíos a todo el país.'
const CANONICAL = `${SITIO}/tienda`

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'website',
    url: CANONICAL,
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

async function productosDestacados() {
  const { data, error } = await supabaseServidor
    .from('productos')
    .select('slug, nombre')
    .eq('activo', true)
    .order('destacado', { ascending: false })
    .order('precio', { ascending: false })
    .limit(24)
  if (error) {
    console.error('[tienda índice] Supabase:', error.message)
    return []
  }
  return (data || []).filter((p) => p?.slug && p?.nombre)
}

export default async function PaginaTiendaRoute() {
  const productos = await productosDestacados()

  const jsonLd = {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: SITIO },
      { '@type': 'ListItem', position: 2, name: 'Tienda', item: CANONICAL },
    ],
  }

  return (
    <>
      {/* serializarJsonLd escapa < > & para que ningún texto de BD pueda cerrar el <script>. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLd) }}
      />
      <Suspense fallback={null}>
        <TiendaCliente />
      </Suspense>
      {/* sr-only (no display:none): invisible para el usuario, rastreable por Google y
          navegable con lector de pantalla. prefetch={false} para no disparar egress
          por enlaces que nadie ve. */}
      {productos.length > 0 && (
        <nav className="sr-only" aria-label="Índice de productos de la tienda">
          <h2>Productos destacados de la tienda</h2>
          <ul>
            {productos.map((p) => (
              <li key={p.slug}>
                <Link href={`/producto/${p.slug}`} prefetch={false}>
                  {p.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </>
  )
}
