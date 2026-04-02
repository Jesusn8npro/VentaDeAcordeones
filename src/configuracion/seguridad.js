/**
 * Configuración de seguridad para la aplicación
 * Este archivo contiene medidas de seguridad y validaciones
 */

// Validación de entrada contra XSS
export const sanitizarEntrada = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// Validación de email
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 100;
};

// Validación de contraseña
export const validarContrasena = (contrasena) => {
  return contrasena.length >= 8 && 
         /[A-Z]/.test(contrasena) && 
         /[a-z]/.test(contrasena) && 
         /[0-9]/.test(contrasena) &&
         contrasena.length <= 128;
};

// Rate limiting mejorado con diferentes límites según tipo de operación
const intentosPorIP = new Map();

// Configuración de límites según tipo de operación
const LIMITES_POR_TIPO = {
  default: { max: 5, tiempoBloqueo: 15 * 60 * 1000 }, // 15 minutos
  auth: { max: 3, tiempoBloqueo: 30 * 60 * 1000 },    // 3 intentos, 30 minutos bloqueo
  pago: { max: 2, tiempoBloqueo: 60 * 60 * 1000 },    // 2 intentos, 1 hora bloqueo
  api: { max: 100, tiempoBloqueo: 60 * 1000 }         // 100 requests por minuto
};

export const verificarRateLimit = (identificador, tipo = 'default') => {
  const ahora = Date.now();
  const limite = LIMITES_POR_TIPO[tipo] || LIMITES_POR_TIPO.default;
  const key = `${identificador}_${tipo}`;
  
  const intentos = intentosPorIP.get(key) || { count: 0, resetTime: ahora + limite.tiempoBloqueo };
  
  if (ahora > intentos.resetTime) {
    intentos.count = 0;
    intentos.resetTime = ahora + limite.tiempoBloqueo;
  }
  
  if (intentos.count >= limite.max) {
    return { 
      permitido: false, 
      tiempoRestante: intentos.resetTime - ahora,
      mensaje: `Demasiados intentos. Por favor, espera ${Math.ceil((intentos.resetTime - ahora) / 60000)} minutos.`
    };
  }
  
  intentos.count++;
  intentosPorIP.set(key, intentos);
  
  return { permitido: true };
};

// Función para limpiar intentos antiguos (prevenir memory leaks)
export const limpiarIntentosAntiguos = () => {
  const ahora = Date.now();
  for (const [key, intentos] of intentosPorIP.entries()) {
    if (ahora > intentos.resetTime) {
      intentosPorIP.delete(key);
    }
  }
};

// Limpiar cada hora
setInterval(limpiarIntentosAntiguos, 60 * 60 * 1000);

// Sistema de auditoría y logging de seguridad
class AuditoriaSeguridad {
  constructor() {
    this.eventos = [];
    this.maxEventos = 1000; // Limitar memoria
    this.nivelLog = import.meta.env.DEV ? 'debug' : 'info';
  }
  
  // Registrar evento de seguridad
  registrar(evento) {
    const eventoCompleto = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      tipo: evento.tipo || 'GENERAL',
      severidad: evento.severidad || 'INFO',
      usuario: evento.usuario || 'anonimo',
      ip: evento.ip || 'desconocida',
      accion: evento.accion,
      detalles: this.sanitizarDetalles(evento.detalles || {}),
      userAgent: evento.userAgent || navigator.userAgent
    };
    
    // Agregar a array manteniendo límite
    this.eventos.unshift(eventoCompleto);
    if (this.eventos.length > this.maxEventos) {
      this.eventos = this.eventos.slice(0, this.maxEventos);
    }
    
    // Log en consola según nivel
    if (this.debeLoggear(eventoCompleto.severidad)) {
      console.log(`[AUDITORÍA ${eventoCompleto.severidad}]`, eventoCompleto);
    }
    
    return eventoCompleto.id;
  }
  
  // Registrar intento de acceso no autorizado
  registrarIntentoNoAutorizado(datos) {
    return this.registrar({
      tipo: 'SEGURIDAD_ACCESO',
      severidad: 'ALERTA',
      accion: 'INTENTO_ACCESO_NO_AUTORIZADO',
      ...datos
    });
  }
  
  // Registrar cambio de contraseña
  registrarCambioContrasena(datos) {
    return this.registrar({
      tipo: 'SEGURIDAD_AUTENTICACION',
      severidad: 'INFO',
      accion: 'CAMBIO_CONTRASENA',
      ...datos
    });
  }
  
  // Registrar error de validación
  registrarErrorValidacion(datos) {
    return this.registrar({
      tipo: 'SEGURIDAD_VALIDACION',
      severidad: 'ADVERTENCIA',
      accion: 'ERROR_VALIDACION',
      ...datos
    });
  }
  
  // Registrar actividad sospechosa
  registrarActividadSospechosa(datos) {
    return this.registrar({
      tipo: 'SEGURIDAD_SOSPECHOSA',
      severidad: 'CRÍTICO',
      accion: 'ACTIVIDAD_SOSPECHOSA',
      ...datos
    });
  }
  
  // Obtener eventos recientes
  obtenerEventosRecientes(cantidad = 50, filtros = {}) {
    let eventosFiltrados = this.eventos;
    
    if (filtros.tipo) {
      eventosFiltrados = eventosFiltrados.filter(e => e.tipo.includes(filtros.tipo));
    }
    
    if (filtros.severidad) {
      eventosFiltrados = eventosFiltrados.filter(e => e.severidad === filtros.severidad);
    }
    
    if (filtros.usuario) {
      eventosFiltrados = eventosFiltrados.filter(e => e.usuario === filtros.usuario);
    }
    
    return eventosFiltrados.slice(0, cantidad);
  }
  
  // Sanitizar detalles para evitar almacenar información sensible
  sanitizarDetalles(detalles) {
    const detallesLimpios = { ...detalles };
    const propiedadesSensibles = ['password', 'contrasena', 'token', 'apiKey', 'secret', 'clave', 'key'];
    
    for (const prop of propiedadesSensibles) {
      if (detallesLimpios[prop]) {
        detallesLimpios[prop] = '[REDACTED]';
      }
    }
    
    return detallesLimpios;
  }
  
  // Verificar si debe loggear según nivel
  debeLoggear(severidad) {
    const niveles = { DEBUG: 0, INFO: 1, ADVERTENCIA: 2, ALERTA: 3, CRÍTICO: 4 };
    const nivelActual = niveles[this.nivelLog.toUpperCase()] || 1;
    const nivelEvento = niveles[severidad] || 1;
    
    return nivelEvento >= nivelActual;
  }
  
  // Exportar eventos para análisis externo
  exportarEventos(formato = 'json') {
    const eventos = this.eventos;
    
    if (formato === 'json') {
      return JSON.stringify(eventos, null, 2);
    }
    
    if (formato === 'csv') {
      const headers = 'ID,Timestamp,Tipo,Severidad,Usuario,IP,Accion\n';
      const rows = eventos.map(e => 
        `${e.id},${e.timestamp},${e.tipo},${e.severidad},${e.usuario},${e.ip},${e.accion}`
      ).join('\n');
      return headers + rows;
    }
    
    return eventos;
  }
}

// Instancia global de auditoría
export const auditoria = new AuditoriaSeguridad();

// Sistema de monitoreo de intentos de acceso no autorizado
class MonitoreoAccesos {
  constructor() {
    this.intentosSospechosos = new Map();
    this.patronesSospechosos = [];
    this.maxIntentosPorIP = 10;
    this.ventanaTiempo = 60 * 60 * 1000; // 1 hora
    this.maxPatrones = 100;
  }
  
  // Registrar intento de acceso
  registrarIntento(datos) {
    const { ip, usuario, exitoso = false, tipo = 'login', detalles = {} } = datos;
    const ahora = Date.now();
    
    // Limpiar intentos antiguos
    this.limpiarIntentosAntiguos(ip);
    
    // Obtener o crear registro de IP
    if (!this.intentosSospechosos.has(ip)) {
      this.intentosSospechosos.set(ip, {
        intentos: [],
        bloqueada: false,
        tiempoBloqueo: null,
        nivelRiesgo: 'BAJO'
      });
    }
    
    const registroIP = this.intentosSospechosos.get(ip);
    
    // Agregar intento
    const intento = {
      timestamp: ahora,
      exitoso,
      tipo,
      usuario: usuario || 'desconocido',
      detalles: this.sanitizarDetalles(detalles)
    };
    
    registroIP.intentos.push(intento);
    
    // Analizar patrones sospechosos
    this.analizarPatrones(ip, registroIP);
    
    // Verificar si debe bloquearse
    this.verificarBloqueo(ip, registroIP);
    
    // Registrar en auditoría si es sospechoso
    if (!exitoso && this.esSospechoso(registroIP)) {
      auditoria.registrarActividadSospechosa({
        ip,
        usuario,
        detalles: {
          tipo: 'INTENTO_ACCESO_FALLIDO',
          cantidadIntentos: registroIP.intentos.filter(i => !i.exitoso).length,
          nivelRiesgo: registroIP.nivelRiesgo
        }
      });
    }
    
    return {
      ip,
      exitoso,
      riesgo: registroIP.nivelRiesgo,
      bloqueada: registroIP.bloqueada,
      intentosRestantes: Math.max(0, this.maxIntentosPorIP - registroIP.intentos.length)
    };
  }
  
  // Analizar patrones sospechosos
  analizarPatrones(ip, registroIP) {
    const intentosFallidos = registroIP.intentos.filter(i => !i.exitoso);
    const ahora = Date.now();
    
    // Patrón: muchos intentos fallidos rápidamente
    const recientes = intentosFallidos.filter(i => ahora - i.timestamp < 5 * 60 * 1000);
    if (recientes.length >= 5) {
      registroIP.nivelRiesgo = 'ALTO';
      this.agregarPatron('INTENTOS_RAPIDOS', ip, recientes.length);
    }
    
    // Patrón: intentos con usuarios variados
    const usuariosUnicos = new Set(intentosFallidos.map(i => i.usuario));
    if (usuariosUnicos.size >= 3) {
      registroIP.nivelRiesgo = 'MEDIO';
      this.agregarPatron('USUARIOS_MULTIPLES', ip, usuariosUnicos.size);
    }
    
    // Patrón: intentos a intervalos regulares (posible bot)
    if (intentosFallidos.length >= 3) {
      const intervalos = [];
      for (let i = 1; i < intentosFallidos.length; i++) {
        intervalos.push(intentosFallidos[i].timestamp - intentosFallidos[i-1].timestamp);
      }
      
      const intervaloPromedio = intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
      const desviacion = Math.sqrt(intervalos.reduce((a, b) => a + Math.pow(b - intervaloPromedio, 2), 0) / intervalos.length);
      
      if (desviacion < 1000) { // Muy poca variación
        registroIP.nivelRiesgo = 'ALTO';
        this.agregarPatron('INTERVALOS_REGULARES', ip, intervaloPromedio);
      }
    }
  }
  
  // Agregar patrón detectado
  agregarPatron(tipo, ip, valor) {
    this.patronesSospechosos.unshift({
      timestamp: Date.now(),
      tipo,
      ip,
      valor,
      id: crypto.randomUUID()
    });
    
    // Mantener límite de patrones
    if (this.patronesSospechosos.length > this.maxPatrones) {
      this.patronesSospechosos = this.patronesSospechosos.slice(0, this.maxPatrones);
    }
  }
  
  // Verificar si debe bloquearse la IP
  verificarBloqueo(ip, registroIP) {
    const intentosFallidos = registroIP.intentos.filter(i => !i.exitoso);
    
    if (registroIP.nivelRiesgo === 'ALTO' && intentosFallidos.length >= this.maxIntentosPorIP) {
      registroIP.bloqueada = true;
      registroIP.tiempoBloqueo = Date.now() + (30 * 60 * 1000); // 30 minutos
      
      auditoria.registrarActividadSospechosa({
        ip,
        detalles: {
          tipo: 'IP_BLOQUEADA',
          motivo: 'Exceso de intentos fallidos',
          intentos: intentosFallidos.length,
          tiempoBloqueo: '30 minutos'
        }
      });
    }
  }
  
  // Verificar si una IP está bloqueada
  estaBloqueada(ip) {
    const registro = this.intentosSospechosos.get(ip);
    if (!registro || !registro.bloqueada) return false;
    
    const ahora = Date.now();
    if (ahora > registro.tiempoBloqueo) {
      registro.bloqueada = false;
      registro.tiempoBloqueo = null;
      return false;
    }
    
    return true;
  }
  
  // Verificar si es sospechoso
  esSospechoso(registroIP) {
    return registroIP.nivelRiesgo !== 'BAJO' || registroIP.intentos.filter(i => !i.exitoso).length >= 3;
  }
  
  // Limpiar intentos antiguos
  limpiarIntentosAntiguos(ip) {
    const registro = this.intentosSospechosos.get(ip);
    if (!registro) return;
    
    const ahora = Date.now();
    registro.intentos = registro.intentos.filter(i => ahora - i.timestamp < this.ventanaTiempo);
    
    // Resetear nivel de riesgo si no hay intentos recientes
    if (registro.intentos.length === 0) {
      registro.nivelRiesgo = 'BAJO';
    }
  }
  
  // Obtener estadísticas
  obtenerEstadisticas() {
    const totalIPs = this.intentosSospechosos.size;
    const ipsBloqueadas = Array.from(this.intentosSospechosos.values()).filter(r => r.bloqueada).length;
    const totalIntentos = Array.from(this.intentosSospechosos.values()).reduce((total, r) => total + r.intentos.length, 0);
    const intentosFallidos = Array.from(this.intentosSospechosos.values()).reduce((total, r) => 
      total + r.intentos.filter(i => !i.exitoso).length, 0);
    
    return {
      totalIPs,
      ipsBloqueadas,
      totalIntentos,
      intentosFallidos,
      tasaFallos: totalIntentos > 0 ? (intentosFallidos / totalIntentos * 100).toFixed(2) + '%' : '0%',
      patronesDetectados: this.patronesSospechosos.length
    };
  }
  
  // Obtener IPs más sospechosas
  obtenerIPSSospechosas(limite = 10) {
    return Array.from(this.intentosSospechosos.entries())
      .filter(([ip, registro]) => this.esSospechoso(registro))
      .map(([ip, registro]) => ({
        ip,
        nivelRiesgo: registro.nivelRiesgo,
        intentosFallidos: registro.intentos.filter(i => !i.exitoso).length,
        bloqueada: registro.bloqueada,
        ultimoIntento: Math.max(...registro.intentos.map(i => i.timestamp))
      }))
      .sort((a, b) => b.intentosFallidos - a.intentosFallidos)
      .slice(0, limite);
  }
  
  // Sanitizar detalles
  sanitizarDetalles(detalles) {
    const detallesLimpios = { ...detalles };
    const propiedadesSensibles = ['password', 'contrasena', 'token', 'apiKey', 'secret', 'clave'];
    
    for (const prop of propiedadesSensibles) {
      if (detallesLimpios[prop]) {
        detallesLimpios[prop] = '[REDACTED]';
      }
    }
    
    return detallesLimpios;
  }
}

// Instancia global de monitoreo
export const monitoreoAccesos = new MonitoreoAccesos();

// Headers de seguridad mejorados para producción
export const getSecurityHeaders = (esProduccion = false) => {
  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.epayco.co https://checkout.epayco.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.epayco.co https://api.epayco.co; frame-src https://*.epayco.co; object-src 'none'; base-uri 'self'; form-action 'self';",
    'X-Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.epayco.co https://checkout.epayco.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.epayco.co https://api.epayco.co; frame-src https://*.epayco.co; object-src 'none'; base-uri 'self'; form-action 'self';",
    'X-WebKit-CSP': "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.epayco.co https://checkout.epayco.co; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co https://*.epayco.co https://api.epayco.co; frame-src https://*.epayco.co; object-src 'none'; base-uri 'self'; form-action 'self';",
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Permitted-Cross-Domain-Policies': 'none',
    'Cache-Control': 'no-store, no-cache, must-revalidate, private',
    'Pragma': 'no-cache',
    'Expires': '0'
  };

  // Headers adicionales solo para producción
  if (esProduccion) {
    headers['Expect-CT'] = 'max-age=86400, enforce';
    headers['X-Robots-Tag'] = 'noindex, nofollow';
    headers['Server'] = 'SecureServer';
  }

  return headers;
};

// Configuración de CORS segura
export const configuracionCORS = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://tudominio.com'] // Reemplazar con tu dominio real
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id'],
  maxAge: 86400 // 24 horas
};

// Función para manejo seguro de errores mejorado
export const manejarError = (error, mostrarEnConsola = false, contexto = '') => {
  const errorId = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  
  // Log del error para debugging (solo en desarrollo)
  if (import.meta.env.DEV && mostrarEnConsola) {
    console.error(`[ERROR ${errorId}]`, {
      mensaje: error.message || error,
      stack: error.stack,
      contexto: contexto,
      timestamp: timestamp
    });
  }
  
  // Determinar el tipo de error para mensaje apropiado
  let mensajeUsuario = 'Ha ocurrido un error. Por favor, intenta nuevamente.';
  let codigoError = 'ERROR_GENERAL';
  
  if (error.message) {
    // Errores de autenticación
    if (error.message.includes('auth') || error.message.includes('Auth')) {
      mensajeUsuario = 'Error de autenticación. Por favor, inicia sesión nuevamente.';
      codigoError = 'ERROR_AUTH';
    }
    // Errores de red
    else if (error.message.includes('network') || error.message.includes('Network')) {
      mensajeUsuario = 'Error de conexión. Por favor, verifica tu conexión a internet.';
      codigoError = 'ERROR_RED';
    }
    // Errores de base de datos
    else if (error.message.includes('database') || error.message.includes('Database')) {
      mensajeUsuario = 'Error al procesar la información. Por favor, intenta nuevamente.';
      codigoError = 'ERROR_BD';
    }
    // Errores de validación
    else if (error.message.includes('validation') || error.message.includes('Validation')) {
      mensajeUsuario = 'Los datos proporcionados no son válidos. Por favor, verifica e intenta nuevamente.';
      codigoError = 'ERROR_VALIDACION';
    }
    // Errores de permisos
    else if (error.message.includes('permission') || error.message.includes('Permission')) {
      mensajeUsuario = 'No tienes permisos para realizar esta acción.';
      codigoError = 'ERROR_PERMISOS';
    }
    // Errores de pago
    else if (error.message.includes('payment') || error.message.includes('Payment')) {
      mensajeUsuario = 'Error al procesar el pago. Por favor, intenta nuevamente o contacta soporte.';
      codigoError = 'ERROR_PAGO';
    }
  }
  
  // Mensaje genérico para el usuario sin exponer detalles técnicos
  return {
    error: true,
    mensaje: mensajeUsuario,
    codigo: codigoError,
    errorId: errorId,
    timestamp: timestamp,
    // Solo incluir detalles técnicos en desarrollo
    ...(import.meta.env.DEV && {
      detalles: {
        mensajeOriginal: error.message,
        stack: error.stack,
        contexto: contexto
      }
    })
  };
};

// Función para validar y sanitizar errores antes de mostrarlos
export const sanitizarError = (error) => {
  if (typeof error === 'string') {
    return { mensaje: error, error: true };
  }
  
  if (error instanceof Error) {
    return manejarError(error);
  }
  
  if (typeof error === 'object' && error !== null) {
    // Remover propiedades sensibles
    const { password, token, apiKey, secret, ...errorLimpio } = error;
    return {
      error: true,
      mensaje: error.mensaje || error.message || 'Error desconocido',
      ...errorLimpio
    };
  }
  
  return { error: true, mensaje: 'Error desconocido' };
};

// Validación mejorada de archivos subidos con análisis de contenido
export const validarArchivo = (archivo, opciones = {}) => {
  const configuracion = {
    maxSize: 5 * 1024 * 1024, // 5MB por defecto
    tiposPermitidos: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    permitirPDF: false,
    permitirSVG: false,
    escanearContenido: true,
    ...opciones
  };
  
  if (!archivo) return { valido: false, error: 'No se proporcionó archivo' };
  
  // Validar nombre del archivo
  const nombreArchivo = archivo.name || '';
  if (nombreArchivo.length > 255) {
    return { valido: false, error: 'Nombre de archivo demasiado largo' };
  }
  
  // Validar caracteres peligrosos en el nombre
  const caracteresPeligrosos = /[<>:"|?*\x00-\x1f]/;
  if (caracteresPeligrosos.test(nombreArchivo)) {
    return { valido: false, error: 'Nombre de archivo contiene caracteres inválidos' };
  }
  
  // Validar extensión doble (ejemplo: .jpg.php)
  const extensiones = nombreArchivo.split('.');
  if (extensiones.length > 2) {
    return { valido: false, error: 'Nombre de archivo contiene múltiples extensiones' };
  }
  
  // Validar tamaño
  if (archivo.size > configuracion.maxSize) {
    return { valido: false, error: `El archivo excede el tamaño máximo permitido (${configuracion.maxSize / (1024 * 1024)}MB)` };
  }
  
  if (archivo.size === 0) {
    return { valido: false, error: 'El archivo está vacío' };
  }
  
  // Validar tipo MIME
  const tiposPermitidos = [...configuracion.tiposPermitidos];
  if (configuracion.permitirPDF) tiposPermitidos.push('application/pdf');
  if (configuracion.permitirSVG) tiposPermitidos.push('image/svg+xml');
  
  if (!tiposPermitidos.includes(archivo.type)) {
    return { valido: false, error: 'Tipo de archivo no permitido' };
  }
  
  // Validación adicional para SVG
  if (archivo.type === 'image/svg+xml' && configuracion.escanearContenido) {
    return validarSVG(archivo);
  }
  
  // Validación de firma mágica para imágenes
  if (configuracion.escanearContenido && archivo.type.startsWith('image/')) {
    return validarFirmaMagica(archivo, configuracion.tiposPermitidos);
  }
  
  return { valido: true };
};

// Validar firma mágica del archivo
const validarFirmaMagica = (archivo, tiposPermitidos) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const buffer = new Uint8Array(e.target.result);
      const firma = buffer.slice(0, 4);
      
      // Firmas mágicas comunes
      const firmas = {
        'image/jpeg': [0xFF, 0xD8, 0xFF],
        'image/png': [0x89, 0x50, 0x4E, 0x47],
        'image/gif': [0x47, 0x49, 0x46, 0x38],
        'image/webp': [0x52, 0x49, 0x46, 0x46]
      };
      
      // Verificar firma
      for (const [tipo, firmaEsperada] of Object.entries(firmas)) {
        if (tiposPermitidos.includes(tipo)) {
          const coincide = firmaEsperada.every((byte, index) => firma[index] === byte);
          if (coincide) {
            resolve({ valido: true });
            return;
          }
        }
      }
      
      resolve({ valido: false, error: 'La firma del archivo no coincide con su extensión' });
    };
    
    reader.onerror = () => {
      resolve({ valido: false, error: 'Error al leer el archivo' });
    };
    
    reader.readAsArrayBuffer(archivo.slice(0, 4));
  });
};

// Validar contenido SVG contra XSS
const validarSVG = (archivo) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const contenido = e.target.result;
      
      // Patrones peligrosos en SVG
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
    
    reader.onerror = () => {
      resolve({ valido: false, error: 'Error al leer el archivo SVG' });
    };
    
    reader.readAsText(archivo.slice(0, 1024)); // Leer primeros 1KB
  });
};

// Validación de entrada contra SQL Injection
export const validarSQLInjection = (input) => {
  if (typeof input !== 'string') return { valido: true, valor: input };
  
  // Patrones sospechosos de SQL injection
  const patronesSQL = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|declare|truncate)\b)/gi,
    /(--|\/\*|\*\/|xp_)/gi,
    /(\b(or|and)\b.*=.*)/gi,
    /('|")\s*(or|and)\s*('|")/gi,
    /\b\d+\s*=\s*\d+\b/gi
  ];
  
  for (const patron of patronesSQL) {
    if (patron.test(input)) {
      return { 
        valido: false, 
        error: 'Entrada potencialmente peligrosa detectada',
        patron: patron.toString()
      };
    }
  }
  
  return { valido: true, valor: sanitizarEntrada(input) };
};

// Validación de campos específicos de base de datos
export const validarCampoBD = (campo, valor, tipo = 'string') => {
  if (valor === null || valor === undefined) {
    return { valido: true, valor: null };
  }
  
  switch (tipo) {
    case 'string':
      if (typeof valor !== 'string') {
        return { valido: false, error: 'Tipo de dato inválido' };
      }
      if (valor.length > 255) {
        return { valido: false, error: 'Texto demasiado largo (máx 255 caracteres)' };
      }
      return validarSQLInjection(valor);
      
    case 'email':
      if (!validarEmail(valor)) {
        return { valido: false, error: 'Email inválido' };
      }
      return validarSQLInjection(valor);
      
    case 'numero':
      if (isNaN(Number(valor))) {
        return { valido: false, error: 'Número inválido' };
      }
      return { valido: true, valor: Number(valor) };
      
    case 'uuid':
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(valor)) {
        return { valido: false, error: 'UUID inválido' };
      }
      return { valido: true, valor: valor };
      
    default:
      return validarSQLInjection(String(valor));
  }
};

// Sanitización de datos para base de datos
export const sanitizarParaBD = (datos) => {
  const datosSanitizados = {};
  
  Object.keys(datos).forEach(key => {
    const valor = datos[key];
    
    if (typeof valor === 'string') {
      const validacion = validarSQLInjection(valor);
      if (validacion.valido) {
        datosSanitizados[key] = validacion.valor;
      } else {
        throw new Error(`Validación fallida para campo ${key}: ${validacion.error}`);
      }
    } else if (typeof valor === 'object' && valor !== null) {
      datosSanitizados[key] = sanitizarParaBD(valor);
    } else {
      datosSanitizados[key] = valor;
    }
  });
  
  return datosSanitizados;
};