import type { Metadata } from 'next'
import VideosCliente from './VideosCliente'

export const metadata: Metadata = {
  title: 'Videos IA — Admin',
  robots: { index: false, follow: false },
}

export default function PaginaVideosRoute() {
  return <VideosCliente />
}
