'use client'

// Body client-side (ssr:false) — idéntico al SPA. PaginaCategoria lee el slug
// vía @/compat/router.useParams() (param `slug` = nombre de la carpeta).
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaCategoria = dynamic(
  () => import('@/paginas/ecommerce/PaginaCategoria/PaginaCategoria'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function CategoriaCliente() {
  return <PaginaCategoria />
}
