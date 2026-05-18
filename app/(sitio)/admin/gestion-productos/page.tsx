import type { Metadata } from 'next'
import GestionProductosCliente from './GestionProductosCliente'

export const metadata: Metadata = {
  title: 'Gestión de productos — Admin · VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaGestionProductosRoute() {
  return <GestionProductosCliente />
}
