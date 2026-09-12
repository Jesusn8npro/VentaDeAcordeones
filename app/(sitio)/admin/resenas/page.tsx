import type { Metadata } from 'next'
import ResenasCliente from './ResenasCliente'

export const metadata: Metadata = {
  title: 'Reseñas — Admin',
  robots: { index: false, follow: false },
}

export default function PaginaResenasRoute() {
  return <ResenasCliente />
}
