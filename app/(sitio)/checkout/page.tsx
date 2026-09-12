import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

// Forzar dinámico: si Next prerenderiza estático, redirect() no emite el 307 HTTP.
export const dynamic = 'force-dynamic'

// Ruta privada/transaccional: noindex/nofollow y sin canonical (espejo del
// X-Robots-Tag de next.config.mjs y del disallow de app/robots.ts).
export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

export default function PaginaCheckoutRoute() {
  redirect('/carrito')
}
