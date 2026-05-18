'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaRespuestaEpayco = dynamic(
  () => import('@/paginas/ecommerce/PaginaRespuestaEpayco/PaginaRespuestaEpayco'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function RespuestaEpaycoCliente() {
  return (
    <Suspense fallback={<CargandoPagina />}>
      <PaginaRespuestaEpayco />
    </Suspense>
  )
}
