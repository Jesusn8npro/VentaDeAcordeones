import type { GrupoLanding } from './pielesLanding'

// Coreografía del acordeón cinemático de /landingdelujo.
//
// Es el PORT EXACTO de guias_diseños → assets/scroll-stage.js: siete keyframes repartidos sobre el
// avance de scroll de la página COMPLETA (0 → 1), no sobre una sección anclada. El acordeón vive en
// una capa fija (.accstage) y el contenido pasa por delante; en cada keyframe la capa se desplaza en
// vw/vh, escala, gira, se desenfoca y baja de opacidad.
//
// La única diferencia con el original es qué hay dentro de la capa: allá son dos PNG (azul y rojo)
// que se cruzan con `m`; aquí es el GLB real de Acordeón Pro Max y `m` cruza dos PIELES del editor
// dentro del mismo material. El valor y la curva son los mismos, así que el movimiento se siente
// idéntico al HTML de referencia.

export interface Pose {
  /** Desplazamiento horizontal en vw (unidades de viewport), tal cual el original. */
  x: number
  /** Desplazamiento vertical en vh. */
  y: number
  /** Escala de la capa. */
  s: number
  /** Rotación en GRADOS (transform: rotate). */
  r: number
  /** Desenfoque en píxeles (filter: blur). */
  b: number
  /** Opacidad de la capa. */
  o: number
  /** 0..1 → cruce entre la piel A y la piel B del tramo. */
  m: number
}

const K: Array<Pose & { p: number }> = [
  { p: 0.00, x: 21, y: -1, s: 1.00, r: -2, b: 0, o: 1.00, m: 0 },
  { p: 0.11, x: 20, y: 4, s: 1.14, r: 2, b: 0, o: 0.92, m: 0 },
  { p: 0.26, x: -21, y: -3, s: 1.62, r: -5, b: 1.4, o: 0.34, m: 0.15 },
  { p: 0.44, x: 6, y: 3, s: 2.55, r: 4, b: 3.2, o: 0.20, m: 0.65 },
  { p: 0.62, x: -16, y: -5, s: 1.42, r: -3, b: 0.6, o: 0.46, m: 1 },
  { p: 0.80, x: 18, y: 2, s: 1.16, r: 3, b: 0, o: 0.72, m: 0.45 },
  { p: 1.00, x: 0, y: 1, s: 1.02, r: 0, b: 0, o: 0.88, m: 0 },
]

const CLAVES = ['x', 'y', 's', 'r', 'b', 'o', 'm'] as const

/**
 * Pieles que recorre el scroll, de las que ya existen en Acordeón Pro Max
 * (public/texturas-acordeon → reducidas a public/showroom/pieles).
 * El tramo `i` cruza de PIELES[i] a PIELES[i+1] conforme avanza el scroll, así que el cambio de
 * acabado NUNCA salta: se ve la textura nueva apareciendo encima de la vieja.
 */
export interface PielRecorrido {
  id: string
  nombre: string
  /** Tinte por sección; multiplica sobre la piel. Se interpola junto con el cruce. */
  tintas?: Partial<Record<GrupoLanding, string>>
}

export const PIELES: PielRecorrido[] = [
  { id: '17', nombre: 'Perla blanca' },
  { id: '9', nombre: 'Nácar rojo vino' },
  { id: '10', nombre: 'Nácar negro tornasol' },
  // El tricolor de gala se viste por SECCIONES, que es como se arman de verdad: la caja de melodía
  // de un color, el fuelle de otro y la de bajos del tercero. Los herrajes nunca se tocan.
  { id: '22', nombre: 'Tricolor de gala', tintas: { melodia: '#f2c230', fuelle: '#1c3f9c', bajos: '#c0182b' } },
  { id: '19', nombre: 'Perlas y oro' },
]

/** Suavizado de Hermite — el mismo `t*t*(3-2*t)` del scroll-stage original. */
function suave(t: number): number {
  return t * t * (3 - 2 * t)
}

const _pose: Pose = { ...K[0] }

/** Pose de la capa para un avance 0..1 del scroll de toda la página. Muta y devuelve el mismo objeto. */
export function poseEn(p: number): Pose {
  let i = 0
  while (i < K.length - 2 && p > K[i + 1].p) i++
  const a = K[i]
  const c = K[i + 1]
  const t = suave(Math.min(Math.max((p - a.p) / (c.p - a.p || 1), 0), 1))
  for (const k of CLAVES) _pose[k] = a[k] + (c[k] - a[k]) * t
  return _pose
}

/**
 * Qué par de pieles toca y cuánto llevan cruzado, para un avance de scroll.
 * El recorrido se reparte en tramos IGUALES y dentro de cada uno el cruce va de 0 a 1 con la misma
 * curva suave. Al terminar un tramo, la piel B pasa a ser la A del siguiente: en ese instante lo que
 * se ve ya es exactamente la piel B, así que el relevo es invisible.
 */
export function cruceEn(p: number): { a: number; b: number; mezcla: number } {
  const tramos = PIELES.length - 1
  const escalado = Math.min(Math.max(p, 0), 1) * tramos
  const i = Math.min(Math.floor(escalado), tramos - 1)
  return { a: i, b: i + 1, mezcla: suave(escalado - i) }
}
