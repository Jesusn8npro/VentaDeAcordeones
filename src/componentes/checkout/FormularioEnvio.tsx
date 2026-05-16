import React from 'react'

const DEPARTAMENTOS = [
  'Amazonas','Antioquia','Arauca','Atlántico','Bolívar','Boyacá','Caldas',
  'Caquetá','Casanare','Cauca','Cesar','Chocó','Córdoba','Cundinamarca',
  'Guainía','Guaviare','Huila','La Guajira','Magdalena','Meta','Nariño',
  'Norte de Santander','Putumayo','Quindío','Risaralda','San Andrés',
  'Santander','Sucre','Tolima','Valle del Cauca','Vaupés','Vichada'
]

export default function FormularioEnvio({ datosEnvio, manejarCambio }) {
  return (
    <div className="step-contenido">
      <form className="formulario-envio" onSubmit={e => e.preventDefault()}>
        <div className="fila-formulario">
          <div className="campo-formulario">
            <label>Nombre *</label>
            <input type="text" value={datosEnvio.nombre} onChange={e => manejarCambio('nombre', e.target.value)} placeholder="Tu nombre" required />
          </div>
          <div className="campo-formulario">
            <label>Apellido *</label>
            <input type="text" value={datosEnvio.apellido} onChange={e => manejarCambio('apellido', e.target.value)} placeholder="Tu apellido" required />
          </div>
        </div>

        <div className="fila-formulario">
          <div className="campo-formulario">
            <label>Email *</label>
            <input type="email" value={datosEnvio.email} onChange={e => manejarCambio('email', e.target.value)} placeholder="tu@email.com" required />
          </div>
          <div className="campo-formulario">
            <label>Teléfono *</label>
            <input type="tel" value={datosEnvio.telefono} onChange={e => manejarCambio('telefono', e.target.value)} placeholder="300 123 4567" required />
          </div>
        </div>

        <div className="fila-formulario">
          <div className="campo-formulario">
            <label>Tipo de documento *</label>
            <select value={datosEnvio.tipoDocumento} onChange={e => manejarCambio('tipoDocumento', e.target.value)} required>
              <option value="">Seleccionar</option>
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="PP">Pasaporte</option>
              <option value="NIT">NIT</option>
            </select>
          </div>
          <div className="campo-formulario">
            <label>Número de documento *</label>
            <input type="text" value={datosEnvio.numeroDocumento} onChange={e => manejarCambio('numeroDocumento', e.target.value)} placeholder="Ej: 12345678" required />
          </div>
        </div>

        <div className="campo-formulario">
          <label>Dirección completa *</label>
          <input type="text" value={datosEnvio.direccion} onChange={e => manejarCambio('direccion', e.target.value)} placeholder="Calle 123 #45-67, Apto 8B" required />
        </div>

        <div className="fila-formulario">
          <div className="campo-formulario">
            <label>Ciudad *</label>
            <input type="text" value={datosEnvio.ciudad} onChange={e => manejarCambio('ciudad', e.target.value)} placeholder="Bogotá" required />
          </div>
          <div className="campo-formulario">
            <label>Departamento *</label>
            <select value={datosEnvio.departamento} onChange={e => manejarCambio('departamento', e.target.value)} required>
              <option value="">Seleccionar</option>
              {DEPARTAMENTOS.map(d => <option key={d} value={d.toLowerCase()}>{d}</option>)}
            </select>
          </div>
          <div className="campo-formulario">
            <label>Código postal</label>
            <input type="text" value={datosEnvio.codigoPostal} onChange={e => manejarCambio('codigoPostal', e.target.value)} placeholder="110111" />
          </div>
        </div>

        <div className="campo-formulario">
          <label>Instrucciones especiales</label>
          <textarea value={datosEnvio.instrucciones} onChange={e => manejarCambio('instrucciones', e.target.value)} placeholder="Ej: Tocar el timbre, casa azul..." rows={3} />
        </div>
      </form>
    </div>
  )
}
