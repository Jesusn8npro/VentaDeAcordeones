/**
 * Validaciones para ePayco
 * Contiene todas las funciones de validación para datos de pago y transacciones
 */

/**
 * Valida los datos de una tarjeta de crédito
 * @param {Object} datosTarjeta - Datos de la tarjeta
 * @returns {Object} Resultado de la validación
 */
export const validarDatosTarjeta = (datosTarjeta) => {
  const errores = [];

  // Validar número de tarjeta
  if (!datosTarjeta.numero) {
    errores.push('El número de tarjeta es requerido');
  } else if (!/^\d{13,19}$/.test(datosTarjeta.numero.replace(/\s/g, ''))) {
    errores.push('El número de tarjeta debe tener entre 13 y 19 dígitos');
  }

  // Validar mes de expiración
  if (!datosTarjeta.mesExpiracion) {
    errores.push('El mes de expiración es requerido');
  } else {
    const mes = parseInt(datosTarjeta.mesExpiracion);
    if (mes < 1 || mes > 12) {
      errores.push('El mes de expiración debe estar entre 01 y 12');
    }
  }

  // Validar año de expiración
  if (!datosTarjeta.anioExpiracion) {
    errores.push('El año de expiración es requerido');
  } else {
    const anio = parseInt(datosTarjeta.anioExpiracion);
    const anioActual = new Date().getFullYear();
    if (anio < anioActual || anio > anioActual + 20) {
      errores.push('El año de expiración no es válido');
    }
  }

  // Validar CVC
  if (!datosTarjeta.cvc) {
    errores.push('El código de seguridad (CVC) es requerido');
  } else if (!/^\d{3,4}$/.test(datosTarjeta.cvc)) {
    errores.push('El código de seguridad debe tener 3 o 4 dígitos');
  }

  return {
    esValida: errores.length === 0,
    errores
  };
};

/**
 * Valida los datos del cliente
 * @param {Object} datosCliente - Datos del cliente
 * @returns {Object} Resultado de la validación
 */
export const validarDatosCliente = (datosCliente) => {
  const errores = [];

  // Validar nombre
  if (!datosCliente.nombre || datosCliente.nombre.trim().length < 2) {
    errores.push('El nombre debe tener al menos 2 caracteres');
  }

  // Validar apellido
  if (!datosCliente.apellido || datosCliente.apellido.trim().length < 2) {
    errores.push('El apellido debe tener al menos 2 caracteres');
  }

  // Validar email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!datosCliente.email || !emailRegex.test(datosCliente.email)) {
    errores.push('El email no es válido');
  }

  // Validar documento
  if (!datosCliente.numeroDocumento || datosCliente.numeroDocumento.trim().length < 5) {
    errores.push('El número de documento debe tener al menos 5 caracteres');
  }

  // Validar teléfono (opcional pero si se proporciona debe ser válido)
  if (datosCliente.telefono && !/^\d{7,15}$/.test(datosCliente.telefono.replace(/[\s\-\(\)]/g, ''))) {
    errores.push('El teléfono no es válido');
  }

  return {
    esValida: errores.length === 0,
    errores
  };
};

/**
 * Valida los datos de un pago
 * @param {Object} datosPago - Datos del pago
 * @returns {Object} Resultado de la validación
 */
export const validarDatosPago = (datosPago) => {
  const errores = [];

  // Validar valor
  if (!datosPago.valor || datosPago.valor <= 0) {
    errores.push('El valor del pago debe ser mayor a 0');
  }

  // Validar descripción
  if (!datosPago.descripcion || datosPago.descripcion.trim().length < 5) {
    errores.push('La descripción debe tener al menos 5 caracteres');
  }

  // Validar factura
  if (!datosPago.factura || datosPago.factura.trim().length < 3) {
    errores.push('El número de factura es requerido');
  }

  // Validar moneda
  const monedasPermitidas = ['COP', 'USD', 'EUR'];
  if (datosPago.moneda && !monedasPermitidas.includes(datosPago.moneda)) {
    errores.push('La moneda no es válida');
  }

  // Validar cuotas
  if (datosPago.cuotas && (datosPago.cuotas < 1 || datosPago.cuotas > 36)) {
    errores.push('Las cuotas deben estar entre 1 y 36');
  }

  return {
    esValida: errores.length === 0,
    errores
  };
};

/**
 * Detecta el tipo de tarjeta basado en el número
 * @param {string} numeroTarjeta - Número de la tarjeta
 * @returns {string} Tipo de tarjeta
 */
export const detectarTipoTarjeta = (numeroTarjeta) => {
  const numero = numeroTarjeta.replace(/\s/g, '');
  
  // Visa
  if (/^4/.test(numero)) {
    return 'visa';
  }
  
  // Mastercard
  if (/^5[1-5]/.test(numero) || /^2[2-7]/.test(numero)) {
    return 'mastercard';
  }
  
  // American Express
  if (/^3[47]/.test(numero)) {
    return 'amex';
  }
  
  // Diners Club
  if (/^3[0689]/.test(numero)) {
    return 'diners';
  }
  
  return 'desconocida';
};

/**
 * Formatea el número de tarjeta para mostrar
 * @param {string} numeroTarjeta - Número de la tarjeta
 * @returns {string} Número formateado
 */
export const formatearNumeroTarjeta = (numeroTarjeta) => {
  const numero = numeroTarjeta.replace(/\s/g, '');
  return numero.replace(/(.{4})/g, '$1 ').trim();
};

/**
 * Enmascara el número de tarjeta para mostrar solo los últimos 4 dígitos
 * @param {string} numeroTarjeta - Número de la tarjeta
 * @returns {string} Número enmascarado
 */
export const enmascararNumeroTarjeta = (numeroTarjeta) => {
  const numero = numeroTarjeta.replace(/\s/g, '');
  if (numero.length < 4) return numero;
  
  const ultimosCuatro = numero.slice(-4);
  const asteriscos = '*'.repeat(numero.length - 4);
  
  return formatearNumeroTarjeta(asteriscos + ultimosCuatro);
};

/**
 * Calcula el IVA basado en el valor base
 * @param {number} valorBase - Valor base sin IVA
 * @param {number} porcentajeIva - Porcentaje de IVA (por defecto 19%)
 * @returns {Object} Cálculo del IVA
 */
export const calcularIVA = (valorBase, porcentajeIva = 19) => {
  const iva = Math.round((valorBase * porcentajeIva) / 100);
  const valorTotal = valorBase + iva;
  
  return {
    valorBase,
    iva,
    valorTotal,
    porcentajeIva
  };
};

/**
 * Valida que el valor mínimo de transacción sea válido
 * @param {number} valor - Valor de la transacción
 * @param {string} moneda - Moneda de la transacción
 * @returns {Object} Resultado de la validación
 */
export const validarValorMinimo = (valor, moneda = 'COP') => {
  const valoresMinimos = {
    'COP': 1000,    // $1,000 COP
    'USD': 1,       // $1 USD
    'EUR': 1        // €1 EUR
  };
  
  const valorMinimo = valoresMinimos[moneda] || valoresMinimos['COP'];
  
  return {
    esValido: valor >= valorMinimo,
    valorMinimo,
    mensaje: valor < valorMinimo ? 
      `El valor mínimo para ${moneda} es ${valorMinimo}` : 
      'Valor válido'
  };
};

/**
 * Genera un número de factura único
 * @param {string} prefijo - Prefijo para la factura
 * @returns {string} Número de factura único
 */
export const generarNumeroFactura = (prefijo = 'FAC') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefijo}-${timestamp}-${random}`;
};

/**
 * Valida el formato de una referencia de ePayco
 * @param {string} referencia - Referencia a validar
 * @returns {boolean} Si la referencia es válida
 */
export const validarReferenciaEpayco = (referencia) => {
  // Las referencias de ePayco suelen tener un formato específico
  return /^[a-zA-Z0-9]{10,50}$/.test(referencia);
};

export default {
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
};