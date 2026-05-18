import type { Metadata } from 'next'
import RegistroCliente from './RegistroCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/registro`

export const metadata: Metadata = {
  title: 'Crear cuenta — VentaDeAcordeones.com',
  description:
    'Crea tu cuenta en VentaDeAcordeones.com para comprar acordeones y accesorios, guardar favoritos y seguir tus pedidos.',
  alternates: { canonical },
}

export default function PaginaRegistroRoute() {
  return <RegistroCliente />
}
