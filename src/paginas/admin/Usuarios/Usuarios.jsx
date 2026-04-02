import React, { useState, useEffect } from 'react';
import { clienteSupabase } from '../../../configuracion/supabase';
import { useAuth } from '../../../contextos/ContextoAutenticacion';
import './Usuarios.css';

const Usuarios = () => {
  // Estados principales
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActual, setVistaActual] = useState('tabla'); // 'tabla' o 'cards'
  
  // Estados para filtros y búsqueda
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  
  // Estados para modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTipo, setModalTipo] = useState('crear'); // 'crear' o 'editar'
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  
  // Estados para formulario
  const [formulario, setFormulario] = useState({
    nombre: '',
    email: '',
    rol: 'cliente',
    telefono: '',
    foto: '',
    direccion_linea_1: '',
    direccion_linea_2: '',
    barrio: '',
    ciudad: '',
    departamento: '',
    codigo_postal: '',
    pais: 'Colombia'
  });

  const { usuario: usuarioActual } = useAuth();

  // Verificar si el usuario actual es administrador
  const esAdmin = usuarioActual?.rol === 'admin';

  // Cargar usuarios al montar el componente
  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Filtrar usuarios cuando cambian los filtros
  useEffect(() => {
    filtrarUsuarios();
  }, [usuarios, busqueda, filtroRol, filtroDepartamento, filtroEstado]);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError(null);

      // Intento 1: usar función RPC (security definer) para admins
      // Esto permite obtener todos los usuarios aunque RLS esté habilitado.
      const { data: dataRPC, error: errorRPC } = await clienteSupabase.rpc('obtener_usuarios_admin')

      if (!errorRPC && Array.isArray(dataRPC)) {
        setUsuarios(dataRPC || [])
      } else {
        // Fallback: consulta directa (estará limitada por RLS si aplica)
        const { data, error } = await clienteSupabase
          .from('usuarios')
          .select('*')
          .order('creado_el', { ascending: false });

        if (error) throw error;
        setUsuarios(data || []);
      }
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError('Error al cargar los usuarios');
    } finally {
      setCargando(false);
    }
  };

  const filtrarUsuarios = () => {
    let usuariosFiltrados = [...usuarios];

    // Filtro por búsqueda
    if (busqueda.trim()) {
      usuariosFiltrados = usuariosFiltrados.filter(usuario =>
        usuario.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.email.toLowerCase().includes(busqueda.toLowerCase()) ||
        usuario.telefono?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por rol
    if (filtroRol !== 'todos') {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => usuario.rol === filtroRol);
    }

    // Filtro por departamento
    if (filtroDepartamento !== 'todos') {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => usuario.departamento === filtroDepartamento);
    }

    // Filtro por estado (activo/inactivo basado en si tiene datos completos)
    if (filtroEstado !== 'todos') {
      usuariosFiltrados = usuariosFiltrados.filter(usuario => {
        const activo = usuario.telefono && usuario.ciudad;
        return filtroEstado === 'activo' ? activo : !activo;
      });
    }

    setUsuariosFiltrados(usuariosFiltrados);
  };

  const abrirModal = (tipo, usuario = null) => {
    if (!esAdmin) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    setModalTipo(tipo);
    setUsuarioSeleccionado(usuario);
    
    if (tipo === 'editar' && usuario) {
      setFormulario({
        nombre: usuario.nombre || '',
        email: usuario.email || '',
        rol: usuario.rol || 'cliente',
        telefono: usuario.telefono || '',
        foto: usuario.foto || '',
        direccion_linea_1: usuario.direccion_linea_1 || '',
        direccion_linea_2: usuario.direccion_linea_2 || '',
        barrio: usuario.barrio || '',
        ciudad: usuario.ciudad || '',
        departamento: usuario.departamento || '',
        codigo_postal: usuario.codigo_postal || '',
        pais: usuario.pais || 'Colombia'
      });
    } else {
      setFormulario({
        nombre: '',
        email: '',
        rol: 'cliente',
        telefono: '',
        foto: '',
        direccion_linea_1: '',
        direccion_linea_2: '',
        barrio: '',
        ciudad: '',
        departamento: '',
        codigo_postal: '',
        pais: 'Colombia'
      });
    }
    
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
    setFormulario({
      nombre: '',
      email: '',
      rol: 'cliente',
      telefono: '',
      foto: '',
      direccion_linea_1: '',
      direccion_linea_2: '',
      barrio: '',
      ciudad: '',
      departamento: '',
      codigo_postal: '',
      pais: 'Colombia'
    });
  };

  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    
    if (!esAdmin) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    try {
      setCargando(true);

      if (modalTipo === 'crear') {
        const { error } = await clienteSupabase
          .from('usuarios')
          .insert([formulario]);

        if (error) throw error;
      } else {
        const { error } = await clienteSupabase
          .from('usuarios')
          .update(formulario)
          .eq('id', usuarioSeleccionado.id);

        if (error) throw error;
      }

      await cargarUsuarios();
      cerrarModal();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      setError('Error al guardar el usuario');
    } finally {
      setCargando(false);
    }
  };

  const confirmarEliminar = (usuario) => {
    if (!esAdmin) {
      alert('No tienes permisos para realizar esta acción');
      return;
    }

    setUsuarioAEliminar(usuario);
    setModalConfirmacion(true);
  };

  const eliminarUsuario = async () => {
    if (!esAdmin || !usuarioAEliminar) return;

    try {
      setCargando(true);

      const { error } = await clienteSupabase
        .from('usuarios')
        .delete()
        .eq('id', usuarioAEliminar.id);

      if (error) throw error;

      await cargarUsuarios();
      setModalConfirmacion(false);
      setUsuarioAEliminar(null);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError('Error al eliminar el usuario');
    } finally {
      setCargando(false);
    }
  };

  const obtenerIniciales = (nombre) => {
    return nombre
      .split(' ')
      .map(palabra => palabra.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatearFecha = (fecha) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const obtenerColorRol = (rol) => {
    const colores = {
      admin: '#dc2626',
      vendedor: '#059669',
      cliente: '#0284c7'
    };
    return colores[rol] || '#6b7280';
  };

  if (!esAdmin) {
    return (
      <div className="usuarios-sin-permisos">
        <div className="sin-permisos-contenido">
          <div className="sin-permisos-icono">🔒</div>
          <h2>Acceso Denegado</h2>
          <p>No tienes permisos para acceder a la administración de usuarios.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="usuarios-container">
      {/* Header */}
      <div className="usuarios-header">
        <div className="header-titulo">
          <h1>👥 Administración de Usuarios</h1>
          <p>Gestiona todos los usuarios de la plataforma</p>
        </div>
        
        <div className="header-acciones">
          <button 
            className="btn-nuevo-usuario"
            onClick={() => abrirModal('crear')}
            disabled={cargando}
          >
            <span>➕</span>
            Nuevo Usuario
          </button>
          
          <div className="vista-toggle">
            <button 
              className={`toggle-btn ${vistaActual === 'tabla' ? 'activo' : ''}`}
              onClick={() => setVistaActual('tabla')}
            >
              📋
            </button>
            <button 
              className={`toggle-btn ${vistaActual === 'cards' ? 'activo' : ''}`}
              onClick={() => setVistaActual('cards')}
            >
              🃏
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="usuarios-filtros">
        <div className="filtro-busqueda">
          <input
            type="text"
            placeholder="🔍 Buscar usuarios..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="input-busqueda"
          />
        </div>
        
        <div className="filtros-selectores">
          <select 
            value={filtroRol} 
            onChange={(e) => setFiltroRol(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">Todos los roles</option>
            <option value="admin">Administradores</option>
            <option value="vendedor">Vendedores</option>
            <option value="cliente">Clientes</option>
          </select>
          
          <select 
            value={filtroDepartamento} 
            onChange={(e) => setFiltroDepartamento(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">Todos los departamentos</option>
            <option value="Antioquia">Antioquia</option>
            <option value="Bogotá">Bogotá</option>
            <option value="Valle del Cauca">Valle del Cauca</option>
            <option value="Atlántico">Atlántico</option>
          </select>
          
          <select 
            value={filtroEstado} 
            onChange={(e) => setFiltroEstado(e.target.value)}
            className="filtro-select"
          >
            <option value="todos">Todos los estados</option>
            <option value="activo">Activos</option>
            <option value="inactivo">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="usuarios-estadisticas">
        <div className="estadistica-card">
          <div className="estadistica-numero">{usuarios.length}</div>
          <div className="estadistica-label">Total Usuarios</div>
        </div>
        <div className="estadistica-card">
          <div className="estadistica-numero">{usuarios.filter(u => u.rol === 'admin').length}</div>
          <div className="estadistica-label">Administradores</div>
        </div>
        <div className="estadistica-card">
          <div className="estadistica-numero">{usuarios.filter(u => u.rol === 'cliente').length}</div>
          <div className="estadistica-label">Clientes</div>
        </div>
        <div className="estadistica-card">
          <div className="estadistica-numero">{usuariosFiltrados.length}</div>
          <div className="estadistica-label">Filtrados</div>
        </div>
      </div>

      {/* Contenido principal */}
      {error && (
        <div className="error-mensaje">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {cargando ? (
        <div className="usuarios-cargando">
          <div className="spinner"></div>
          <p>Cargando usuarios...</p>
        </div>
      ) : (
        <>
          {vistaActual === 'tabla' ? (
            <div className="usuarios-tabla-container">
              <table className="usuarios-tabla">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Rol</th>
                    <th>Contacto</th>
                    <th>Ubicación</th>
                    <th>Registro</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map(usuario => (
                    <tr key={usuario.id}>
                      <td>
                        <div className="usuario-info">
                          <div className="usuario-avatar">
                            {usuario.foto ? (
                              <img src={usuario.foto} alt={usuario.nombre} />
                            ) : (
                              <div className="avatar-iniciales">
                                {obtenerIniciales(usuario.nombre)}
                              </div>
                            )}
                          </div>
                          <div className="usuario-datos">
                            <div className="usuario-nombre">{usuario.nombre}</div>
                            <div className="usuario-email">{usuario.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span 
                          className="rol-badge"
                          style={{ backgroundColor: obtenerColorRol(usuario.rol) }}
                        >
                          {usuario.rol}
                        </span>
                      </td>
                      <td>
                        <div className="contacto-info">
                          {usuario.telefono && (
                            <div className="telefono">📞 {usuario.telefono}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="ubicacion-info">
                          {usuario.ciudad && (
                            <div className="ciudad">🏙️ {usuario.ciudad}</div>
                          )}
                          {usuario.departamento && (
                            <div className="departamento">{usuario.departamento}</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="fecha-registro">
                          {formatearFecha(usuario.creado_el)}
                        </div>
                      </td>
                      <td>
                        <div className="acciones-usuario">
                          <button 
                            className="btn-accion editar"
                            onClick={() => abrirModal('editar', usuario)}
                            title="Editar usuario"
                          >
                            ✏️
                          </button>
                          <button 
                            className="btn-accion eliminar"
                            onClick={() => confirmarEliminar(usuario)}
                            title="Eliminar usuario"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="usuarios-cards">
              {usuariosFiltrados.map(usuario => (
                <div key={usuario.id} className="usuario-card">
                  <div className="card-header">
                    <div className="usuario-avatar-card">
                      {usuario.foto ? (
                        <img src={usuario.foto} alt={usuario.nombre} />
                      ) : (
                        <div className="avatar-iniciales-card">
                          {obtenerIniciales(usuario.nombre)}
                        </div>
                      )}
                    </div>
                    <span 
                      className="rol-badge-card"
                      style={{ backgroundColor: obtenerColorRol(usuario.rol) }}
                    >
                      {usuario.rol}
                    </span>
                  </div>
                  
                  <div className="card-body">
                    <h3 className="usuario-nombre-card">{usuario.nombre}</h3>
                    <p className="usuario-email-card">{usuario.email}</p>
                    
                    {usuario.telefono && (
                      <div className="info-item">
                        <span className="info-icon">📞</span>
                        <span>{usuario.telefono}</span>
                      </div>
                    )}
                    
                    {usuario.ciudad && (
                      <div className="info-item">
                        <span className="info-icon">🏙️</span>
                        <span>{usuario.ciudad}, {usuario.departamento}</span>
                      </div>
                    )}
                    
                    <div className="info-item">
                      <span className="info-icon">📅</span>
                      <span>Registro: {formatearFecha(usuario.creado_el)}</span>
                    </div>
                  </div>
                  
                  <div className="card-footer">
                    <button 
                      className="btn-card-accion editar"
                      onClick={() => abrirModal('editar', usuario)}
                    >
                      ✏️ Editar
                    </button>
                    <button 
                      className="btn-card-accion eliminar"
                      onClick={() => confirmarEliminar(usuario)}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal para crear/editar usuario */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={cerrarModal}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {modalTipo === 'crear' ? '➕ Crear Nuevo Usuario' : '✏️ Editar Usuario'}
              </h2>
              <button className="btn-cerrar-modal" onClick={cerrarModal}>✕</button>
            </div>
            
            <form onSubmit={guardarUsuario} className="formulario-usuario">
              <div className="formulario-grid">
                <div className="campo-formulario">
                  <label>Nombre Completo *</label>
                  <input
                    type="text"
                    name="nombre"
                    value={formulario.nombre}
                    onChange={manejarCambioFormulario}
                    required
                    placeholder="Ingresa el nombre completo"
                  />
                </div>
                
                <div className="campo-formulario">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formulario.email}
                    onChange={manejarCambioFormulario}
                    required
                    placeholder="correo@ejemplo.com"
                  />
                </div>
                
                <div className="campo-formulario">
                  <label>Rol *</label>
                  <select
                    name="rol"
                    value={formulario.rol}
                    onChange={manejarCambioFormulario}
                    required
                  >
                    <option value="cliente">Cliente</option>
                    <option value="vendedor">Vendedor</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
                
                <div className="campo-formulario">
                  <label>Teléfono</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formulario.telefono}
                    onChange={manejarCambioFormulario}
                    placeholder="+57 300 123 4567"
                  />
                </div>
                
                <div className="campo-formulario campo-completo">
                  <label>URL de Foto</label>
                  <input
                    type="url"
                    name="foto"
                    value={formulario.foto}
                    onChange={manejarCambioFormulario}
                    placeholder="https://ejemplo.com/foto.jpg"
                  />
                </div>
                
                <div className="campo-formulario">
                  <label>Dirección Línea 1</label>
                  <input
                    type="text"
                    name="direccion_linea_1"
                    value={formulario.direccion_linea_1}
                    onChange={manejarCambioFormulario}
                    placeholder="Calle 123 #45-67"
                  />
                </div>
                
                <div className="campo-formulario">
                  <label>Dirección Línea 2</label>
                  <input
                    type="text"
                    name="direccion_linea_2"
                    value={formulario.direccion_linea_2}
                    onChange={manejarCambioFormulario}
                    placeholder="Apartamento, oficina, etc."
                  />
                </div>
                
                <div className="campo-formulario">
                  <label>Barrio</label>
                  <input
                    type="text"
                    name="barrio"
                    value={formulario.barrio}
                    onChange={manejarCambioFormulario}
                    placeholder="Nombre del barrio"
                  />
                </div>
                
                <div className="campo-formulario">
                  <label>Ciudad</label>
                  <input
                    type="text"
                    name="ciudad"
                    value={formulario.ciudad}
                    onChange={manejarCambioFormulario}
                    placeholder="Medellín, Bogotá, etc."
                  />
                </div>
                
                <div className="campo-formulario">
                  <label>Departamento</label>
                  <select
                    name="departamento"
                    value={formulario.departamento}
                    onChange={manejarCambioFormulario}
                  >
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
                  <input
                    type="text"
                    name="codigo_postal"
                    value={formulario.codigo_postal}
                    onChange={manejarCambioFormulario}
                    placeholder="050001"
                  />
                </div>
                
                <div className="campo-formulario">
                  <label>País</label>
                  <input
                    type="text"
                    name="pais"
                    value={formulario.pais}
                    onChange={manejarCambioFormulario}
                    placeholder="Colombia"
                  />
                </div>
              </div>
              
              <div className="modal-acciones">
                <button type="button" className="btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar" disabled={cargando}>
                  {cargando ? 'Guardando...' : (modalTipo === 'crear' ? 'Crear Usuario' : 'Guardar Cambios')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar */}
      {modalConfirmacion && (
        <div className="modal-overlay" onClick={() => setModalConfirmacion(false)}>
          <div className="modal-confirmacion" onClick={(e) => e.stopPropagation()}>
            <div className="confirmacion-icono">⚠️</div>
            <h3>¿Eliminar Usuario?</h3>
            <p>
              ¿Estás seguro de que deseas eliminar a <strong>{usuarioAEliminar?.nombre}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="confirmacion-acciones">
              <button 
                className="btn-cancelar-confirmacion"
                onClick={() => setModalConfirmacion(false)}
              >
                Cancelar
              </button>
              <button 
                className="btn-confirmar-eliminacion"
                onClick={eliminarUsuario}
                disabled={cargando}
              >
                {cargando ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;