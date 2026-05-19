'use client'
import { Suspense } from 'react'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'
import PaginaRespuestaEpayco from '@/paginas/ecommerce/PaginaRespuestaEpayco/PaginaRespuestaEpayco'

export default function RespuestaEpaycoCliente() {
  return (
    <Suspense fallback={<CargandoPagina />}>
      <PaginaRespuestaEpayco />
    </Suspense>
  )
}
