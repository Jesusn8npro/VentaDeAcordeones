import { Suspense } from 'react'
import type { Metadata } from 'next'
import RespuestaEpaycoCliente from './RespuestaEpaycoCliente'

export const metadata: Metadata = {
  title: 'Respuesta de pago',
  robots: { index: false, follow: false },
}

export default function PaginaRespuestaEpaycoRoute() {
  return <Suspense fallback={null}>
        <RespuestaEpaycoCliente />
      </Suspense>
}
