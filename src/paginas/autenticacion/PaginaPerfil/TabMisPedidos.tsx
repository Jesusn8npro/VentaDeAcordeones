import React from 'react'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'

interface Pedido {
  id: string
  numero_pedido?: string
  creado_el: string
  estado?: string
  total?: number
  direccion_envio?: { ciudad?: string }
}

interface TabMisPedidosProps {
  pedidos: Pedido[]
  cargando: boolean
  error: string | null
  formatearFecha: (fecha: string) => string
}

export default function TabMisPedidos({ pedidos, cargando, error, formatearFecha }: TabMisPedidosProps) {
  return (
    <section className="panel">
      <div className="panel-card">
        <div className="panel-card-header">
          <h3>Mis pedidos</h3>
          <p>Historial y seguimiento</p>
        </div>
        <div className="tabla-pedidos grande">
          <div className="tabla-header">
            <span>#</span>
            <span>Fecha</span>
            <span>Estado</span>
            <span>Envio</span>
            <span>Total</span>
          </div>
          {cargando ? (
            <div className="tabla-row"><span>Cargando pedidos...</span></div>
          ) : error ? (
            <div className="tabla-row"><span>Error: {error}</span></div>
          ) : pedidos.length === 0 ? (
            <div className="tabla-row"><span>No tienes pedidos registrados</span></div>
          ) : (
            pedidos.map(p => (
              <div className="tabla-row" key={p.id}>
                <span>{p.numero_pedido || p.id}</span>
                <span>{formatearFecha(p.creado_el)}</span>
                <span className={`estado estado-${(p.estado || 'pendiente').toLowerCase()}`}>
                  {p.estado || 'Pendiente'}
                </span>
                <span>{p?.direccion_envio?.ciudad || '—'}</span>
                <span>{formatearPrecioCOP(p.total || 0)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
