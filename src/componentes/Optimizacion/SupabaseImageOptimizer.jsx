import React, { useState, useEffect, useRef, useCallback } from 'react'

/**
 * Componente optimizado para cargar imágenes desde Supabase Storage
 * Implementa: lazy loading, WebP conversion, cache, placeholders y manejo de errores
 * 
 * @author: Sistema de Optimización Supabase
 * @version: 1.0.0
 */

const SupabaseImageOptimizer = ({
  src,
  alt = 'Imagen',
  width,
  height,
  quality = 80,
  format = 'auto', // auto, webp, avif, original
  loading = 'lazy',
  placeholder = 'blur',
  errorImage = '/imagen-no-disponible.jpg',
  className = '',
  style = {},
  onLoad,
  onError,
  priority = false,
  cache = true,
  retryAttempts = 3,
  retryDelay = 1000,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  // Cache de imágenes en memoria
  const imageCache = useRef(new Map())

  /**
   * Optimiza la URL de Supabase para mejor rendimiento
   */
  const optimizarUrl = useCallback((url) => {
    if (!url || typeof url !== 'string') return ''

    // Verificar si es URL de Supabase
    if (!url.includes('supabase.co/storage/v1/object/public')) {
      return url
    }

    // Parsear la URL original
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/')
    const bucketIndex = pathParts.indexOf('public') + 1
    
    if (bucketIndex === 0 || bucketIndex >= pathParts.length) return url

    const bucketName = pathParts[bucketIndex]
    const filePath = pathParts.slice(bucketIndex + 1).join('/')
    
    // Construir URL optimizada con transformaciones
    const params = new URLSearchParams()
    
    if (width) params.set('width', width.toString())
    if (height) params.set('height', height.toString())
    if (quality && quality !== 100) params.set('quality', quality.toString())
    
    // Seleccionar formato optimizado
    if (format === 'auto') {
      // Detectar soporte del navegador
      if (supportsWebP()) params.set('format', 'webp')
      else if (supportsAVIF()) params.set('format', 'avif')
    } else if (format !== 'original') {
      params.set('format', format)
    }

    // Construir URL final
    const baseUrl = `${urlObj.origin}/storage/v1/render/image/public/${bucketName}/${filePath}`
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl
  }, [width, height, quality, format])

  /**
   * Detecta soporte de WebP en el navegador
   */
  const supportsWebP = () => {
    if (typeof window === 'undefined') return false
    
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    
    return canvas.toDataURL('image/webp').indexOf('webp') > -1
  }

  /**
   * Detecta soporte de AVIF en el navegador
   */
  const supportsAVIF = () => {
    if (typeof window === 'undefined') return false
    
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    
    try {
      return canvas.toDataURL('image/avif').indexOf('avif') > -1
    } catch {
      return false
    }
  }

  /**
   * Genera placeholder de baja calidad mientras carga
   */
  const generarPlaceholder = useCallback((url) => {
    if (!url || placeholder !== 'blur') return ''
    
    // Crear versión tiny de la imagen (10x10 píxeles)
    const placeholderUrl = optimizarUrl(url).replace(/width=\d+/, 'width=10').replace(/height=\d+/, 'height=10')
    return placeholderUrl
  }, [optimizarUrl, placeholder])

  /**
   * Intenta cargar la imagen con reintentos
   */
  const cargarImagen = useCallback(async (imageUrl, isRetry = false) => {
    if (!imageUrl) return

    // Verificar cache
    if (cache && imageCache.current.has(imageUrl)) {
      setImageSrc(imageCache.current.get(imageUrl))
      setIsLoading(false)
      return
    }

    try {
      // Crear imagen temporal para precarga
      const tempImg = new Image()
      
      tempImg.onload = () => {
        // Guardar en cache
        if (cache) {
          imageCache.current.set(imageUrl, imageUrl)
        }
        
        setImageSrc(imageUrl)
        setIsLoading(false)
        setHasError(false)
        
        if (onLoad) {
          onLoad({ target: tempImg, src: imageUrl })
        }
      }

      tempImg.onerror = () => {
        if (retryCount < retryAttempts && !isRetry) {
          // Reintentar después de un delay
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
            cargarImagen(imageUrl, true)
          }, retryDelay)
        } else {
          // Falló después de todos los intentos
          setHasError(true)
          setIsLoading(false)
          setImageSrc(errorImage)
          
          if (onError) {
            onError(new Error('Error al cargar imagen'))
          }
        }
      }

      tempImg.src = imageUrl
    } catch (error) {
      console.error('Error en carga de imagen:', error)
      setHasError(true)
      setIsLoading(false)
      setImageSrc(errorImage)
      
      if (onError) {
        onError(error)
      }
    }
  }, [cache, retryCount, retryAttempts, retryDelay, errorImage, onLoad, onError])

  /**
   * Implementa Intersection Observer para lazy loading
   */
  useEffect(() => {
    if (!src || priority) {
      // Cargar inmediatamente si es prioritaria
      const optimizedSrc = optimizarUrl(src)
      cargarImagen(optimizedSrc)
      return
    }

    if (loading === 'lazy' && typeof IntersectionObserver !== 'undefined') {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const optimizedSrc = optimizarUrl(src)
              cargarImagen(optimizedSrc)
              
              // Dejar de observar después de cargar
              if (observerRef.current && imgRef.current) {
                observerRef.current.unobserve(imgRef.current)
              }
            }
          })
        },
        {
          rootMargin: '50px', // Cargar 50px antes de entrar en vista
          threshold: 0.01
        }
      )

      if (imgRef.current) {
        observerRef.current.observe(imgRef.current)
      }
    } else {
      // Fallback para navegadores sin IntersectionObserver
      const optimizedSrc = optimizarUrl(src)
      cargarImagen(optimizedSrc)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [src, loading, priority, optimizarUrl, cargarImagen])

  /**
   * Renderizado con placeholder de carga
   */
  const renderPlaceholder = () => {
    if (placeholder === 'blur' && !hasError) {
      const placeholderSrc = generarPlaceholder(src)
      return (
        <img
          src={placeholderSrc}
          alt=""
          className={`${className} imagen-placeholder`}
          style={{
            ...style,
            filter: 'blur(5px)',
            transform: 'scale(1.1)',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          aria-hidden="true"
        />
      )
    }

    if (placeholder === 'color') {
      return (
        <div
          className="imagen-placeholder-color"
          style={{
            backgroundColor: '#f0f0f0',
            width: width || '100%',
            height: height || '200px',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        />
      )
    }

    return null
  }

  return (
    <div
      className={`supabase-image-container ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        width: width || 'auto',
        height: height || 'auto',
        ...style
      }}
      ref={imgRef}
    >
      {isLoading && renderPlaceholder()}
      
      <img
        src={imageSrc}
        alt={alt}
        className={`supabase-image ${hasError ? 'imagen-error' : ''}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease, transform 0.3s ease',
          display: isLoading && placeholder ? 'none' : 'block'
        }}
        loading={loading}
        decoding="async"
        {...props}
      />

      {hasError && (
        <div className="imagen-error-overlay">
          <span>❌ Error al cargar imagen</span>
        </div>
      )}
    </div>
  )
}

// PropTypes para validación de tipos
if (process.env.NODE_ENV !== 'production') {
  SupabaseImageOptimizer.propTypes = {
    src: (props, propName, componentName) => {
      if (!props[propName] || typeof props[propName] !== 'string') {
        return new Error(
          `Invalid prop ${propName} supplied to ${componentName}. Expected a non-empty string.`
        )
      }
      return null
    },
    alt: PropTypes.string,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    quality: PropTypes.number,
    format: PropTypes.oneOf(['auto', 'webp', 'avif', 'original']),
    loading: PropTypes.oneOf(['lazy', 'eager']),
    placeholder: PropTypes.oneOf(['blur', 'color', 'none']),
    errorImage: PropTypes.string,
    className: PropTypes.string,
    style: PropTypes.object,
    onLoad: PropTypes.func,
    onError: PropTypes.func,
    priority: PropTypes.bool,
    cache: PropTypes.bool,
    retryAttempts: PropTypes.number,
    retryDelay: PropTypes.number
  }
}

// Configuración por defecto optimizada
SupabaseImageOptimizer.defaultProps = {
  alt: 'Imagen optimizada desde Supabase',
  quality: 80,
  format: 'auto',
  loading: 'lazy',
  placeholder: 'blur',
  errorImage: '/imagen-no-disponible.jpg',
  priority: false,
  cache: true,
  retryAttempts: 3,
  retryDelay: 1000
}

export default SupabaseImageOptimizer