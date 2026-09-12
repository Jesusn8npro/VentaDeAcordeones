import type { Metadata } from 'next'
import UsuariosCliente from './UsuariosCliente'

export const metadata: Metadata = {
  title: 'Usuarios — Admin',
  robots: { index: false, follow: false },
}

export default function PaginaUsuariosRoute() {
  return <UsuariosCliente />
}
