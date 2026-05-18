import { redirect } from 'next/navigation'

// Forzar dinámico: si Next prerenderiza estático, redirect() no emite el 307 HTTP.
export const dynamic = 'force-dynamic'

export default function PaginaCheckoutRoute() {
  redirect('/carrito')
}
