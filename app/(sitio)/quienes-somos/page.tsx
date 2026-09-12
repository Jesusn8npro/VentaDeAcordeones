// /quienes-somos — página fija de empresa. page.tsx = SERVER component con metadata estática.
// El body (QuienesSomos) usa hooks, por eso se importa vía wrapper 'use client' (igual que /contacto).
import type { Metadata } from 'next'
import QuienesSomosCliente from './QuienesSomosCliente'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/quienes-somos`

const DESCRIPCION =
  'Somos músicos vendiendo acordeones Hohner desde 2014: asesoría real por WhatsApp, garantía de 6 meses, taller propio en Bogotá y envíos a toda Colombia.'

export const metadata: Metadata = {
  title: 'Quiénes Somos: acordeones Hohner desde 2014',
  description: DESCRIPCION,
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Quiénes Somos: acordeones Hohner desde 2014',
    description: DESCRIPCION,
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

export default function PaginaQuienesSomosRoute() {
  return <QuienesSomosCliente />
}
