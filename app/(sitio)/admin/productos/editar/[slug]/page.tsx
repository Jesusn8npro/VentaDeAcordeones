import type { Metadata } from 'next'
import EditarProductoCliente from './EditarProductoCliente'

export const metadata: Metadata = {
  title: 'Editar producto — Admin · VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaEditarProductoRoute() {
  return <EditarProductoCliente />
}
