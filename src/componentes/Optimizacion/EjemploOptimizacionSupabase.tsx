import React, { useState, useEffect } from 'react'
import SupabaseImageOptimizer from './SupabaseImageOptimizer'
import SupabaseImagePreloader from './SupabaseImagePreloader'
import useSupabaseImageOptimizer from '../../hooks/useSupabaseImageOptimizer'
import { obtenerMonitorGlobal } from '../../utils/ImagePerformanceMonitor'
import './SupabaseImageOptimizer.css'

/**
 * Componente de demostración que muestra cómo implementar la optimización completa
 * de imágenes de Supabase con todos los features activados
 * 
 * @author: Sistema de Optimización Supabase
 * @version: 1.0.0
 */

const EjemploOptimizacionSupabase = () => {
  const [imagenes, setImagenes] = useState([])
  const [mostrarMetricas, setMostrarMetricas] = useState(false)
  const [rendimiento, setRendimiento] = useState(null)
  
  const { 
    precargarImagenesCriticas, 
    optimizarUrlSupabase,
    analizarRendimiento 
  } = useSupabaseImageOptimizer()
  
  const monitor = obtenerMonitorGlobal()

  // Ejemplo de imágenes de Supabase (reemplaza con tus URLs reales)
  const imagenesEjemplo = [
    'https://rrmafdbxvimmvcerwguy.supabase.co/storage/v1/object/public/imagenes/fortuner-2010-elegancia-lateral.jpg',
    'https://rrmafdbxvimmvcerwguy.supabase.co/storage/v1/object/public/imagenes/producto-2.jpg',
    'https://rrmafdbxvimmvcerwguy.supabase.co/storage/v1/object/public/imagenes/producto-3.jpg',
    'https://rrmafdbxvimmvcerwguy.supabase.co/storage/v1/object/public/imagenes/categoria-1.jpg',
    'https://rrmafdbxvimmvcerwguy.supabase.co/storage/v1/object/public/imagenes/banner-principal.jpg'
  ]

  // Configuraciones de optimización para diferentes casos de uso
  const configuracionesOptimizacion = {
    // Para productos en grid
    productoGrid: {
      width: 300,
      height: 300,
      quality: 85,
      format: 'webp',
      loading: 'lazy',
      placeholder: 'blur'
    },
    
    // Para imágenes principales/banners
    heroBanner: {
      width: 1200,
      height: 600,
      quality: 90,
      format: 'auto',
      loading: 'eager',
      placeholder: 'blur',
      priority: true
    },
    
    // Para thumbnails pequeños
    thumbnail: {
      width: 150,
      height: 150,
      quality: 80,
      format: 'webp',
      loading: 'lazy',
      placeholder: 'color'
    },
    
    // Para galerías de productos
    galeriaProducto: {
      width: 800,
      height: 600,
      quality: 88,
      format: 'auto',
      loading: 'lazy',
      placeholder: 'blur'
    }
  }

  useEffect(() => {
    // Inicializar con imágenes de ejemplo
    setImagenes(imagenesEjemplo)
    
    // Escuchar eventos de rendimiento
    const manejarAlertaRendimiento = (_evento) => {
    }
    
    window.addEventListener('imagePerformanceAlert', manejarAlertaRendimiento)
    
    return () => {
      window.removeEventListener('imagePerformanceAlert', manejarAlertaRendimiento)
    }
  }, [])

  /**
   * Maneja la finalización de la precarga
   */
  const handlePrecargaComplete = (resultado) => {
    // Obtener métricas de rendimiento
    const metricasActuales = analizarRendimiento()
    const reporteMonitor = monitor.obtenerReporteCompleto()
    
    setRendimiento({
      precarga: resultado,
      metricas: metricasActuales,
      monitor: reporteMonitor
    })
  }

  /**
   * Maneja el progreso de la precarga
   */
  const handlePrecargaProgress = (_progreso) => {
  }

  /**
   * Maneja errores en la carga de imágenes
   */
  const handleImageError = (_error, imagenUrl) => {
    optimizarUrlSupabase(imagenUrl, {
      ancho: 500,
      calidad: 70,
      formato: 'original'
    })
  }

  /**
   * Maneja carga exitosa de imágenes
   */
  const handleImageLoad = (evento, imagenUrl) => {
    // Registrar en monitor de rendimiento
    const id = monitor.iniciarCarga(imagenUrl)
    monitor.finalizarCarga(id, evento.target.naturalWidth * evento.target.naturalHeight * 3)
  }

  /**
   * Alternar visualización de métricas
   */
  const toggleMetricas = () => {
    setMostrarMetricas(!mostrarMetricas)
    
    if (!mostrarMetricas) {
      const reporte = monitor.obtenerReporteCompleto()
      setRendimiento(prev => ({ ...prev, monitor: reporte }))
    }
  }

  return (
    <div className="ejemplo-optimizacion-container">
      {/* Precargador de imágenes críticas */}
      <SupabaseImagePreloader
        imagenes={imagenes}
        estrategia="critica"
        onComplete={handlePrecargaComplete}
        onProgress={handlePrecargaProgress}
      >
        <div className="contenido-principal">
          {/* Header con métricas */}
          <div className="header-metricas">
            <h2>🚀 Optimización Supabase - Demo Completa</h2>
            <button 
              className="btn-metricas"
              onClick={toggleMetricas}
            >
              {mostrarMetricas ? 'Ocultar' : 'Mostrar'} Métricas
            </button>
          </div>

          {/* Grid de imágenes optimizadas */}
          <div className="grid-imagenes">
            {imagenes.map((imagen, index) => {
              // Determinar configuración según posición
              const esPrincipal = index === 0
              const esThumbnail = index > 2
              
              const config = esPrincipal 
                ? configuracionesOptimizacion.heroBanner
                : esThumbnail
                ? configuracionesOptimizacion.thumbnail
                : configuracionesOptimizacion.productoGrid

              return (
                <div key={imagen} className="imagen-item">
                  <div className="imagen-info">
                    <span className="imagen-tipo">
                      {esPrincipal ? '🎯 Principal' : esThumbnail ? '🖼️ Thumbnail' : '📦 Producto'}
                    </span>
                    <span className="imagen-size">
                      {config.width}x{config.height}px
                    </span>
                  </div>
                  
                  <SupabaseImageOptimizer
                    src={imagen}
                    alt={`Imagen optimizada ${index + 1}`}
                    className="imagen-optimizada"
                    onLoad={(evento) => handleImageLoad(evento, imagen)}
                    onError={(error) => handleImageError(error, imagen)}
                    {...config}
                  />
                  
                  <div className="imagen-url">
                    <small>{imagen.split('/').pop()}</small>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Galería con configuración especial */}
          <div className="galeria-seccion">
            <h3>🖼️ Galería de Productos (Configuración Especial)</h3>
            <div className="galeria-grid">
              {imagenes.slice(0, 3).map((imagen, index) => (
                <SupabaseImageOptimizer
                  key={`galeria-${index}`}
                  src={imagen}
                  alt={`Galería ${index + 1}`}
                  className="imagen-galeria"
                  {...configuracionesOptimizacion.galeriaProducto}
                />
              ))}
            </div>
          </div>

          {/* Métricas de rendimiento */}
          {mostrarMetricas && rendimiento && (
            <div className="metricas-container">
              <h3>📊 Métricas de Rendimiento</h3>
              
              <div className="metricas-grid">
                <div className="metrica-card">
                  <h4>⏱️ Tiempo de Carga</h4>
                  <div className="metrica-valor">
                    {rendimiento.monitor?.resumen?.tiempoPromedioCarga || 'N/A'}
                  </div>
                </div>
                
                <div className="metrica-card">
                  <h4>📈 Tasa de Éxito</h4>
                  <div className="metrica-valor">
                    {rendimiento.monitor?.resumen?.tasaExito || 'N/A'}
                  </div>
                </div>
                
                <div className="metrica-card">
                  <h4>💾 Ahorro de Datos</h4>
                  <div className="metrica-valor">
                    {rendimiento.monitor?.resumen?.ahorroPorcentaje || 'N/A'}
                  </div>
                </div>
                
                <div className="metrica-card">
                  <h4>🎯 Imágenes Procesadas</h4>
                  <div className="metrica-valor">
                    {rendimiento.monitor?.resumen?.imagenesProcesadas || 0}
                  </div>
                </div>
              </div>

              {/* Recomendaciones */}
              {rendimiento.monitor?.recomendaciones && rendimiento.monitor.recomendaciones.length > 0 && (
                <div className="recomendaciones">
                  <h4>💡 Recomendaciones de Optimización</h4>
                  {rendimiento.monitor.recomendaciones.map((rec, index) => (
                    <div key={index} className={`recomendacion ${rec.prioridad}`}>
                      <span className="recomendacion-tipo">{rec.tipo}</span>
                      <span className="recomendacion-mensaje">{rec.mensaje}</span>
                      <span className="recomendacion-accion">{rec.accion}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Controles de prueba */}
          <div className="controles-prueba">
            <h3>🧪 Controles de Prueba</h3>
            <div className="botones-prueba">
              <button 
                className="btn-precargar"
                onClick={() => precargarImagenesCriticas(imagenesEjemplo, { estrategia: 'todas' })}
              >
                🚀 Precargar Todas las Imágenes
              </button>
              
              <button
                className="btn-analizar"
                onClick={() => {
                  monitor.obtenerReporteCompleto()
                  alert('Reporte de rendimiento generado')
                }}
              >
                📈 Generar Reporte de Rendimiento
              </button>
              
              <button 
                className="btn-limpiar"
                onClick={() => {
                  monitor.reiniciar()
                  alert('Métricas reiniciadas')
                }}
              >
                🧹 Reiniciar Métricas
              </button>
            </div>
          </div>
        </div>
      </SupabaseImagePreloader>
    </div>
  )
}

export default EjemploOptimizacionSupabase