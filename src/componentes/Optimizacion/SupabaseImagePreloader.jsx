import React, { useEffect, useState } from 'react'
import useSupabaseImageOptimizer from '../../hooks/useSupabaseImageOptimizer'

/**
 * Componente de precarga inteligente para imágenes críticas
 * Precarga las imágenes más importantes antes de que el usuario las vea
 * 
 * @author: Sistema de Optimización Supabase
 * @version: 1.0.0
 */

const SupabaseImagePreloader = ({ 
  imagenes = [], 
  estrategia = 'critica', // 'critica', 'secundaria', 'todas'
  onComplete,
  onProgress,
  children 
}) => {
  const [estaPrecargando, setEstaPrecargando] = useState(false)
  const [progreso, setProgreso] = useState(0)
  const [imagenesPrecargadas, setImagenesPrecargadas] = useState(0)
  
  const { precargarImagenesCriticas, analizarRendimiento } = useSupabaseImageOptimizer()

  // Priorizar imágenes según estrategia
  const obtenerImagenesPrioritarias = () => {
    if (estrategia === 'todas') return imagenes
    
    if (estrategia === 'critica') {
      // Imágenes que el usuario verá inmediatamente
      return imagenes.slice(0, 5)
    }
    
    if (estrategia === 'secundaria') {
      // Imágenes que el usuario verá después de 2-3 segundos
      return imagenes.slice(5, 15)
    }
    
    return imagenes
  }

  // Iniciar precarga cuando el componente se monte
  useEffect(() => {
    if (imagenes.length === 0) return

    const iniciarPrecarga = async () => {
      setEstaPrecargando(true)
      
      try {
        const imagenesPrioritarias = obtenerImagenesPrioritarias()
        
        console.log(`🚀 Iniciando precarga ${estrategia}: ${imagenesPrioritarias.length} imágenes`)
        
        const resultado = await precargarImagenesCriticas(imagenesPrioritarias, {
          batchSize: estrategia === 'critica' ? 2 : 3,
          delayEntreLotes: estrategia === 'critica' ? 100 : 300,
          timeout: 8000,
          onProgress: (progresoActual) => {
            setProgreso(progresoActual)
            setImagenesPrecargadas(Math.floor(progresoActual * imagenesPrioritarias.length))
            
            if (onProgress) {
              onProgress({
                progreso: progresoActual,
                imagenesProcesadas: Math.floor(progresoActual * imagenesPrioritarias.length),
                totalImagenes: imagenesPrioritarias.length
              })
            }
          }
        })

        console.log(`✅ Precarga ${estrategia} completada:`, resultado)
        
        // Analizar rendimiento después de precargar
        const metricas = analizarRendimiento()
        console.log('📊 Métricas de rendimiento:', metricas)
        
        if (onComplete) {
          onComplete({
            ...resultado,
            metricas,
            estrategia
          })
        }
        
      } catch (error) {
        console.error(`❌ Error en precarga ${estrategia}:`, error)
        
        if (onComplete) {
          onComplete({
            error: error.message,
            estrategia
          })
        }
      } finally {
        setEstaPrecargando(false)
      }
    }

    // Delay estratégico según prioridad
    const delay = estrategia === 'critica' ? 0 : estrategia === 'secundaria' ? 2000 : 5000
    
    const timeoutId = setTimeout(iniciarPrecarga, delay)
    
    return () => clearTimeout(timeoutId)
  }, [imagenes, estrategia, precargarImagenesCriticas, analizarRendimiento, onComplete, onProgress])

  // Renderizar indicador de progreso si está precargando
  if (estaPrecargando && progreso < 1) {
    return (
      <div className="supabase-preloader-indicator">
        <div className="preloader-content">
          <div className="preloader-spinner"></div>
          <div className="preloader-text">
            {estrategia === 'critica' 
              ? '🚀 Optimizando imágenes principales...' 
              : '📸 Precargando imágenes adicionales...'
            }
          </div>
          <div className="preloader-progress">
            <div 
              className="preloader-progress-bar" 
              style={{ width: `${progreso * 100}%` }}
            ></div>
          </div>
          <div className="preloader-count">
            {imagenesPrecargadas} / {obtenerImagenesPrioritarias().length} imágenes
          </div>
        </div>
      </div>
    )
  }

  // Renderizar children cuando termine la precarga crítica
  return children || null
}

// Estrategias de precarga predefinidas
export const ESTRATEGIAS_PRECARGA = {
  CRITICA: 'critica',
  SECUNDARIA: 'secundaria', 
  TODAS: 'todas'
}

export default SupabaseImagePreloader