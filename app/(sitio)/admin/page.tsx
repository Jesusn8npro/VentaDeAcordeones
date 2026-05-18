import type { Metadata } from 'next'
import DashboardCliente from './DashboardCliente'

export const metadata: Metadata = {
  title: 'Dashboard — Admin · VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaDashboardRoute() {
  return <DashboardCliente />
}
