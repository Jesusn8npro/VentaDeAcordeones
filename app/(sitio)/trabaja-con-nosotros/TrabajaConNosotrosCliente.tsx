'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const TrabajaConNosotros = dynamic(
  () => import('@/paginas/empresa/TrabajaConNosotros/TrabajaConNosotros'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function TrabajaConNosotrosCliente() {
  return <TrabajaConNosotros />
}
