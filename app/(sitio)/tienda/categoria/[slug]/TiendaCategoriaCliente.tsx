'use client'

// Body client-side (ssr:false) — idéntico al SPA. /tienda/categoria/[slug]
// reutiliza PaginaTienda (igual que el App.tsx original); lee el slug vía
// @/compat/router.useParams() (param `slug` = nombre de la carpeta).
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaTienda = dynamic(
  () => import('@/paginas/ecommerce/PaginaTienda/PaginaTienda'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function TiendaCategoriaCliente() {
  return <PaginaTienda />
}
