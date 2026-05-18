// ───────────────────────────────────────────────────────────────────────────
// /acordeones-personalizados — landing fija (sin datos dinámicos). page.tsx =
// SERVER component con metadata estática SEO (title/description/canonical/OG).
// Sin fetch Supabase. JSON-LD omitido: la landing no expone precio/SKU claros
// (conversión por WhatsApp), no hay datos fiables para Product/Offer.
// El body (AcordeonesPersonalizados) es Client Component ssr:false.
// ───────────────────────────────────────────────────────────────────────────
import type { Metadata } from 'next'
import AcordeonesPersonalizadosCliente from './AcordeonesPersonalizadosCliente'

const SITIO = 'https://ventadeacordeones.com'

const TITULO = 'Acordeones Personalizados — VentaDeAcordeones.com'
const DESCRIPCION =
  'Acordeones Rey Vallenato personalizados pieza por pieza: acabados nacarados, grillas doradas y grabados a mano. Cada uno irrepetible. Envíos a toda Colombia.'
const CANONICAL = `${SITIO}/acordeones-personalizados`
const IMAGEN = `${SITIO}/logo.svg`

export const metadata: Metadata = {
  title: TITULO,
  description: DESCRIPCION,
  alternates: { canonical: CANONICAL },
  openGraph: {
    type: 'website',
    url: CANONICAL,
    title: TITULO,
    description: DESCRIPCION,
    images: [IMAGEN],
    siteName: 'VentaDeAcordeones.com',
    locale: 'es_CO',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITULO,
    description: DESCRIPCION,
    images: [IMAGEN],
  },
}

export default function PaginaAcordeonesPersonalizadosRoute() {
  return <AcordeonesPersonalizadosCliente />
}
