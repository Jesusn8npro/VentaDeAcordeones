// /ayuda — centro de ayuda. page.tsx = SERVER component con metadata estática.
// Aquí no hace falta wrapper: src/paginas/ayuda/Ayuda.tsx ya declara 'use client'.
import type { Metadata } from 'next'
import Ayuda from '@/paginas/ayuda/Ayuda'

const SITIO = 'https://ventadeacordeones.com'
const canonical = `${SITIO}/ayuda`

const DESCRIPCION =
  'Centro de ayuda de VentaDeAcordeones.com: cómo comprar, métodos de pago, tiempos de envío, garantía y soporte por WhatsApp al +57 314 486 5310.'

export const metadata: Metadata = {
  title: 'Centro de Ayuda: compras, envíos y soporte',
  description: DESCRIPCION,
  alternates: { canonical },
  openGraph: {
    type: 'website',
    url: canonical,
    title: 'Centro de Ayuda: compras, envíos y soporte',
    description: DESCRIPCION,
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
}

export default function PaginaAyudaRoute() {
  return <Ayuda />
}
