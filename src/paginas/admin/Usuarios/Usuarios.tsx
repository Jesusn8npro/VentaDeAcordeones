import React, { useState, useEffect } from 'react';
import { clienteSupabase } from '../../../configuracion/supabase';
import { useAuth } from '../../../contextos/ContextoAutenticacion';
import ModalUsuario from './ModalUsuario';
import ListaUsuarios from './ListaUsuarios';
import './Usuarios.css';

const FORMULARIO_INICIAL = {
  nombre: '', email: '', rol: 'cliente', telefono: '', foto: '',
  direccion_linea_1: '', direccion_linea_2: '', barrio: '',
  ciudad: '', departamento: '', codigo_postal: '', pais: 'Colombia'
}

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosFiltrados, setUsuariosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [vistaActual, setVistaActual] = useState('tabla');
  const [busqueda, setBusqueda] = useState('');
  const [filtroRol, setFiltroRol] = useState('todos');
  const [filtroDepartamento, setFiltroDepartamento] = useState('todos');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalTipo, setModalTipo] = useState('crear');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
  const [modalConfirmacion, setModalConfirmacion] = useState(false);
  const [usuarioAEliminar, setUsuarioAEliminar] = useState(null);
  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [seleccionados, setSeleccionados] = useState([]);

  const { usuario: usuarioActual } = useAuth();
  const esAdmin = usuarioActual?.rol === 'admin';

  useEffect(() => {
    cargarUsuarios();
  }, []);

  useEffect(() => {
    filtrarUsuarios();
  }, [usuarios, busqueda, filtroRol, filtroDepartamento]);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError(null);

      const { data: dataRPC, error: errorRPC } = await clienteSupabase.rpc('obtener_usuarios_admin');

      if (!errorRPC && Array.isArray(dataRPC)) {
        setUsuarios(dataRPC || []);
      } else {
        const { data, error } = await clienteSupabase
          .from('usuarios')
          .select('*')
          .order('creado_el', { ascending: false });

        if (error) throw error;
        setUsuarios(data || []);
      }
    } catch {
      setError('Error al cargar los usuarios');
    } finally {
      setCargando(false);
    }
  };

  const filtrarUsuarios = () => {
    let resultado = [...usuarios];

    if (busqueda.trim()) {
      resultado = resultado.filter(u =>
        u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.telefono?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    if (filtroRol !== 'todos') {
      resultado = resultado.filter(u => u.rol === filtroRol);
    }

    if (filtroDepartamento !== 'todos') {
      resultado = resultado.filter(u => u.departamento === filtroDepartamento);
    }

    setUsuariosFiltrados(resultado);
    setSeleccionados([]);
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
      setFormulario(FORMULARIO_INICIAL);
    }

    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioSeleccionado(null);
    setFormulario(FORMULARIO_INICIAL);
  };

  const manejarCambioFormulario = (e) => {
    const { name, value } = e.target;
    setFormulario(prev => ({ ...prev, [name]: value }));
  };

  const guardarUsuario = async (e) => {
    e.preventDefault();
    if (!esAdmin) return;

    try {
      setCargando(true);

      if (modalTipo === 'crear') {
        const { error } = await clienteSupabase.from('usuarios').insert([formulario]);
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
    } catch {
      setError('Error al guardar el usuario');
    } finally {
      setCargando(false);
    }
  };

  const confirmarEliminar = (usuario) => {
    if (!esAdmin) return;
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
    } catch {
      setError('Error al eliminar el usuario');
    } finally {
      setCargando(false);
    }
  };

  // Bulk ops
  const toggleSeleccion = (id) => {
    setSeleccionados(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const toggleTodos = () => {
    if (seleccionados.length === usuariosFiltrados.length) {
      setSeleccionados([]);
    } else {
      setSeleccionados(usuariosFiltrados.map(u => u.id));
    }
  };

  const bulkCambiarRol = async (nuevoRol) => {
    if (!esAdmin || seleccionados.length === 0) return;
    try {
      setCargando(true);
      const { error } = await clienteSupabase
        .from('usuarios')
        .update({ rol: nuevoRol })
        .in('id', seleccionados);
      if (error) throw error;
      await cargarUsuarios();
      setSeleccionados([]);
    } catch {
      setError('Error al cambiar rol masivo');
    } finally {
      setCargando(false);
    }
  };

  const bulkEliminar = async () => {
    if (!esAdmin || seleccionados.length === 0) return;
    if (!confirm(`¿Eliminar ${seleccionados.length} usuario(s)? Esta acción no se puede deshacer.`)) return;
    try {
      setCargando(true);
      const { error } = await clienteSupabase
        .from('usuarios')
        .delete()
        .in('id', seleccionados);
      if (error) throw error;
      await cargarUsuarios();
      setSeleccionados([]);
    } catch {
      setError('Error al eliminar usuarios');
    } finally {
      setCargando(false);
    }
  };

  const obtenerIniciales = (nombre) =>
    (nombre || '?').split(' ').map(p => p.charAt(0)).join('').toUpperCase().slice(0, 2);

  const formatearFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

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
      <div className="usuarios-header">
        <div className="header-titulo">
          <h1>Usuarios ({usuarios.length})</h1>
          <p>Gestiona todos los usuarios de la plataforma</p>
        </div>

        <div className="header-acciones">
          <button
            className="btn-nuevo-usuario"
            onClick={() => abrirModal('crear')}
            disabled={cargando}
          >
            + Nuevo Usuario
          </button>

          <div className="vista-toggle">
            <button
              className={`toggle-btn ${vistaActual === 'tabla' ? 'activo' : ''}`}
              onClick={() => setVistaActual('tabla')}
              title="Vista tabla"
            >
              ☰
            </button>
            <button
              className={`toggle-btn ${vistaActual === 'cards' ? 'activo' : ''}`}
              onClick={() => setVistaActual('cards')}
              title="Vista cards"
            >
              ⊞
            </button>
          </div>
        </div>
      </div>

      <div className="usuarios-estadisticas">
        <div className="estadistica-card">
          <div className="estadistica-numero">{usuarios.length}</div>
          <div className="estadistica-label">Total</div>
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

      <div className="usuarios-filtros">
        <div className="filtro-busqueda">
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
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
            <option value="Santander">Santander</option>
          </select>
        </div>
      </div>

      {seleccionados.length > 0 && (
        <div className="bulk-acciones">
          <span className="bulk-info">{seleccionados.length} usuario(s) seleccionado(s)</span>
          <button className="btn-bulk" onClick={() => bulkCambiarRol('admin')}>Hacer admin</button>
          <button className="btn-bulk" onClick={() => bulkCambiarRol('cliente')}>Hacer cliente</button>
          <button className="btn-bulk peligro" onClick={bulkEliminar}>Eliminar seleccionados</button>
          <button className="btn-bulk" onClick={() => setSeleccionados([])}>Cancelar</button>
        </div>
      )}

      {error && (
        <div className="error-mensaje">
          <span>⚠</span>
          {error}
        </div>
      )}

      <ListaUsuarios
        cargando={cargando}
        usuariosFiltrados={usuariosFiltrados}
        vistaActual={vistaActual}
        seleccionados={seleccionados}
        obtenerIniciales={obtenerIniciales}
        formatearFecha={formatearFecha}
        onEditar={(u) => abrirModal('editar', u)}
        onEliminar={confirmarEliminar}
        onToggleSeleccion={toggleSeleccion}
        onToggleTodos={toggleTodos}
      />

      {modalAbierto && (
        <ModalUsuario
          modalTipo={modalTipo}
          formulario={formulario}
          cargando={cargando}
          onCambio={manejarCambioFormulario}
          onGuardar={guardarUsuario}
          onCerrar={cerrarModal}
        />
      )}

      {modalConfirmacion && (
        <div className="modal-overlay" onClick={() => setModalConfirmacion(false)}>
          <div className="modal-confirmacion" onClick={(e) => e.stopPropagation()}>
            <div className="confirmacion-icono">⚠</div>
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
