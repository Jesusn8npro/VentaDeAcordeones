// 404 global de Next (Server Component). El <head> lo da `metadata`;
// el body es client-side (ssr:false) vía NotFoundCliente.
import type { Metadata } from 'next'
import NotFoundCliente from './not-found-cliente'

export const metadata: Metadata = {
  title: 'Página no encontrada — VentaDeAcordeones.com',
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return <NotFoundCliente />
}
