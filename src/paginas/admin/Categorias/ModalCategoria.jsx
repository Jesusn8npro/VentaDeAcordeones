import React from 'react'
import { Save, X, Upload, ImageIcon } from 'lucide-react'
import './ModalCategoria.css'

const ModalCategoria = ({
  modalAbierto,
  categoriaEditando,
  formulario,
  guardando,
  subiendoImagen,
  archivoImagen,
  previewImagen,
  error,
  onCerrar,
  onGuardar,
  onCambio,
  onSeleccionArchivo,
  onDragOver,
  onDrop,
  onEliminarImagen
}) => {
  if (!modalAbierto) return null

  const manejarClickOverlay = (e) => {
    if (e.target === e.currentTarget) {
      onCerrar()
    }
  }

  return (
    <div className="modal-overlay" onClick={manejarClickOverlay}>
      <div className="modal-contenido">
        <div className="modal-header">
          <h2>{categoriaEditando ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="modal-cerrar"
            disabled={guardando}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="error-mensaje">
            {error}
          </div>
        )}

        <form onSubmit={onGuardar} className="modal-form">
          <div className="campos-fila">
            <div className="campo-grupo">
              <label className="campo-label">Nombre *</label>
              <input
                type="text"
                value={formulario.nombre}
                onChange={(e) => onCambio('nombre', e.target.value)}
                className="campo-input"
                placeholder="Nombre de la categoría"
                required
                disabled={guardando}
              />
            </div>
            <div className="campo-grupo">
              <label className="campo-label">Slug *</label>
              <input
                type="text"
                value={formulario.slug}
                onChange={(e) => onCambio('slug', e.target.value)}
                className="campo-input"
                placeholder="url-amigable"
                required
                disabled={guardando}
              />
            </div>
          </div>

          <div className="campo-grupo">
            <label className="campo-label">Descripción</label>
            <textarea
              value={formulario.descripcion}
              onChange={(e) => onCambio('descripcion', e.target.value)}
              className="campo-textarea"
              placeholder="Descripción de la categoría"
              rows="3"
              disabled={guardando}
            />
          </div>

          <div className="campo-grupo">
            <label className="campo-label">Orden</label>
            <input
              type="number"
              value={formulario.orden}
              onChange={(e) => onCambio('orden', parseInt(e.target.value) || 0)}
              className="campo-input"
              min="0"
              disabled={guardando}
            />
          </div>

          <div className="campo-grupo">
            <label className="campo-label">Imagen de la Categoría</label>
            <div className="imagen-upload-container">
              {!previewImagen ? (
                <div
                  className="imagen-upload-area"
                  onDragOver={onDragOver}
                  onDrop={onDrop}
                  onClick={() => document.getElementById('input-imagen')?.click()}
                >
                  <div className="imagen-upload-content">
                    <Upload size={32} />
                    <p className="imagen-upload-text">
                      Arrastra una imagen aquí o haz clic para seleccionar
                    </p>
                    <p className="imagen-upload-subtext">
                      PNG, JPG, WEBP hasta 5MB
                    </p>
                  </div>
                  <input
                    id="input-imagen"
                    type="file"
                    accept="image/*"
                    onChange={onSeleccionArchivo}
                    style={{ display: 'none' }}
                    disabled={guardando}
                  />
                </div>
              ) : (
                <div className="imagen-preview-container">
                  <img 
                    src={previewImagen} 
                    alt="Preview" 
                    className="imagen-preview"
                  />
                  <div className="imagen-actions">
                    <button
                      type="button"
                      className="imagen-btn"
                      onClick={() => document.getElementById('input-imagen')?.click()}
                      disabled={subiendoImagen || guardando}
                    >
                      <ImageIcon size={14} />
                      Cambiar
                    </button>
                    <button
                      type="button"
                      className="imagen-btn eliminar"
                      onClick={onEliminarImagen}
                      disabled={subiendoImagen || guardando}
                    >
                      <X size={14} />
                      Eliminar
                    </button>
                  </div>
                  <input
                    id="input-imagen"
                    type="file"
                    accept="image/*"
                    onChange={onSeleccionArchivo}
                    style={{ display: 'none' }}
                    disabled={guardando}
                  />
                </div>
              )}
              
              <div className="campo-grupo" style={{ marginTop: '1rem' }}>
                <label className="campo-label">O ingresa una URL de imagen</label>
                <input
                  type="url"
                  value={formulario.imagen_url}
                  onChange={(e) => onCambio('imagen_url', e.target.value)}
                  className="campo-input"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  disabled={guardando}
                />
              </div>
            </div>
          </div>

          <div className="campo-grupo">
            <label className="campo-label">Icono (emoji o clase CSS)</label>
            <input
              type="text"
              value={formulario.icono}
              onChange={(e) => onCambio('icono', e.target.value)}
              className="campo-input"
              placeholder="📱 o fa-mobile"
              disabled={guardando}
            />
          </div>

          <div className="campos-fila">
            <div className="campo-grupo">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formulario.activo}
                  onChange={(e) => onCambio('activo', e.target.checked)}
                  className="checkbox-input"
                  disabled={guardando}
                />
                <span className="checkbox-texto">Categoría activa</span>
              </label>
            </div>

            <div className="campo-grupo">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formulario.destacado}
                  onChange={(e) => onCambio('destacado', e.target.checked)}
                  className="checkbox-input"
                  disabled={guardando}
                />
                <span className="checkbox-texto">Mostrar como destacada</span>
              </label>
            </div>
          </div>

          <div className="modal-acciones">
            <button
              type="button"
              onClick={onCerrar}
              className="boton-cancelar"
              disabled={guardando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="boton-guardar"
              disabled={guardando || subiendoImagen}
            >
              {guardando ? (
                <>
                  <div className="spinner-pequeno"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {categoriaEditando ? 'Actualizar' : 'Crear'} Categoría
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalCategoria