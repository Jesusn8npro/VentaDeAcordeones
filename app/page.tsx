import type { Metadata } from 'next'
import InicioCliente from './InicioCliente'
import { supabaseServidor } from '@/configuracion/supabaseServidor'

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

export default async function HomePage() {
  const { destacados, ofertas } = await obtenerListados()
  return <InicioCliente destacados={destacados} ofertas={ofertas} />
}
