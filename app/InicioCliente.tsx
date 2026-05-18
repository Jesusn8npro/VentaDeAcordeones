'use client'

// Body de la home, client-side (ssr:false) — idéntico al SPA.
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaInicio = dynamic(
  () => import('@/paginas/ecommerce/PaginaInicio/PaginaInicio'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function InicioCliente() {
  return <PaginaInicio />
}
