import type { Metadata } from 'next'
import CarritoCliente from './CarritoCliente'

export const metadata: Metadata = {
  title: 'Mi Carrito — VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaCarritoRoute() {
  return <CarritoCliente />
}
