'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PoliticaPrivacidad = dynamic(
  () => import('@/paginas/legal/PoliticaPrivacidad/PoliticaPrivacidad'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function PoliticaPrivacidadCliente() {
  return <PoliticaPrivacidad />
}
