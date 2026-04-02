import { useState, useRef, useEffect } from 'react'

const ImagenProtegida = ({ 
  src, 
  alt, 
  className = '', 
  style = {},
  onClick,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState('')
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef(null)
  const canvasRef = useRef(null)

  useEffect(() => {
    // Crear canvas para renderizar la imagen
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const img = new Image()
    
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Configurar canvas
      canvas.width = img.width
      canvas.height = img.height
      
      // Dibujar imagen en canvas
      ctx.drawImage(img, 0, 0)
      
      // Convertir canvas a data URL
      const dataURL = canvas.toDataURL('image/png')
      setImageSrc(dataURL)
      setIsLoaded(true)
    }
    
    img.onerror = () => {
      // Si falla la carga, usar la imagen original
      setImageSrc(src)
      setIsLoaded(true)
    }
    
    img.src = src
  }, [src])

  const handleContextMenu = (e) => {
    e.preventDefault()
    return false
  }

  const handleDragStart = (e) => {
    e.preventDefault()
    return false
  }

  const handleMouseDown = (e) => {
    // Deshabilitar arrastrar
    e.preventDefault()
  }

  return (
    <div 
      className={`imagen-protegida ${className}`}
      style={{
        position: 'relative',
        display: 'inline-block',
        ...style
      }}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onMouseDown={handleMouseDown}
    >
      {/* Canvas oculto para procesar la imagen */}
      <canvas 
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      
      {/* Imagen protegida */}
      {isLoaded && (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          style={{
            maxWidth: '100%',
            height: 'auto',
            pointerEvents: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            MozUserSelect: 'none',
            msUserSelect: 'none',
            WebkitUserDrag: 'none',
            MozUserDrag: 'none',
            userDrag: 'none',
            ...style
          }}
          draggable={false}
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
          onClick={onClick}
          {...props}
        />
      )}
      
      {/* Overlay de protección - SOLO para imágenes */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'transparent',
          zIndex: 1,
          pointerEvents: 'none' // Cambiar a 'none' para no interferir
        }}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
      />
    </div>
  )
}

export default ImagenProtegida

