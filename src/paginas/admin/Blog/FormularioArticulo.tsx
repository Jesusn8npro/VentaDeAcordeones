import React, { useState, useEffect } from 'react';
import UploaderImagenesArticulo from './Componentes/UploaderImagenesArticulo';
import EditorJsonArticulo from './Componentes/EditorJsonArticulo';
import './FormularioArticulo.css';

const estadoInicialArticulo = {
  titulo: '',
  slug: '',
  resumen_breve: '',
  resumen_completo: '',
  secciones: [],
  cta: [],
  estado_publicacion: 'borrador',
  categorias: [],
  etiquetas: [],
  autor_id: null, // Se debería obtener del usuario autenticado
  meta_titulo: '',
  meta_descripcion: '',
  meta_keywords: '',
  canonical_url: '',
  og_titulo: '',
  og_descripcion: '',
  og_imagen_url: '',
  twitter_card: 'summary_large_image',
};

const FormularioArticulo = ({ articulo, onArticuloChange, onGuardar, cargando }) => {

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    onArticuloChange({ ...articulo, [name]: value });
  };

  const manejarCambioJson = (campo, valor) => {
    onArticuloChange({ ...articulo, [campo]: valor });
  };

  const manejarCambioImagenes = (imagenes) => {
    // Esta función ahora pasará las imágenes al componente padre
    onArticuloChange({ ...articulo, imagenes });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onGuardar(); // El padre ya tiene el estado más reciente del artículo
  };

  if (!articulo) {
    return <div>Cargando formulario...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="formulario-articulo">
      <h2>{articulo.id ? 'Editar Artículo' : 'Crear Artículo'}</h2>

      <div className="card">
        <div className="card-body">
          <div className="form-grupo">
            <label>Estado</label>
            <select name="estado_publicacion" value={articulo.estado_publicacion} onChange={manejarCambio}>
              <option value="borrador">Borrador</option>
              <option value="publicado">Publicado</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-titulo">Contenido Principal</h3>
        </div>
        <div className="card-body">
          <div className="form-grupo">
            <label>Título</label>
            <input type="text" name="titulo" value={articulo.titulo} onChange={manejarCambio} placeholder="El título principal de tu artículo" required />
          </div>

          <div className="form-grupo">
            <label>Slug (URL amigable)</label>
            <input type="text" name="slug" value={articulo.slug} onChange={manejarCambio} placeholder="ejemplo-url-amigable" required />
          </div>

          <div className="form-grupo">
            <label>Resumen Breve</label>
            <textarea name="resumen_breve" value={articulo.resumen_breve} onChange={manejarCambio} rows="3" placeholder="Un resumen corto para vistas previas."></textarea>
          </div>

          <div className="form-grupo">
            <label>Resumen Completo</label>
            <textarea name="resumen_completo" value={articulo.resumen_completo} onChange={manejarCambio} rows="6" placeholder="Descripción más detallada del contenido del artículo."></textarea>
          </div>
        </div>
      </div>

      <div className="card">
        <details className="acordeon-item" open>
          <summary>Cuerpo del Artículo (JSON)</summary>
          <div className="acordeon-contenido">
            <div className="form-grupo">
              <EditorJsonArticulo
                tipo="secciones"
                valor={articulo.secciones}
                onChange={(valor) => manejarCambioJson('secciones', valor)}
              />
            </div>
            <div className="form-grupo">
              <EditorJsonArticulo
                tipo="cta"
                valor={articulo.cta}
                onChange={(valor) => manejarCambioJson('cta', valor)}
              />
            </div>
          </div>
        </details>
      </div>

      <div className="card">
        <details className="acordeon-item">
          <summary>Imágenes del Artículo</summary>
          <div className="acordeon-contenido">
            <div className="form-grupo">
              <UploaderImagenesArticulo
                articuloId={articulo.id}
                onImagenesChange={manejarCambioImagenes}
                imagenesIniciales={articulo.imagenes || []}
              />
            </div>
          </div>
        </details>
      </div>

      <div className="card">
        <details className="acordeon-item">
          <summary>Optimización SEO</summary>
          <div className="acordeon-contenido">
            <div className="form-grupo">
              <label>Meta Título</label>
              <input type="text" name="meta_titulo" value={articulo.meta_titulo || ''} onChange={manejarCambio} placeholder="Título para buscadores (Google, Bing...)" />
            </div>
            <div className="form-grupo">
              <label>Meta Descripción</label>
              <textarea name="meta_descripcion" value={articulo.meta_descripcion || ''} onChange={manejarCambio} rows="3" placeholder="Descripción para buscadores."></textarea>
            </div>
            <div className="form-grupo">
              <label>Meta Keywords</label>
              <input type="text" name="meta_keywords" value={articulo.meta_keywords || ''} onChange={manejarCambio} placeholder="Palabras clave separadas por comas" />
            </div>
            <div className="form-grupo">
              <label>URL Canónica</label>
              <input type="text" name="canonical_url" value={articulo.canonical_url || ''} onChange={manejarCambio} placeholder="URL original si es contenido duplicado" />
            </div>
          </div>
        </details>
      </div>

      <div className="card">
        <details className="acordeon-item">
          <summary>Redes Sociales (Open Graph)</summary>
          <div className="acordeon-contenido">
            <div className="form-grupo">
              <label>Título para Redes Sociales</label>
              <input type="text" name="og_titulo" value={articulo.og_titulo || ''} onChange={manejarCambio} placeholder="Título al compartir en redes sociales" />
            </div>
            <div className="form-grupo">
              <label>Descripción para Redes Sociales</label>
              <textarea name="og_descripcion" value={articulo.og_descripcion || ''} onChange={manejarCambio} rows="3" placeholder="Descripción al compartir en redes."></textarea>
            </div>
            <div className="form-grupo">
              <label>URL de Imagen para Redes Sociales</label>
              <input type="text" name="og_imagen_url" value={articulo.og_imagen_url || ''} onChange={manejarCambio} placeholder="URL de la imagen para vista previa" />
            </div>
            <div className="form-grupo">
              <label>Tipo de Tarjeta de Twitter</label>
              <select name="twitter_card" value={articulo.twitter_card || 'summary_large_image'} onChange={manejarCambio}>
                <option value="summary">Resumen</option>
                <option value="summary_large_image">Resumen con imagen grande</option>
              </select>
            </div>
          </div>
        </details>
      </div>

      <div className="form-acciones">
        <button type="submit" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Guardar Artículo'}
        </button>
      </div>
    </form>
  );
};

export default FormularioArticulo;