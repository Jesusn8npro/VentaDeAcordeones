'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaPerfil = dynamic(
  () => import('@/paginas/autenticacion/PaginaPerfil/PaginaPerfil'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function PerfilCliente() {
  return <PaginaPerfil />
}
