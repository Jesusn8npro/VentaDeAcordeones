import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { clienteSupabase } from '../../../../configuracion/supabase'

const PedidosRecientes = () => {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    cargarPedidosRecientes()
  }, [])

  const cargarPedidosRecientes = async () => {
    try {
      const { data: pedidosData, error } = await clienteSupabase
        .from('pedidos')
        .select(`
          *,
          usuarios(nombre, email)
        `)
        .order('creado_el', { ascending: false })
        .limit(5)

      if (error) {
        // Error silencioso para producción
        return
      }

      setPedidos(pedidosData || [])
    } catch (error) {
      // Error silencioso para producción
    } finally {
      setCargando(false)
    }
  }

  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(cantidad)
  }

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const obtenerClaseEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado':
        return 'estado-completado'
      case 'pendiente':
        return 'estado-pendiente'
      case 'cancelado':
        return 'estado-cancelado'
      case 'procesando':
        return 'estado-procesando'
      default:
        return 'estado-pendiente'
    }
  }

  const obtenerTextoEstado = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado':
        return 'Completado'
      case 'pendiente':
        return 'Pendiente'
      case 'cancelado':
        return 'Cancelado'
      case 'procesando':
        return 'Procesando'
      default:
        return 'Pendiente'
    }
  }

  if (cargando) {
    return (
      <div className="pedidos-recientes-card">
        <div className="pedidos-recientes-header">
          <h3 className="pedidos-recientes-titulo">Pedidos Recientes</h3>
        </div>
        <div className="pedidos-recientes-cargando">
          <div className="spinner"></div>
          <span>Cargando pedidos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="pedidos-recientes-card">
      <div className="pedidos-recientes-header">
        <h3 className="pedidos-recientes-titulo">Pedidos Recientes</h3>
        <Link to="/admin/pedidos" className="pedidos-recientes-ver-todos">
          Ver todos
        </Link>
      </div>

      <div className="pedidos-recientes-contenido">
        {pedidos.length === 0 ? (
          <div className="pedidos-recientes-vacio">
            <p>No hay pedidos recientes</p>
          </div>
        ) : (
          <div className="pedidos-recientes-tabla">
            <div className="tabla-header">
              <div className="tabla-columna">Cliente</div>
              <div className="tabla-columna">Pedido</div>
              <div className="tabla-columna">Fecha</div>
              <div className="tabla-columna">Total</div>
              <div className="tabla-columna">Estado</div>
            </div>
            
            <div className="tabla-body">
              {pedidos.map((pedido) => (
                <div key={pedido.id} className="tabla-fila">
                  <div className="tabla-celda">
                    <div className="cliente-info">
                      <div className="cliente-avatar">
                        {pedido.usuarios?.nombre?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                      <div className="cliente-detalles">
                        <span className="cliente-nombre">
                          {pedido.usuarios?.nombre || 'Cliente Anónimo'}
                        </span>
                        <span className="cliente-email">
                          {pedido.usuarios?.email || 'Sin email'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="tabla-celda">
                    <span className="pedido-numero">#{pedido.numero_pedido || pedido.id}</span>
                  </div>
                  
                  <div className="tabla-celda">
                    <span className="pedido-fecha">{formatearFecha(pedido.creado_el)}</span>
                  </div>
                  
                  <div className="tabla-celda">
                    <span className="pedido-total">{formatearMoneda(pedido.total || 0)}</span>
                  </div>
                  
                  <div className="tabla-celda">
                    <span className={`estado-badge ${obtenerClaseEstado(pedido.estado)}`}>
                      {obtenerTextoEstado(pedido.estado)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PedidosRecientes
