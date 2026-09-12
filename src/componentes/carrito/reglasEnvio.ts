/**
 * Regla de envío del carrito, en un solo sitio.
 *
 * El cálculo real vive en `src/contextos/carritoReducer.ts` (CALCULAR_TOTALES):
 *   `const envio = subtotal >= 50000 ? 0 : 5000`
 * Aquí NO se recalcula nada: se copian los mismos números para poder pintar el
 * progreso (cuánto falta, qué porcentaje llevas). El estado "ya lo conseguí" se
 * decide con el `envio` que devuelve el reducer, no con este umbral, para que la
 * barra jamás pueda contradecir al total que el cliente está viendo.
 *
 * Si algún día cambia el umbral en carritoReducer.ts, hay que cambiarlo aquí.
 */
export const UMBRAL_ENVIO_GRATIS = 50_000
export const COSTO_ENVIO = 5_000

export interface ProgresoEnvio {
  /** Pesos que faltan para llegar al umbral (0 si ya se llegó). */
  falta: number
  /** 0–100, saturado, para el ancho de la barra y el aria-valuenow. */
  porcentaje: number
  /** true solo cuando el reducer ya no está cobrando envío. */
  conseguido: boolean
  /** true a partir del 60 %: es cuando conviene cambiar el mensaje a "casi". */
  cerca: boolean
}

/**
 * @param subtotal subtotal del carrito (mismo que usa el reducer)
 * @param envio    coste de envío YA calculado por el reducer
 */
export function calcularProgresoEnvio(subtotal: number, envio: number): ProgresoEnvio {
  const base = Math.max(0, Number(subtotal) || 0)
  // El reducer manda: si no cobra envío, está conseguido. Con el carrito vacío
  // (subtotal 0) el envío también es 5.000, así que no hay falso positivo.
  const conseguido = (Number(envio) || 0) === 0 && base > 0
  const falta = conseguido ? 0 : Math.max(0, UMBRAL_ENVIO_GRATIS - base)
  const porcentaje = conseguido ? 100 : Math.min(100, (base / UMBRAL_ENVIO_GRATIS) * 100)
  return { falta, porcentaje, conseguido, cerca: porcentaje >= 60 && !conseguido }
}
