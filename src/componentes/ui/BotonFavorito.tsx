import React from 'react'
import { Heart } from 'lucide-react'
import { useFavoritos } from '../../contextos/FavoritosContext'
import './BotonFavorito.css'

/**
 * BotonFavorito - Componente reutilizable para agregar/quitar favoritos
 * 
 * Props:
 * - producto: Objeto del producto
 * - tamaño: 'pequeño', 'normal', 'grande'
 * - variante: 'circular', 'rectangular', 'minimalista'
 * - mostrarTexto: boolean para mostrar texto junto al icono
 * - className: clases CSS adicionales
 */
const BotonFavorito = ({ 
  producto, 
  tamaño = 'normal',
  variante = 'circular',
  mostrarTexto = false,
  className = '',
  ...props 
}) => {
  const { esFavorito, alternarFavorito } = useFavoritos()
  
  if (!producto) return null
  
  const favorito = esFavorito(producto.id)
  
  const manejarClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    alternarFavorito(producto)
  }
  
  const clases = [
    'boton-favorito',
    `tamaño-${tamaño}`,
    `variante-${variante}`,
    favorito ? 'activo' : '',
    className
  ].filter(Boolean).join(' ')
  
  return (
    <button 
      className={clases}
      onClick={manejarClick}
      title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      {...props}
    >
      <Heart 
        size={tamaño === 'pequeño' ? 16 : tamaño === 'grande' ? 24 : 20}
        fill={favorito ? 'currentColor' : 'none'}
        className="icono-corazon"
      />
      {mostrarTexto && (
        <span className="texto-favorito">
          {favorito ? 'En favoritos' : 'Agregar a favoritos'}
        </span>
      )}
    </button>
  )
}

export default BotonFavorito