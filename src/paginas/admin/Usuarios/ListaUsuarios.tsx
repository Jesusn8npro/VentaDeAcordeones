import React from 'react'

interface Usuario {
  id: string
  nombre: string
  email: string
  rol: string
  telefono?: string
  foto?: string
  ciudad?: string
  departamento?: string
  creado_el: string
}

interface ListaUsuariosProps {
  cargando: boolean
  usuariosFiltrados: Usuario[]
  vistaActual: 'tabla' | 'cards'
  seleccionados: string[]
  obtenerIniciales: (nombre: string) => string
  formatearFecha: (fecha: string) => string
  onEditar: (usuario: Usuario) => void
  onEliminar: (usuario: Usuario) => void
  onToggleSeleccion: (id: string) => void
  onToggleTodos: () => void
}

function AvatarIniciales({ nombre, rol, size = 'sm' }: { nombre: string; rol: string; size?: 'sm' | 'lg' }) {
  const iniciales = (nombre || '?').split(' ').map(p => p.charAt(0)).join('').toUpperCase().slice(0, 2)
  const claseAvatar = rol === 'admin' ? 'avatar-iniciales avatar-admin' : 'avatar-iniciales avatar-cliente'
  const claseCard = rol === 'admin' ? 'avatar-iniciales-card avatar-admin' : 'avatar-iniciales-card avatar-cliente'
  return <div className={size === 'lg' ? claseCard : claseAvatar}>{iniciales}</div>
}

function BadgeRol({ rol }: { rol: string }) {
  const clase = rol === 'admin' ? 'rol-badge rol-admin' : 'rol-badge rol-cliente'
  return <span className={clase}>{rol}</span>
}

export default function ListaUsuarios({
  cargando,
  usuariosFiltrados,
  vistaActual,
  seleccionados,
  obtenerIniciales,
  formatearFecha,
  onEditar,
  onEliminar,
  onToggleSeleccion,
  onToggleTodos
}: ListaUsuariosProps) {
  if (cargando) {
    return (
      <div className="usuarios-cargando">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    )
  }

  if (usuariosFiltrados.length === 0) {
    return (
      <div className="usuarios-vacio">
        <p>No se encontraron usuarios con los filtros aplicados.</p>
      </div>
    )
  }

  const todosSeleccionados = seleccionados.length === usuariosFiltrados.length && usuariosFiltrados.length > 0

  if (vistaActual === 'tabla') {
    return (
      <div className="usuarios-tabla-container">
        <table className="usuarios-tabla">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={todosSeleccionados}
                  onChange={onToggleTodos}
                  title="Seleccionar todos"
                />
              </th>
              <th>Usuario</th>
              <th>Rol</th>
              <th>Teléfono</th>
              <th>Ubicación</th>
              <th>Registrado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuariosFiltrados.map(usuario => (
              <tr key={usuario.id}>
                <td>
                  <input
                    type="checkbox"
                    checked={seleccionados.includes(usuario.id)}
                    onChange={() => onToggleSeleccion(usuario.id)}
                  />
                </td>
                <td>
                  <div className="usuario-info">
                    <div className="usuario-avatar">
                      {usuario.foto ? (
                        <img src={usuario.foto} alt={usuario.nombre} />
                      ) : (
                        <AvatarIniciales nombre={usuario.nombre} rol={usuario.rol} size="sm" />
                      )}
                    </div>
                    <div>
                      <div className="usuario-nombre">{usuario.nombre}</div>
                      <div className="usuario-email">{usuario.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <BadgeRol rol={usuario.rol} />
                </td>
                <td>
                  <span style={{ color: 'var(--color-texto-secundario)', fontSize: '0.875rem' }}>
                    {usuario.telefono || '—'}
                  </span>
                </td>
                <td>
                  <span style={{ color: 'var(--color-texto-secundario)', fontSize: '0.875rem' }}>
                    {usuario.ciudad ? `${usuario.ciudad}${usuario.departamento ? `, ${usuario.departamento}` : ''}` : '—'}
                  </span>
                </td>
                <td>
                  <div className="fecha-registro">{formatearFecha(usuario.creado_el)}</div>
                </td>
                <td>
                  <div className="acciones-usuario">
                    <button className="btn-accion editar" onClick={() => onEditar(usuario)} title="Editar">
                      Editar
                    </button>
                    <button className="btn-accion eliminar" onClick={() => onEliminar(usuario)} title="Eliminar">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="usuarios-cards">
      {usuariosFiltrados.map(usuario => (
        <div key={usuario.id} className="usuario-card">
          <div className="card-header">
            <div className="usuario-avatar-card">
              {usuario.foto ? (
                <img src={usuario.foto} alt={usuario.nombre} />
              ) : (
                <AvatarIniciales nombre={usuario.nombre} rol={usuario.rol} size="lg" />
              )}
            </div>
            <BadgeRol rol={usuario.rol} />
          </div>
          <div className="card-body">
            <h3 className="usuario-nombre-card">{usuario.nombre}</h3>
            <p className="usuario-email-card">{usuario.email}</p>
            {usuario.telefono && (
              <div className="info-item">
                <span>Tel:</span>
                <span>{usuario.telefono}</span>
              </div>
            )}
            {usuario.ciudad && (
              <div className="info-item">
                <span>Ciudad:</span>
                <span>{usuario.ciudad}{usuario.departamento ? `, ${usuario.departamento}` : ''}</span>
              </div>
            )}
            <div className="info-item">
              <span>Registro:</span>
              <span>{formatearFecha(usuario.creado_el)}</span>
            </div>
          </div>
          <div className="card-footer">
            <button className="btn-card-accion editar" onClick={() => onEditar(usuario)}>Editar</button>
            <button className="btn-card-accion eliminar" onClick={() => onEliminar(usuario)}>Eliminar</button>
          </div>
        </div>
      ))}
    </div>
  )
}
