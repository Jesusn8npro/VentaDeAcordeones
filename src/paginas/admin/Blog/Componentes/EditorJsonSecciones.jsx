import React, { useState, useEffect } from 'react';

const EditorJsonSecciones = ({ valorInicial, onChange, campo }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (valorInicial) {
      setItems(valorInicial);
    }
  }, [valorInicial]);

  const handleItemChange = (index, subCampo, valor) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [subCampo]: valor };
    setItems(nuevosItems);
    onChange(campo, nuevosItems);
  };

  const agregarItem = () => {
    let nuevoItem = {};
    if (campo === 'secciones') {
      nuevoItem = { tipo: 'parrafo', contenido: '', orden: items.length + 1 };
    } else if (campo === 'cta') {
      nuevoItem = { texto_boton: '', url: '', tipo: 'primario' };
    }
    const nuevosItems = [...items, nuevoItem];
    setItems(nuevosItems);
    onChange(campo, nuevosItems);
  };

  const eliminarItem = (index) => {
    const nuevosItems = items.filter((_, i) => i !== index);
    setItems(nuevosItems);
    onChange(campo, nuevosItems);
  };

  const renderizarCamposItem = (item, index) => {
    if (campo === 'secciones') {
      return (
        <>
          <select value={item.tipo} onChange={(e) => handleItemChange(index, 'tipo', e.target.value)}>
            <option value="parrafo">Párrafo</option>
            <option value="subtitulo">Subtítulo</option>
            <option value="imagen">Imagen</option>
            <option value="lista">Lista</option>
          </select>
          <textarea
            placeholder="Contenido"
            value={item.contenido}
            onChange={(e) => handleItemChange(index, 'contenido', e.target.value)}
          />
        </>
      );
    } else if (campo === 'cta') {
      return (
        <>
          <input
            type="text"
            placeholder="Texto del botón"
            value={item.texto_boton}
            onChange={(e) => handleItemChange(index, 'texto_boton', e.target.value)}
          />
          <input
            type="text"
            placeholder="URL"
            value={item.url}
            onChange={(e) => handleItemChange(index, 'url', e.target.value)}
          />
        </>
      );
    }
    return null;
  };

  return (
    <div className="editor-json">
      <h4>Editor de {campo}</h4>
      {items.map((item, index) => (
        <div key={index} className="editor-item">
          {renderizarCamposItem(item, index)}
          <button type="button" onClick={() => eliminarItem(index)}>Eliminar</button>
        </div>
      ))}
      <button type="button" onClick={agregarItem}>
        Agregar {campo === 'secciones' ? 'Sección' : 'CTA'}
      </button>
    </div>
  );
};

export default EditorJsonSecciones;