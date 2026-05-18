'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaRestablecerClave = dynamic(
  () => import('@/paginas/autenticacion/PaginaResetPassword/PaginaResetPassword'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function RestablecerContrasenaCliente() {
  return <PaginaRestablecerClave />
}
