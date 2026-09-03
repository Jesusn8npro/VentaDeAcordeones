import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Suspense } from 'react'
import { Inter, Poppins, Bebas_Neue, Cormorant_Garamond, JetBrains_Mono, Barlow_Condensed } from 'next/font/google'
import Providers from './providers'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'
import '@/estilos/index.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
})

const bebasNeue = Bebas_Neue({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-bebas',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['italic', 'normal'],
  display: 'swap',
  variable: '--font-cormorant',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-barlow',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-jetbrains',
})

// JSON-LD site-wide (Organization + WebSite) — recomendado en el layout.
const jsonLdSitio = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://ventadeacordeones.com/#organization',
      name: 'VentaDeAcordeones.com',
      url: 'https://ventadeacordeones.com/',
      logo: 'https://ventadeacordeones.com/logo.svg',
    },
    {
      '@type': 'WebSite',
      '@id': 'https://ventadeacordeones.com/#website',
      url: 'https://ventadeacordeones.com/',
      name: 'VentaDeAcordeones.com',
      publisher: { '@id': 'https://ventadeacordeones.com/#organization' },
      inLanguage: 'es-CO',
    },
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL('https://ventadeacordeones.com'),
  title: {
    default: 'Acordeones Hohner en Colombia: Venta, Personalizados y Taller | VentaDeAcordeones.com',
    template: '%s | VentaDeAcordeones.com',
  },
  description:
    'Acordeones Hohner Rey Vallenato y Corona III, personalizados con tu nombre, accesorios, audio y taller de acordeones en Bogotá. Distribuidor autorizado. Envíos a toda Colombia y 42 países.',
  keywords:
    'acordeones, acordeon hohner, acordeon rey vallenato, hohner corona iii, acordeones personalizados, taller de acordeones bogota, parrillas de acordeon, fuelles de acordeon, comprar acordeon colombia',
  authors: [{ name: 'VentaDeAcordeones.com' }],
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
  manifest: '/manifest.json',
  icons: {
    icon: { url: '/logo.svg', type: 'image/svg+xml' },
    apple: '/logo.svg',
  },
  openGraph: {
    type: 'website',
    url: 'https://ventadeacordeones.com/',
    title: 'Acordeones Hohner en Colombia: Venta, Personalizados y Taller',
    description:
      'Acordeones Hohner, personalizados con tu nombre, accesorios, audio y taller en Bogotá. Distribuidor autorizado. Envíos a toda Colombia y el mundo.',
    // 1200×630 real (antes era el logo SVG: WhatsApp/Facebook no lo mostraban).
    images: [{ url: 'https://ventadeacordeones.com/images/og/portada.jpg', width: 1200, height: 630, alt: 'Acordeones Hohner en VentaDeAcordeones.com' }],
    locale: 'es_CO',
    siteName: 'VentaDeAcordeones.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Acordeones Hohner en Colombia | VentaDeAcordeones.com',
    description: 'Acordeones Hohner, personalizados, accesorios, audio y taller de acordeones en Bogotá.',
    images: ['https://ventadeacordeones.com/images/og/portada.jpg'],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1a1a2e',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${poppins.variable} ${bebasNeue.variable} ${cormorant.variable} ${jetbrainsMono.variable} ${barlowCondensed.variable}`}>
      <head>
        {/* Performance: preconnect a recursos externos críticos */}
        <link
          rel="preconnect"
          href="https://dxcpzivxzxvhabdimemb.supabase.co"
          crossOrigin=""
        />
        <link rel="dns-prefetch" href="https://checkout.epayco.co" />
        <link
          rel="preload"
          href="/logo.svg"
          as="image"
          type="image/svg+xml"
        />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSitio) }}
        />
        <Suspense fallback={<CargandoPagina />}>
          <Providers>{children}</Providers>
        </Suspense>

        {/* Protección básica: deshabilitar arrastre de imágenes */}
        <Script id="anti-dragstart" strategy="afterInteractive">
          {`(function(){try{document.addEventListener('dragstart',function(e){e.preventDefault();},{passive:false});}catch(_){}})();`}
        </Script>

        {/* Advertencia estilo Facebook (solo producción) */}
        <Script id="anti-fraude-consola" strategy="afterInteractive">
          {`(function(){try{var host=window.location.hostname;var esLocal=host==='localhost'||host==='127.0.0.1'||host==='::1';if(esLocal)return;console.clear();var t='color:#d93025;font-size:48px;font-weight:700;font-family:system-ui;';var b='color:#222;font-size:16px;font-family:system-ui;';console.log('%c¡Detente!',t);console.log('%cEsta función es para desarrolladores. Si alguien te pidió copiar algo aquí, es un intento de fraude.',b);}catch(e){}})();`}
        </Script>

        {/* ePayco: checkout externo (se carga tras hidratar, no bloquea render) */}
        <Script
          src="https://checkout.epayco.co/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  )
}
