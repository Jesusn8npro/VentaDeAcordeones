import React from 'react'
import { Edit2 } from 'lucide-react'

interface Props {
  item: any
  selec: boolean
  editando: boolean
  editandoValor: string
  inputRef: React.RefObject<HTMLInputElement>
  obtenerEstadoStock: (item: any) => { estado: string; texto: string; clase: string; icono: any }
  formatearPrecio: (v: number) => string
  onToggle: (id: string) => void
  onIniciarEdicion: (item: any) => void
  onGuardarEdicion: (item: any) => void
  onCancelarEdicion: () => void
  onEditandoValorChange: (v: string) => void
  onAbrirModal: (item: any) => void
}

export default function FilaInventario({
  item, selec, editando, editandoValor, inputRef,
  obtenerEstadoStock, formatearPrecio,
  onToggle, onIniciarEdicion, onGuardarEdicion, onCancelarEdicion, onEditandoValorChange, onAbrirModal
}: Props) {
  const est = obtenerEstadoStock(item)
  const IconoEst = est.icono
  return (
    <tr className={`fila-inventario${selec ? ' inv-seleccionada' : ''}`}>
      <td><input type="checkbox" checked={selec} onChange={() => onToggle(item.id)} /></td>
      <td>
        <div className="producto-info">
          <div className="producto-detalles">
            <h4 className="producto-nombre">{item.productos?.nombre || '—'}</h4>
            <p className="producto-sku" style={{ fontSize: '0.75rem', color: 'var(--color-texto-secundario)' }}>
              {formatearPrecio(item.productos?.precio || 0)}
            </p>
          </div>
        </div>
      </td>
      <td className="celda-sku">
        {item.productos?.slug
          ? <code className="sku-codigo">{item.productos.slug}</code>
          : <span style={{ color: 'var(--color-texto-secundario)' }}>—</span>}
      </td>
      <td className="celda-stock-actual">
        {editando ? (
          <div className="inv-inline-edit">
            <input
              ref={inputRef}
              type="number"
              min="0"
              value={editandoValor}
              onChange={e => onEditandoValorChange(e.target.value)}
              onBlur={() => onGuardarEdicion(item)}
              onKeyDown={e => {
                if (e.key === 'Enter') onGuardarEdicion(item)
                if (e.key === 'Escape') onCancelarEdicion()
              }}
              className="inv-inline-input"
            />
          </div>
        ) : (
          <button className="inv-stock-btn" onClick={() => onIniciarEdicion(item)} title="Click para editar">
            <span className={`inv-stock-num${item.cantidad === 0 ? ' inv-zero' : item.cantidad < 5 ? ' inv-crit' : ''}`}>
              {item.cantidad}
            </span>
            <Edit2 size={11} className="inv-edit-hint" />
          </button>
        )}
      </td>
      <td className="celda-stock-minimo">
        <span className="stock-minimo">{item.stock_minimo}</span>
      </td>
      <td className="celda-estado">
        <span className={`inv-sem-badge ${est.clase}`}>
          <IconoEst size={12} /> {est.texto}
        </span>
      </td>
      <td className="celda-valor">
        <span className="valor-total">{formatearPrecio(item.cantidad * (item.productos?.precio || 0))}</span>
      </td>
      <td className="celda-acciones">
        <div className="acciones-inventario">
          <button onClick={() => onAbrirModal(item)} className="accion-boton ajustar" title="Ajustar stock">
            <Edit2 size={14} />
          </button>
        </div>
      </td>
    </tr>
  )
}
