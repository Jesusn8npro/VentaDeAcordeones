import type { Metadata } from 'next'
import CrearArticuloCliente from './CrearArticuloCliente'

export const metadata: Metadata = {
  title: 'Crear artículo — Admin',
  robots: { index: false, follow: false },
}

export default function PaginaCrearArticuloRoute() {
  return <CrearArticuloCliente />
}
