'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const SobreLaTienda = dynamic(
  () => import('@/paginas/empresa/SobreLaTienda/SobreLaTienda'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function SobreLaTiendaCliente() {
  return <SobreLaTienda />
}
