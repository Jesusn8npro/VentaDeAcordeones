import React from 'react'

// ─── Banner Animado ────────────────────────────────────────────────────────────

interface BannerAnimadoProps {
  datos: { mensajes: string[] }
  onAgregarMensaje: () => void
  onEliminarMensaje: (index: number) => void
  onActualizarMensaje: (index: number, valor: string) => void
}

export const EditorBannerAnimado: React.FC<BannerAnimadoProps> = ({
  datos, onAgregarMensaje, onEliminarMensaje, onActualizarMensaje
}) => (
  <div className="banner-animado-editor">
    <div className="mensajes-lista">
      {datos.mensajes.map((mensaje, index) => (
        <div key={`mensaje-${index}-${mensaje.slice(0, 10)}`} className="mensaje-item">
          <div className="mensaje-numero">#{index + 1}</div>
          <input
            type="text"
            value={mensaje}
            onChange={(e) => onActualizarMensaje(index, e.target.value)}
            placeholder={`Mensaje ${index + 1} (ej: "¡Oferta especial!", "Envío gratis")`}
            className="mensaje-input"
          />
          {datos.mensajes.length > 1 && (
            <button type="button" onClick={() => onEliminarMensaje(index)} className="btn-eliminar" title="Eliminar mensaje">
              ❌
            </button>
          )}
        </div>
      ))}
    </div>

    <button type="button" onClick={onAgregarMensaje} className="btn-agregar-mensaje">
      ➕ Agregar Mensaje
    </button>

    <div className="preview-banner">
      <strong>Vista previa:</strong>
      <div className="mensajes-preview">
        {datos.mensajes.filter(msg => msg && msg.trim()).map((mensaje, index, arr) => (
          <span key={`preview-${index}-${mensaje.slice(0, 10)}`} className="mensaje-preview">
            "{mensaje}"{index < arr.length - 1 && ', '}
          </span>
        ))}
      </div>
    </div>
  </div>
)

// ─── Puntos de Dolor ───────────────────────────────────────────────────────────

interface TimelineItem {
  id?: number
  icono: string
  nombre: string
  posicion: string
  descripcion: string
  solucion: string
  textoBoton: string
}

interface PuntosDolorProps {
  datos: { titulo: string; subtitulo: string; timeline: TimelineItem[] }
  onActualizarTitulo: (valor: string) => void
  onActualizarSubtitulo: (valor: string) => void
  onAgregarItem: () => void
  onEliminarItem: (index: number) => void
  onActualizarItem: (index: number, campo: string, valor: string) => void
}

export const EditorPuntosDolor: React.FC<PuntosDolorProps> = ({
  datos, onActualizarTitulo, onActualizarSubtitulo,
  onAgregarItem, onEliminarItem, onActualizarItem
}) => (
  <div className="puntos-dolor-editor">
    <div className="puntos-dolor-header">
      <input
        type="text"
        value={datos.titulo}
        onChange={(e) => onActualizarTitulo(e.target.value)}
        placeholder="Título de la sección"
        className="puntos-dolor-titulo"
      />
      <input
        type="text"
        value={datos.subtitulo}
        onChange={(e) => onActualizarSubtitulo(e.target.value)}
        placeholder="Subtítulo explicativo"
        className="puntos-dolor-subtitulo"
      />
    </div>

    <div className="timeline-lista">
      {datos.timeline.map((item, index) => (
        <div key={item.id || index} className="timeline-item">
          <div className="timeline-item-header">
            <div className="timeline-numero">#{index + 1}</div>
            <input
              type="text"
              value={item.icono}
              onChange={(e) => onActualizarItem(index, 'icono', e.target.value)}
              placeholder="🔥"
              className="timeline-icono timeline-input"
              style={{ width: '50px' }}
            />
            <input
              type="text"
              value={item.nombre}
              onChange={(e) => onActualizarItem(index, 'nombre', e.target.value)}
              placeholder="Nombre del problema"
              className="timeline-input"
            />
            {datos.timeline.length > 1 && (
              <button type="button" onClick={() => onEliminarItem(index)} className="btn-eliminar" title="Eliminar punto de dolor">
                ❌
              </button>
            )}
          </div>

          <div className="timeline-campos">
            <div className="timeline-campo">
              <label className="timeline-label">Posición:</label>
              <select
                value={item.posicion}
                onChange={(e) => onActualizarItem(index, 'posicion', e.target.value)}
                className="timeline-select"
              >
                <option value="izquierda">Izquierda</option>
                <option value="derecha">Derecha</option>
              </select>
            </div>
            <div className="timeline-campo">
              <label className="timeline-label">Descripción del problema:</label>
              <textarea
                value={item.descripcion}
                onChange={(e) => onActualizarItem(index, 'descripcion', e.target.value)}
                placeholder="Describe el problema que enfrentan los clientes..."
                className="timeline-textarea"
              />
            </div>
          </div>

          <div className="timeline-campo">
            <label className="timeline-label">Solución que ofreces:</label>
            <textarea
              value={item.solucion}
              onChange={(e) => onActualizarItem(index, 'solucion', e.target.value)}
              placeholder="Explica cómo tu producto resuelve este problema..."
              className="timeline-textarea"
            />
          </div>

          <div className="timeline-campo">
            <label className="timeline-label">Texto del botón:</label>
            <input
              type="text"
              value={item.textoBoton}
              onChange={(e) => onActualizarItem(index, 'textoBoton', e.target.value)}
              placeholder="NUESTRA SOLUCIÓN"
              className="timeline-input"
            />
          </div>
        </div>
      ))}
    </div>

    <button type="button" onClick={onAgregarItem} className="btn-agregar-timeline">
      ➕ Agregar Punto de Dolor
    </button>

    <div className="preview-puntos-dolor">
      <strong>Vista previa:</strong>
      <div style={{ marginTop: '8px' }}>
        <h4>{datos.titulo}</h4>
        <p>{datos.subtitulo}</p>
        <div className="preview-timeline">
          {datos.timeline.filter(item => item.nombre && item.nombre.trim()).map((item, index) => (
            <div key={`timeline-preview-${item.id || index}`} className="preview-timeline-item">
              <div className="preview-timeline-nombre">{item.icono} {item.nombre} ({item.posicion})</div>
              <div className="preview-timeline-descripcion">Problema: {item.descripcion}</div>
              <div className="preview-timeline-solucion">Solución: {item.solucion}</div>
              <div className="preview-timeline-boton">
                <button className="preview-boton-solucion">{item.textoBoton || 'NUESTRA SOLUCIÓN'}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)
