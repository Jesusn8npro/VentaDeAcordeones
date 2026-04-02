import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Hook personalizado para gestionar el estado y optimización de imágenes de Supabase
 * Proporciona funciones avanzadas de precarga, caché y análisis de rendimiento
 * 
 * @author: Sistema de Optimización Supabase
 * @version: 1.0.0
 */

const useSupabaseImageOptimizer = () => {
  // Estado global de carga de imágenes
  const [imagenesCargando, setImagenesCargando] = useState(new Set())
  const [imagenesCacheadas, setImagenesCacheadas] = useState(new Map())
  const [imagenesFallidas, setImagenesFallidas] = useState(new Set())
  
  // Métricas de rendimiento
  const [metricas, setMetricas] = useState({
    totalImagenes: 0,
    imagenesOptimizadas: 0,
    tiempoAhorrado: 0,
    bytesAhorrados: 0
  })
  
  // Referencias para caché persistente
  const cacheRef = useRef(new Map())
  const sessionStartRef = useRef(Date.now())

  /**
   * Precarga estratégica de imágenes críticas
   * Carga las imágenes más importantes primero para mejor UX
   */
  const precargarImagenesCriticas = useCallback(async (urls, opciones = {}) => {
    const {
      prioridad = 'alta',
      batchSize = 3,
      delayEntreLotes = 200,
      timeout = 5000
    } = opciones

    const urlsUnicas = [...new Set(urls)].filter(url => url && !imagenesCacheadas.has(url))
    
    if (urlsUnicas.length === 0) return

    console.log(`🚀 Precargando ${urlsUnicas.length} imágenes críticas...`)

    const inicio = performance.now()
    let imagenesPrecargadas = 0

    for (let i = 0; i < urlsUnicas.length; i += batchSize) {
      const lote = urlsUnicas.slice(i, i + batchSize)
      
      const promesasLote = lote.map(async (url) => {
        if (imagenesFallidas.has(url)) return null

        try {
          const response = await Promise.race([
            fetch(url, { method: 'HEAD' }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), timeout)
            )
          ])

          if (response.ok) {
            // Precargar en caché del navegador
            const img = new Image()
            img.src = url
            
            cacheRef.current.set(url, {
              url,
              timestamp: Date.now(),
              size: response.headers.get('content-length'),
              precargada: true
            })
            
            imagenesPrecargadas++
            return url
          }
        } catch (error) {
          console.warn(`⚠️ Error precargando ${url}:`, error.message)
          setImagenesFallidas(prev => new Set(prev).add(url))
        }
        
        return null
      })

      const resultados = await Promise.allSettled(promesasLote)
      const exitosas = resultados
        .filter(resultado => resultado.status === 'fulfilled' && resultado.value)
        .map(resultado => resultado.value)

      // Actualizar estado de caché
      setImagenesCacheadas(prev => {
        const nuevoCache = new Map(prev)
        exitosas.forEach(url => {
          if (url) nuevoCache.set(url, cacheRef.current.get(url))
        })
        return nuevoCache
      })

      // Pequeña pausa entre lotes para no saturar
      if (i + batchSize < urlsUnicas.length) {
        await new Promise(resolve => setTimeout(resolve, delayEntreLotes))
      }
    }

    const tiempoTotal = performance.now() - inicio
    console.log(`✅ Precarga completada: ${imagenesPrecargadas}/${urlsUnicas.length} imágenes en ${tiempoTotal.toFixed(2)}ms`)

    return {
      imagenesPrecargadas,
      tiempoTotal,
      ratioExito: imagenesPrecargadas / urlsUnicas.length
    }
  }, [imagenesCacheadas, imagenesFallidas])

  /**
   * Optimiza URLs de Supabase con transformaciones inteligentes
   */
  const optimizarUrlSupabase = useCallback((url, opciones = {}) => {
    if (!url || typeof url !== 'string') return ''

    const {
      ancho,
      alto,
      calidad = 80,
      formato = 'auto',
      recorte = 'cover',
      sinPerdida = false
    } = opciones

    // Verificar si es URL de Supabase Storage
    if (!url.includes('supabase.co/storage/v1/object/public')) {
      return url
    }

    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === 'public')
      
      if (bucketIndex === -1 || bucketIndex + 1 >= pathParts.length) return url

      const bucketName = pathParts[bucketIndex + 1]
      const filePath = pathParts.slice(bucketIndex + 2).join('/')
      
      // Construir URL de transformación
      const baseTransformUrl = `${urlObj.origin}/storage/v1/render/image/public/${bucketName}/${filePath}`
      
      const params = new URLSearchParams()
      
      // Aplicar transformaciones solo si se especifican
      if (ancho) params.set('width', ancho.toString())
      if (alto) params.set('height', alto.toString())
      if (calidad && calidad !== 100) params.set('quality', calidad.toString())
      if (recorte) params.set('resize', recorte)
      
      // Formato optimizado según navegador
      if (formato === 'auto') {
        if (detectarSoporteWebP()) params.set('format', 'webp')
        else if (detectarSoporteAVIF()) params.set('format', 'avif')
      } else if (formato !== 'original') {
        params.set('format', formato)
      }

      return params.toString() ? `${baseTransformUrl}?${params.toString()}` : baseTransformUrl
    } catch (error) {
      console.error('Error optimizando URL:', error)
      return url
    }
  }, [])

  /**
   * Detecta soporte de formatos modernos en el navegador
   */
  const detectarSoporteWebP = () => {
    if (typeof window === 'undefined') return false
    
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      return canvas.toDataURL('image/webp').indexOf('webp') > -1
    } catch {
      return false
    }
  }

  const detectarSoporteAVIF = () => {
    if (typeof window === 'undefined') return false
    
    try {
      const canvas = document.createElement('canvas')
      canvas.width = 1
      canvas.height = 1
      const dataURL = canvas.toDataURL('image/avif')
      return dataURL.indexOf('avif') > -1
    } catch {
      return false
    }
  }

  /**
   * Analiza el rendimiento de carga de imágenes
   */
  const analizarRendimiento = useCallback(() => {
    const ahora = Date.now()
    const tiempoSesion = ahora - sessionStartRef.current
    
    const estadisticas = {
      tiempoSesion,
      totalCacheadas: cacheRef.current.size,
      imagenesFallidas: imagenesFallidas.size,
      tasaCache: (cacheRef.current.size / (cacheRef.current.size + imagenesFallidas.size)) * 100,
      metricasActuales: metricas
    }

    console.log('📊 Estadísticas de rendimiento de imágenes:', estadisticas)
    return estadisticas
  }, [imagenesFallidas, metricas])

  /**
   * Limpieza de caché y recursos
   */
  const limpiarCache = useCallback(() => {
    const antes = cacheRef.current.size
    
    // Limpiar imágenes antiguas (> 1 hora)
    const ahora = Date.now()
    const limiteTiempo = 60 * 60 * 1000 // 1 hora
    
    for (const [url, datos] of cacheRef.current.entries()) {
      if (ahora - datos.timestamp > limiteTiempo) {
        cacheRef.current.delete(url)
      }
    }
    
    setImagenesCacheadas(new Map())
    setImagenesFallidas(new Set())
    
    console.log(`🧹 Limpieza completada: ${antes - cacheRef.current.size} imágenes eliminadas`)
  }, [])

  /**
   * Hook de efecto para limpieza automática
   */
  useEffect(() => {
    // Limpiar cada 30 minutos
    const intervalo = setInterval(limpiarCache, 30 * 60 * 1000)
    
    return () => clearInterval(intervalo)
  }, [limpiarCache])

  return {
    // Funciones principales
    precargarImagenesCriticas,
    optimizarUrlSupabase,
    analizarRendimiento,
    limpiarCache,
    
    // Estado y métricas
    imagenesCargando,
    imagenesCacheadas,
    imagenesFallidas,
    metricas,
    
    // Utilidades
    detectarSoporteWebP,
    detectarSoporteAVIF
  }
}

export default useSupabaseImageOptimizer