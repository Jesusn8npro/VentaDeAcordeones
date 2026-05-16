import React, { useState } from 'react'
import './ImagenOptimizada.css'

const PLACEHOLDER_SVG = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f1f3f5'/%3E%3Ctext x='50%25' y='50%25' font-family='system-ui' font-size='14' fill='%23adb5bd' text-anchor='middle' dy='.3em'%3ESin imagen%3C%2Ftext%3E%3C%2Fsvg%3E`

/**
 * Genera URL optimizada para Supabase Storage Image Transform API.
 */
export const optimizarUrlSupabase = (url: string, width: number, height: number): string => {
  if (!url || !url.includes('/storage/v1/object/public/')) return url
  return url
    .replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
    + `?width=${width}&height=${height}&resize=cover&quality=80&format=webp`
}

interface ImagenOptimizadaProps {
  src?: string
  alt?: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  onClick?: () => void
  style?: React.CSSProperties
}

const ImagenOptimizada = ({
  src,
  alt = '',
  width,
  height,
  className = '',
  priority = false,
  onClick,
  style = {},
}: ImagenOptimizadaProps) => {
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(false)

  const manejarCarga = () => setCargando(false)
  const manejarError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    setCargando(false)
    setError(true)
    ;(e.currentTarget as HTMLImageElement).src = PLACEHOLDER_SVG
  }

  const srcEfectivo = (!src || error) ? PLACEHOLDER_SVG : src

  return (
    <div
      className={`imagen-optimizada ${className} ${cargando ? 'cargando' : ''}`}
      style={style}
      onClick={onClick}
    >
      {cargando && <div className="imagen-skeleton" aria-hidden="true" />}
      <img
        src={srcEfectivo}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={manejarCarga}
        onError={manejarError}
      />
    </div>
  )
}

/**
 * Componente simplificado para thumbnails.
 */
export const ThumbnailOptimizado = ({
  src,
  alt,
  tamaño = 200,
  ...props
}: { src?: string; alt?: string; tamaño?: number; [key: string]: unknown }) => (
  <ImagenOptimizada
    src={src}
    alt={alt}
    width={tamaño}
    height={tamaño}
    className="thumbnail"
    {...(props as Partial<ImagenOptimizadaProps>)}
  />
)

export default ImagenOptimizada
