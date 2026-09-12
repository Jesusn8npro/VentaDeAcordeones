import type { Metadata } from 'next'
import RegistroCliente from './RegistroCliente'

// Ruta privada: noindex/nofollow y SIN canonical (ver comentario en /login).
export const metadata: Metadata = {
  title: 'Crear cuenta',
  description:
    'Crea tu cuenta en VentaDeAcordeones.com para comprar acordeones y accesorios, guardar favoritos y seguir tus pedidos.',
  robots: { index: false, follow: false },
}

export default function PaginaRegistroRoute() {
  return <RegistroCliente />
}
