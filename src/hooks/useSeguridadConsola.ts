/**
 * BLINDAJE DE CONSOLA / DEVTOOLS — misma política que AcademiaNext.
 *
 * Solo actúa en PRODUCCIÓN (en localhost no hace nada):
 *  1. Silencia console.* para el público y muestra el aviso anti "self-XSS" (estilo Facebook).
 *  2. Bloquea menú contextual, F12, Ctrl+Shift+I/J/C, Ctrl+U, Ctrl+S (guardar página).
 *  3. Si detecta DevTools abierto (diferencia outer/inner), limpia y repite el aviso.
 *  4. El ADMIN logueado recupera la consola completa.
 *
 * El gate `window.__permitirDevTools` es de SOLO LECTURA: el valor real vive en una
 * variable de módulo inalcanzable desde la consola (no se puede desactivar tecleando).
 */
import { useEffect } from 'react'
import { useAuth } from '@/contextos/ContextoAutenticacion'

const consoleOriginal = {
  log: console.log, warn: console.warn, error: console.error, info: console.info,
  debug: console.debug, table: console.table, dir: console.dir, dirxml: console.dirxml,
  trace: console.trace, group: console.group, groupCollapsed: console.groupCollapsed,
  groupEnd: console.groupEnd, clear: console.clear,
}
const funcionVacia = () => {}

let mensajeIntervalId: ReturnType<typeof setInterval> | null = null
let devToolsIntervalId: ReturnType<typeof setInterval> | null = null
let permitidoInterno = false

const instalarGate = () => {
  if (typeof window === 'undefined') return
  try {
    const desc = Object.getOwnPropertyDescriptor(window, '__permitirDevTools')
    if (desc && !desc.configurable) return
    Object.defineProperty(window, '__permitirDevTools', {
      get: () => permitidoInterno,
      set: () => {},
      configurable: false,
    })
  } catch {}
}
instalarGate()

const estaPermitido = () => permitidoInterno
const esProduccion = () => process.env.NODE_ENV === 'production'

const mostrarMensajeDetente = () => {
  if (estaPermitido()) return
  try {
    consoleOriginal.clear()
    consoleOriginal.log('%c¡Detente!', 'color:#d93025;font-size:64px;font-weight:800;text-shadow:3px 3px 6px rgba(0,0,0,.5);font-family:system-ui;padding:16px;')
    consoleOriginal.log(
      '%cEsta función del navegador es para desarrolladores. Si alguien te pidió copiar y pegar algo aquí para "activar una función" o "hackear" una cuenta, es un fraude: quien lo haga podrá acceder a tu cuenta y tus pedidos.',
      'color:#222;font-size:18px;font-family:system-ui;line-height:1.6;padding:8px;',
    )
    consoleOriginal.log('%cVentaDeAcordeones.com · https://ventadeacordeones.com/politica-privacidad', 'color:#1a73e8;text-decoration:underline;font-size:14px;')
  } catch {}
}

const inicializarSeguridadConsola = () => {
  if (!esProduccion() || estaPermitido()) return
  ;(Object.keys(consoleOriginal) as Array<keyof typeof consoleOriginal>).forEach((k) => {
    if (k !== 'clear') (console as any)[k] = funcionVacia
  })
  mostrarMensajeDetente()
  if (!mensajeIntervalId) mensajeIntervalId = setInterval(mostrarMensajeDetente, 5000)
}

const restaurarConsola = () => {
  permitidoInterno = true
  Object.assign(console, consoleOriginal)
  if (mensajeIntervalId) { clearInterval(mensajeIntervalId); mensajeIntervalId = null }
  if (devToolsIntervalId) { clearInterval(devToolsIntervalId); devToolsIntervalId = null }
  consoleOriginal.clear()
  consoleOriginal.log('🔓 Consola desbloqueada para administrador')
}

const contextMenuHandler = (e: Event) => {
  if (estaPermitido()) return
  e.preventDefault()
}

const keyDownHandler = (e: KeyboardEvent) => {
  if (estaPermitido()) return
  const k = (e.key || '').toUpperCase()
  const esInspector =
    k === 'F12' ||
    (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(k)) ||
    (e.ctrlKey && ['U', 'S'].includes(k)) ||
    (e.metaKey && e.altKey && ['I', 'J', 'C'].includes(k)) ||
    (e.metaKey && ['U', 'S'].includes(k))
  if (esInspector) { e.preventDefault(); e.stopPropagation() }
}

const bloquearDevTools = () => {
  if (!esProduccion() || estaPermitido()) return
  try {
    if (!(window as any).__seguridadListenersConfigurados) {
      document.addEventListener('contextmenu', contextMenuHandler, { capture: true })
      document.addEventListener('keydown', keyDownHandler, { capture: true })
      ;(window as any).__seguridadListenersConfigurados = true
    }
    if (!devToolsIntervalId) {
      devToolsIntervalId = setInterval(() => {
        if (estaPermitido()) return
        const umbral = 160
        if (window.outerWidth - window.innerWidth > umbral || window.outerHeight - window.innerHeight > umbral) {
          mostrarMensajeDetente()
        }
      }, 1000)
    }
  } catch {}
}

export const useSeguridadConsola = () => {
  const { usuario, sesionInicializada } = useAuth()
  useEffect(() => {
    if (!esProduccion()) return
    inicializarSeguridadConsola()
    bloquearDevTools()
    if (sesionInicializada && usuario?.rol === 'admin' && !usuario?._parcial) restaurarConsola()
  }, [usuario, sesionInicializada])
}
