import type { Metadata } from 'next'
import ImagenesIACliente from './ImagenesIACliente'

export const metadata: Metadata = {
  title: 'Imágenes IA — Admin · VentaDeAcordeones.com',
  robots: { index: false, follow: false },
}

export default function PaginaImagenesIARoute() {
  return <ImagenesIACliente />
}
