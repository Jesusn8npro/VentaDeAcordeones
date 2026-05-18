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
      "img-src 'self' data: https:; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.epayco.co https://api.epayco.co https://api.openai.com; " +
      "frame-src https://*.epayco.co; object-src 'none'; base-uri 'self'; form-action 'self';"
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
