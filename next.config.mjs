/** @type {import('next').NextConfig} */
const nextConfig = {
  // SSR estándar (NO output:export) — necesitamos generateMetadata + route handlers
  reactStrictMode: false, // El SPA Vite no usaba StrictMode: mantener comportamiento idéntico
  typescript: {
    // Migración progresiva: no bloquear el build por tipos (se endurece al final)
    ignoreBuildErrors: true,
  },
  images: {
    // Fase inicial: sin optimización (host Nixpacks necesita vips). Se reactiva al final.
    unoptimized: true,
  },
  // Next 16 usa Turbopack por defecto; resuelve tsconfig paths (@/*) y .ts/.tsx
  // sin config. Los specifiers '.js'→'.ts' se corrigieron en el código.

  // Headers de seguridad + CSP. En PRODUCCIÓN es byte-idéntica a la que server.js
  // ponía en todas las respuestas. En DESARROLLO se añade 'unsafe-eval' a
  // script-src porque React/Turbopack en `next dev` requiere eval() (en prod
  // React nunca usa eval, así que la CSP de producción NO se relaja).
  async headers() {
    const esDev = process.env.NODE_ENV !== 'production'
    const scriptSrc = esDev
      ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.epayco.co"
      : "script-src 'self' 'unsafe-inline' https://checkout.epayco.co"
    const csp =
      `default-src 'self'; ${scriptSrc}; style-src 'self' 'unsafe-inline'; ` +
      "img-src 'self' data: https:; connect-src 'self' https://*.supabase.co https://api.openai.com https://checkout.epayco.co; frame-src https://checkout.epayco.co;"
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
