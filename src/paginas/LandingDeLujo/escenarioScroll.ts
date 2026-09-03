import { poseEn } from './coreografia'

// Motor del acordeón cinemático — port de guias_diseños → assets/scroll-stage.js.
//
// Mueve la CAPA (.accstage-inner) con transform/opacity/filter de CSS, exactamente como el original
// mueve sus dos PNG. El 3D que va dentro no se entera: sólo recibe el avance para cruzar las pieles.
// Trabajar la pose en CSS y no dentro de la escena es lo que hace que se vea igual de grande y con
// el mismo desbordamiento que el HTML de referencia — a escala 2.55 el acordeón se sale del cuadro
// del lienzo, que es justo el efecto de "zoom profundo detrás del texto".

/** Cuánto se acerca la pose actual a la objetivo en cada frame. El 0.085 es el del original. */
const PERSECUCION = 0.085

/** Elemento que realmente scrollea. Igual que el original: unas veces es el body y otras el html. */
function scroller(): Element {
  const b = document.body
  if (b.scrollHeight > b.clientHeight + 4 && (b.scrollTop > 0 || getComputedStyle(b).overflowY !== 'visible')) return b
  return document.scrollingElement || document.documentElement
}

function avance(): number {
  const s = scroller()
  const top = Math.max(window.scrollY || 0, s.scrollTop || 0)
  const h = s.scrollHeight - s.clientHeight
  return h > 0 ? Math.min(Math.max(top / h, 0), 1) : 0
}

export interface OpcionesEscenario {
  /** Capa a la que se le aplica la pose. Si es null, sólo se reporta el avance (modo móvil). */
  capa: HTMLElement | null
  /** Se llama en cada frame con el avance ya suavizado (0..1). */
  alAvanzar: (p: number) => void
  /** En vertical el recorrido lateral se comprime: si no, el acordeón se sale de pantalla. */
  factorX?: number
  factorEscala?: number
}

/**
 * Arranca el bucle. Devuelve la función de parada.
 *
 * Incluye el mismo RESPALDO del original: si rAF lleva más de 220 ms sin correr (pestaña en segundo
 * plano, capa fuera de pantalla, navegador estrangulando animaciones), un intervalo salta la
 * interpolación y coloca la pose exacta. Sin él, al volver a la pestaña el acordeón aparecía
 * congelado en una pose vieja y se deslizaba durante un segundo hasta alcanzar al scroll.
 */
export function crearEscenario({ capa, alAvanzar, factorX = 1, factorEscala = 1 }: OpcionesEscenario): () => void {
  let actual = avance()
  let raf = 0
  let ultimoTick = performance.now()
  let vivo = true

  const aplicar = () => {
    alAvanzar(actual)
    if (!capa) return
    const q = poseEn(actual)
    capa.style.transform =
      `translate3d(${(q.x * factorX).toFixed(3)}vw, ${q.y.toFixed(3)}vh, 0) ` +
      `scale(${(q.s * factorEscala).toFixed(4)}) rotate(${q.r.toFixed(3)}deg)`
    capa.style.opacity = q.o.toFixed(3)
    capa.style.filter = q.b > 0.02 ? `blur(${q.b.toFixed(2)}px)` : 'none'
  }

  const paso = () => {
    ultimoTick = performance.now()
    const objetivo = avance()
    actual += (objetivo - actual) * PERSECUCION
    aplicar()
  }

  const frame = () => {
    if (!vivo) return
    paso()
    raf = requestAnimationFrame(frame)
  }

  aplicar()
  raf = requestAnimationFrame(frame)

  const respaldo = window.setInterval(() => {
    if (performance.now() - ultimoTick > 220) { actual = avance(); aplicar() }
  }, 120)

  return () => {
    vivo = false
    cancelAnimationFrame(raf)
    clearInterval(respaldo)
  }
}
