'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PreguntasFrecuentes = dynamic(
  () => import('@/paginas/legal/PreguntasFrecuentes/PreguntasFrecuentes'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function PreguntasFrecuentesCliente() {
  return <PreguntasFrecuentes />
}
