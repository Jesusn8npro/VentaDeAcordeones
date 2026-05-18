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
}

export default nextConfig
