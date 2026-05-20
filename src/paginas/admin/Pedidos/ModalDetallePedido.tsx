import React from 'react'
import { X, Package } from 'lucide-react'
import { ESTADOS_CONFIG, formatearPrecio, formatearFechaHora } from './pedidosUtils'

interface Props {
  pedido: any
  onCerrar: () => void
}

export default function ModalDetallePedido({ pedido, onCerrar }: Props) {
  const ui = ESTADOS_CONFIG[pedido.estado] || ESTADOS_CONFIG.pendiente

  return (
    <div className="ped-modal-overlay" onClick={onCerrar}>
      <div className="ped-modal" onClick={e => e.stopPropagation()}>
        <div className="ped-modal-header">
          <h2>Detalle del pedido</h2>
          <button className="ped-modal-cerrar" onClick={onCerrar}><X size={18} /></button>
        </div>
        <div className="ped-modal-body">
          <div className="ped-det-fila">
            <span className="ped-det-lbl">#Pedido</span>
            <span className="ped-det-val">TXN-{pedido.numero_pedido || String(pedido.id).slice(0, 8)}</span>
          </div>
          <div className="ped-det-fila">
            <span className="ped-det-lbl">Cliente</span>
            <span className="ped-det-val">{pedido.usuarios?.nombre || pedido.nombre_cliente || '—'}</span>
          </div>
          <div className="ped-det-fila">
            <span className="ped-det-lbl">Email</span>
            <span className="ped-det-val">{pedido.usuarios?.email || pedido.email_cliente || '—'}</span>
          </div>
          <div className="ped-det-fila">
            <span className="ped-det-lbl">Teléfono</span>
            <span className="ped-det-val">
              {typeof pedido.telefono_cliente === 'object'
                ? pedido.telefono_cliente?.telefono || '—'
                : pedido.telefono_cliente || '—'}
            </span>
          </div>
          <div className="ped-det-fila">
            <span className="ped-det-lbl">Total</span>
            <span className="ped-det-val ped-det-total">{formatearPrecio(Number(pedido.total) || 0)}</span>
          </div>
          <div className="ped-det-fila">
            <span className="ped-det-lbl">Estado</span>
            <span className={`ped-badge ${ui.clase}`}>{ui.etiqueta}</span>
          </div>
          <div className="ped-det-fila">
            <span className="ped-det-lbl">Fecha</span>
            <span className="ped-det-val">{formatearFechaHora(pedido.creado_el)}</span>
          </div>
          <div className="ped-det-fila">
            <span className="ped-det-lbl">Método de pago</span>
            <span className="ped-det-val">{pedido.metodo_pago || '—'}</span>
          </div>
          {pedido.direccion_envio && (
            <div className="ped-det-fila">
              <span className="ped-det-lbl">Dirección</span>
              <span className="ped-det-val">
                {typeof pedido.direccion_envio === 'object'
                  ? JSON.stringify(pedido.direccion_envio)
                  : pedido.direccion_envio}
              </span>
            </div>
          )}
          {Array.isArray(pedido.productos) && pedido.productos.length > 0 && (
            <div className="ped-det-productos">
              <h3>Productos</h3>
              {pedido.productos.map((prod: any, i: number) => (
                <div key={i} className="ped-det-prod-item">
                  <Package size={14} />
                  <span className="ped-det-prod-nombre">{prod.nombre || prod.name || '—'}</span>
                  {prod.cantidad && <span className="ped-det-prod-qty">x{prod.cantidad}</span>}
                  {prod.precio && <span className="ped-det-prod-precio">{formatearPrecio(prod.precio)}</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
