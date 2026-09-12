import type { Metadata } from 'next'
import RestablecerContrasenaCliente from './RestablecerContrasenaCliente'

export const metadata: Metadata = {
  title: 'Restablecer contraseña',
  robots: { index: false, follow: false },
}

export default function PaginaRestablecerContrasenaRoute() {
  return <RestablecerContrasenaCliente />
}
