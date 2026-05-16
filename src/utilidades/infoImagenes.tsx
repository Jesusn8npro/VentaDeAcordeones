import React from 'react'

/**
 * 📊 UTILIDAD DE INFORMACIÓN DE IMÁGENES
 * 
 * Utilidad OPCIONAL para mostrar información detallada de imágenes en el editor.
 * Puedes agregar estas funciones a tu editor existente sin romper nada.
 * 
 * Características:
 * - Obtiene tamaño real de archivos
 * - Calcula dimensiones de imágenes
 * - Analiza formato y calidad
 * - Estima tiempo de carga
 * - Compatible con URLs de Supabase
 */

/**
 * Obtiene información completa de una imagen
 * 
 * @param {string|File} fuente - URL de imagen o archivo
 * @returns {Promise<Object>} - Información detallada de la imagen
 */
export const obtenerInfoCompleta = async (fuente) => {
  try {
    let infoArchivo = {}
    let infoImagen = {}
    
    // Si es un archivo local
    if (fuente instanceof File) {
      infoArchivo = await analizarArchivo(fuente)
      infoImagen = await analizarImagenArchivo(fuente)
    } 
    // Si es una URL
    else if (typeof fuente === 'string') {
      infoArchivo = await analizarURL(fuente)
      infoImagen = await analizarImagenURL(fuente)
    }
    
    // Combinar información
    const infoCompleta = {
      ...infoArchivo,
      ...infoImagen,
      rendimiento: calcularRendimiento(infoArchivo, infoImagen),
      recomendaciones: generarRecomendaciones(infoArchivo, infoImagen)
    }
    
    return infoCompleta
  } catch (error) {
    return {
      error: error.message,
      disponible: false
    }
  }
}

/**
 * Analiza un archivo de imagen local
 */
const analizarArchivo = async (archivo) => {
  return {
    nombre: archivo.name,
    tamaño: archivo.size,
    tamañoFormateado: formatearTamaño(archivo.size),
    tipo: archivo.type,
    fechaModificacion: archivo.lastModified ? new Date(archivo.lastModified) : null,
    esLocal: true
  }
}

/**
 * Analiza una URL de imagen
 */
const analizarURL = async (url) => {
  try {
    // Intentar obtener información del header
    const response = await fetch(url, { method: 'HEAD' })
    const tamaño = response.headers.get('content-length')
    const tipo = response.headers.get('content-type')
    const fechaModificacion = response.headers.get('last-modified')
    
    return {
      url: url,
      tamaño: tamaño ? parseInt(tamaño) : null,
      tamañoFormateado: tamaño ? formatearTamaño(parseInt(tamaño)) : 'Desconocido',
      tipo: tipo || 'Desconocido',
      fechaModificacion: fechaModificacion ? new Date(fechaModificacion) : null,
      esLocal: false,
      esSupabase: url.includes('supabase')
    }
  } catch (error) {
    // Si falla el HEAD request, intentar con información básica
    return {
      url: url,
      tamaño: null,
      tamañoFormateado: 'No disponible',
      tipo: 'Desconocido',
      fechaModificacion: null,
      esLocal: false,
      esSupabase: url.includes('supabase'),
      error: 'No se pudo obtener información del servidor'
    }
  }
}

/**
 * Analiza dimensiones y propiedades de imagen desde archivo
 */
const analizarImagenArchivo = (archivo) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(archivo)
    
    img.onload = () => {
      URL.revokeObjectURL(url) // Limpiar memoria
      
      resolve({
        dimensiones: {
          ancho: img.naturalWidth,
          alto: img.naturalHeight,
          aspecto: (img.naturalWidth / img.naturalHeight).toFixed(2),
          megapixeles: ((img.naturalWidth * img.naturalHeight) / 1000000).toFixed(1)
        },
        calidad: estimarCalidad(archivo.size, img.naturalWidth, img.naturalHeight)
      })
    }
    
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo cargar la imagen'))
    }
    
    img.src = url
  })
}

/**
 * Analiza dimensiones y propiedades de imagen desde URL
 */
const analizarImagenURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    // Configurar CORS si es necesario
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      resolve({
        dimensiones: {
          ancho: img.naturalWidth,
          alto: img.naturalHeight,
          aspecto: (img.naturalWidth / img.naturalHeight).toFixed(2),
          megapixeles: ((img.naturalWidth * img.naturalHeight) / 1000000).toFixed(1)
        },
        calidad: 'No disponible' // No podemos estimar calidad desde URL
      })
    }
    
    img.onerror = () => {
      reject(new Error('No se pudo cargar la imagen desde la URL'))
    }
    
    img.src = url
  })
}

/**
 * Estima la calidad de una imagen basada en tamaño y dimensiones
 */
const estimarCalidad = (tamaño, ancho, alto) => {
  const pixeles = ancho * alto
  const bytesPerPixel = tamaño / pixeles
  
  if (bytesPerPixel > 3) return 'Muy Alta'
  if (bytesPerPixel > 2) return 'Alta'
  if (bytesPerPixel > 1) return 'Media'
  if (bytesPerPixel > 0.5) return 'Baja'
  return 'Muy Baja'
}

/**
 * Calcula métricas de rendimiento
 */
const calcularRendimiento = (infoArchivo, infoImagen) => {
  const tamaño = infoArchivo.tamaño
  if (!tamaño) return { disponible: false }
  
  // Estimaciones de tiempo de carga (en segundos)
  const tiemposCarga = {
    '3G': (tamaño / (1.5 * 1024 * 1024)) * 8, // 1.5 Mbps
    '4G': (tamaño / (10 * 1024 * 1024)) * 8,  // 10 Mbps
    'WiFi': (tamaño / (50 * 1024 * 1024)) * 8, // 50 Mbps
    'Fibra': (tamaño / (100 * 1024 * 1024)) * 8 // 100 Mbps
  }
  
  return {
    disponible: true,
    tiemposCarga: Object.fromEntries(
      Object.entries(tiemposCarga).map(([conexion, tiempo]) => [
        conexion,
        tiempo > 1 ? `${tiempo.toFixed(1)}s` : `${(tiempo * 1000).toFixed(0)}ms`
      ])
    ),
    impactoSEO: tamaño > 1024 * 1024 ? 'Alto' : tamaño > 500 * 1024 ? 'Medio' : 'Bajo',
    optimizable: tamaño > 500 * 1024
  }
}

/**
 * Genera recomendaciones de optimización
 */
const generarRecomendaciones = (infoArchivo, infoImagen) => {
  const recomendaciones = []
  const tamaño = infoArchivo.tamaño
  const dimensiones = infoImagen.dimensiones
  
  if (!tamaño || !dimensiones) {
    return ['No se puede analizar - información insuficiente']
  }
  
  // Recomendaciones por tamaño
  if (tamaño > 2 * 1024 * 1024) {
    recomendaciones.push('🔴 Archivo muy grande (>2MB) - Comprimir urgentemente')
  } else if (tamaño > 1024 * 1024) {
    recomendaciones.push('🟡 Archivo grande (>1MB) - Considerar compresión')
  } else if (tamaño > 500 * 1024) {
    recomendaciones.push('🟡 Archivo mediano - Compresión opcional')
  } else {
    recomendaciones.push('🟢 Tamaño óptimo para web')
  }
  
  // Recomendaciones por dimensiones
  if (dimensiones.ancho > 1920 || dimensiones.alto > 1080) {
    recomendaciones.push('📐 Dimensiones muy grandes - Redimensionar para web')
  } else if (dimensiones.ancho > 1200 || dimensiones.alto > 800) {
    recomendaciones.push('📐 Dimensiones grandes - Considerar redimensionar')
  }
  
  // Recomendaciones por formato
  if (infoArchivo.tipo === 'image/png' && tamaño > 500 * 1024) {
    recomendaciones.push('🔄 PNG grande - Considerar convertir a WebP o JPEG')
  }
  
  if (infoArchivo.tipo === 'image/jpeg' && tamaño > 1024 * 1024) {
    recomendaciones.push('🔄 JPEG grande - Reducir calidad o convertir a WebP')
  }
  
  // Recomendaciones específicas para Supabase
  if (infoArchivo.esSupabase) {
    recomendaciones.push('⚡ Usar transformaciones de Supabase Storage para optimizar')
  }
  
  return recomendaciones
}

/**
 * Formatea tamaño en unidades legibles
 */
const formatearTamaño = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const tamaños = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamaños[i]
}

/**
 * Componente React para mostrar información de imagen
 * Puedes usar este componente en tu editor existente
 */
export const InfoImagenWidget = ({ fuente, className = '' }) => {
  const [info, setInfo] = React.useState(null)
  const [cargando, setCargando] = React.useState(false)
  
  React.useEffect(() => {
    if (!fuente) return
    
    setCargando(true)
    obtenerInfoCompleta(fuente)
      .then(setInfo)
      .finally(() => setCargando(false))
  }, [fuente])
  
  if (cargando) {
    return (
      <div className={`info-imagen-widget cargando ${className}`}>
        <div className="spinner-pequeño"></div>
        <span>Analizando imagen...</span>
      </div>
    )
  }
  
  if (!info || info.error) {
    return (
      <div className={`info-imagen-widget error ${className}`}>
        <span>⚠️ No se pudo analizar la imagen</span>
      </div>
    )
  }
  
  return (
    <div className={`info-imagen-widget ${className}`}>
      {/* Información básica */}
      <div className="info-basica">
        <div className="tamaño">
          <strong>{info.tamañoFormateado}</strong>
          {info.dimensiones && (
            <span className="dimensiones">
              {info.dimensiones.ancho}×{info.dimensiones.alto}
            </span>
          )}
        </div>
        
        {info.rendimiento?.impactoSEO && (
          <div className={`impacto-seo ${info.rendimiento.impactoSEO.toLowerCase()}`}>
            SEO: {info.rendimiento.impactoSEO}
          </div>
        )}
      </div>
      
      {/* Recomendaciones */}
      {info.recomendaciones && info.recomendaciones.length > 0 && (
        <div className="recomendaciones">
          {info.recomendaciones.slice(0, 2).map((rec, index) => (
            <div key={index} className="recomendacion">
              {rec}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Hook para usar información de imagen en componentes
 */
export const useInfoImagen = (fuente) => {
  const [info, setInfo] = React.useState(null)
  const [cargando, setCargando] = React.useState(false)
  const [error, setError] = React.useState(null)
  
  React.useEffect(() => {
    if (!fuente) {
      setInfo(null)
      setError(null)
      return
    }
    
    setCargando(true)
    setError(null)
    
    obtenerInfoCompleta(fuente)
      .then(resultado => {
        if (resultado.error) {
          setError(resultado.error)
          setInfo(null)
        } else {
          setInfo(resultado)
          setError(null)
        }
      })
      .catch(err => {
        setError(err.message)
        setInfo(null)
      })
      .finally(() => setCargando(false))
  }, [fuente])
  
  return { info, cargando, error }
}