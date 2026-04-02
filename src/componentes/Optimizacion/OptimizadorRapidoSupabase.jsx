/**
 * Implementación Rápida de Optimización de Imágenes Supabase
 * Componente listo para usar que reemplaza las imágenes actuales por versiones optimizadas
 * 
 * @author: Sistema de Optimización Supabase
 * @version: 1.0.0
 */

import React from 'react'
import SupabaseImageOptimizer from './SupabaseImageOptimizer'

/**
 * Componente de reemplazo rápido para optimizar todas las imágenes de Supabase
 * en tu aplicación sin cambiar la estructura existente
 */

// Configuraciones predefinidas para diferentes tipos de imágenes
const CONFIGURACIONES_RAPIDAS = {
  // Para productos en listas/grid
  producto: {
    width: 300,
    height: 300,
    quality: 85,
    format: 'webp',
    loading: 'lazy',
    placeholder: 'blur'
  },
  
  // Para imágenes principales/banners
  banner: {
    width: 1200,
    height: 600,
    quality: 90,
    format: 'auto',
    loading: 'eager',
    placeholder: 'blur',
    priority: true
  },
  
  // Para thumbnails/miniaturas
  thumbnail: {
    width: 150,
    height: 150,
    quality: 80,
    format: 'webp',
    loading: 'lazy',
    placeholder: 'color'
  },
  
  // Para galerías
  galeria: {
    width: 800,
    height: 600,
    quality: 88,
    format: 'auto',
    loading: 'lazy',
    placeholder: 'blur'
  },
  
  // Para imágenes de blog/artículos
  blog: {
    width: 600,
    height: 400,
    quality: 85,
    format: 'webp',
    loading: 'lazy',
    placeholder: 'blur'
  }
}

/**
 * OptimizadorRapidoSupabase - Reemplaza imágenes existentes por versiones optimizadas
 * 
 * @param {Object} props - Propiedades del componente
 * @param {string} props.src - URL de la imagen en Supabase
 * @param {string} props.alt - Texto alternativo
 * @param {string} props.tipo - Tipo de imagen ('producto', 'banner', 'thumbnail', 'galeria', 'blog')
 * @param {Object} props.configPersonalizada - Configuración personalizada (opcional)
 * @param {string} props.className - Clases CSS adicionales
 * @param {Object} props.style - Estilos CSS adicionales
 * @param {Function} props.onLoad - Callback cuando la imagen carga
 * @param {Function} props.onError - Callback cuando hay error
 */
const OptimizadorRapidoSupabase = ({
  src,
  alt,
  tipo = 'producto',
  configPersonalizada,
  className = '',
  style = {},
  onLoad,
  onError,
  ...otrosProps
}) => {
  // Validar que sea una URL de Supabase
  const esUrlSupabase = src && src.includes('supabase.co/storage/v1/object/public')
  
  if (!esUrlSupabase) {
    console.warn('⚠️ La URL no es de Supabase Storage. Usando imagen sin optimización:', src)
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={style}
        onLoad={onLoad}
        onError={onError}
        {...otrosProps}
      />
    )
  }
  
  // Obtener configuración según tipo o usar personalizada
  const configuracion = configPersonalizada || CONFIGURACIONES_RAPIDAS[tipo] || CONFIGURACIONES_RAPIDAS.producto
  
  return (
    <SupabaseImageOptimizer
      src={src}
      alt={alt}
      className={`optimizacion-rapida ${tipo} ${className}`}
      style={style}
      onLoad={onLoad}
      onError={onError}
      {...configuracion}
      {...otrosProps}
    />
  )
}

/**
 * Función de utilidad para reemplazar múltiples imágenes a la vez
 * 
 * @param {Array} imagenes - Array de objetos con { src, alt, tipo, ...otrosProps }
 * @returns {Array} Array de componentes OptimizadorRapidoSupabase
 */
export const optimizarMultiplesImagenes = (imagenes) => {
  return imagenes.map((imagen, index) => (
    <OptimizadorRapidoSupabase
      key={imagen.key || index}
      {...imagen}
    />
  ))
}

/**
 * Wrapper para componentes existentes que usan imágenes
 * Permite optimizar sin cambiar la estructura del componente original
 * 
 * @param {React.Component} ComponenteOriginal - Componente a envolver
 * @param {string} propImagen - Nombre de la prop que contiene la imagen
 * @param {string} tipoImagen - Tipo de imagen para configuración
 */
export const conOptimizacionImagen = (ComponenteOriginal, propImagen = 'imagen', tipoImagen = 'producto') => {
  return React.forwardRef((props, ref) => {
    const imagenUrl = props[propImagen]
    const imagenOptimizada = imagenUrl ? (
      <OptimizadorRapidoSupabase
        src={imagenUrl}
        alt={props.alt || 'Imagen optimizada'}
        tipo={tipoImagen}
        className={props.classNameImagen}
        style={props.styleImagen}
      />
    ) : null
    
    return (
      <ComponenteOriginal
        {...props}
        {...{ [propImagen]: imagenOptimizada }}
        ref={ref}
      />
    )
  })
}

/**
 * Componente de migración gradual - Permite cambiar entre imagen normal y optimizada
 * 
 * @param {Object} props
 * @param {boolean} props.activarOptimizacion - Activar/desactivar optimización
 * @param {string} props.src - URL de la imagen
 * @param {string} props.alt - Texto alternativo
 * @param {string} props.tipo - Tipo de imagen para configuración
 */
const MigradorImagenSupabase = ({ activarOptimizacion = true, src, alt, tipo = 'producto', ...props }) => {
  if (activarOptimizacion) {
    return <OptimizadorRapidoSupabase src={src} alt={alt} tipo={tipo} {...props} />
  }
  
  return <img src={src} alt={alt} {...props} />
}

// Estilos CSS para el optimizador rápido
const ESTILOS_OPTIMIZACION = `
.optimizacion-rapida {
  transition: all 0.3s ease;
  will-change: transform, opacity;
}

.optimizacion-rapida:hover {
  transform: scale(1.02);
}

.optimizacion-rapida.producto {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.optimizacion-rapida.banner {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.optimizacion-rapida.thumbnail {
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.optimizacion-rapida.galeria {
  border-radius: 10px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.12);
}

.optimizacion-rapida.blog {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
`

// Inyectar estilos en el documento
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style')
  styleElement.textContent = ESTILOS_OPTIMIZACION
  document.head.appendChild(styleElement)
}

export {
  OptimizadorRapidoSupabase,
  MigradorImagenSupabase,
  CONFIGURACIONES_RAPIDAS
}

export default OptimizadorRapidoSupabase