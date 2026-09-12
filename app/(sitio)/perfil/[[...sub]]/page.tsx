import type { Metadata } from 'next'
import PerfilCliente from './PerfilCliente'

export const metadata: Metadata = {
  title: 'Mi perfil',
  robots: { index: false, follow: false },
}

export default function PaginaPerfilRoute() {
  return <PerfilCliente />
}
