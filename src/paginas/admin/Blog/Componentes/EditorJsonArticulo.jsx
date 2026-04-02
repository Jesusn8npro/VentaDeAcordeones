import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import './EditorJsonArticulo.css';

const EditorJsonArticulo = ({ valor, onChange, tipo }) => {
  const [datos, setDatos] = useState(null);
  const [seccionesAbiertas, setSeccionesAbiertas] = useState({});

  const sonValoresIguales = useCallback((val1, val2) => {
    return JSON.stringify(val1) === JSON.stringify(val2);
  }, []);

  useEffect(() => {
    try {
      const datosParseados = typeof valor === 'string' ? JSON.parse(valor) : valor;
      if (!sonValoresIguales(datos, datosParseados)) {
        if (tipo === 'secciones') {
          setDatos(Array.isArray(datosParseados) ? datosParseados : []);
        } else if (tipo === 'cta') {
          setDatos(Array.isArray(datosParseados) ? datosParseados : []);
        }
      }
    } catch (e) {
      console.error("Error al parsear JSON inicial:", e);
      setDatos([]);
    }
  }, [valor, tipo, sonValoresIguales]);

  const manejarCambio = (nuevosDatos) => {
    setDatos(nuevosDatos);
    onChange(nuevosDatos);
  };

  const agregarElemento = () => {
    let nuevoElemento;
    if (tipo === 'secciones') {
      nuevoElemento = { id: Date.now(), tipo: 'parrafo', contenido: '', nivel: 2 };
    } else { // cta
      nuevoElemento = { id: Date.now(), texto: 'Nuevo Botón', url: '#', estilo: 'primario' };
    }
    manejarCambio([...(datos || []), nuevoElemento]);
  };

  const eliminarElemento = (id) => {
    manejarCambio(datos.filter(el => el.id !== id));
  };

  const actualizarElemento = (id, campo, valor) => {
    const nuevosDatos = datos.map(el => {
      if (el.id === id) {
        return { ...el, [campo]: valor };
      }
      return el;
    });
    manejarCambio(nuevosDatos);
  };

  const toggleSeccion = (id) => {
    setSeccionesAbiertas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderizarEditorSecciones = () => (
    <div className="editor-json-secciones">
      {datos && datos.map((seccion, index) => (
        <div key={seccion.id || index} className="seccion-item">
          <div className="seccion-header" onClick={() => toggleSeccion(seccion.id)}>
            {seccionesAbiertas[seccion.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            <span>{seccion.tipo || 'Elemento'} #{index + 1}</span>
            <button onClick={(e) => { e.stopPropagation(); eliminarElemento(seccion.id); }} className="btn-eliminar-seccion"><Trash2 size={16} /></button>
          </div>
          {seccionesAbiertas[seccion.id] && (
            <div className="seccion-contenido">
              <select value={seccion.tipo} onChange={(e) => actualizarElemento(seccion.id, 'tipo', e.target.value)}>
                <option value="encabezado">Encabezado</option>
                <option value="parrafo">Párrafo</option>
                <option value="imagen">Imagen</option>
                <option value="lista">Lista</option>
              </select>
              {seccion.tipo === 'encabezado' && (
                <input type="number" value={seccion.nivel || ''} onChange={(e) => actualizarElemento(seccion.id, 'nivel', parseInt(e.target.value, 10)) } placeholder="Nivel (ej. 2 para H2)" />
              )}
              <textarea value={seccion.contenido || ''} onChange={(e) => actualizarElemento(seccion.id, 'contenido', e.target.value)} placeholder="Contenido..." />
              {seccion.tipo === 'imagen' && (
                <>
                  <input type="text" value={seccion.url || ''} onChange={(e) => actualizarElemento(seccion.id, 'url', e.target.value)} placeholder="URL de la imagen" />
                  <input type="text" value={seccion.alt || ''} onChange={(e) => actualizarElemento(seccion.id, 'alt', e.target.value)} placeholder="Texto alternativo" />
                </>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderizarEditorCTA = () => (
    <div className="editor-json-cta">
      {datos && datos.map((cta, index) => (
        <div key={cta.id || index} className="cta-item">
          <input type="text" value={cta.texto} onChange={(e) => actualizarElemento(cta.id, 'texto', e.target.value)} placeholder="Texto del botón" />
          <input type="text" value={cta.url} onChange={(e) => actualizarElemento(cta.id, 'url', e.target.value)} placeholder="URL" />
          <select value={cta.estilo} onChange={(e) => actualizarElemento(cta.id, 'estilo', e.target.value)}>
            <option value="primario">Primario</option>
            <option value="secundario">Secundario</option>
          </select>
          <button onClick={() => eliminarElemento(cta.id)} className="btn-eliminar-cta"><Trash2 size={16} /></button>
        </div>
      ))}
    </div>
  );

  return (
    <div className="editor-json-container">
      <div className="editor-json-header">
        <h4>{tipo === 'secciones' ? 'Editor de Secciones' : 'Editor de CTA'}</h4>
        <button onClick={agregarElemento} className="btn-agregar">
          <Plus size={16} />
          <span>Agregar</span>
        </button>
      </div>
      {tipo === 'secciones' ? renderizarEditorSecciones() : renderizarEditorCTA()}
    </div>
  );
};

export default EditorJsonArticulo;