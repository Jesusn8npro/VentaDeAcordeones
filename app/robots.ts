import type { MetadataRoute } from 'next'

// Reemplaza public/robots.txt (mismas reglas).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // ⚠️ Espejo de la cabecera X-Robots-Tag en next.config.mjs: si se toca una, tocar la otra.
      disallow: ['/admin/', '/api/', '/perfil', '/carrito', '/checkout', '/favoritos', '/login', '/registro', '/restablecer-contrasena', '/sesion-cerrada', '/confirmacion-epayco', '/respuesta-epayco', '/landingdelujo', '/inicio-3d', '/mantenimiento'],
    },
    sitemap: 'https://ventadeacordeones.com/sitemap.xml',
  }
}
