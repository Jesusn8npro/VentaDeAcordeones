// Validaciones de entrada y rate limiting

export const sanitizarEntrada = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email) && email.length <= 100;
};

export const validarContrasena = (contrasena) => {
  return contrasena.length >= 8 &&
         /[A-Z]/.test(contrasena) &&
         /[a-z]/.test(contrasena) &&
         /[0-9]/.test(contrasena) &&
         contrasena.length <= 128;
};

const intentosPorIP = new Map();

const LIMITES_POR_TIPO = {
  default: { max: 5, tiempoBloqueo: 15 * 60 * 1000 },
  auth: { max: 3, tiempoBloqueo: 30 * 60 * 1000 },
  pago: { max: 2, tiempoBloqueo: 60 * 60 * 1000 },
  api: { max: 100, tiempoBloqueo: 60 * 1000 }
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

export const limpiarIntentosAntiguos = () => {
  const ahora = Date.now();
  for (const [key, intentos] of intentosPorIP.entries()) {
    if (ahora > intentos.resetTime) {
      intentosPorIP.delete(key);
    }
  }
};

setInterval(limpiarIntentosAntiguos, 60 * 60 * 1000);

export const validarSQLInjection = (input) => {
  if (typeof input !== 'string') return { valido: true, valor: input };

  const patronesSQL = [
    /(\b(union|select|insert|update|delete|drop|create|alter|exec|execute|script|declare|truncate)\b)/gi,
    /(--|\/\*|\*\/|xp_)/gi,
    /(\b(or|and)\b.*=.*)/gi,
    /('|")\s*(or|and)\s*('|")/gi,
    /\b\d+\s*=\s*\d+\b/gi
  ];

  for (const patron of patronesSQL) {
    if (patron.test(input)) {
      return { valido: false, error: 'Entrada potencialmente peligrosa detectada', patron: patron.toString() };
    }
  }

  return { valido: true, valor: sanitizarEntrada(input) };
};

export const validarCampoBD = (campo, valor, tipo = 'string') => {
  if (valor === null || valor === undefined) return { valido: true, valor: null };

  switch (tipo) {
    case 'string':
      if (typeof valor !== 'string') return { valido: false, error: 'Tipo de dato inválido' };
      if (valor.length > 255) return { valido: false, error: 'Texto demasiado largo (máx 255 caracteres)' };
      return validarSQLInjection(valor);
    case 'email':
      if (!validarEmail(valor)) return { valido: false, error: 'Email inválido' };
      return validarSQLInjection(valor);
    case 'numero':
      if (isNaN(Number(valor))) return { valido: false, error: 'Número inválido' };
      return { valido: true, valor: Number(valor) };
    case 'uuid': {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(valor)) return { valido: false, error: 'UUID inválido' };
      return { valido: true, valor };
    }
    default:
      return validarSQLInjection(String(valor));
  }
};

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
