'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const QuienesSomos = dynamic(
  () => import('@/paginas/empresa/QuienesSomos/QuienesSomos'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function QuienesSomosCliente() {
  return <QuienesSomos />
}
