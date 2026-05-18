import type { Metadata } from 'next'
import LoginCliente from './LoginCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/login`

export const metadata: Metadata = {
  title: 'Iniciar sesión — VentaDeAcordeones.com',
  description:
    'Inicia sesión en tu cuenta de VentaDeAcordeones.com para ver tus pedidos, direcciones y favoritos.',
  alternates: { canonical },
}

export default function PaginaLoginRoute() {
  return <LoginCliente />
}
