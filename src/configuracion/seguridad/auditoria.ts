// Sistema de auditoría y monitoreo de accesos

class AuditoriaSeguridad {
  constructor() {
    this.eventos = [];
    this.maxEventos = 1000;
    this.nivelLog = process.env.NODE_ENV !== 'production' ? 'debug' : 'info';
  }

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

    this.eventos.unshift(eventoCompleto);
    if (this.eventos.length > this.maxEventos) {
      this.eventos = this.eventos.slice(0, this.maxEventos);
    }

    if (this.debeLoggear(eventoCompleto.severidad)) {
    }

    return eventoCompleto.id;
  }

  registrarIntentoNoAutorizado(datos) {
    return this.registrar({ tipo: 'SEGURIDAD_ACCESO', severidad: 'ALERTA', accion: 'INTENTO_ACCESO_NO_AUTORIZADO', ...datos });
  }

  registrarCambioContrasena(datos) {
    return this.registrar({ tipo: 'SEGURIDAD_AUTENTICACION', severidad: 'INFO', accion: 'CAMBIO_CONTRASENA', ...datos });
  }

  registrarErrorValidacion(datos) {
    return this.registrar({ tipo: 'SEGURIDAD_VALIDACION', severidad: 'ADVERTENCIA', accion: 'ERROR_VALIDACION', ...datos });
  }

  registrarActividadSospechosa(datos) {
    return this.registrar({ tipo: 'SEGURIDAD_SOSPECHOSA', severidad: 'CRÍTICO', accion: 'ACTIVIDAD_SOSPECHOSA', ...datos });
  }

  obtenerEventosRecientes(cantidad = 50, filtros = {}) {
    let eventosFiltrados = this.eventos;
    if (filtros.tipo) eventosFiltrados = eventosFiltrados.filter(e => e.tipo.includes(filtros.tipo));
    if (filtros.severidad) eventosFiltrados = eventosFiltrados.filter(e => e.severidad === filtros.severidad);
    if (filtros.usuario) eventosFiltrados = eventosFiltrados.filter(e => e.usuario === filtros.usuario);
    return eventosFiltrados.slice(0, cantidad);
  }

  sanitizarDetalles(detalles) {
    const detallesLimpios = { ...detalles };
    ['password', 'contrasena', 'token', 'apiKey', 'secret', 'clave', 'key'].forEach(prop => {
      if (detallesLimpios[prop]) detallesLimpios[prop] = '[REDACTED]';
    });
    return detallesLimpios;
  }

  debeLoggear(severidad) {
    const niveles = { DEBUG: 0, INFO: 1, ADVERTENCIA: 2, ALERTA: 3, CRÍTICO: 4 };
    const nivelActual = niveles[this.nivelLog.toUpperCase()] || 1;
    return (niveles[severidad] || 1) >= nivelActual;
  }

  exportarEventos(formato = 'json') {
    if (formato === 'csv') {
      const headers = 'ID,Timestamp,Tipo,Severidad,Usuario,IP,Accion\n';
      const rows = this.eventos.map(e =>
        `${e.id},${e.timestamp},${e.tipo},${e.severidad},${e.usuario},${e.ip},${e.accion}`
      ).join('\n');
      return headers + rows;
    }
    return formato === 'json' ? JSON.stringify(this.eventos, null, 2) : this.eventos;
  }
}

export const auditoria = new AuditoriaSeguridad();

class MonitoreoAccesos {
  constructor() {
    this.intentosSospechosos = new Map();
    this.patronesSospechosos = [];
    this.maxIntentosPorIP = 10;
    this.ventanaTiempo = 60 * 60 * 1000;
    this.maxPatrones = 100;
  }

  registrarIntento(datos) {
    const { ip, usuario, exitoso = false, tipo = 'login', detalles = {} } = datos;
    this.limpiarIntentosAntiguos(ip);

    if (!this.intentosSospechosos.has(ip)) {
      this.intentosSospechosos.set(ip, { intentos: [], bloqueada: false, tiempoBloqueo: null, nivelRiesgo: 'BAJO' });
    }

    const registroIP = this.intentosSospechosos.get(ip);
    registroIP.intentos.push({ timestamp: Date.now(), exitoso, tipo, usuario: usuario || 'desconocido', detalles: this.sanitizarDetalles(detalles) });

    this.analizarPatrones(ip, registroIP);
    this.verificarBloqueo(ip, registroIP);

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

  analizarPatrones(ip, registroIP) {
    const intentosFallidos = registroIP.intentos.filter(i => !i.exitoso);
    const ahora = Date.now();

    if (intentosFallidos.filter(i => ahora - i.timestamp < 5 * 60 * 1000).length >= 5) {
      registroIP.nivelRiesgo = 'ALTO';
      this.agregarPatron('INTENTOS_RAPIDOS', ip, intentosFallidos.length);
    }

    if (new Set(intentosFallidos.map(i => i.usuario)).size >= 3) {
      registroIP.nivelRiesgo = 'MEDIO';
      this.agregarPatron('USUARIOS_MULTIPLES', ip, new Set(intentosFallidos.map(i => i.usuario)).size);
    }

    if (intentosFallidos.length >= 3) {
      const intervalos = [];
      for (let i = 1; i < intentosFallidos.length; i++) {
        intervalos.push(intentosFallidos[i].timestamp - intentosFallidos[i - 1].timestamp);
      }
      const avg = intervalos.reduce((a, b) => a + b, 0) / intervalos.length;
      const desviacion = Math.sqrt(intervalos.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / intervalos.length);
      if (desviacion < 1000) {
        registroIP.nivelRiesgo = 'ALTO';
        this.agregarPatron('INTERVALOS_REGULARES', ip, avg);
      }
    }
  }

  agregarPatron(tipo, ip, valor) {
    this.patronesSospechosos.unshift({ timestamp: Date.now(), tipo, ip, valor, id: crypto.randomUUID() });
    if (this.patronesSospechosos.length > this.maxPatrones) {
      this.patronesSospechosos = this.patronesSospechosos.slice(0, this.maxPatrones);
    }
  }

  verificarBloqueo(ip, registroIP) {
    const intentosFallidos = registroIP.intentos.filter(i => !i.exitoso);
    if (registroIP.nivelRiesgo === 'ALTO' && intentosFallidos.length >= this.maxIntentosPorIP) {
      registroIP.bloqueada = true;
      registroIP.tiempoBloqueo = Date.now() + (30 * 60 * 1000);
      auditoria.registrarActividadSospechosa({
        ip,
        detalles: { tipo: 'IP_BLOQUEADA', motivo: 'Exceso de intentos fallidos', intentos: intentosFallidos.length, tiempoBloqueo: '30 minutos' }
      });
    }
  }

  estaBloqueada(ip) {
    const registro = this.intentosSospechosos.get(ip);
    if (!registro?.bloqueada) return false;
    if (Date.now() > registro.tiempoBloqueo) {
      registro.bloqueada = false;
      registro.tiempoBloqueo = null;
      return false;
    }
    return true;
  }

  esSospechoso(registroIP) {
    return registroIP.nivelRiesgo !== 'BAJO' || registroIP.intentos.filter(i => !i.exitoso).length >= 3;
  }

  limpiarIntentosAntiguos(ip) {
    const registro = this.intentosSospechosos.get(ip);
    if (!registro) return;
    const ahora = Date.now();
    registro.intentos = registro.intentos.filter(i => ahora - i.timestamp < this.ventanaTiempo);
    if (registro.intentos.length === 0) registro.nivelRiesgo = 'BAJO';
  }

  obtenerEstadisticas() {
    const totalIPs = this.intentosSospechosos.size;
    const ipsBloqueadas = Array.from(this.intentosSospechosos.values()).filter(r => r.bloqueada).length;
    const totalIntentos = Array.from(this.intentosSospechosos.values()).reduce((t, r) => t + r.intentos.length, 0);
    const intentosFallidos = Array.from(this.intentosSospechosos.values()).reduce((t, r) => t + r.intentos.filter(i => !i.exitoso).length, 0);
    return {
      totalIPs,
      ipsBloqueadas,
      totalIntentos,
      intentosFallidos,
      tasaFallos: totalIntentos > 0 ? (intentosFallidos / totalIntentos * 100).toFixed(2) + '%' : '0%',
      patronesDetectados: this.patronesSospechosos.length
    };
  }

  obtenerIPSSospechosas(limite = 10) {
    return Array.from(this.intentosSospechosos.entries())
      .filter(([, registro]) => this.esSospechoso(registro))
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

  sanitizarDetalles(detalles) {
    const detallesLimpios = { ...detalles };
    ['password', 'contrasena', 'token', 'apiKey', 'secret', 'clave'].forEach(prop => {
      if (detallesLimpios[prop]) detallesLimpios[prop] = '[REDACTED]';
    });
    return detallesLimpios;
  }
}

export const monitoreoAccesos = new MonitoreoAccesos();
