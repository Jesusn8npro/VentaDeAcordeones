import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clienteSupabase as supabase } from '../../../configuracion/supabase';
import './AdminBlog.css';

const AdminBlog = () => {
  const [articulos, setArticulos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArticulos = async () => {
      const { data, error } = await supabase
        .from('articulos_web')
        .select('id, titulo, autor, estado_publicacion, slug')
        .order('creado_en', { ascending: false });

      if (error) {
        console.error('Error al obtener los artículos:', error);
        setError('No se pudieron cargar los artículos. Inténtalo de nuevo más tarde.');
      } else {
        setArticulos(data);
      }
    };

    fetchArticulos();
  }, []);

  return (
    <div className="admin-blog-container">
      <div className="admin-blog-header">
        <h1>Gestión de Artículos del Blog</h1>
        <Link to="/admin/crear-articulo" className="btn-crear-articulo">
          Crear Nuevo Artículo
        </Link>
      </div>

      {error && <p className="error-mensaje">{error}</p>}

      <div className="lista-articulos">
        <table>
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {articulos.length > 0 ? (
              articulos.map((articulo) => (
                <tr key={articulo.id}>
                  <td>{articulo.titulo}</td>
                  <td>{articulo.autor}</td>
                  <td>
                    <span className={`estado-publicacion ${articulo.estado_publicacion}`}>
                      {articulo.estado_publicacion}
                    </span>
                  </td>
                  <td>
                    <Link to={`/admin/blog/editar/${articulo.slug}`} className="btn-editar">
                      Editar
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No se encontraron artículos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBlog;