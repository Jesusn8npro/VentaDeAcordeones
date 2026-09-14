import React, { useState } from 'react'
import { ShoppingCart, Check } from 'lucide-react'
import './BotonCarritoAnimado.css'

const BotonCarritoAnimado = ({ 
  producto, 
  cantidad = 1, 
  variante = null, 
  className = '', 
  children = 'Agregar al carrito',
  onAgregar = () => {},
  onError = () => {}
}) => {
  const [estado, setEstado] = useState('normal') // normal, agregando, agregado, error

  const manejarClick = async () => {
    if (estado === 'agregando' || estado === 'agregado') return

    setEstado('agregando')
    
    try {
      await onAgregar(producto, cantidad, variante)
      
      // Mostrar estado de éxito
      setEstado('agregado')
      
    } catch (error) {
      setEstado('error')
      onError(error)
      
      // Volver a normal después de 2 segundos
      setTimeout(() => {
        setEstado('normal')
      }, 2000)
    }
  }

  const obtenerTexto = () => {
    switch (estado) {
      case 'agregando':
        return 'Agregando...'
      case 'agregado':
        return 'Producto añadido'
      case 'error':
        return 'Error - Reintentar'
      default:
        return children
    }
  }

  const obtenerIcono = () => {
    switch (estado) {
      case 'agregando':
        return <div className="spinner" />
      case 'agregado':
        return <Check size={18} />
      case 'error':
        return <ShoppingCart size={18} />
      default:
        return <ShoppingCart size={18} />
    }
  }

  return (
    <button 
      className={`boton-carrito-animado ${estado} ${className}`}
      onClick={manejarClick}
      disabled={estado === 'agregando'}
    >
      <span className="boton-icono">
        {obtenerIcono()}
      </span>
      <span className="boton-texto">
        {obtenerTexto()}
      </span>
      
      {/* Efecto de ondas */}
      {estado === 'agregado' && (
        <div className="ondas-efecto">
          <div className="onda onda-1"></div>
          <div className="onda onda-2"></div>
          <div className="onda onda-3"></div>
        </div>
      )}
    </button>
  )
}

export default BotonCarritoAnimado
