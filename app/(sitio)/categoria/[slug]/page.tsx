// /categoria/[slug] — RUTA LEGACY: redirección 301 permanente.
//
// La misma categoría vivía en dos URLs (/categoria/… y /tienda/categoria/…) con
// contenido idéntico: contenido duplicado y autoridad partida entre ambas. La URL
// oficial es /tienda/categoria/[slug] (es la que enlaza el menú y el breadcrumb),
// así que aquí ya no se genera metadata ni JSON-LD: sólo se redirige.
//
// permanentRedirect() emite 308 (301 permanente equivalente para Google), que
// transfiere el enlazado antiguo; redirect() daría 307 temporal y no consolidaría.
import { permanentRedirect } from 'next/navigation'

export default async function CategoriaLegacyRoute({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  permanentRedirect(`/tienda/categoria/${slug}`)
}
