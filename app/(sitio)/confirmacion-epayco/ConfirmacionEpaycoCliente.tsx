'use client'
import { Suspense } from 'react'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'
import ConfirmacionEpayco from '@/paginas/ecommerce/ConfirmacionEpayco'

export default function ConfirmacionEpaycoCliente() {
  return (
    <Suspense fallback={<CargandoPagina />}>
      <ConfirmacionEpayco />
    </Suspense>
  )
}
