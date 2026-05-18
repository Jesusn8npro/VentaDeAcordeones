import type { Metadata } from 'next'
import FavoritosCliente from './FavoritosCliente'

export const metadata: Metadata = {
  title: 'Mis Favoritos — VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaFavoritosRoute() {
  return <FavoritosCliente />
}
