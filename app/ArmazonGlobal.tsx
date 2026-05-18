'use client'

// Recrea el armazón global que vivía en src/App.tsx (ConHeader + flotantes),
// con su MISMA lógica de rutas, pero usando usePathname de Next.
// (En App.tsx: la mayoría de rutas iban envueltas en <ConHeader>; landing,
//  acordeones-personalizados y admin NO. Flotantes ocultos en landing/
//  producto/admin/acordeones-personalizados.)
import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import ChatEnVivo from '@/componentes/chat/ChatEnVivo'
import BotonWhatsapp from '@/componentes/BotonWhatsapp/BotonWhatsapp'
import NotificacionCarritoWrapper from '@/componentes/ui/NotificacionCarritoWrapper'
import HeaderPrincipal from '@/componentes/layout/HeaderPrincipal'
import FooterPrincipal from '@/componentes/layout/FooterPrincipal'
import ErrorBoundary from '@/componentes/sistema/ErrorBoundary'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const RUTAS_SIN_FLOTANTES = ['/landing/', '/producto/', '/admin', '/acordeones-personalizados']
const RUTAS_SIN_HEADER = ['/landing/', '/admin', '/acordeones-personalizados']

export default function ArmazonGlobal({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '/'
  const sinFlotantes = RUTAS_SIN_FLOTANTES.some((r) => pathname.startsWith(r))
  const sinHeader = RUTAS_SIN_HEADER.some((r) => pathname.startsWith(r))

  return (
    <div className="app">
      {!sinFlotantes && <ChatEnVivo />}
      {!sinFlotantes && <BotonWhatsapp />}
      <ErrorBoundary>
        <Suspense fallback={<CargandoPagina />}>
          {sinHeader ? (
            children
          ) : (
            <>
              <HeaderPrincipal />
              <main className="contenido-principal">{children}</main>
              <FooterPrincipal />
            </>
          )}
        </Suspense>
      </ErrorBoundary>
      <NotificacionCarritoWrapper />
    </div>
  )
}
