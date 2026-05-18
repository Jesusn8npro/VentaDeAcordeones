'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaFavoritos = dynamic(
  () => import('@/paginas/ecommerce/PaginaFavoritos/PaginaFavoritos'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function FavoritosCliente() {
  return <PaginaFavoritos />
}
