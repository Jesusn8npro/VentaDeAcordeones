import React from 'react'

interface Testimonio {
  id?: number
  nombre: string
  ubicacion: string
  fecha: string
  likes: number
  rating: number
  comentario: string
  verificado: boolean
  compraVerificada: boolean
}

interface TestimoniosProps {
  datos: {
    titulo: string
    subtitulo: string
    testimonios: Testimonio[]
    estadisticas: { recomiendan: number; satisfaccion: number; totalClientes: number }
  }
  onActualizarTitulo: (valor: string) => void
  onActualizarSubtitulo: (valor: string) => void
  onActualizarEstadisticas: (campo: string, valor: number) => void
  onAgregarTestimonio: () => void
  onEliminarTestimonio: (index: number) => void
  onActualizarTestimonio: (index: number, campo: string, valor: any) => void
}

export const EditorTestimonios: React.FC<TestimoniosProps> = ({
  datos,
  onActualizarTitulo, onActualizarSubtitulo, onActualizarEstadisticas,
  onAgregarTestimonio, onEliminarTestimonio, onActualizarTestimonio
}) => (
  <div className="testimonios-editor">
    <div className="testimonios-header">
      <input type="text" value={datos.titulo} onChange={(e) => onActualizarTitulo(e.target.value)} placeholder="Título principal" className="testimonios-titulo" />
      <input type="text" value={datos.subtitulo} onChange={(e) => onActualizarSubtitulo(e.target.value)} placeholder="Subtítulo explicativo" className="testimonios-subtitulo" />
    </div>

    <div className="estadisticas-seccion">
      <h4>Estadísticas</h4>
      <div className="estadisticas-campos">
        <div className="estadisticas-campo">
          <label>% Recomiendan:</label>
          <input type="number" value={datos.estadisticas.recomiendan} onChange={(e) => onActualizarEstadisticas('recomiendan', parseInt(e.target.value) || 0)} placeholder="98" className="estadisticas-input" min="0" max="100" />
        </div>
        <div className="estadisticas-campo">
          <label>Satisfacción:</label>
          <input type="number" step="0.1" value={datos.estadisticas.satisfaccion} onChange={(e) => onActualizarEstadisticas('satisfaccion', parseFloat(e.target.value) || 0)} placeholder="4.9" className="estadisticas-input" min="0" max="5" />
        </div>
        <div className="estadisticas-campo">
          <label>Total Clientes:</label>
          <input type="number" value={datos.estadisticas.totalClientes} onChange={(e) => onActualizarEstadisticas('totalClientes', parseInt(e.target.value) || 0)} placeholder="15847" className="estadisticas-input" min="0" />
        </div>
      </div>
    </div>

    <div className="testimonios-lista">
      {datos.testimonios.map((testimonio, index) => (
        <div key={testimonio.id || index} className="testimonio-item">
          <div className="testimonio-item-header">
            <div className="testimonio-numero">#{index + 1}</div>
            <button type="button" onClick={() => onEliminarTestimonio(index)} className="btn-eliminar-testimonio" disabled={datos.testimonios.length <= 1}>
              🗑️
            </button>
          </div>
          <div className="testimonio-campos">
            <div className="testimonio-campo">
              <label className="testimonio-label">Nombre:</label>
              <input type="text" value={testimonio.nombre} onChange={(e) => onActualizarTestimonio(index, 'nombre', e.target.value)} placeholder="María González" className="testimonio-input" />
            </div>
            <div className="testimonio-campo">
              <label className="testimonio-label">Ubicación:</label>
              <input type="text" value={testimonio.ubicacion} onChange={(e) => onActualizarTestimonio(index, 'ubicacion', e.target.value)} placeholder="Bogotá, Colombia" className="testimonio-input" />
            </div>
            <div className="testimonio-campo">
              <label className="testimonio-label">Fecha:</label>
              <input type="text" value={testimonio.fecha} onChange={(e) => onActualizarTestimonio(index, 'fecha', e.target.value)} placeholder="Hace 2 días" className="testimonio-input" />
            </div>
            <div className="testimonio-campo">
              <label className="testimonio-label">Likes:</label>
              <input type="number" value={testimonio.likes} onChange={(e) => onActualizarTestimonio(index, 'likes', parseInt(e.target.value) || 0)} placeholder="234" className="testimonio-input" min="0" />
            </div>
            <div className="testimonio-campo">
              <label className="testimonio-label">Rating:</label>
              <select value={testimonio.rating} onChange={(e) => onActualizarTestimonio(index, 'rating', parseInt(e.target.value))} className="testimonio-select">
                <option value={1}>⭐ (1)</option>
                <option value={2}>⭐⭐ (2)</option>
                <option value={3}>⭐⭐⭐ (3)</option>
                <option value={4}>⭐⭐⭐⭐ (4)</option>
                <option value={5}>⭐⭐⭐⭐⭐ (5)</option>
              </select>
            </div>
            <div className="testimonio-campo-completo">
              <label className="testimonio-label">Comentario:</label>
              <textarea value={testimonio.comentario} onChange={(e) => onActualizarTestimonio(index, 'comentario', e.target.value)} placeholder="¡El producto revolucionó mi emprendimiento!..." className="testimonio-textarea" rows={3} />
            </div>
            <div className="testimonio-checkboxes">
              <label className="testimonio-checkbox">
                <input type="checkbox" checked={testimonio.verificado} onChange={(e) => onActualizarTestimonio(index, 'verificado', e.target.checked)} />
                Verificado
              </label>
              <label className="testimonio-checkbox">
                <input type="checkbox" checked={testimonio.compraVerificada} onChange={(e) => onActualizarTestimonio(index, 'compraVerificada', e.target.checked)} />
                Compra Verificada
              </label>
            </div>
          </div>
        </div>
      ))}
    </div>

    <button type="button" onClick={onAgregarTestimonio} className="btn-agregar-testimonio">
      ➕ Agregar Testimonio
    </button>

    <div className="preview-testimonios">
      <strong>Vista previa:</strong>
      <div style={{ marginTop: '8px' }}>
        <h3>{datos.titulo}</h3>
        <p>{datos.subtitulo}</p>
        <div className="preview-estadisticas">
          <div className="estadistica-item">
            <span className="estadistica-numero">{datos.estadisticas.recomiendan}%</span>
            <span className="estadistica-texto">Lo recomiendan</span>
          </div>
          <div className="estadistica-item">
            <span className="estadistica-numero">{datos.estadisticas.satisfaccion}</span>
            <span className="estadistica-texto">Satisfacción</span>
          </div>
          <div className="estadistica-item">
            <span className="estadistica-numero">{datos.estadisticas.totalClientes.toLocaleString()}</span>
            <span className="estadistica-texto">Clientes</span>
          </div>
        </div>
        <div className="preview-testimonios-lista">
          {datos.testimonios.filter(t => t.nombre?.trim() && t.comentario?.trim()).map((t, index) => (
            <div key={`testimonio-preview-${t.id || index}`} className="preview-testimonio-item">
              <div className="preview-testimonio-header">
                <div className="preview-testimonio-info">
                  <span className="preview-testimonio-nombre">{t.nombre}</span>
                  <span className="preview-testimonio-ubicacion">{t.ubicacion}</span>
                  <span className="preview-testimonio-fecha">{t.fecha}</span>
                </div>
                <div className="preview-testimonio-rating">{'⭐'.repeat(t.rating)}</div>
              </div>
              <div className="preview-testimonio-comentario">{t.comentario}</div>
              <div className="preview-testimonio-footer">
                <span className="preview-testimonio-likes">👍 {t.likes}</span>
                {t.verificado && <span className="preview-verificado">✅ Verificado</span>}
                {t.compraVerificada && <span className="preview-compra-verificada">🛒 Compra Verificada</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)
