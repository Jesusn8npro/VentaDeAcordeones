'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaLogin = dynamic(
  () => import('@/paginas/autenticacion/PaginaLogin/PaginaLogin'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function LoginCliente() {
  return <PaginaLogin />
}
