'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaCarrito = dynamic(
  () => import('@/paginas/ecommerce/PaginaCarrito/PaginaCarrito'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function CarritoCliente() {
  return <PaginaCarrito />
}
