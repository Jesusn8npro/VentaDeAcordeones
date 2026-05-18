import type { Metadata } from 'next'
import SesionCerradaCliente from './SesionCerradaCliente'

export const metadata: Metadata = {
  title: 'Sesión cerrada — VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaSesionCerradaRoute() {
  return <SesionCerradaCliente />
}
