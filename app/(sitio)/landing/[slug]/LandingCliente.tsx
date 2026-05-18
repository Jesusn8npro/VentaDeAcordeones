'use client'

// Body client-side (ssr:false) — idéntico al SPA. LandingProducto lee el slug
// vía @/compat/router.useParams() (param `slug` de la ruta /landing/[slug]).
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const LandingProducto = dynamic(
  () => import('@/paginas/LandingProducto'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function LandingCliente() {
  return <LandingProducto />
}
