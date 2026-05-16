import React from 'react'
import { Package, Plus, Minus } from 'lucide-react'

interface AjusteStock {
  tipo: string
  cantidad: string
  motivo: string
}

interface ProductoInventario {
  id: string
  cantidad: number
  productos?: {
    id: string
    nombre?: string
    slug?: string
    precio?: number
  }
}

interface ModalAjusteStockProps {
  productoSeleccionado: ProductoInventario
  ajusteStock: AjusteStock
  onCambioAjuste: (ajuste: AjusteStock) => void
  onGuardar: (e: React.FormEvent) => void
  onCerrar: () => void
}

export default function ModalAjusteStock({
  productoSeleccionado,
  ajusteStock,
  onCambioAjuste,
  onGuardar,
  onCerrar
}: ModalAjusteStockProps) {
  return (
    <div className="modal-overlay">
      <div className="modal-contenido modal-ajuste-stock">
        <div className="modal-header">
          <h3>Ajustar Stock</h3>
          <button onClick={onCerrar} className="modal-cerrar">×</button>
        </div>

        <div className="modal-cuerpo">
          <div className="producto-seleccionado">
            <div className="producto-imagen">
              <Package />
            </div>
            <div className="producto-info">
              <h4>{productoSeleccionado.productos?.nombre}</h4>
              <p>Slug: {productoSeleccionado.productos?.slug}</p>
              <p>Stock actual: <strong>{productoSeleccionado.cantidad} unidades</strong></p>
            </div>
          </div>

          <form onSubmit={onGuardar} className="formulario-ajuste">
            <div className="campo-grupo">
              <label className="campo-label">Tipo de Movimiento</label>
              <div className="radio-grupo">
                <label className="radio-label">
                  <input
                    type="radio"
                    value="entrada"
                    checked={ajusteStock.tipo === 'entrada'}
                    onChange={(e) => onCambioAjuste({ ...ajusteStock, tipo: e.target.value })}
                    className="radio-input"
                  />
                  <Plus className="radio-icono" />
                  <span>Entrada (Agregar stock)</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    value="salida"
                    checked={ajusteStock.tipo === 'salida'}
                    onChange={(e) => onCambioAjuste({ ...ajusteStock, tipo: e.target.value })}
                    className="radio-input"
                  />
                  <Minus className="radio-icono" />
                  <span>Salida (Reducir stock)</span>
                </label>
              </div>
            </div>

            <div className="campo-grupo">
              <label className="campo-label">Cantidad</label>
              <input
                type="number"
                min="1"
                value={ajusteStock.cantidad}
                onChange={(e) => onCambioAjuste({ ...ajusteStock, cantidad: e.target.value })}
                className="campo-input"
                placeholder="Ingresa la cantidad"
                required
              />
            </div>

            <div className="campo-grupo">
              <label className="campo-label">Motivo</label>
              <select
                value={ajusteStock.motivo}
                onChange={(e) => onCambioAjuste({ ...ajusteStock, motivo: e.target.value })}
                className="campo-select"
                required
              >
                <option value="">Seleccionar motivo</option>
                {ajusteStock.tipo === 'entrada' ? (
                  <>
                    <option value="compra">Compra de mercancía</option>
                    <option value="devolucion">Devolución de cliente</option>
                    <option value="ajuste_positivo">Ajuste de inventario</option>
                    <option value="produccion">Producción interna</option>
                    <option value="otro_entrada">Otro motivo</option>
                  </>
                ) : (
                  <>
                    <option value="venta">Venta</option>
                    <option value="dano">Producto dañado</option>
                    <option value="perdida">Pérdida</option>
                    <option value="ajuste_negativo">Ajuste de inventario</option>
                    <option value="devolucion_proveedor">Devolución a proveedor</option>
                    <option value="otro_salida">Otro motivo</option>
                  </>
                )}
              </select>
            </div>

            <div className="resumen-ajuste">
              <div className="resumen-item">
                <span>Stock actual:</span>
                <strong>{productoSeleccionado.cantidad} unidades</strong>
              </div>
              <div className="resumen-item">
                <span>Cambio:</span>
                <strong className={ajusteStock.tipo === 'entrada' ? 'positivo' : 'negativo'}>
                  {ajusteStock.tipo === 'entrada' ? '+' : '-'}{ajusteStock.cantidad || 0} unidades
                </strong>
              </div>
              <div className="resumen-item">
                <span>Nuevo stock:</span>
                <strong>
                  {ajusteStock.cantidad ? (
                    ajusteStock.tipo === 'entrada'
                      ? productoSeleccionado.cantidad + parseInt(ajusteStock.cantidad)
                      : Math.max(0, productoSeleccionado.cantidad - parseInt(ajusteStock.cantidad))
                  ) : productoSeleccionado.cantidad} unidades
                </strong>
              </div>
            </div>

            <div className="modal-acciones">
              <button type="button" onClick={onCerrar} className="boton-cancelar">
                Cancelar
              </button>
              <button type="submit" className="boton-confirmar">
                Confirmar Ajuste
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
