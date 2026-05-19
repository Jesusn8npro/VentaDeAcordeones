'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import ChatEnVivo from '@/componentes/chat/ChatEnVivo'
import BotonWhatsapp from '@/componentes/BotonWhatsapp/BotonWhatsapp'
import NotificacionCarritoWrapper from '@/componentes/ui/NotificacionCarritoWrapper'
import Encabezado from '@/componentes/layout/Encabezado/Encabezado'
import PieDePagina from '@/componentes/layout/PieDePagina/PieDePagina'
import ErrorBoundary from '@/componentes/sistema/ErrorBoundary'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const RUTAS_SIN_FLOTANTES = ['/landing/', '/producto/', '/admin', '/acordeones-personalizados']
const RUTAS_SIN_ENCABEZADO = ['/landing/', '/admin', '/acordeones-personalizados']

export default function ArmazonGlobal({ children }: { children: React.ReactNode }) {
  const ruta = usePathname() || '/'
  const sinFlotantes = RUTAS_SIN_FLOTANTES.some((r) => ruta.startsWith(r))
  const sinEncabezado = RUTAS_SIN_ENCABEZADO.some((r) => ruta.startsWith(r))

  return (
    <div className="app">
      {!sinFlotantes && <ChatEnVivo />}
      {!sinFlotantes && <BotonWhatsapp />}
      <ErrorBoundary>
        <Suspense fallback={<CargandoPagina />}>
          {sinEncabezado ? (
            children
          ) : (
            <>
              <Encabezado />
              <main className="contenido-principal">{children}</main>
              <PieDePagina />
            </>
          )}
        </Suspense>
      </ErrorBoundary>
      <NotificacionCarritoWrapper />
    </div>
  )
}
