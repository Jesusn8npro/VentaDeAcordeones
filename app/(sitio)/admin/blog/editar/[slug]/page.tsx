import type { Metadata } from 'next'
import EditarArticuloCliente from './EditarArticuloCliente'

export const metadata: Metadata = {
  title: 'Editar artículo — Admin · VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaEditarArticuloRoute() {
  return <EditarArticuloCliente />
}
