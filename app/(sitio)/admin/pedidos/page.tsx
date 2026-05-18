import type { Metadata } from 'next'
import PedidosCliente from './PedidosCliente'

export const metadata: Metadata = {
  title: 'Pedidos — Admin · VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaPedidosRoute() {
  return <PedidosCliente />
}
