// /trabaja-con-nosotros — página fija de empresa. page.tsx = SERVER component con metadata estática.
// El body (TrabajaConNosotros) tiene formulario con useState, por eso el wrapper 'use client'.
import type { Metadata } from 'next'
import TrabajaConNosotrosCliente from './TrabajaConNosotrosCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/trabaja-con-nosotros`

const DESCRIPCION =
  'Vacantes en VentaDeAcordeones.com: ventas, atención al cliente, marketing y taller en Bogotá. Envíanos tu hoja de vida y cuéntanos qué sabes hacer.'

export const metadata: Metadata = {
  title: 'Trabaja con Nosotros: vacantes en Bogotá',
  description: DESCRIPCION,
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Trabaja con Nosotros: vacantes en Bogotá',
    description: DESCRIPCION,
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

export default function PaginaTrabajaConNosotrosRoute() {
  return <TrabajaConNosotrosCliente />
}
