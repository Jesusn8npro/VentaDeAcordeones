// Página legal estática (Cambios y Devoluciones). Indexable, sin fetch ni JSON-LD.
import type { Metadata } from 'next'
import CambiosDevolucionesCliente from './CambiosDevolucionesCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/cambios-devoluciones`

export const metadata: Metadata = {
  title: 'Cambios y Devoluciones — VentaDeAcordeones.com',
  description:
    'Política de cambios, devoluciones y garantía de acordeones en VentaDeAcordeones.com: requisitos, plazos y procedimiento.',
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Cambios y Devoluciones — VentaDeAcordeones.com',
    description:
      'Política de cambios, devoluciones y garantía de acordeones en VentaDeAcordeones.com: requisitos, plazos y procedimiento.',
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

export default function PaginaCambiosDevolucionesRoute() {
  return <CambiosDevolucionesCliente />
}
