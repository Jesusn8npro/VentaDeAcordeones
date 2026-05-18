'use client'

// Body client-side (ssr:false) — idéntico al SPA. PaginaTienda lee el slug
// (cuando aplica) vía @/compat/router.useParams() (param `slug`).
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaTienda = dynamic(
  () => import('@/paginas/ecommerce/PaginaTienda/PaginaTienda'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function TiendaCliente() {
  return <PaginaTienda />
}
