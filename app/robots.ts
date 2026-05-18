import type { MetadataRoute } from 'next'

// Reemplaza public/robots.txt (mismas reglas).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/perfil', '/carrito', '/checkout', '/login', '/registro'],
    },
    sitemap: 'https://ventadeacordeones.com/sitemap.xml',
  }
}
