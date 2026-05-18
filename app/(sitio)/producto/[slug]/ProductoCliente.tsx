'use client'

// Body client-side (ssr:false) — idéntico al SPA. PaginaProducto lee el slug
// vía @/compat/router.useParams() (param `slug` de la ruta /producto/[slug]).
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaProducto = dynamic(
  () => import('@/paginas/ecommerce/PaginaProducto/PaginaProducto'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function ProductoCliente() {
  return <PaginaProducto />
}
