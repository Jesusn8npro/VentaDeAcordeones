import type { Metadata } from 'next'
import CreadorPrCliente from './CreadorPrCliente'

export const metadata: Metadata = {
  title: 'Creador PR — Admin · VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaCreadorPrRoute() {
  return <CreadorPrCliente />
}
