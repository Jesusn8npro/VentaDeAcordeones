import type { MetadataRoute } from 'next'
import { supabaseServidor } from '@/configuracion/supabaseServidor'

const SITIO = 'https://ventadeacordeones.com'

// Sitemap dinámico desde Supabase (productos/categorías/blog) + rutas estáticas.
// Regenera cada hora. Robusto: si una query falla, esa sección se omite y el
// sitemap sigue siendo válido.
export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const estaticas: MetadataRoute.Sitemap = [
    '', '/tienda', '/contacto', '/quienes-somos', '/trabaja-con-nosotros',
    '/sobre-la-tienda', '/terminos-condiciones', '/politica-privacidad',
    '/preguntas-frecuentes', '/politica-envio', '/cambios-devoluciones',
    '/blog', '/ayuda', '/acordeones-personalizados',
  ].map((p) => ({
    url: `${SITIO}${p || '/'}`,
    changeFrequency: 'weekly',
    priority: p === '' ? 1 : 0.7,
  }))

  const [prod, cat, art] = await Promise.all([
    supabaseServidor.from('productos').select('slug, actualizado_el').eq('activo', true),
    supabaseServidor.from('categorias').select('slug').eq('activo', true),
    supabaseServidor.from('articulos_web').select('slug'),
  ])

  const productos: MetadataRoute.Sitemap = (prod.data || [])
    .filter((p: any) => p.slug)
    .map((p: any) => ({
      url: `${SITIO}/producto/${p.slug}`,
      lastModified: p.actualizado_el ? new Date(p.actualizado_el) : undefined,
      changeFrequency: 'weekly',
      priority: 0.9,
    }))

  const categorias: MetadataRoute.Sitemap = (cat.data || [])
    .filter((c: any) => c.slug)
    .map((c: any) => ({
      url: `${SITIO}/categoria/${c.slug}`,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

  const articulos: MetadataRoute.Sitemap = (art.data || [])
    .filter((a: any) => a.slug)
    .map((a: any) => ({
      url: `${SITIO}/blog/${a.slug}`,
      changeFrequency: 'monthly',
      priority: 0.6,
    }))

  return [...estaticas, ...productos, ...categorias, ...articulos]
}
