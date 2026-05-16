import React from 'react'

interface FormUsuario {
  nombre: string
  email: string
  telefono: string
  direccion_linea_1: string
  direccion_linea_2: string
  barrio: string
  ciudad: string
  departamento: string
  codigo_postal: string
  pais: string
}

interface MensajeEstado {
  tipo: 'ok' | 'error'
  texto: string
}

interface TabDatosPersonalesProps {
  formUsuario: FormUsuario
  onChange: (campo: keyof FormUsuario, valor: string) => void
  onGuardar: () => void
  guardando: boolean
  cargando: boolean
  mensaje: MensajeEstado | null
}

export default function TabDatosPersonales({
  formUsuario,
  onChange,
  onGuardar,
  guardando,
  cargando,
  mensaje
}: TabDatosPersonalesProps) {
  return (
    <section className="panel">
      <div className="panel-card">
        <div className="panel-card-header">
          <h3>Datos personales</h3>
          <p>Actualiza tu información de perfil</p>
        </div>
        <div className="form-grid">
          <div className="campo">
            <label>Nombre</label>
            <input
              type="text"
              value={formUsuario.nombre}
              onChange={(e) => onChange('nombre', e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Email</label>
            <input type="email" value={formUsuario.email} readOnly />
          </div>
          <div className="campo">
            <label>Teléfono</label>
            <input
              type="text"
              value={formUsuario.telefono}
              onChange={(e) => onChange('telefono', e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Dirección (línea 1)</label>
            <input
              type="text"
              placeholder="Calle, número, apto"
              value={formUsuario.direccion_linea_1}
              onChange={(e) => onChange('direccion_linea_1', e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Dirección (línea 2)</label>
            <input
              type="text"
              placeholder="Barrio, referencias, interior"
              value={formUsuario.direccion_linea_2}
              onChange={(e) => onChange('direccion_linea_2', e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Barrio</label>
            <input
              type="text"
              value={formUsuario.barrio}
              onChange={(e) => onChange('barrio', e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Ciudad</label>
            <input
              type="text"
              value={formUsuario.ciudad}
              onChange={(e) => onChange('ciudad', e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Departamento</label>
            <input
              type="text"
              value={formUsuario.departamento}
              onChange={(e) => onChange('departamento', e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Código Postal</label>
            <input
              type="text"
              value={formUsuario.codigo_postal}
              onChange={(e) => onChange('codigo_postal', e.target.value)}
            />
          </div>
          <div className="campo">
            <label>País</label>
            <input
              type="text"
              value={formUsuario.pais}
              onChange={(e) => onChange('pais', e.target.value)}
            />
          </div>
          <div className="campo campo-col-2">
            <button className="btn-primary" onClick={onGuardar} disabled={guardando || cargando}>
              {guardando ? 'Guardando...' : 'Guardar cambios'}
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
