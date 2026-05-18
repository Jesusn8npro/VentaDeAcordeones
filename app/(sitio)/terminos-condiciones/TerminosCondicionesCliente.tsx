'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const TerminosCondiciones = dynamic(
  () => import('@/paginas/legal/TerminosCondiciones/TerminosCondiciones'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function TerminosCondicionesCliente() {
  return <TerminosCondiciones />
}
