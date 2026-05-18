import type { Metadata } from 'next'
import FeedMetaCliente from './FeedMetaCliente'

export const metadata: Metadata = {
  title: 'Feed Meta — Admin · VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaFeedMetaRoute() {
  return <FeedMetaCliente />
}
