import React from 'react'
import { X } from 'lucide-react'
import { ESTADOS_CONFIG, ESTADOS_OPCIONES } from './pedidosUtils'

interface Props {
  pedido: any
  nuevoEstado: string
  setNuevoEstado: (v: string) => void
  onCerrar: () => void
  onGuardar: () => void
}

export default function ModalCambioEstado({ pedido, nuevoEstado, setNuevoEstado, onCerrar, onGuardar }: Props) {
  return (
    <div className="ped-modal-overlay" onClick={onCerrar}>
      <div className="ped-modal ped-modal-sm" onClick={e => e.stopPropagation()}>
        <div className="ped-modal-header">
          <h2>Cambiar estado</h2>
          <button className="ped-modal-cerrar" onClick={onCerrar}><X size={18} /></button>
        </div>
        <div className="ped-modal-body">
          <p className="ped-det-lbl">
            Pedido: <strong>TXN-{pedido.numero_pedido || String(pedido.id).slice(0, 8)}</strong>
          </p>
          <select className="ped-select-estado" value={nuevoEstado} onChange={e => setNuevoEstado(e.target.value)}>
            {ESTADOS_OPCIONES.map(e => (
              <option key={e} value={e}>{ESTADOS_CONFIG[e]?.etiqueta || e}</option>
            ))}
          </select>
          <div className="ped-modal-acciones">
            <button className="ped-btn-sec" onClick={onCerrar}>Cancelar</button>
            <button className="ped-btn-prim" onClick={onGuardar}>Guardar</button>
          </div>
        </div>
      </div>
    </div>
  )
}
