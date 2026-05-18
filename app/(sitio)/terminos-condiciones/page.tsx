// Página legal estática (Términos y Condiciones). Indexable, sin fetch ni JSON-LD.
import type { Metadata } from 'next'
import TerminosCondicionesCliente from './TerminosCondicionesCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/terminos-condiciones`

export const metadata: Metadata = {
  title: 'Términos y Condiciones — VentaDeAcordeones.com',
  description:
    'Términos y condiciones de uso de VentaDeAcordeones.com: condiciones de compra, pagos, envíos y responsabilidades.',
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Términos y Condiciones — VentaDeAcordeones.com',
    description:
      'Términos y condiciones de uso de VentaDeAcordeones.com: condiciones de compra, pagos, envíos y responsabilidades.',
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

export default function PaginaTerminosCondicionesRoute() {
  return <TerminosCondicionesCliente />
}
