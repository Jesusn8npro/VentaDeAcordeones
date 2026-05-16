import React from 'react'

interface DireccionEnvio {
  receptor: string
  direccion: string
  ciudad: string
  departamento: string
  codigoPostal: string
  indicaciones: string
}

interface MensajeEstado {
  tipo: 'ok' | 'error'
  texto: string
}

interface TabDireccionEnvioProps {
  direccion: DireccionEnvio
  onChange: (campo: keyof DireccionEnvio, valor: string) => void
  onGuardar: () => void
  guardando: boolean
  cargando: boolean
  mensaje: MensajeEstado | null
}

export default function TabDireccionEnvio({
  direccion,
  onChange,
  onGuardar,
  guardando,
  cargando,
  mensaje
}: TabDireccionEnvioProps) {
  return (
    <section className="panel">
      <div className="panel-card">
        <div className="panel-card-header">
          <h3>Dirección de envío</h3>
          <p>Gestiona tus lugares de entrega</p>
        </div>
        <div className="form-grid">
          <div className="campo">
            <label>Nombre del receptor</label>
            <input
              type="text"
              value={direccion.receptor}
              onChange={(e) => onChange('receptor', e.target.value)}
              placeholder="Nombre y apellido"
            />
          </div>
          <div className="campo">
            <label>Dirección</label>
            <input
              type="text"
              value={direccion.direccion}
              onChange={(e) => onChange('direccion', e.target.value)}
              placeholder="Calle, número, apto"
            />
          </div>
          <div className="campo">
            <label>Ciudad</label>
            <input
              type="text"
              value={direccion.ciudad}
              onChange={(e) => onChange('ciudad', e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Departamento</label>
            <input
              type="text"
              value={direccion.departamento}
              onChange={(e) => onChange('departamento', e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Código Postal</label>
            <input
              type="text"
              value={direccion.codigoPostal}
              onChange={(e) => onChange('codigoPostal', e.target.value)}
            />
          </div>
          <div className="campo campo-col-2">
            <label>Indicaciones</label>
            <textarea
              rows={3}
              value={direccion.indicaciones}
              onChange={(e) => onChange('indicaciones', e.target.value)}
              placeholder="Referencias de entrega"
            />
          </div>
          <div className="campo campo-col-2">
            <button className="btn-primary" onClick={onGuardar} disabled={guardando || cargando}>
              {guardando ? 'Guardando...' : 'Guardar dirección'}
            </button>
          </div>
          {mensaje && (
            <div className="campo campo-col-2" role="alert" aria-live="polite">
              <div className={`alerta ${mensaje.tipo === 'ok' ? 'ok' : 'error'}`}>
                {mensaje.texto}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
