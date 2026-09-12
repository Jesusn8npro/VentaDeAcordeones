/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  // Sin `X-Powered-By: Next.js`: no anunciar el framework (misma política que AcademiaNext).
  poweredByHeader: false,
  // Quita la "N" flotante de las dev tools de Next (solo existe en `next dev`, pero se cuela en capturas).
  devIndicators: false,
  compiler: {
    // Producción: elimina console.log/debug/info/warn del bundle (mantiene console.error).
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
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
    // 31 días: las imágenes optimizadas (/_next/image) se sirven desde la caché del servidor y no se vuelven
    // a pedir a Supabase Storage en cada visita → menos egress (datos) facturado.
    minimumCacheTTL: 2678400,
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
      "connect-src 'self' blob: https://*.supabase.co wss://*.supabase.co https://*.epayco.co https://api.epayco.co; " +
      // instagram.com en frame-src: los reels de @ventadeacordeones1 se abren en un iframe /embed al hacer clic.
      // 'self' en frame-src: la pestaña "Vista previa" del admin muestra la ficha /producto/<slug> en un iframe.
      "frame-src 'self' https://*.epayco.co https://checkout.epayco.co https://www.instagram.com; " +
      "manifest-src 'self'; object-src 'none'; base-uri 'self'; " +
      // frame-ancestors 'self': nadie de FUERA puede embeber el sitio, pero la pestaña
      // "Vista previa" del admin sí puede mostrar /producto/<slug> en un iframe propio
      // (con 'none' el navegador la bloqueaba aunque frame-src lo permitiera).
      "frame-ancestors 'self'; form-action 'self' https://*.epayco.co https://checkout.epayco.co; " +
      // Cualquier http:// colado (imagen vieja pegada en un artículo) se pide por https: sin aviso de contenido mixto.
      'upgrade-insecure-requests;'
    return [
      {
        // noindex REAL para lo privado/transaccional (espejo del disallow de app/robots.ts). Un Disallow
        // no saca la URL del índice si alguien la enlaza; la cabecera sí, y cubre las páginas 'use client'.
        source: '/:ruta(admin|api|perfil|carrito|checkout|favoritos|login|registro|restablecer-contrasena|sesion-cerrada|confirmacion-epayco|respuesta-epayco|landingdelujo|inicio-3d|mantenimiento)/:resto*',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        source: '/:ruta(admin|api|perfil|carrito|checkout|favoritos|login|registro|restablecer-contrasena|sesion-cerrada|confirmacion-epayco|respuesta-epayco|landingdelujo|inicio-3d|mantenimiento)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
      {
        // Cache inmutable (1 año) para los estáticos pesados de /public: recortes de producto, hero, reels,
        // GLB del showroom, Draco. Se versionan por nombre (…-v2, …-r3), así que el navegador no revalida
        // → menos peticiones y menos transferencia en cada visita.
        source: '/:dir(images|migradas|showroom|draco|acordeonesPersonalizados)/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self "https://checkout.epayco.co")' },
          // Aísla el origen frente a ventanas abiertas desde otros sitios sin romper el popup de ePayco (lo abrimos nosotros).
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
          { key: 'Content-Security-Policy', value: csp },
        ],
      },
    ]
  },
}

export default nextConfig
