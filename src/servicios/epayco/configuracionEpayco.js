/**
 * Configuración de ePayco
 * Maneja las credenciales y configuración del SDK de ePayco
 */

// Configuración de ePayco desde variables de entorno
export const configuracionEpayco = {
  // Credenciales principales
  clavePublica: import.meta.env.VITE_EPAYCO_PUBLIC_KEY,
  clavePrivada: undefined,
  
  // Configuración del entorno
  esProduccion: import.meta.env.VITE_EPAYCO_ENVIRONMENT === 'production',
  idioma: 'ES', // Español por defecto
  
  // URLs de respuesta
  urlConfirmacion: import.meta.env.VITE_EPAYCO_URL_CONFIRMATION,
  urlRespuesta: import.meta.env.VITE_EPAYCO_URL_RESPONSE,
  
  // Configuración de la pasarela
  configuracionPasarela: {
    // Moneda por defecto (Peso Colombiano)
    moneda: 'COP',
    
    // País por defecto
    pais: 'CO',
    
    // Configuración de impuestos (IVA e ICO)
    iva: 19, // 19% IVA por defecto en Colombia
    ico: 0,  // ICO por defecto
    
    // Configuración de la interfaz
    tema: {
      colorPrimario: '#007bff',
      colorSecundario: '#6c757d'
    }
  }
};

/**
 * Valida que todas las credenciales necesarias estén configuradas
 * @returns {Object} Resultado de la validación
 */
export const validarConfiguracion = () => {
  const errores = [];
  
  if (!configuracionEpayco.clavePublica) {
    errores.push('VITE_EPAYCO_PUBLIC_KEY no está configurada');
  }
  
  if (!configuracionEpayco.urlConfirmacion) {
    errores.push('VITE_EPAYCO_URL_CONFIRMATION no está configurada');
  }
  
  if (!configuracionEpayco.urlRespuesta) {
    errores.push('VITE_EPAYCO_URL_RESPONSE no está configurada');
  }
  
  return {
    esValida: errores.length === 0,
    errores,
    configuracion: configuracionEpayco
  };
};

/**
 * Obtiene la configuración para inicializar el SDK de ePayco
 * @returns {Object} Configuración del SDK
 */
export const obtenerConfiguracionSDK = () => {
  return {
    apiKey: configuracionEpayco.clavePublica,
    lang: configuracionEpayco.idioma,
    test: !configuracionEpayco.esProduccion
  };
};

export default configuracionEpayco;