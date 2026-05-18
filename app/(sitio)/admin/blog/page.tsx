import type { Metadata } from 'next'
import BlogCliente from './BlogCliente'

export const metadata: Metadata = {
  title: 'Blog — Admin · VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaBlogAdminRoute() {
  return <BlogCliente />
}
