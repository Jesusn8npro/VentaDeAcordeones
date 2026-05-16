import React from 'react'
import { ListOrdered, MapPin, CreditCard } from 'lucide-react'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'

interface Pedido {
  id: string
  numero_pedido?: string
  creado_el: string
  estado?: string
  total?: number
}

interface TabResumenProps {
  pedidos: Pedido[]
  cargando: boolean
  error: string | null
  formatearFecha: (fecha: string) => string
}

export default function TabResumen({ pedidos, cargando, error, formatearFecha }: TabResumenProps) {
  return (
    <section className="panel lujo-grid">
      <div className="panel-card panel-bienvenida">
        <div className="panel-card-header">
          <h3>Resumen general</h3>
          <p>Accesos rápidos a tus principales acciones</p>
        </div>
        <div className="panel-card-body grid-acciones">
          <div className="accion-item">
            <ListOrdered size={22} />
            <div>
              <h4>Pedidos</h4>
              <p>Consulta el estado y detalle</p>
            </div>
          </div>
          <div className="accion-item">
            <MapPin size={22} />
            <div>
              <h4>Direcciones</h4>
              <p>Envio y facturación</p>
            </div>
          </div>
          <div className="accion-item">
            <CreditCard size={22} />
            <div>
              <h4>Pagos</h4>
              <p>Gestiona tus métodos</p>
            </div>
          </div>
        </div>
      </div>

      <div className="panel-card panel-resumen-pedidos">
        <div className="panel-card-header">
          <h3>Últimos pedidos</h3>
        </div>
        <div className="tabla-pedidos">
          <div className="tabla-header">
            <span>#</span>
            <span>Fecha</span>
            <span>Estado</span>
            <span>Total</span>
          </div>
          {cargando ? (
            <div className="tabla-row"><span>Cargando...</span></div>
          ) : error ? (
            <div className="tabla-row"><span>Error: {error}</span></div>
          ) : pedidos.length === 0 ? (
            <div className="tabla-row"><span>Sin pedidos aún</span></div>
          ) : (
            pedidos.slice(0, 3).map(p => (
              <div className="tabla-row" key={p.id}>
                <span>{p.numero_pedido || p.id}</span>
                <span>{formatearFecha(p.creado_el)}</span>
                <span className={`estado estado-${(p.estado || 'pendiente').toLowerCase()}`}>
                  {p.estado || 'Pendiente'}
                </span>
                <span>{formatearPrecioCOP(p.total || 0)}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
