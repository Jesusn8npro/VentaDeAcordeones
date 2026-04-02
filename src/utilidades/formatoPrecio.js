/**
 * Utilidades para formatear precios en pesos colombianos (COP)
 * 
 * El peso colombiano NO usa decimales en transacciones cotidianas
 * Formato: $1.000.000 (puntos como separadores de miles)
 */

/**
 * Formatea un precio en pesos colombianos
 * @param {number} precio - El precio a formatear
 * @returns {string} - Precio formateado (ej: "$50.000")
 */
export const formatearPrecioCOP = (precio) => {
  if (!precio && precio !== 0) return '$0'
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio)
}

/**
 * Formatea un precio sin el símbolo de moneda
 * @param {number} precio - El precio a formatear
 * @returns {string} - Precio formateado sin símbolo (ej: "50.000")
 */
export const formatearNumeroMiles = (precio) => {
  if (!precio && precio !== 0) return '0'
  
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio)
}

/**
 * Convierte un string de precio a número
 * @param {string} precioString - String del precio
 * @returns {number} - Número del precio
 */
export const parsearPrecio = (precioString) => {
  if (!precioString) return 0
  
  // Remover todo excepto números
  const numeroLimpio = precioString.toString().replace(/[^0-9]/g, '')
  return parseInt(numeroLimpio) || 0
}

/**
 * Valida que un precio sea válido para Colombia
 * @param {number} precio - El precio a validar
 * @returns {boolean} - Si el precio es válido
 */
export const validarPrecio = (precio) => {
  const num = Number(precio)
  return !isNaN(num) && num >= 0 && num <= 999999999 // Máximo mil millones
}

/**
 * Formatea precio con descuento
 * @param {number} precioOriginal - Precio original
 * @param {number} descuento - Porcentaje de descuento
 * @returns {object} - Objeto con precio original, descuento y precio final
 */
export const formatearPrecioConDescuento = (precioOriginal, descuento) => {
  const precioFinal = precioOriginal * (1 - descuento / 100)
  
  return {
    original: formatearPrecioCOP(precioOriginal),
    final: formatearPrecioCOP(precioFinal),
    descuento: `${descuento}%`,
    ahorro: formatearPrecioCOP(precioOriginal - precioFinal)
  }
}

/**
 * Ejemplos de precios comunes en Colombia
 */
export const PRECIOS_EJEMPLO = {
  PRODUCTO_BASICO: 25000,      // $25.000
  PRODUCTO_MEDIO: 150000,      // $150.000
  PRODUCTO_PREMIUM: 500000,    // $500.000
  PRODUCTO_LUJO: 2000000       // $2.000.000
}

// Configuración por defecto para Colombia
export const CONFIG_MONEDA_COLOMBIA = {
  locale: 'es-CO',
  currency: 'COP',
  symbol: '$',
  decimals: 0,
  thousandsSeparator: '.',
  decimalSeparator: ','
}

















