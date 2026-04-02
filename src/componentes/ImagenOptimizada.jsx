/**
 * 🖼️ COMPONENTE DE IMAGEN OPTIMIZADA
 * 
 * Componente OPCIONAL que puedes usar para mostrar imágenes optimizadas.
 * NO reemplaza el código existente - úsalo cuando quieras optimización extra.
 * 
 * Características:
 * - Lazy loading automático
 * - Transformaciones de Supabase Storage
 * - Formatos modernos (WebP) con fallbacks
 * - Placeholder mientras carga
 * - Manejo de errores elegante
 * - Compatible con URLs existentes de Supabase
 */

import React, { useState, useRef, useEffect } from 'react'
import './ImagenOptimizada.css'

/**
 * Componente de imagen optimizada con lazy loading y transformaciones
 */
const ImagenOptimizada = ({
  src,
  alt = '',
  width,
  height,
  className = '',
  placeholder = '/placeholder-imagen.svg',
  calidad = 80,
  formato = 'webp',
  lazy = true,
  mostrarTamaño = false,
  onClick,
  style = {},
  ...props
}) => {
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(!lazy)
  const [tamañoArchivo, setTamañoArchivo] = useState(null)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  /**
   * Genera URL optimizada para Supabase Storage
   */
  const generarUrlOptimizada = (urlOriginal) => {
    if (!urlOriginal) return placeholder

    // Si no es una URL de Supabase, devolver original
    if (!urlOriginal.includes('supabase')) {
      return urlOriginal
    }

    try {
      // Extraer la URL base y el path del archivo
      const url = new URL(urlOriginal)
      const pathSegments = url.pathname.split('/')
      
      // Buscar el índice de 'storage' en el path
      const storageIndex = pathSegments.findIndex(segment => segment === 'storage')
      if (storageIndex === -1) return urlOriginal

      // Construir URL con transformaciones
      const basePath = pathSegments.slice(0, storageIndex + 1).join('/')
      const bucketAndFile = pathSegments.slice(storageIndex + 1).join('/')
      
      // Parámetros de transformación
      const transformaciones = []
      
      if (width) transformaciones.push(`width=${width}`)
      if (height) transformaciones.push(`height=${height}`)
      if (calidad) transformaciones.push(`quality=${calidad}`)
      if (formato) transformaciones.push(`format=${formato}`)
      
      // Si hay transformaciones, agregarlas
      if (transformaciones.length > 0) {
        const transformQuery = transformaciones.join('&')
        return `${url.origin}${basePath}/render/image/authenticated/${bucketAndFile}?${transformQuery}`
      }
      
      return urlOriginal
    } catch (error) {
      // Error silencioso para producción
      return urlOriginal
    }
  }

  /**
   * Obtiene el tamaño del archivo de imagen
   */
  const obtenerTamañoArchivo = async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      const tamaño = response.headers.get('content-length')
      if (tamaño) {
        setTamañoArchivo(formatearTamaño(parseInt(tamaño)))
      }
    } catch (error) {
      console.warn('No se pudo obtener el tamaño del archivo:', error)
    }
  }

  /**
   * Formatea el tamaño en unidades legibles
   */
  const formatearTamaño = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const tamaños = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamaños[i]
  }

  /**
   * Configurar Intersection Observer para lazy loading
   */
  useEffect(() => {
    if (!lazy || visible) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px'
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    observerRef.current = observer

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [lazy, visible])

  /**
   * Obtener tamaño del archivo cuando se carga la imagen
   */
  useEffect(() => {
    if (visible && src && mostrarTamaño) {
      obtenerTamañoArchivo(src)
    }
  }, [visible, src, mostrarTamaño])

  /**
   * Manejar carga exitosa de imagen
   */
  const manejarCarga = () => {
    setCargando(false)
    setError(false)
  }

  /**
   * Manejar error de carga
   */
  const manejarError = () => {
    setCargando(false)
    setError(true)
  }

  // URLs para diferentes formatos (con fallbacks)
  const urlOptimizada = generarUrlOptimizada(src)
  const urlFallback = src || placeholder

  return (
    <div 
      ref={imgRef}
      className={`imagen-optimizada ${className} ${cargando ? 'cargando' : ''} ${error ? 'error' : ''}`}
      style={style}
      onClick={onClick}
    >
      {/* Placeholder mientras carga */}
      {cargando && (
        <div className="imagen-placeholder">
          <div className="spinner"></div>
          <span>Cargando...</span>
        </div>
      )}

      {/* Imagen principal */}
      {visible && (
        <picture>
          {/* Formato moderno (WebP) */}
          {formato === 'webp' && (
            <source 
              srcSet={urlOptimizada} 
              type="image/webp" 
            />
          )}
          
          {/* Fallback a formato original */}
          <img
            src={error ? placeholder : urlFallback}
            alt={alt}
            width={width}
            height={height}
            onLoad={manejarCarga}
            onError={manejarError}
            loading={lazy ? 'lazy' : 'eager'}
            {...props}
          />
        </picture>
      )}

      {/* Información del archivo (opcional) */}
      {mostrarTamaño && tamañoArchivo && !cargando && (
        <div className="info-archivo">
          <span className="tamaño-archivo">{tamañoArchivo}</span>
          {width && height && (
            <span className="dimensiones">{width}×{height}</span>
          )}
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mensaje-error">
          <span>⚠️ Error al cargar imagen</span>
        </div>
      )}
    </div>
  )
}

/**
 * Hook personalizado para usar transformaciones de Supabase
 */
export const useTransformacionSupabase = (url, opciones = {}) => {
  const [urlTransformada, setUrlTransformada] = useState(url)

  useEffect(() => {
    if (!url) return

    const {
      width,
      height,
      calidad = 80,
      formato = 'webp'
    } = opciones

    // Generar URL transformada
    const componente = new ImagenOptimizada({})
    const urlOptimizada = componente.generarUrlOptimizada(url)
    setUrlTransformada(urlOptimizada)
  }, [url, opciones])

  return urlTransformada
}

/**
 * Componente simplificado para casos básicos
 */
export const ImagenRapida = ({ src, alt, className, ...props }) => (
  <ImagenOptimizada
    src={src}
    alt={alt}
    className={className}
    lazy={true}
    formato="webp"
    calidad={80}
    {...props}
  />
)

/**
 * Componente para thumbnails optimizados
 */
export const ThumbnailOptimizado = ({ src, alt, tamaño = 200, ...props }) => (
  <ImagenOptimizada
    src={src}
    alt={alt}
    width={tamaño}
    height={tamaño}
    lazy={true}
    formato="webp"
    calidad={70}
    className="thumbnail"
    {...props}
  />
)

export default ImagenOptimizada