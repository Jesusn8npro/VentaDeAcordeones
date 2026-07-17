'use client'

import { Suspense } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contextos/ContextoAutenticacion'
import ChatEnVivo from '@/componentes/chat/ChatEnVivo'
import BotonWhatsapp from '@/componentes/BotonWhatsapp/BotonWhatsapp'
import NotificacionCarritoWrapper from '@/componentes/ui/NotificacionCarritoWrapper'
import ErrorBoundary from '@/componentes/sistema/ErrorBoundary'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'
import Mantenimiento from '@/componentes/sistema/Mantenimiento/Mantenimiento'
import Encabezado from '@/componentes/layout/Encabezado/Encabezado'
import PieDePagina from '@/componentes/layout/PieDePagina/PieDePagina'

const RUTAS_SIN_LAYOUT   = ['/landing/', '/admin', '/inicio-3d', '/mantenimiento']
const RUTAS_SIN_FLOTANTES = ['/landing/', '/admin', '/inicio-3d', '/mantenimiento']
const RUTAS_SIN_WRAP      = ['/landing/', '/admin', '/acordeones-personalizados', '/inicio-3d', '/mantenimiento']

// ── MODO MANTENIMIENTO ───────────────────────────────────────────────────────
// NEXT_PUBLIC_MODO_MANTENIMIENTO = 'true'  → el público ve "Estamos actualizando"
//                                            y SOLO el admin logueado ve el sitio.
// NEXT_PUBLIC_MODO_MANTENIMIENTO = 'false' → sitio 100% abierto para todos.
// (Es NEXT_PUBLIC → se fija en el BUILD; para cambiarlo hay que re-desplegar.)
const MODO_MANTENIMIENTO = process.env.NEXT_PUBLIC_MODO_MANTENIMIENTO === 'true'
// Rutas que el público SÍ puede ver aunque haya mantenimiento (para poder loguearte).
const RUTAS_LIBRES_MANT = ['/login', '/mantenimiento', '/restablecer-contrasena']

export default function ArmazonGlobal({ children }: { children: React.ReactNode }) {
  const ruta = usePathname() || '/'
  const { usuario, sesionInicializada } = useAuth()

  // Gate de mantenimiento: se evalúa antes de pintar cualquier cosa.
  if (MODO_MANTENIMIENTO && !RUTAS_LIBRES_MANT.some((r) => ruta.startsWith(r))) {
    // Sesión aún resolviéndose o perfil (rol) cargando → pantalla neutra
    // (evita mostrar el sitio a quien no debe y evita parpadear mantenimiento al admin)
    if (!sesionInicializada || usuario?._parcial) {
      return <div style={{ minHeight: '100vh', background: '#070a14' }} />
    }
    // No es admin logueado → página de mantenimiento
    if (usuario?.rol !== 'admin') {
      return <Mantenimiento />
    }
    // Es admin → cae al render normal del sitio ↓
  }

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
