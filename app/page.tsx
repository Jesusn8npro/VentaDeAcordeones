import type { Metadata } from 'next'
import InicioCliente from './InicioCliente'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import { obtenerConteosClusters } from '@/datos/conteosClusters'

// Los listados de la portada se consultan en el SERVIDOR y viajan dentro del HTML.
// Antes los pedía el navegador tras hidratar: la portada salía con huecos, el contenido
// daba un salto al llegar los datos y los buscadores no veían ni un producto.
export const revalidate = 900

const SELECT_TARJETA = `
  id, nombre, slug, precio, precio_original, marca, estado,
  categorias(nombre),
  producto_imagenes(imagen_principal)
`

async function obtenerListados() {
  try {
    const [destacados, ofertas] = await Promise.all([
      supabaseServidor
        .from('productos')
        .select(SELECT_TARJETA)
        .eq('activo', true)
        .gt('stock', 0)
        .order('creado_el', { ascending: false })
        .limit(8),
      supabaseServidor
        .from('productos')
        .select(SELECT_TARJETA)
        .eq('activo', true)
        .gt('stock', 0)
        .not('precio_original', 'is', null)
        .order('creado_el', { ascending: false })
        .limit(4),
    ])
    return { destacados: destacados.data || [], ofertas: ofertas.data || [] }
  } catch (e: any) {
    // Si la consulta falla, los componentes la repiten desde el navegador.
    console.error('[home] Supabase:', e?.message)
    return { destacados: [], ofertas: [] }
  }
}

export const metadata: Metadata = {
  title: { absolute: 'Acordeones Hohner en Colombia: Venta, Personalizados y Taller | VentaDeAcordeones.com' },
  description:
    'Compra acordeones Hohner Rey Vallenato y Corona III, diseña el tuyo personalizado, consigue parrillas, fuelles, correas y audio, y repara en nuestro taller en Bogotá. Envíos a toda Colombia y 42 países.',
  alternates: { canonical: 'https://ventadeacordeones.com/' },
  openGraph: {
    type: 'website',
    url: 'https://ventadeacordeones.com/',
    title: 'Acordeones Hohner en Colombia: Venta, Personalizados y Taller',
    description:
      'Acordeones Hohner, personalizados con tu nombre, accesorios, audio y taller de acordeones en Bogotá. Distribuidor autorizado.',
    images: [{ url: 'https://ventadeacordeones.com/images/og/portada.jpg', width: 1200, height: 630, alt: 'Acordeones Hohner en VentaDeAcordeones.com' }],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

// La imagen grande del hero es lo último que pinta la portada, y es lo que mide Google como
// LCP. Lleva `priority` en el componente, pero eso no basta: `PaginaInicio` es un componente de
// CLIENTE, así que Next no llega a emitir su <link rel="preload"> en el HTML del servidor y el
// navegador no sabe de esa imagen hasta que hidrata el JavaScript. Medido en producción: LCP de
// 4,7 s, con la imagen empezando a bajar tardísimo.
//
// Aquí se emite el preload a mano, desde el servidor, con el mismo srcset y los mismos `sizes`
// que usa el <Image> del hero, para que el navegador elija el mismo archivo y no descargue dos.
// OJO: tiene que ser la MISMA que la primera diapositiva de HeroInicio. Si se cambia allí y
// no aquí, se precarga una imagen que nadie usa y el LCP vuelve a irse a las nubes.
const HERO_LCP = '/images/hero/real-blanco-premium-corona.webp'
const ANCHOS_LCP = [640, 750, 828, 1080, 1200, 1920]
const urlOptimizada = (w: number) => `/_next/image?url=${encodeURIComponent(HERO_LCP)}&w=${w}&q=75`

function PreloadHero() {
  return (
    <link
      rel="preload"
      as="image"
      // eslint-disable-next-line react/no-unknown-property
      imageSrcSet={ANCHOS_LCP.map((w) => `${urlOptimizada(w)} ${w}w`).join(', ')}
      imageSizes="(max-width: 1100px) 70vw, 38vw"
      fetchPriority="high"
    />
  )
}

export default async function HomePage() {
  const [{ destacados, ofertas }, conteos] = await Promise.all([obtenerListados(), obtenerConteosClusters()])
  return (
    <>
      <PreloadHero />
      <InicioCliente destacados={destacados} ofertas={ofertas} conteos={conteos} />
    </>
  )
}
