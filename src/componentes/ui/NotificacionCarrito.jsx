import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, ShoppingCart, X } from 'lucide-react'
import './NotificacionCarrito.css'

const NotificacionCarrito = ({ 
  visible, 
  tipo = 'success', // 'success', 'error', 'warning'
  titulo = '',
  mensaje = '',
  duracion = 3000,
  onCerrar 
}) => {
  const [mostrar, setMostrar] = useState(visible)
  const [animacionSalida, setAnimacionSalida] = useState(false)

  useEffect(() => {
    if (visible) {
      setMostrar(true)
      setAnimacionSalida(false)
      
      // Auto-cerrar después de la duración especificada
      const timer = setTimeout(() => {
        cerrarNotificacion()
      }, duracion)

      return () => clearTimeout(timer)
    }
  }, [visible, duracion])

  const cerrarNotificacion = () => {
    setAnimacionSalida(true)
    setTimeout(() => {
      setMostrar(false)
      setAnimacionSalida(false)
      if (onCerrar) onCerrar()
    }, 300)
  }

  const obtenerIcono = () => {
    switch (tipo) {
      case 'success':
        return <CheckCircle size={20} className="icono-success" />
      case 'error':
        return <XCircle size={20} className="icono-error" />
      case 'warning':
        return <ShoppingCart size={20} className="icono-warning" />
      default:
        return <CheckCircle size={20} className="icono-success" />
    }
  }

  const obtenerTituloPorDefecto = () => {
    switch (tipo) {
      case 'success':
        return '¡Producto agregado!'
      case 'error':
        return 'Error al agregar'
      case 'warning':
        return 'Atención'
      default:
        return 'Notificación'
    }
  }

  if (!mostrar) return null

  return (
    <div className={`notificacion-carrito ${tipo} ${animacionSalida ? 'saliendo' : ''}`}>
      <div className="notificacion-contenido">
        <div className="notificacion-icono">
          {obtenerIcono()}
        </div>
        
        <div className="notificacion-texto">
          <h4 className="notificacion-titulo">
            {titulo || obtenerTituloPorDefecto()}
          </h4>
          {mensaje && (
            <p className="notificacion-mensaje">
              {mensaje}
            </p>
          )}
        </div>

        <button 
          className="notificacion-cerrar"
          onClick={cerrarNotificacion}
          aria-label="Cerrar notificación"
        >
          <X size={16} />
        </button>
      </div>

      {/* Barra de progreso */}
      <div className="notificacion-progreso">
        <div 
          className="notificacion-progreso-barra"
          style={{
            animationDuration: `${duracion}ms`
          }}
        />
      </div>
    </div>
  )
}

export default NotificacionCarrito
