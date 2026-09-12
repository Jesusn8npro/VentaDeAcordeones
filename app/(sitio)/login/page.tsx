import type { Metadata } from 'next'
import LoginCliente from './LoginCliente'

// Ruta privada: noindex/nofollow y SIN canonical. Un canonical en una página no
// indexable manda señales contradictorias a Google (le pide consolidar una URL
// que a la vez le prohíbe indexar). El sufijo de marca lo pone el template del layout.
export const metadata: Metadata = {
  title: 'Iniciar sesión',
  description:
    'Inicia sesión en tu cuenta de VentaDeAcordeones.com para ver tus pedidos, direcciones y favoritos.',
  robots: { index: false, follow: false },
}

export default function PaginaLoginRoute() {
  return <LoginCliente />
}
