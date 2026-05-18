import type { Metadata } from 'next'
import InventarioCliente from './InventarioCliente'

export const metadata: Metadata = {
  title: 'Inventario — Admin · VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaInventarioRoute() {
  return <InventarioCliente />
}
