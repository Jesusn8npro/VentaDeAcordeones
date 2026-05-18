import React, { useState, useEffect } from 'react';
import { Link } from '@/compat/router';
import { clienteSupabase as supabase } from '../../../configuracion/supabase';
import './AdminBlog.css';

const AdminBlog = () => {
  const [articulos, setArticulos] = useState([]);
  const [articulosFiltrados, setArticulosFiltrados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [seleccionados, setSeleccionados] = useState([]);

  useEffect(() => {
    cargarArticulos();
  }, []);

  useEffect(() => {
    filtrar();
  }, [articulos, filtroEstado, busqueda]);

  const cargarArticulos = async () => {
    setCargando(true);
    setError(null);
    const { data, error } = await supabase
      .from('articulos_web')
      .select('id, titulo, autor, estado_publicacion, slug, imagen_portada, extracto, creado_en')
      .order('creado_en', { ascending: false });

    if (error) {
      setError('No se pudieron cargar los artículos.');
    } else {
      setArticulos(data || []);
    }
    setCargando(false);
  };

  const filtrar = () => {
    let resultado = [...articulos];

    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(a => a.estado_publicacion === filtroEstado);
    }

    if (busqueda.trim()) {
      resultado = resultado.filter(a =>
        a.titulo?.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    setArticulosFiltrados(resultado);
    setSeleccionados([]);
  };

  const formatearFecha = (fecha) =>
    fecha ? new Date(fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';

  const cambiarEstado = async (id, nuevoEstado) => {
    const { error } = await supabase
      .from('articulos_web')
      .update({ estado_publicacion: nuevoEstado })
      .eq('id', id);
    if (!error) await cargarArticulos();
  };

  const eliminarArticulo = async (id, titulo) => {
    if (!confirm(`¿Eliminar "${titulo}"? Esta acción no se puede deshacer.`)) return;
    const { error } = await supabase.from('articulos_web').delete().eq('id', id);
    if (!error) await cargarArticulos();
  };

  const duplicarArticulo = async (articulo) => {
    const copia = {
      titulo: `${articulo.titulo} (copia)`,
      autor: articulo.autor,
      estado_publicacion: 'borrador',
      slug: `${articulo.slug}-copia-${Date.now()}`,
      imagen_portada: articulo.imagen_portada,
      extracto: articulo.extracto,
    };
    const { error } = await supabase.from('articulos_web').insert([copia]);
    if (!error) await cargarArticulos();
  };

  // Bulk ops
  const toggleSeleccion = (id) => {
    setSeleccionados(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  const toggleTodos = () => {
    setSeleccionados(seleccionados.length === articulosFiltrados.length
      ? []
      : articulosFiltrados.map(a => a.id)
    );
  };

  const bulkCambiarEstado = async (nuevoEstado) => {
    if (seleccionados.length === 0) return;
    const { error } = await supabase
      .from('articulos_web')
      .update({ estado_publicacion: nuevoEstado })
      .in('id', seleccionados);
    if (!error) { await cargarArticulos(); setSeleccionados([]); }
  };

  const bulkEliminar = async () => {
    if (seleccionados.length === 0) return;
    if (!confirm(`¿Eliminar ${seleccionados.length} artículo(s)?`)) return;
    const { error } = await supabase.from('articulos_web').delete().in('id', seleccionados);
    if (!error) { await cargarArticulos(); setSeleccionados([]); }
  };

  const publicados = articulos.filter(a => a.estado_publicacion === 'publicado').length;
  const borradores = articulos.filter(a => a.estado_publicacion === 'borrador').length;

  return (
    <div className="blog-container">
      <div className="blog-header">
        <div className="blog-header-titulo">
          <h1>Blog ({articulos.length})</h1>
          <p>Gestiona los artículos del blog</p>
        </div>
        <Link to="/admin/crear-articulo" className="btn-nuevo-articulo">
          + Nuevo Artículo
        </Link>
      </div>

      <div className="blog-stats">
        <div className="blog-stat">
          <span className="blog-stat-num">{articulos.length}</span>
          <span className="blog-stat-label">Total</span>
        </div>
        <div className="blog-stat">
          <span className="blog-stat-num publicado">{publicados}</span>
          <span className="blog-stat-label">Publicados</span>
        </div>
        <div className="blog-stat">
          <span className="blog-stat-num borrador">{borradores}</span>
          <span className="blog-stat-label">Borradores</span>
        </div>
      </div>

      <div className="blog-filtros">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="blog-busqueda"
        />
        <div className="blog-tabs">
          {['todos', 'publicado', 'borrador'].map(tab => (
            <button
              key={tab}
              className={`blog-tab ${filtroEstado === tab ? 'activo' : ''}`}
              onClick={() => setFiltroEstado(tab)}
            >
              {tab === 'todos' ? 'Todos' : tab === 'publicado' ? 'Publicados' : 'Borradores'}
            </button>
          ))}
        </div>
      </div>

      {seleccionados.length > 0 && (
        <div className="bulk-acciones">
          <span className="bulk-info">{seleccionados.length} artículo(s) seleccionado(s)</span>
          <button className="btn-bulk" onClick={() => bulkCambiarEstado('publicado')}>Publicar</button>
          <button className="btn-bulk" onClick={() => bulkCambiarEstado('borrador')}>Despublicar</button>
          <button className="btn-bulk peligro" onClick={bulkEliminar}>Eliminar</button>
          <button className="btn-bulk" onClick={() => setSeleccionados([])}>Cancelar</button>
        </div>
      )}

      {error && (
        <div className="blog-error">
          <span>⚠</span> {error}
        </div>
      )}

      {cargando ? (
        <div className="blog-cargando">
          <div className="spinner"></div>
          <p>Cargando artículos...</p>
        </div>
      ) : articulosFiltrados.length === 0 ? (
        <div className="blog-vacio">
          <div className="blog-vacio-icono">📝</div>
          <h3>No hay artículos aún</h3>
          <p>¡Crea el primero y empieza a publicar contenido!</p>
          <Link to="/admin/crear-articulo" className="btn-nuevo-articulo">
            + Crear primer artículo
          </Link>
        </div>
      ) : (
        <div className="blog-tabla-container">
          <table className="blog-tabla">
            <thead>
              <tr>
                <th>
                  <input
                    type="checkbox"
                    checked={seleccionados.length === articulosFiltrados.length && articulosFiltrados.length > 0}
                    onChange={toggleTodos}
                  />
                </th>
                <th>Artículo</th>
                <th>Autor</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {articulosFiltrados.map(articulo => (
                <tr key={articulo.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={seleccionados.includes(articulo.id)}
                      onChange={() => toggleSeleccion(articulo.id)}
                    />
                  </td>
                  <td>
                    <div className="articulo-info">
                      {articulo.imagen_portada && (
                        <img
                          src={articulo.imagen_portada}
                          alt={articulo.titulo}
                          className="articulo-thumbnail"
                        />
                      )}
                      <div>
                        <div className="articulo-titulo">{articulo.titulo}</div>
                        {articulo.extracto && (
                          <div className="articulo-extracto">{articulo.extracto.slice(0, 80)}…</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="articulo-autor">{articulo.autor || '—'}</span>
                  </td>
                  <td>
                    <span className={`estado-badge estado-${articulo.estado_publicacion}`}>
                      {articulo.estado_publicacion}
                    </span>
                  </td>
                  <td>
                    <span className="articulo-fecha">{formatearFecha(articulo.creado_en)}</span>
                  </td>
                  <td>
                    <div className="articulo-acciones">
                      <Link to={`/admin/blog/editar/${articulo.slug}`} className="btn-articulo editar">
                        Editar
                      </Link>
                      {articulo.slug && (
                        <a
                          href={`/blog/${articulo.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-articulo ver"
                        >
                          Ver
                        </a>
                      )}
                      <button
                        className="btn-articulo duplicar"
                        onClick={() => duplicarArticulo(articulo)}
                      >
                        Duplicar
                      </button>
                      <button
                        className="btn-articulo toggle-estado"
                        onClick={() => cambiarEstado(
                          articulo.id,
                          articulo.estado_publicacion === 'publicado' ? 'borrador' : 'publicado'
                        )}
                      >
                        {articulo.estado_publicacion === 'publicado' ? 'Despublicar' : 'Publicar'}
                      </button>
                      <button
                        className="btn-articulo eliminar"
                        onClick={() => eliminarArticulo(articulo.id, articulo.titulo)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
