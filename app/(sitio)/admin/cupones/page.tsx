import type { Metadata } from 'next'
import CuponesCliente from './CuponesCliente'

export const metadata: Metadata = {
  title: 'Cupones — Admin',
  robots: { index: false, follow: false },
}

export default function PaginaCuponesRoute() {
  return <CuponesCliente />
}
