import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Inter, Poppins, Bebas_Neue, Cormorant_Garamond, JetBrains_Mono, Barlow_Condensed } from 'next/font/google'
import Providers from './providers'
import { serializarJsonLd } from '@/utilidades/jsonLd'
import '@/estilos/index.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Pesos recortados (antes 4 por familia): cada peso extra es un woff2 mas que descarga
// el navegador en la primera visita. Los que faltan los sintetiza a partir del mas cercano.
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'],
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
  weight: ['400'],
  style: ['italic', 'normal'],
  display: 'swap',
  variable: '--font-cormorant',
})

const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '800'],
  display: 'swap',
  variable: '--font-barlow',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-jetbrains',
})

// JSON-LD del sitio. `Store` en vez de un Organization pelado: con telefono, direccion,
// horario y redes es lo que Google necesita para las busquedas locales ("acordeones Bogota")
// y para el panel de conocimiento. El @id se reutiliza como `seller` en cada ficha.
const jsonLdSitio = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Store', 'Organization'],
      '@id': 'https://ventadeacordeones.com/#organization',
      name: 'VentaDeAcordeones.com',
      alternateName: 'Venta de Acordeones',
      url: 'https://ventadeacordeones.com/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ventadeacordeones.com/icons/icon-512.png',
        width: 512,
        height: 512,
      },
      image: 'https://ventadeacordeones.com/images/og/portada.jpg',
      description:
        'Venta de acordeones Hohner, acordeones personalizados, accesorios, audio y taller de reparacion de acordeones en Bogota. Envios a toda Colombia y al mundo.',
      telephone: '+573144865310',
      email: 'acordeon91@gmail.com',
      priceRange: '$$-$$$',
      currenciesAccepted: 'COP',
      paymentAccepted: 'Tarjeta de credito, PSE, efectivo, contra entrega',
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bogota',
        addressRegion: 'Cundinamarca',
        addressCountry: 'CO',
      },
      areaServed: [
        { '@type': 'Country', name: 'Colombia' },
        { '@type': 'Place', name: 'Envios internacionales' },
      ],
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          opens: '08:00',
          closes: '18:00',
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Saturday'],
          opens: '09:00',
          closes: '14:00',
        },
      ],
      sameAs: [
        'https://www.instagram.com/ventadeacordeones1/',
        'https://www.facebook.com/ventadeacordeones',
        'https://www.tiktok.com/@ventadeacordeones',
        'https://www.youtube.com/@ventadeacordeones',
      ],
    },
    {
      '@type': 'WebSite',
      '@id': 'https://ventadeacordeones.com/#website',
      url: 'https://ventadeacordeones.com/',
      name: 'VentaDeAcordeones.com',
      publisher: { '@id': 'https://ventadeacordeones.com/#organization' },
      inLanguage: 'es-CO',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://ventadeacordeones.com/tienda?q={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
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
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48' },
      { url: '/icons/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icons/icon-192.png', type: 'image/png', sizes: '192x192' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180' }],
    shortcut: '/favicon.ico',
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
  // Sin zoom por pellizco/doble-tap en móvil (misma política que AcademiaNext): el pinch-zoom
  // rompía el mega menú, los drawers y el slider. Android lo respeta con esto; iOS lo ignora y
  // se corta con antiZoomScript (eventos gesture*).
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1a1a2e',
}

// Anti pinch-zoom para iOS Safari (ignora user-scalable=no pero respeta preventDefault en gesture*).
// Solo frena el zoom del NAVEGADOR: scroll, taps y swipes siguen intactos (no tocamos touchend).
const antiZoomScript = `(function(){try{var s=function(e){e.preventDefault()};document.addEventListener('gesturestart',s,{passive:false});document.addEventListener('gesturechange',s,{passive:false});document.addEventListener('gestureend',s,{passive:false});}catch(e){}})();`

// Tema aplicado ANTES del primer pintado. Sin esto ContextoTema lo pone al hidratar y quien
// tiene el modo oscuro guardado ve un destello blanco en cada carga. El valor por defecto es
// 'light', el mismo que usa ContextoTema.tsx: si no coincidieran, el flash seguiria existiendo.
const temaScript = `(function(){try{var t=localStorage.getItem('tema');if(t!=='light'&&t!=='dark'){t='light'}var e=document.documentElement;e.setAttribute('data-theme',t);e.classList.toggle('dark',t==='dark')}catch(e){}})();`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es-CO" suppressHydrationWarning className={`${inter.variable} ${poppins.variable} ${bebasNeue.variable} ${cormorant.variable} ${jetbrainsMono.variable} ${barlowCondensed.variable}`}>
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
        <script dangerouslySetInnerHTML={{ __html: temaScript }} />
        <script dangerouslySetInnerHTML={{ __html: antiZoomScript }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializarJsonLd(jsonLdSitio) }}
        />
        {/* Sin <Suspense> aqui: al hacer flush del shell, Next ya habia enviado un 200 y las
            paginas que llaman notFound() o redirect() nunca podian responder 404 / 308. */}
        <Providers>{children}</Providers>

        {/* Protección básica: deshabilitar arrastre de imágenes */}
        <Script id="anti-dragstart" strategy="afterInteractive">
          {`(function(){try{document.addEventListener('dragstart',function(e){e.preventDefault();},{passive:false});}catch(_){}})();`}
        </Script>


        {/* El SDK de ePayco ya no se carga en todas las paginas: lo pide el hook usarEpayco
            justo antes de abrir el checkout (src/hooks/usarEpayco.ts). */}
      </body>
    </html>
  )
}
