import React, { useMemo } from 'react'
import { Lock, ChevronRight } from 'lucide-react'
import { formatearPrecioCOP } from '../../utilidades/formatoPrecio'

interface FormState {
  nombre: string
  apellido: string
  email: string
  telefono: string
  direccion: string
  apto: string
  barrio: string
  departamento: string
  ciudad: string
}

interface Errores {
  nombre?: string
  apellido?: string
  email?: string
  telefono?: string
  direccion?: string
  departamento?: string
  ciudad?: string
  general?: string
}

interface FormularioDireccionCODProps {
  form: FormState
  errores: Errores
  manejarCambioForm: (campo: string, valor: string) => void
  onSubmit: (e: React.FormEvent) => void
  total: number
}

const DEPARTAMENTOS_CO = [
  'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá',
  'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare',
  'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo',
  'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
  'Valle del Cauca', 'Vaupés', 'Vichada'
]

const FormularioDireccionCOD = ({ form, errores, manejarCambioForm, onSubmit, total }: FormularioDireccionCODProps) => (
  <form onSubmit={onSubmit} className="cod-formulario">
    <h3 className="cod-form-titulo">Datos de envío</h3>

    <div className="cod-form-grupo-doble">
      <div className="cod-form-grupo">
        <input
          type="text"
          placeholder="Nombre"
          value={form.nombre}
          onChange={(e) => manejarCambioForm('nombre', e.target.value)}
          className={errores.nombre ? 'cod-error' : ''}
        />
        {errores.nombre && <span className="cod-error-texto">{errores.nombre}</span>}
      </div>
      <div className="cod-form-grupo">
        <input
          type="text"
          placeholder="Apellido"
          value={form.apellido}
          onChange={(e) => manejarCambioForm('apellido', e.target.value)}
          className={errores.apellido ? 'cod-error' : ''}
        />
        {errores.apellido && <span className="cod-error-texto">{errores.apellido}</span>}
      </div>
    </div>

    <div className="cod-form-grupo">
      <input
        type="email"
        placeholder="Correo electrónico"
        value={form.email}
        onChange={(e) => manejarCambioForm('email', e.target.value)}
        className={errores.email ? 'cod-error' : ''}
      />
      {errores.email && <span className="cod-error-texto">{errores.email}</span>}
    </div>

    <div className="cod-form-grupo">
      <input
        type="tel"
        placeholder="Teléfono (ej: 3001234567)"
        value={form.telefono}
        onChange={(e) => manejarCambioForm('telefono', e.target.value)}
        className={errores.telefono ? 'cod-error' : ''}
      />
      {errores.telefono && <span className="cod-error-texto">{errores.telefono}</span>}
    </div>

    <div className="cod-form-grupo">
      <input
        type="text"
        placeholder="Dirección completa"
        value={form.direccion}
        onChange={(e) => manejarCambioForm('direccion', e.target.value)}
        className={errores.direccion ? 'cod-error' : ''}
      />
      {errores.direccion && <span className="cod-error-texto">{errores.direccion}</span>}
    </div>

    <div className="cod-form-grupo-doble">
      <div className="cod-form-grupo">
        <input
          type="text"
          placeholder="Apto/Casa (opcional)"
          value={form.apto}
          onChange={(e) => manejarCambioForm('apto', e.target.value)}
        />
      </div>
      <div className="cod-form-grupo">
        <input
          type="text"
          placeholder="Barrio"
          value={form.barrio}
          onChange={(e) => manejarCambioForm('barrio', e.target.value)}
        />
      </div>
    </div>

    <div className="cod-form-grupo-doble">
      <div className="cod-form-grupo">
        <select
          value={form.departamento}
          onChange={(e) => manejarCambioForm('departamento', e.target.value)}
          className={errores.departamento ? 'cod-error' : ''}
        >
          <option value="">Selecciona departamento</option>
          {DEPARTAMENTOS_CO.map(dep => (
            <option key={dep} value={dep}>{dep}</option>
          ))}
        </select>
        {errores.departamento && <span className="cod-error-texto">{errores.departamento}</span>}
      </div>
      <div className="cod-form-grupo">
        <input
          type="text"
          placeholder="Ciudad"
          value={form.ciudad}
          onChange={(e) => manejarCambioForm('ciudad', e.target.value)}
          className={errores.ciudad ? 'cod-error' : ''}
        />
        {errores.ciudad && <span className="cod-error-texto">{errores.ciudad}</span>}
      </div>
    </div>

    {errores.general && <div className="cod-error-general">{errores.general}</div>}

    <button type="submit" className="cod-cta-principal">
      <Lock size={20} />
      Confirmar Pedido - {formatearPrecioCOP(total)}
      <ChevronRight size={20} />
    </button>
  </form>
)

export default FormularioDireccionCOD
