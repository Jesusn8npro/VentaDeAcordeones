import type { Metadata } from 'next'
import TrabajaConNosotrosCliente from './TrabajaConNosotrosCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/trabaja-con-nosotros`

export const metadata: Metadata = {
  title: 'Trabaja con nosotros — VentaDeAcordeones.com',
  description:
    'Únete al equipo de VentaDeAcordeones.com. Descubre nuestras vacantes y oportunidades para crecer con la tienda de acordeones líder en Colombia.',
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Trabaja con nosotros — VentaDeAcordeones.com',
    description:
      'Únete al equipo de VentaDeAcordeones.com. Descubre nuestras vacantes y oportunidades para crecer con la tienda de acordeones líder en Colombia.',
    images: [`${SITIO}/logo.svg`],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trabaja con nosotros — VentaDeAcordeones.com',
    description:
      'Únete al equipo de VentaDeAcordeones.com. Descubre nuestras vacantes y oportunidades para crecer con la tienda de acordeones líder en Colombia.',
    images: [`${SITIO}/logo.svg`],
  },
}

export default function PaginaTrabajaConNosotrosRoute() {
  return <TrabajaConNosotrosCliente />
}
