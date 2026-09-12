import { Suspense } from 'react'
import type { Metadata } from 'next'
import ConfirmacionEpaycoCliente from './ConfirmacionEpaycoCliente'

export const metadata: Metadata = {
  title: 'Confirmación de pago',
  robots: { index: false, follow: false },
}

export default function PaginaConfirmacionEpaycoRoute() {
  return <Suspense fallback={null}>
        <ConfirmacionEpaycoCliente />
      </Suspense>
}
