import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import '@/estilos/index.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://ventadeacordeones.com'),
  title: 'VentaDeAcordeones.com — Acordeones y Accesorios en Colombia',
  description:
    'La tienda online líder en acordeones de Colombia. Hohner, Gabbanelli, Guerrini y más. Envíos a toda Colombia con SERVIENTREGA. Asesoría gratis por WhatsApp.',
  keywords:
    'acordeones, acordeones vallenato, comprar acordeon, acordeon hohner, acordeon Colombia, acordeones baratos',
  authors: [{ name: 'VentaDeAcordeones.com' }],
  robots: { index: true, follow: true },
  manifest: '/manifest.json',
  icons: {
    icon: { url: '/logo.svg', type: 'image/svg+xml' },
    apple: '/logo.svg',
  },
  openGraph: {
    type: 'website',
    url: 'https://ventadeacordeones.com/',
    title: 'VentaDeAcordeones.com — Acordeones en Colombia',
    description:
      'Tienda online de acordeones. Hohner, Gabbanelli, Guerrini. Envíos a toda Colombia. Garantía real.',
    images: ['https://ventadeacordeones.com/logo.svg'],
    locale: 'es_CO',
    siteName: 'VentaDeAcordeones.com',
  },
  twitter: {
    card: 'summary',
    title: 'VentaDeAcordeones.com',
    description: 'Tienda online de acordeones en Colombia.',
    images: ['https://ventadeacordeones.com/logo.svg'],
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
    <html lang="es">
      <head>
        {/* Performance: preconnect a recursos externos críticos */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
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
        {children}

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
