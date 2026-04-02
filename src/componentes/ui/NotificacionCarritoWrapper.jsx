import React from 'react'
import { useCarrito } from '../../contextos/CarritoContext'
import NotificacionCarrito from './NotificacionCarrito'

const NotificacionCarritoWrapper = () => {
  const { notificacion, ocultarNotificacion } = useCarrito()

  return (
    <NotificacionCarrito
      visible={notificacion.visible}
      tipo={notificacion.tipo}
      titulo={notificacion.titulo}
      mensaje={notificacion.mensaje}
      onCerrar={ocultarNotificacion}
    />
  )
}

export default NotificacionCarritoWrapper
