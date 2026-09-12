import type { Metadata } from 'next'
import CategoriasCliente from './CategoriasCliente'

export const metadata: Metadata = {
  title: 'Categorías — Admin',
  robots: { index: false, follow: false },
}

export default function PaginaCategoriasRoute() {
  return <CategoriasCliente />
}
