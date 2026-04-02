/**
 * Utilidad de rendimiento para medir y optimizar la carga de imágenes
 * Proporciona métricas detalladas y análisis de bottlenecks
 * 
 * @author: Sistema de Optimización Supabase
 * @version: 1.0.0
 */

class ImagePerformanceMonitor {
  constructor() {
    this.metricas = {
      imagenesProcesadas: 0,
      tiempoTotalCarga: 0,
      tiempoPromedioCarga: 0,
      imagenesExitosas: 0,
      imagenesFallidas: 0,
      tasaExito: 0,
      bytesDescargados: 0,
      bytesOptimizados: 0,
      ahorroPorcentaje: 0
    }
    
    this.historial = []
    this.iniciosCarga = new Map()
    this.sesionInicio = Date.now()
    
    // Configuración de límites de rendimiento
    this.limites = {
      tiempoMaximoCarga: 3000, // 3 segundos
      tasaExitoMinima: 0.95, // 95%
      ahorroMinimo: 20 // 20%
    }
  }

  /**
   * Inicia el monitoreo de una imagen
   */
  iniciarCarga(url, opciones = {}) {
    const id = this.generarIdUnico()
    
    this.iniciosCarga.set(id, {
      url,
      inicio: performance.now(),
      timestamp: Date.now(),
      opciones
    })

    return id
  }

  /**
   * Finaliza el monitoreo de una imagen exitosa
   */
  finalizarCarga(id, tamañoDescargado = 0, tamañoOptimizado = 0) {
    const datosInicio = this.iniciosCarga.get(id)
    if (!datosInicio) return null

    const tiempoCarga = performance.now() - datosInicio.inicio
    const ahorroBytes = Math.max(0, tamañoDescargado - tamañoOptimizado)
    const ahorroPorcentaje = tamañoDescargado > 0 ? (ahorroBytes / tamañoDescargado) * 100 : 0

    const metrica = {
      id,
      url: datosInicio.url,
      tiempoCarga,
      exitosa: true,
      tamañoDescargado,
      tamañoOptimizado,
      ahorroBytes,
      ahorroPorcentaje,
      timestamp: Date.now()
    }

    this.actualizarMetricas(metrica)
    this.historial.push(metrica)
    this.iniciosCarga.delete(id)

    // Verificar si hay problemas de rendimiento
    this.verificarProblemasRendimiento(metrica)

    return metrica
  }

  /**
   * Registra una carga fallida
   */
  registrarError(id, error) {
    const datosInicio = this.iniciosCarga.get(id)
    if (!datosInicio) return null

    const tiempoCarga = performance.now() - datosInicio.inicio

    const metrica = {
      id,
      url: datosInicio.url,
      tiempoCarga,
      exitosa: false,
      error: error?.message || 'Error desconocido',
      timestamp: Date.now()
    }

    this.actualizarMetricas(metrica)
    this.historial.push(metrica)
    this.iniciosCarga.delete(id)

    return metrica
  }

  /**
   * Actualiza las métricas globales
   */
  actualizarMetricas(metrica) {
    this.metricas.imagenesProcesadas++
    
    if (metrica.exitosa) {
      this.metricas.imagenesExitosas++
      this.metricas.tiempoTotalCarga += metrica.tiempoCarga
      this.metricas.tiempoPromedioCarga = this.metricas.tiempoTotalCarga / this.metricas.imagenesExitosas
      this.metricas.bytesDescargados += metrica.tamañoDescargado || 0
      this.metricas.bytesOptimizados += metrica.tamañoOptimizado || 0
      this.metricas.ahorroPorcentaje = this.metricas.bytesDescargados > 0 
        ? ((this.metricas.bytesDescargados - this.metricas.bytesOptimizados) / this.metricas.bytesDescargados) * 100
        : 0
    } else {
      this.metricas.imagenesFallidas++
    }

    this.metricas.tasaExito = this.metricas.imagenesExitosas / this.metricas.imagenesProcesadas
  }

  /**
   * Verifica si hay problemas de rendimiento
   */
  verificarProblemasRendimiento(metrica) {
    const problemas = []

    if (metrica.tiempoCarga > this.limites.tiempoMaximoCarga) {
      problemas.push({
        tipo: 'tiempo_excesivo',
        mensaje: `Imagen demasiado lenta: ${metrica.tiempoCarga.toFixed(2)}ms`,
        severidad: 'alta',
        url: metrica.url
      })
    }

    if (this.metricas.tasaExito < this.limites.tasaExitoMinima) {
      problemas.push({
        tipo: 'tasa_exito_baja',
        mensaje: `Tasa de éxito baja: ${(this.metricas.tasaExito * 100).toFixed(1)}%`,
        severidad: 'media',
        valorActual: this.metricas.tasaExito
      })
    }

    if (metrica.ahorroPorcentaje < this.limites.ahorroMinimo && metrica.tamañoDescargado > 0) {
      problemas.push({
        tipo: 'optimizacion_insuficiente',
        mensaje: `Optimización insuficiente: ${metrica.ahorroPorcentaje.toFixed(1)}% de ahorro`,
        severidad: 'baja',
        url: metrica.url
      })
    }

    if (problemas.length > 0) {
      console.warn('⚠️ Problemas de rendimiento detectados:', problemas)
      this.emitirAlertaRendimiento(problemas)
    }

    return problemas
  }

  /**
   * Emite alertas de rendimiento
   */
  emitirAlertaRendimiento(problemas) {
    const alerta = {
      timestamp: Date.now(),
      problemas,
      severidad: Math.max(...problemas.map(p => this.obtenerNivelSeveridad(p.severidad))),
      metricasActuales: { ...this.metricas }
    }

    // Emitir evento personalizado
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('imagePerformanceAlert', { detail: alerta }))
    }

    return alerta
  }

  /**
   * Obtiene nivel numérico de severidad
   */
  obtenerNivelSeveridad(severidad) {
    const niveles = { baja: 1, media: 2, alta: 3, critica: 4 }
    return niveles[severidad] || 1
  }

  /**
   * Genera ID único para cada carga
   */
  generarIdUnico() {
    return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Obtiene reporte completo de rendimiento
   */
  obtenerReporteCompleto() {
    const tiempoSesion = Date.now() - this.sesionInicio
    
    return {
      resumen: {
        tiempoSesion: this.formatearTiempo(tiempoSesion),
        imagenesProcesadas: this.metricas.imagenesProcesadas,
        tasaExito: `${(this.metricas.tasaExito * 100).toFixed(1)}%`,
        tiempoPromedioCarga: `${this.metricas.tiempoPromedioCarga.toFixed(2)}ms`,
        ahorroTotal: this.formatearBytes(this.metricas.bytesDescargados - this.metricas.bytesOptimizados),
        ahorroPorcentaje: `${this.metricas.ahorroPorcentaje.toFixed(1)}%`
      },
      detalles: {
        ...this.metricas,
        historial: this.historial.slice(-10) // Últimas 10 imágenes
      },
      recomendaciones: this.generarRecomendaciones(),
      timestamp: Date.now()
    }
  }

  /**
   * Genera recomendaciones basadas en las métricas
   */
  generarRecomendaciones() {
    const recomendaciones = []

    if (this.metricas.tiempoPromedioCarga > 2000) {
      recomendaciones.push({
        tipo: 'rendimiento',
        prioridad: 'alta',
        mensaje: 'Considera implementar lazy loading o reducir el tamaño de las imágenes',
        accion: 'Optimizar imágenes o implementar carga diferida'
      })
    }

    if (this.metricas.tasaExito < 0.9) {
      recomendaciones.push({
        tipo: 'fiabilidad',
        prioridad: 'alta',
        mensaje: 'Alta tasa de errores en carga de imágenes',
        accion: 'Verificar conexión o implementar reintentos automáticos'
      })
    }

    if (this.metricas.ahorroPorcentaje < 15) {
      recomendaciones.push({
        tipo: 'optimizacion',
        prioridad: 'media',
        mensaje: 'Bajo porcentaje de compresión/optimización',
        accion: 'Considerar formatos WebP/AVIF o mayor compresión'
      })
    }

    return recomendaciones
  }

  /**
   * Formatea tiempo en formato legible
   */
  formatearTiempo(milisegundos) {
    if (milisegundos < 1000) return `${milisegundos}ms`
    if (milisegundos < 60000) return `${(milisegundos / 1000).toFixed(1)}s`
    return `${(milisegundos / 60000).toFixed(1)}m`
  }

  /**
   * Formatea bytes en formato legible
   */
  formatearBytes(bytes) {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  /**
   * Reinicia todas las métricas
   */
  reiniciar() {
    this.metricas = {
      imagenesProcesadas: 0,
      tiempoTotalCarga: 0,
      tiempoPromedioCarga: 0,
      imagenesExitosas: 0,
      imagenesFallidas: 0,
      tasaExito: 0,
      bytesDescargados: 0,
      bytesOptimizados: 0,
      ahorroPorcentaje: 0
    }
    
    this.historial = []
    this.iniciosCarga.clear()
    this.sesionInicio = Date.now()
    
    console.log('📊 Monitor de rendimiento reiniciado')
  }

  /**
   * Exporta datos para análisis externo
   */
  exportarDatos() {
    return {
      metricas: this.metricas,
      historialCompleto: this.historial,
      reporte: this.obtenerReporteCompleto(),
      timestampExport: Date.now()
    }
  }
}

// Instancia global del monitor
const monitorGlobal = new ImagePerformanceMonitor()

// Funciones de utilidad exportables
export const crearMonitor = () => new ImagePerformanceMonitor()
export const obtenerMonitorGlobal = () => monitorGlobal

export default ImagePerformanceMonitor