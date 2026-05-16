// Headers de seguridad, manejo de errores y validación de archivos

export const getSecurityHeaders = (esProduccion = false) => {
  const csp = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.epayco.co https://checkout.epayco.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.epayco.co https://api.epayco.co; frame-src https://*.epayco.co; object-src 'none'; base-uri 'self'; form-action 'self';";

  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': csp,
    'X-Content-Security-Policy': csp,
    'X-WebKit-CSP': csp,
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  if (esProduccion) {
    headers['Expect-CT'] = 'max-age=86400, enforce';
    headers['X-Robots-Tag'] = 'noindex, nofollow';
    headers['Server'] = 'SecureServer';
  }

  return headers;
};

export const configuracionCORS = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://tudominio.com']
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
  maxAge: 86400
};

export const manejarError = (error, mostrarEnConsola = false, contexto = '') => {
  const errorId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  if (import.meta.env.DEV && mostrarEnConsola) {
  }

  let mensajeUsuario = 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  let codigoError = 'ERROR_GENERAL';

  if (error.message) {
    if (/auth/i.test(error.message)) { mensajeUsuario = 'Error de autenticación. Por favor, inicia sesión nuevamente.'; codigoError = 'ERROR_AUTH'; }
    else if (/network/i.test(error.message)) { mensajeUsuario = 'Error de conexión. Por favor, verifica tu conexión a internet.'; codigoError = 'ERROR_RED'; }
    else if (/database/i.test(error.message)) { mensajeUsuario = 'Error al procesar la información. Por favor, intenta nuevamente.'; codigoError = 'ERROR_BD'; }
    else if (/validation/i.test(error.message)) { mensajeUsuario = 'Los datos proporcionados no son válidos. Por favor, verifica e intenta nuevamente.'; codigoError = 'ERROR_VALIDACION'; }
    else if (/permission/i.test(error.message)) { mensajeUsuario = 'No tienes permisos para realizar esta acción.'; codigoError = 'ERROR_PERMISOS'; }
    else if (/payment/i.test(error.message)) { mensajeUsuario = 'Error al procesar el pago. Por favor, intenta nuevamente o contacta soporte.'; codigoError = 'ERROR_PAGO'; }
  }

  return {
    error: true,
    mensaje: mensajeUsuario,
    codigo: codigoError,
    errorId,
    timestamp,
    ...(import.meta.env.DEV && { detalles: { mensajeOriginal: error.message, stack: error.stack, contexto } })
  };
};

export const sanitizarError = (error) => {
  if (typeof error === 'string') return { mensaje: error, error: true };
  if (error instanceof Error) return manejarError(error);
  if (typeof error === 'object' && error !== null) {
    const { password, token, apiKey, secret, ...errorLimpio } = error;
    return { error: true, mensaje: error.mensaje || error.message || 'Error desconocido', ...errorLimpio };
  }
  return { error: true, mensaje: 'Error desconocido' };
};

export const validarArchivo = (archivo, opciones = {}) => {
  const configuracion = {
    maxSize: 5 * 1024 * 1024,
    tiposPermitidos: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    permitirPDF: false,
    permitirSVG: false,
    escanearContenido: true,
    ...opciones
  };

  if (!archivo) return { valido: false, error: 'No se proporcionó archivo' };

  const nombreArchivo = archivo.name || '';
  if (nombreArchivo.length > 255) return { valido: false, error: 'Nombre de archivo demasiado largo' };
  if (/[<>:"|?*\x00-\x1f]/.test(nombreArchivo)) return { valido: false, error: 'Nombre de archivo contiene caracteres inválidos' };
  if (nombreArchivo.split('.').length > 2) return { valido: false, error: 'Nombre de archivo contiene múltiples extensiones' };
  if (archivo.size > configuracion.maxSize) return { valido: false, error: `El archivo excede el tamaño máximo permitido (${configuracion.maxSize / (1024 * 1024)}MB)` };
  if (archivo.size === 0) return { valido: false, error: 'El archivo está vacío' };

  const tiposPermitidos = [...configuracion.tiposPermitidos];
  if (configuracion.permitirPDF) tiposPermitidos.push('application/pdf');
  if (configuracion.permitirSVG) tiposPermitidos.push('image/svg+xml');
  if (!tiposPermitidos.includes(archivo.type)) return { valido: false, error: 'Tipo de archivo no permitido' };

  if (archivo.type === 'image/svg+xml' && configuracion.escanearContenido) return validarSVG(archivo);
  if (configuracion.escanearContenido && archivo.type.startsWith('image/')) return validarFirmaMagica(archivo, configuracion.tiposPermitidos);

  return { valido: true };
};

const validarFirmaMagica = (archivo, tiposPermitidos) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const firma = new Uint8Array(e.target.result).slice(0, 4);
      const firmas = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47],
        'image/gif': [0x47, 0x49, 0x46, 0x38],
        'image/webp': [0x52, 0x49, 0x46, 0x46]
      };
      for (const [tipo, firmaEsperada] of Object.entries(firmas)) {
        if (tiposPermitidos.includes(tipo) && firmaEsperada.every((byte, i) => firma[i] === byte)) {
          resolve({ valido: true });
          return;
        }
      }
      resolve({ valido: false, error: 'La firma del archivo no coincide con su extensión' });
    };
    reader.onerror = () => resolve({ valido: false, error: 'Error al leer el archivo' });
    reader.readAsArrayBuffer(archivo.slice(0, 4));
  });
};

const validarSVG = (archivo) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const contenido = e.target.result;
      const patronesPeligrosos = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
        /vbscript:/gi,
        /livescript:/gi
      ];
      for (const patron of patronesPeligrosos) {
        if (patron.test(contenido)) {
          resolve({ valido: false, error: 'El archivo SVG contiene contenido potencialmente peligroso' });
          return;
        }
      }
      resolve({ valido: true });
    };
    reader.onerror = () => resolve({ valido: false, error: 'Error al leer el archivo SVG' });
    reader.readAsText(archivo.slice(0, 1024));
  });
};
