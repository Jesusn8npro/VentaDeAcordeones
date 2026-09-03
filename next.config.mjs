/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'dxcpzivxzxvhabdimemb.supabase.co' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'ventadeacordeones.com' },
      { protocol: 'https', hostname: '*.ventadeacordeones.com' },
      // 2026-09: todas las imágenes de producto viven ya en Supabase Storage (re-hospedadas por
      // scripts/procesar-imagenes-productos.mjs e importar-miche.mjs). Sólo queda 1 hotlink a hohner.de.
      // Lista cerrada de nuevo: con '**' cualquiera podía usar /_next/image como proxy/optimizador gratis.
      { protocol: 'https', hostname: 'hohner.de' },
      { protocol: 'https', hostname: 'cdn.shopify.com' },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400,
  },
  // Next 16 usa Turbopack por defecto; resuelve tsconfig paths (@/*) y .ts/.tsx
  // sin config. Los specifiers '.js'→'.ts' se corrigieron en el código.

  // Headers de seguridad + CSP. Alineada con la política PROPIA del app
  // (src/configuracion/seguridad/utilidades.ts getSecurityHeaders): la de
  // server.js estaba incompleta y bloqueaba las Google Fonts que importa
  // src/estilos/index.css. Añadidos: fonts.googleapis/gstatic, wss://*.supabase.co
  // (Supabase Realtime: TarjetaProductoLujo usa .channel().subscribe()),
  // api.openai.com. En DESARROLLO se añade 'unsafe-eval' (React/Turbopack dev
  // lo requiere; en prod React no usa eval → no se relaja la seguridad real).
  async headers() {
    const esDev = process.env.NODE_ENV !== 'production'
    const scriptSrc =
      "script-src 'self' 'unsafe-inline' " +
      (esDev ? "'unsafe-eval' " : '') +
      'https://cdn.epayco.co https://checkout.epayco.co'
    const csp =
      `default-src 'self'; ${scriptSrc}; ` +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "img-src 'self' data: blob: https:; " +
      // blob: en img-src y worker-src: GLTFLoader carga las texturas embebidas del GLB como blob: y el
      // decodificador Draco levanta un Worker desde blob: (landing 3D /landingdelujo).
      "worker-src 'self' blob:; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' blob: https://*.supabase.co wss://*.supabase.co https://*.epayco.co https://api.epayco.co https://api.openai.com; " +
      // instagram.com en frame-src: los reels de @ventadeacordeones1 se abren en un iframe /embed al hacer clic.
      "frame-src https://*.epayco.co https://www.instagram.com; object-src 'none'; base-uri 'self'; form-action 'self';"
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
