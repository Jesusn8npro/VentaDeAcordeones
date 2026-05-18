import type { Metadata } from 'next'
import ProductosCliente from './ProductosCliente'

export const metadata: Metadata = {
  title: 'Productos — Admin · VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaProductosRoute() {
  return <ProductosCliente />
}
