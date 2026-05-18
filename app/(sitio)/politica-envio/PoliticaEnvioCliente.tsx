'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PoliticaEnvio = dynamic(
  () => import('@/paginas/legal/PoliticaEnvio/PoliticaEnvio'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function PoliticaEnvioCliente() {
  return <PoliticaEnvio />
}
