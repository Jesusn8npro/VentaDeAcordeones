import type { Metadata } from 'next'
import PerfilCliente from './PerfilCliente'

export const metadata: Metadata = {
  title: 'Mi perfil — VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaPerfilRoute() {
  return <PerfilCliente />
}
