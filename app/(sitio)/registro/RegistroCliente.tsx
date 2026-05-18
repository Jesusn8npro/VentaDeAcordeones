'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaRegistro = dynamic(
  () => import('@/paginas/autenticacion/PaginaRegistro/PaginaRegistro'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function RegistroCliente() {
  return <PaginaRegistro />
}
