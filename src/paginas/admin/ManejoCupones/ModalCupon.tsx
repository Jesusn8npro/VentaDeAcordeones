import React from 'react'
import { XCircle, Percent, DollarSign } from 'lucide-react'

interface FormularioCupon {
  codigo: string
  nombre: string
  descripcion: string
  tipoDescuento: string
  valorDescuento: string
  montoMinimoCompra: string
  descuentoMaximo: string
  usosPorUsuario: number
  usosMaximos: string
  soloprimeraCompra: boolean
  fechaInicio: string
  fechaFin: string
  activo: boolean
}

interface ModalCuponProps {
  modoModal: 'crear' | 'editar' | 'ver'
  formulario: FormularioCupon
  onCambio: (campo: string, valor: string | boolean | number) => void
  onGuardar: (e: React.FormEvent) => void
  onCerrar: () => void
}

export default function ModalCupon({ modoModal, formulario, onCambio, onGuardar, onCerrar }: ModalCuponProps) {
  const soloLectura = modoModal === 'ver'

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-cupon" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            {modoModal === 'crear' && 'Crear Nuevo Cupón'}
            {modoModal === 'editar' && 'Editar Cupón'}
            {modoModal === 'ver' && 'Detalles del Cupón'}
          </h2>
          <button className="boton-cerrar" onClick={onCerrar}>
            <XCircle size={24} />
          </button>
        </div>

        <form onSubmit={onGuardar} className="formulario-cupon">
          <div className="campos-formulario">
            <div className="grupo-campos">
              <h3>Información Básica</h3>
              <div className="fila-campos">
                <div className="campo">
                  <label>Código del Cupón *</label>
                  <input
                    type="text"
                    value={formulario.codigo}
                    onChange={(e) => onCambio('codigo', e.target.value.toUpperCase())}
                    placeholder="Ej: DESCUENTO25"
                    required
                    disabled={soloLectura}
                  />
                </div>
                <div className="campo">
                  <label>Nombre del Cupón *</label>
                  <input
                    type="text"
                    value={formulario.nombre}
                    onChange={(e) => onCambio('nombre', e.target.value)}
                    placeholder="Ej: Descuento de Bienvenida"
                    required
                    disabled={soloLectura}
                  />
                </div>
              </div>
              <div className="campo">
                <label>Descripción</label>
                <textarea
                  value={formulario.descripcion}
                  onChange={(e) => onCambio('descripcion', e.target.value)}
                  placeholder="Descripción opcional del cupón"
                  rows={3}
                  disabled={soloLectura}
                />
              </div>
            </div>

            <div className="grupo-campos">
              <h3>Configuración del Descuento</h3>
              <div className="fila-campos">
                <div className="campo">
                  <label>Tipo de Descuento *</label>
                  <select
                    value={formulario.tipoDescuento}
                    onChange={(e) => onCambio('tipoDescuento', e.target.value)}
                    disabled={soloLectura}
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="monto_fijo">Monto Fijo ($)</option>
                  </select>
                </div>
                <div className="campo">
                  <label>
                    Valor del Descuento *
                    {formulario.tipoDescuento === 'porcentaje' ? ' (%)' : ' (COP)'}
                  </label>
                  <input
                    type="number"
                    value={formulario.valorDescuento}
                    onChange={(e) => onCambio('valorDescuento', e.target.value)}
                    placeholder={formulario.tipoDescuento === 'porcentaje' ? '25' : '50000'}
                    min="0"
                    max={formulario.tipoDescuento === 'porcentaje' ? '100' : undefined}
                    step={formulario.tipoDescuento === 'porcentaje' ? '0.01' : '1000'}
                    required
                    disabled={soloLectura}
                  />
                </div>
              </div>
              <div className="fila-campos">
                <div className="campo">
                  <label>Compra Mínima (COP)</label>
                  <input
                    type="number"
                    value={formulario.montoMinimoCompra}
                    onChange={(e) => onCambio('montoMinimoCompra', e.target.value)}
                    placeholder="100000"
                    min="0"
                    step="1000"
                    disabled={soloLectura}
                  />
                </div>
                {formulario.tipoDescuento === 'porcentaje' && (
                  <div className="campo">
                    <label>Descuento Máximo (COP)</label>
                    <input
                      type="number"
                      value={formulario.descuentoMaximo}
                      onChange={(e) => onCambio('descuentoMaximo', e.target.value)}
                      placeholder="50000"
                      min="0"
                      step="1000"
                      disabled={soloLectura}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="grupo-campos">
              <h3>Limitaciones de Uso</h3>
              <div className="fila-campos">
                <div className="campo">
                  <label>Usos por Usuario</label>
                  <input
                    type="number"
                    value={formulario.usosPorUsuario}
                    onChange={(e) => onCambio('usosPorUsuario', e.target.value)}
                    min="1"
                    disabled={soloLectura}
                  />
                </div>
                <div className="campo">
                  <label>Usos Máximos Totales</label>
                  <input
                    type="number"
                    value={formulario.usosMaximos}
                    onChange={(e) => onCambio('usosMaximos', e.target.value)}
                    placeholder="Ilimitado"
                    min="1"
                    disabled={soloLectura}
                  />
                </div>
              </div>
              <div className="campo-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formulario.soloprimeraCompra}
                    onChange={(e) => onCambio('soloprimeraCompra', e.target.checked)}
                    disabled={soloLectura}
                  />
                  <span className="checkbox-custom"></span>
                  Solo válido para primera compra
                </label>
              </div>
            </div>

            <div className="grupo-campos">
              <h3>Vigencia del Cupón</h3>
              <div className="fila-campos">
                <div className="campo">
                  <label>Fecha de Inicio</label>
                  <input
                    type="date"
                    value={formulario.fechaInicio}
                    onChange={(e) => onCambio('fechaInicio', e.target.value)}
                    disabled={soloLectura}
                  />
                </div>
                <div className="campo">
                  <label>Fecha de Fin</label>
                  <input
                    type="date"
                    value={formulario.fechaFin}
                    onChange={(e) => onCambio('fechaFin', e.target.value)}
                    disabled={soloLectura}
                  />
                </div>
              </div>
            </div>

            <div className="grupo-campos">
              <div className="campo-checkbox">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formulario.activo}
                    onChange={(e) => onCambio('activo', e.target.checked)}
                    disabled={soloLectura}
                  />
                  <span className="checkbox-custom"></span>
                  Cupón activo
                </label>
              </div>
            </div>
          </div>

          {modoModal !== 'ver' && (
            <div className="acciones-modal">
              <button type="button" className="boton-cancelar" onClick={onCerrar}>
                Cancelar
              </button>
              <button type="submit" className="boton-guardar">
                {modoModal === 'crear' ? 'Crear Cupón' : 'Guardar Cambios'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
