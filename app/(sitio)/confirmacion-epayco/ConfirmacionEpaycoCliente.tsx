'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const ConfirmacionEpayco = dynamic(
  () => import('@/paginas/ecommerce/ConfirmacionEpayco'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function ConfirmacionEpaycoCliente() {
  return (
    <Suspense fallback={<CargandoPagina />}>
      <ConfirmacionEpayco />
    </Suspense>
  )
}
