import type { Metadata } from 'next'
import EditarArticuloCliente from './EditarArticuloCliente'

export const metadata: Metadata = {
  title: 'Editar artículo — Admin',
  robots: { index: false, follow: false },
}

export default function PaginaEditarArticuloRoute() {
  return <EditarArticuloCliente />
}
