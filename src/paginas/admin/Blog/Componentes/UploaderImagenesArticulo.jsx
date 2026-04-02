import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, Upload, Trash2, Loader, AlertCircle } from 'lucide-react';
import './UploaderImagenesArticulo.css';

const UploaderImagenesArticulo = ({ onImagenesChange, imagenesIniciales = [] }) => {
  const [imagenes, setImagenes] = useState([]);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    // Inicializa el estado con una estructura unificada
    const imagenesEstructuradas = imagenesIniciales.map(img => ({
      id: img.id || `id_${Date.now()}`,
      url: img.url_imagen || img.url, // URL de la imagen ya subida
      alt_text: img.alt_text || '',
      tipo_imagen: img.tipo_imagen || 'contenido',
      nombre_archivo: img.nombre_archivo,
      archivo: null, // No hay archivo local para imágenes existentes
      estado: 'subido',
    }));
    setImagenes(imagenesEstructuradas);
  }, [imagenesIniciales]);

  const onDrop = useCallback((acceptedFiles) => {
    setCargando(true);
    const nuevasImagenes = acceptedFiles.map(file => ({
      id: `local_${Date.now()}_${Math.random()}`,
      url: URL.createObjectURL(file), // URL temporal para vista previa
      alt_text: '',
      tipo_imagen: 'contenido',
      archivo: file, // El objeto File real
      estado: 'local', // Nuevo estado para archivos no subidos
    }));

    const listaActualizada = [...imagenes, ...nuevasImagenes];
    setImagenes(listaActualizada);
    onImagenesChange(listaActualizada); // Notificar al padre
    setCargando(false);
  }, [imagenes, onImagenesChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] },
    disabled: cargando,
  });

  const eliminarImagen = (id) => {
    const confirmacion = window.confirm('¿Estás seguro de que quieres eliminar esta imagen?');
    if (!confirmacion) return;

    const nuevasImagenes = imagenes.filter(img => img.id !== id);
    setImagenes(nuevasImagenes);
    onImagenesChange(nuevasImagenes); // Notificar al padre
  };

  const actualizarCampo = (id, campo, valor) => {
    const nuevasImagenes = imagenes.map(img => {
      if (img.id === id) {
        return { ...img, [campo]: valor };
      }
      return img;
    });
    setImagenes(nuevasImagenes);
    onImagenesChange(nuevasImagenes); // Notificar al padre
  };

  return (
    <div className="uploader-articulo-container">
      <div {...getRootProps({ className: `dropzone ${isDragActive ? 'active' : ''}` })}>
        <input {...getInputProps()} />
        <Upload className="upload-icon" />
        {isDragActive ? (
          <p>Suelta las imágenes aquí...</p>
        ) : (
          <p>Arrastra y suelta imágenes, o haz clic para seleccionar</p>
        )}
      </div>

      {cargando && (
        <div className="uploader-spinner">
          <Loader className="animate-spin" />
          <p>Procesando imágenes...</p>
        </div>
      )}

      <div className="lista-imagenes-container">
        {imagenes.map((imagen) => (
          <div key={imagen.id} className={`imagen-card ${imagen.estado}`}>
            <div className="imagen-preview">
              <img src={imagen.url} alt={imagen.alt_text || 'preview'} />
              {imagen.estado === 'error' && <div className="imagen-overlay error"><AlertCircle /></div>}
            </div>
            <div className="imagen-detalles">
              <input
                type="text"
                value={imagen.alt_text}
                onChange={(e) => actualizarCampo(imagen.id, 'alt_text', e.target.value)}
                placeholder="Texto alternativo (ALT)"
                className="input-alt"
              />
              <select
                value={imagen.tipo_imagen}
                onChange={(e) => actualizarCampo(imagen.id, 'tipo_imagen', e.target.value)}
                className="select-tipo"
              >
                <option value="portada">Portada</option>
                <option value="contenido">Contenido</option>
                <option value="meta">Meta (SEO)</option>
              </select>
              <button onClick={() => eliminarImagen(imagen.id)} className="btn-eliminar">
                <Trash2 size={16} />
              </button>
            </div>
            {imagen.error && <p className="error-message">{imagen.error}</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploaderImagenesArticulo;