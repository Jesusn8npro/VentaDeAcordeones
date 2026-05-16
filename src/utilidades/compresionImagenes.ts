/**
 * 🖼️ UTILIDAD DE COMPRESIÓN DE IMÁGENES
 * 
 * Esta utilidad permite comprimir imágenes del lado del cliente antes de subirlas.
 * Es un ADDON que no afecta el flujo existente - úsala cuando quieras optimizar.
 * 
 * Características:
 * - Compresión automática con calidad configurable
 * - Redimensionamiento inteligente
 * - Conversión a formatos modernos (WebP)
 * - Preserva metadatos importantes
 * - Muestra estadísticas de compresión
 */

import Compressor from 'compressorjs'

/**
 * Configuración por defecto para compresión
 */
const CONFIG_DEFAULT = {
  quality: 0.8, // 80% de calidad (buen balance calidad/tamaño)
  maxWidth: 1920, // Ancho máximo para imágenes grandes
  maxHeight: 1080, // Alto máximo para imágenes grandes
  convertSize: 5000000, // 5MB - archivos más grandes se convierten a WebP
  success: null,
  error: null
}

/**
 * Comprime una imagen manteniendo buena calidad
 * 
 * @param {File} archivo - Archivo de imagen a comprimir
 * @param {Object} opciones - Opciones de compresión
 * @returns {Promise<Object>} - Resultado con archivo comprimido y estadísticas
 */
export const comprimirImagen = (archivo, opciones = {}) => {
  return new Promise((resolve, reject) => {
    // Validar que sea un archivo de imagen
    if (!archivo || !archivo.type.startsWith('image/')) {
      reject(new Error('El archivo debe ser una imagen válida'))
      return
    }

    // Combinar opciones con configuración por defecto
    const config = { ...CONFIG_DEFAULT, ...opciones }
    
    // Información del archivo original
    const archivoOriginal = {
      nombre: archivo.name,
      tamaño: archivo.size,
      tipo: archivo.type,
      tamañoFormateado: formatearTamaño(archivo.size)
    }

    new Compressor(archivo, {
      quality: config.quality,
      maxWidth: config.maxWidth,
      maxHeight: config.maxHeight,
      
      // Convertir a WebP si el archivo es muy grande
      convertTypes: archivo.size > config.convertSize ? ['image/webp'] : undefined,
      
      // Mantener orientación original
      checkOrientation: true,
      
      // Callback de éxito
      success(archivoComprimido) {
        // Calcular estadísticas de compresión
        const estadisticas = calcularEstadisticas(archivo, archivoComprimido)
        
        // Resolver con archivo comprimido y estadísticas
        resolve({
          archivoOriginal,
          archivoComprimido,
          estadisticas,
          // Métodos de utilidad
          obtenerURL: () => URL.createObjectURL(archivoComprimido),
          obtenerFormData: (nombreCampo = 'imagen') => {
            const formData = new FormData()
            formData.append(nombreCampo, archivoComprimido)
            return formData
          }
        })
      },
      
      // Callback de error
      error(error) {
        reject(new Error(`Error al comprimir imagen: ${error.message}`))
      }
    })
  })
}

/**
 * Comprime múltiples imágenes en paralelo
 * 
 * @param {FileList|Array} archivos - Lista de archivos a comprimir
 * @param {Object} opciones - Opciones de compresión
 * @returns {Promise<Array>} - Array con resultados de compresión
 */
export const comprimirImagenesMultiples = async (archivos, opciones = {}) => {
  const archivosArray = Array.from(archivos)
  
  try {
    const resultados = await Promise.all(
      archivosArray.map(archivo => comprimirImagen(archivo, opciones))
    )
    
    // Estadísticas totales
    const estadisticasTotales = calcularEstadisticasTotales(resultados)
    
    return {
      resultados,
      estadisticasTotales
    }
  } catch (error) {
    throw error
  }
}

/**
 * Calcula estadísticas de compresión entre archivo original y comprimido
 */
const calcularEstadisticas = (original, comprimido) => {
  const reduccion = original.size - comprimido.size
  const porcentajeReduccion = ((reduccion / original.size) * 100).toFixed(1)
  const factorCompresion = (original.size / comprimido.size).toFixed(2)
  
  return {
    tamaño: {
      original: original.size,
      comprimido: comprimido.size,
      reduccion: reduccion,
      originalFormateado: formatearTamaño(original.size),
      comprimidoFormateado: formatearTamaño(comprimido.size),
      reduccionFormateada: formatearTamaño(reduccion)
    },
    porcentajes: {
      reduccion: parseFloat(porcentajeReduccion),
      compresion: ((1 - comprimido.size / original.size) * 100).toFixed(1)
    },
    factorCompresion: parseFloat(factorCompresion),
    formato: {
      original: original.type,
      comprimido: comprimido.type,
      cambioFormato: original.type !== comprimido.type
    }
  }
}

/**
 * Calcula estadísticas totales para múltiples archivos
 */
const calcularEstadisticasTotales = (resultados) => {
  const totales = resultados.reduce((acc, resultado) => {
    acc.tamaño.original += resultado.estadisticas.tamaño.original
    acc.tamaño.comprimido += resultado.estadisticas.tamaño.comprimido
    acc.cantidad++
    return acc
  }, {
    tamaño: { original: 0, comprimido: 0 },
    cantidad: 0
  })
  
  const reduccionTotal = totales.tamaño.original - totales.tamaño.comprimido
  const porcentajeReduccionTotal = ((reduccionTotal / totales.tamaño.original) * 100).toFixed(1)
  
  return {
    ...totales,
    tamaño: {
      ...totales.tamaño,
      reduccion: reduccionTotal,
      originalFormateado: formatearTamaño(totales.tamaño.original),
      comprimidoFormateado: formatearTamaño(totales.tamaño.comprimido),
      reduccionFormateada: formatearTamaño(reduccionTotal)
    },
    porcentajeReduccion: parseFloat(porcentajeReduccionTotal)
  }
}

/**
 * Formatea tamaño de archivo en unidades legibles
 */
const formatearTamaño = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const tamaños = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamaños[i]
}

/**
 * Obtiene información detallada de una imagen sin comprimirla
 * 
 * @param {File} archivo - Archivo de imagen
 * @returns {Promise<Object>} - Información de la imagen
 */
export const obtenerInfoImagen = (archivo) => {
  return new Promise((resolve, reject) => {
    if (!archivo || !archivo.type.startsWith('image/')) {
      reject(new Error('El archivo debe ser una imagen válida'))
      return
    }
    
    const img = new Image()
    const url = URL.createObjectURL(archivo)
    
    img.onload = () => {
      URL.revokeObjectURL(url) // Limpiar memoria
      
      resolve({
        nombre: archivo.name,
        tamaño: archivo.size,
        tamañoFormateado: formatearTamaño(archivo.size),
        tipo: archivo.type,
        dimensiones: {
          ancho: img.naturalWidth,
          alto: img.naturalHeight,
          aspecto: (img.naturalWidth / img.naturalHeight).toFixed(2)
        },
        fechaModificacion: archivo.lastModified ? new Date(archivo.lastModified) : null
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
 * Configuraciones predefinidas para diferentes casos de uso
 */
export const CONFIGURACIONES_PREDEFINIDAS = {
  // Para imágenes de productos (alta calidad)
  producto: {
    quality: 0.9,
    maxWidth: 1920,
    maxHeight: 1080
  },
  
  // Para thumbnails (tamaño pequeño)
  thumbnail: {
    quality: 0.7,
    maxWidth: 400,
    maxHeight: 400
  },
  
  // Para web (balance calidad/velocidad)
  web: {
    quality: 0.8,
    maxWidth: 1200,
    maxHeight: 800
  },
  
  // Para móviles (tamaño optimizado)
  movil: {
    quality: 0.75,
    maxWidth: 800,
    maxHeight: 600
  }
  ,
  // Ultra compresión: forzar WebP y reducir dimensiones
  ultra: {
    quality: 0.6,
    maxWidth: 1024,
    maxHeight: 768,
    convertSize: 0 // cualquier tamaño se convierte a WebP
  }
  ,
  // Preset aún más agresivo
  extremo: {
    quality: 0.35,
    maxWidth: 800,
    maxHeight: 600,
    convertSize: 0 // fuerza WebP para máxima reducción
  }
}

/**
 * Función de utilidad para usar en el editor existente
 * Esta función es compatible con el flujo actual de ImagenesLanding
 */
export const comprimirParaEditor = async (archivo, tipoImagen = 'web') => {
  try {
    const config = CONFIGURACIONES_PREDEFINIDAS[tipoImagen] || CONFIGURACIONES_PREDEFINIDAS.web
    const resultado = await comprimirImagen(archivo, config)
    
    return {
      archivo: resultado.archivoComprimido,
      estadisticas: resultado.estadisticas,
      url: resultado.obtenerURL()
    }
  } catch (error) {
    // Si falla la compresión, devolver archivo original
    return {
      archivo: archivo,
      estadisticas: null,
      url: URL.createObjectURL(archivo),
      error: error.message
    }
  }
}