import React from 'react'

interface FormularioUsuario {
  nombre: string
  email: string
  rol: string
  telefono: string
  foto: string
  direccion_linea_1: string
  direccion_linea_2: string
  barrio: string
  ciudad: string
  departamento: string
  codigo_postal: string
  pais: string
}

interface ModalUsuarioProps {
  modalTipo: 'crear' | 'editar'
  formulario: FormularioUsuario
  cargando: boolean
  onCambio: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onGuardar: (e: React.FormEvent) => void
  onCerrar: () => void
}

export default function ModalUsuario({
  modalTipo,
  formulario,
  cargando,
  onCambio,
  onGuardar,
  onCerrar
}: ModalUsuarioProps) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{modalTipo === 'crear' ? '➕ Crear Nuevo Usuario' : '✏️ Editar Usuario'}</h2>
          <button className="btn-cerrar-modal" onClick={onCerrar}>✕</button>
        </div>

        <form onSubmit={onGuardar} className="formulario-usuario">
          <div className="formulario-grid">
            <div className="campo-formulario">
              <label>Nombre Completo *</label>
              <input type="text" name="nombre" value={formulario.nombre} onChange={onCambio} required placeholder="Ingresa el nombre completo" />
            </div>
            <div className="campo-formulario">
              <label>Email *</label>
              <input type="email" name="email" value={formulario.email} onChange={onCambio} required placeholder="correo@ejemplo.com" />
            </div>
            <div className="campo-formulario">
              <label>Rol *</label>
              <select name="rol" value={formulario.rol} onChange={onCambio} required>
                <option value="cliente">Cliente</option>
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="campo-formulario">
              <label>Teléfono</label>
              <input type="tel" name="telefono" value={formulario.telefono} onChange={onCambio} placeholder="+57 300 123 4567" />
            </div>
            <div className="campo-formulario campo-completo">
              <label>URL de Foto</label>
              <input type="url" name="foto" value={formulario.foto} onChange={onCambio} placeholder="https://ejemplo.com/foto.jpg" />
            </div>
            <div className="campo-formulario">
              <label>Dirección Línea 1</label>
              <input type="text" name="direccion_linea_1" value={formulario.direccion_linea_1} onChange={onCambio} placeholder="Calle 123 #45-67" />
            </div>
            <div className="campo-formulario">
              <label>Dirección Línea 2</label>
              <input type="text" name="direccion_linea_2" value={formulario.direccion_linea_2} onChange={onCambio} placeholder="Apartamento, oficina, etc." />
            </div>
            <div className="campo-formulario">
              <label>Barrio</label>
              <input type="text" name="barrio" value={formulario.barrio} onChange={onCambio} placeholder="Nombre del barrio" />
            </div>
            <div className="campo-formulario">
              <label>Ciudad</label>
              <input type="text" name="ciudad" value={formulario.ciudad} onChange={onCambio} placeholder="Medellín, Bogotá, etc." />
            </div>
            <div className="campo-formulario">
              <label>Departamento</label>
              <select name="departamento" value={formulario.departamento} onChange={onCambio}>
                <option value="">Seleccionar departamento</option>
                <option value="Antioquia">Antioquia</option>
                <option value="Bogotá">Bogotá</option>
                <option value="Valle del Cauca">Valle del Cauca</option>
                <option value="Atlántico">Atlántico</option>
                <option value="Santander">Santander</option>
                <option value="Cundinamarca">Cundinamarca</option>
              </select>
            </div>
            <div className="campo-formulario">
              <label>Código Postal</label>
              <input type="text" name="codigo_postal" value={formulario.codigo_postal} onChange={onCambio} placeholder="050001" />
            </div>
            <div className="campo-formulario">
              <label>País</label>
              <input type="text" name="pais" value={formulario.pais} onChange={onCambio} placeholder="Colombia" />
            </div>
          </div>

          <div className="modal-acciones">
            <button type="button" className="btn-cancelar" onClick={onCerrar}>Cancelar</button>
            <button type="submit" className="btn-guardar" disabled={cargando}>
              {cargando ? 'Guardando...' : (modalTipo === 'crear' ? 'Crear Usuario' : 'Guardar Cambios')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
