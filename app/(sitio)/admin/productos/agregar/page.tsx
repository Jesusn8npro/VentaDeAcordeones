import type { Metadata } from 'next'
import AgregarProductoCliente from './AgregarProductoCliente'

export const metadata: Metadata = {
  title: 'Agregar producto — Admin',
  robots: { index: false, follow: false },
}

export default function PaginaAgregarProductoRoute() {
  return <AgregarProductoCliente />
}
