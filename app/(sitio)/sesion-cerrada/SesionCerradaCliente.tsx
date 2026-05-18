'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaSesionCerrada = dynamic(
  () => import('@/paginas/autenticacion/PaginaSesionCerrada/PaginaSesionCerrada'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function SesionCerradaCliente() {
  return <PaginaSesionCerrada />
}
