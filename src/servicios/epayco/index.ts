/**
 * Índice de servicios de ePayco
 * Exporta todos los servicios y utilidades relacionadas con ePayco
 */

// Servicios principales
export { default as servicioEpayco } from './servicioEpayco.js';
export { 
  configuracionEpayco, 
  validarConfiguracion, 
  obtenerConfiguracionSDK 
} from './configuracionEpayco.js';

// Validaciones y utilidades
export {
  validarDatosTarjeta,
  validarDatosCliente,
  validarDatosPago,
  detectarTipoTarjeta,
  formatearNumeroTarjeta,
  enmascararNumeroTarjeta,
  calcularIVA,
  validarValorMinimo,
  generarNumeroFactura,
  validarReferenciaEpayco
} from './validacionesEpayco.js';

// Exportación por defecto del servicio principal
export { default } from './servicioEpayco.js';