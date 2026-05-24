'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import ChatEnVivo from '@/componentes/chat/ChatEnVivo'
import BotonWhatsapp from '@/componentes/BotonWhatsapp/BotonWhatsapp'
import NotificacionCarritoWrapper from '@/componentes/ui/NotificacionCarritoWrapper'
import ErrorBoundary from '@/componentes/sistema/ErrorBoundary'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'
import Encabezado from '@/componentes/layout/Encabezado/Encabezado'
import PieDePagina from '@/componentes/layout/PieDePagina/PieDePagina'

const RUTAS_SIN_LAYOUT   = ['/landing/', '/admin']
const RUTAS_SIN_FLOTANTES = ['/landing/', '/admin']
const RUTAS_SIN_WRAP      = ['/landing/', '/admin', '/acordeones-personalizados']

export default function ArmazonGlobal({ children }: { children: React.ReactNode }) {
  const ruta = usePathname() || '/'
  const sinLayout    = RUTAS_SIN_LAYOUT.some((r) => ruta.startsWith(r))
  const sinFlotantes = RUTAS_SIN_FLOTANTES.some((r) => ruta.startsWith(r))
  const sinWrap      = RUTAS_SIN_WRAP.some((r) => ruta.startsWith(r))

  return (
    <div className="app">
      {!sinLayout && <Encabezado />}
      {!sinFlotantes && <ChatEnVivo />}
      {!sinFlotantes && <BotonWhatsapp />}
      <ErrorBoundary>
        <Suspense fallback={<CargandoPagina />}>
          {sinWrap ? children : <main className="contenido-principal">{children}</main>}
        </Suspense>
      </ErrorBoundary>
      {!sinLayout && <PieDePagina />}
      <NotificacionCarritoWrapper />
    </div>
  )
}
