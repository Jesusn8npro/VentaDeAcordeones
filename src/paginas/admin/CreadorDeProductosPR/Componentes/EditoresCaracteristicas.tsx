import React from 'react'

interface ItemConIcono {
  id?: number
  icono: string
  titulo: string
  descripcion: string
}

// ─── Características ───────────────────────────────────────────────────────────

interface CTAData {
  texto: string
  subtexto: string
}

interface CaracteristicasProps {
  datos: {
    titulo: string
    subtitulo: string
    detalles: ItemConIcono[]
    beneficios: ItemConIcono[]
    cta: CTAData
  }
  onActualizarTitulo: (valor: string) => void
  onActualizarSubtitulo: (valor: string) => void
  onAgregarDetalle: () => void
  onEliminarDetalle: (index: number) => void
  onActualizarDetalle: (index: number, campo: string, valor: string) => void
  onAgregarBeneficio: () => void
  onEliminarBeneficio: (index: number) => void
  onActualizarBeneficio: (index: number, campo: string, valor: string) => void
  onActualizarCTA: (campo: string, valor: string) => void
}

export const EditorCaracteristicas: React.FC<CaracteristicasProps> = ({
  datos,
  onActualizarTitulo, onActualizarSubtitulo,
  onAgregarDetalle, onEliminarDetalle, onActualizarDetalle,
  onAgregarBeneficio, onEliminarBeneficio, onActualizarBeneficio,
  onActualizarCTA
}) => (
  <div className="caracteristicas-editor">
    <div className="caracteristicas-header">
      <div className="caracteristicas-campo">
        <label className="caracteristicas-label">Título principal:</label>
        <input type="text" value={datos.titulo} onChange={(e) => onActualizarTitulo(e.target.value)} placeholder="Título de las características" className="caracteristicas-input" />
      </div>
      <div className="caracteristicas-campo">
        <label className="caracteristicas-label">Subtítulo:</label>
        <input type="text" value={datos.subtitulo} onChange={(e) => onActualizarSubtitulo(e.target.value)} placeholder="Subtítulo descriptivo" className="caracteristicas-input" />
      </div>
    </div>

    <div className="caracteristicas-seccion">
      <h4>Detalles del Producto</h4>
      {datos.detalles.map((detalle, index) => (
        <div key={detalle.id} className="caracteristicas-item">
          <div className="caracteristicas-item-header">
            <span className="caracteristicas-numero">Detalle #{index + 1}</span>
            {datos.detalles.length > 1 && (
              <button type="button" onClick={() => onEliminarDetalle(index)} className="btn-eliminar-caracteristicas">❌</button>
            )}
          </div>
          <div className="caracteristicas-campos">
            <div className="caracteristicas-campo">
              <label className="caracteristicas-label">Icono:</label>
              <input type="text" value={detalle.icono} onChange={(e) => onActualizarDetalle(index, 'icono', e.target.value)} placeholder="⚡" className="caracteristicas-input-small" />
            </div>
            <div className="caracteristicas-campo">
              <label className="caracteristicas-label">Título:</label>
              <input type="text" value={detalle.titulo} onChange={(e) => onActualizarDetalle(index, 'titulo', e.target.value)} placeholder="Título del detalle" className="caracteristicas-input" />
            </div>
          </div>
          <div className="caracteristicas-campo">
            <label className="caracteristicas-label">Descripción:</label>
            <textarea value={detalle.descripcion} onChange={(e) => onActualizarDetalle(index, 'descripcion', e.target.value)} placeholder="Descripción detallada de la característica..." className="caracteristicas-textarea" />
          </div>
        </div>
      ))}
      <button type="button" onClick={onAgregarDetalle} className="btn-agregar-caracteristicas">➕ Agregar Detalle</button>
    </div>

    <div className="caracteristicas-seccion">
      <h4>Beneficios del Producto</h4>
      {datos.beneficios.map((beneficio, index) => (
        <div key={beneficio.id} className="caracteristicas-item">
          <div className="caracteristicas-item-header">
            <span className="caracteristicas-numero">Beneficio #{index + 1}</span>
            {datos.beneficios.length > 1 && (
              <button type="button" onClick={() => onEliminarBeneficio(index)} className="btn-eliminar-caracteristicas">❌</button>
            )}
          </div>
          <div className="caracteristicas-campos">
            <div className="caracteristicas-campo">
              <label className="caracteristicas-label">Icono:</label>
              <input type="text" value={beneficio.icono} onChange={(e) => onActualizarBeneficio(index, 'icono', e.target.value)} placeholder="🛡️" className="caracteristicas-input-small" />
            </div>
            <div className="caracteristicas-campo">
              <label className="caracteristicas-label">Título:</label>
              <input type="text" value={beneficio.titulo} onChange={(e) => onActualizarBeneficio(index, 'titulo', e.target.value)} placeholder="Título del beneficio" className="caracteristicas-input" />
            </div>
          </div>
          <div className="caracteristicas-campo">
            <label className="caracteristicas-label">Descripción:</label>
            <textarea value={beneficio.descripcion} onChange={(e) => onActualizarBeneficio(index, 'descripcion', e.target.value)} placeholder="Descripción detallada del beneficio..." className="caracteristicas-textarea" />
          </div>
        </div>
      ))}
      <button type="button" onClick={onAgregarBeneficio} className="btn-agregar-caracteristicas">➕ Agregar Beneficio</button>
    </div>

    <div className="caracteristicas-seccion">
      <h4>Call to Action (CTA)</h4>
      <div className="caracteristicas-campo">
        <label className="caracteristicas-label">Texto del botón:</label>
        <input type="text" value={datos.cta.texto} onChange={(e) => onActualizarCTA('texto', e.target.value)} placeholder="¡QUIERO APROVECHAR ESTA OFERTA!" className="caracteristicas-input" />
      </div>
      <div className="caracteristicas-campo">
        <label className="caracteristicas-label">Subtexto:</label>
        <input type="text" value={datos.cta.subtexto} onChange={(e) => onActualizarCTA('subtexto', e.target.value)} placeholder="🔥 Stock limitado, no dejes pasar esta oportunidad" className="caracteristicas-input" />
      </div>
    </div>

    <div className="preview-caracteristicas">
      <strong>Vista previa:</strong>
      <div style={{ marginTop: '8px' }}>
        <h3>{datos.titulo}</h3>
        <p>{datos.subtitulo}</p>
        <div className="preview-detalles">
          <h4>Detalles:</h4>
          {datos.detalles.filter(d => d.titulo && d.titulo.trim()).map((d, index) => (
            <div key={`detalle-preview-${d.id || index}`} className="preview-caracteristica-item">
              <div className="preview-caracteristica-header">
                <span className="preview-icono">{d.icono}</span>
                <span className="preview-titulo">{d.titulo}</span>
              </div>
              <div className="preview-descripcion">{d.descripcion}</div>
            </div>
          ))}
        </div>
        <div className="preview-beneficios">
          <h4>Beneficios:</h4>
          {datos.beneficios.filter(b => b.titulo && b.titulo.trim()).map((b, index) => (
            <div key={`beneficio-preview-${b.id || index}`} className="preview-caracteristica-item">
              <div className="preview-caracteristica-header">
                <span className="preview-icono">{b.icono}</span>
                <span className="preview-titulo">{b.titulo}</span>
              </div>
              <div className="preview-descripcion">{b.descripcion}</div>
            </div>
          ))}
        </div>
        <div className="preview-cta">
          <button className="preview-boton-cta">{datos.cta.texto}</button>
          <div className="preview-subtexto">{datos.cta.subtexto}</div>
        </div>
      </div>
    </div>
  </div>
)

// ─── Ventajas / Beneficios (lista genérica de ítems) ──────────────────────────

interface ListaItemsProps {
  datos: { titulo: string; subtitulo: string; items: ItemConIcono[] }
  tipo: string
  onActualizarTitulo: (valor: string) => void
  onActualizarSubtitulo: (valor: string) => void
  onAgregarItem: () => void
  onEliminarItem: (index: number) => void
  onActualizarItem: (index: number, campo: string, valor: string) => void
}

export const EditorListaItems: React.FC<ListaItemsProps> = ({
  datos, tipo,
  onActualizarTitulo, onActualizarSubtitulo,
  onAgregarItem, onEliminarItem, onActualizarItem
}) => {
  const tituloSeccion = tipo === 'ventajas' ? 'Ventajas Competitivas' : 'Beneficios del Producto'
  return (
    <div className="caracteristicas-editor">
      <div className="caracteristicas-header">
        <div className="caracteristicas-campo">
          <label className="caracteristicas-label">Título principal:</label>
          <input type="text" value={datos.titulo} onChange={(e) => onActualizarTitulo(e.target.value)} placeholder={tituloSeccion} className="caracteristicas-input" />
        </div>
        <div className="caracteristicas-campo">
          <label className="caracteristicas-label">Subtítulo:</label>
          <input type="text" value={datos.subtitulo} onChange={(e) => onActualizarSubtitulo(e.target.value)} placeholder="Subtítulo descriptivo" className="caracteristicas-input" />
        </div>
      </div>

      <div className="caracteristicas-seccion">
        <h4>{tituloSeccion}</h4>
        {(datos.items || []).map((item, index) => (
          <div key={item.id || index} className="caracteristicas-item">
            <div className="caracteristicas-item-header">
              <span className="caracteristicas-numero">Ítem #{index + 1}</span>
              {(datos.items || []).length > 1 && (
                <button type="button" onClick={() => onEliminarItem(index)} className="btn-eliminar-caracteristicas">❌</button>
              )}
            </div>
            <div className="caracteristicas-campos">
              <div className="caracteristicas-campo">
                <label className="caracteristicas-label">Icono:</label>
                <input type="text" value={item.icono || ''} onChange={(e) => onActualizarItem(index, 'icono', e.target.value)} placeholder="🛡️" className="caracteristicas-input-small" />
              </div>
              <div className="caracteristicas-campo">
                <label className="caracteristicas-label">Título:</label>
                <input type="text" value={item.titulo || ''} onChange={(e) => onActualizarItem(index, 'titulo', e.target.value)} placeholder="Título del ítem" className="caracteristicas-input" />
              </div>
            </div>
            <div className="caracteristicas-campo">
              <label className="caracteristicas-label">Descripción:</label>
              <textarea value={item.descripcion || ''} onChange={(e) => onActualizarItem(index, 'descripcion', e.target.value)} placeholder="Descripción del ítem..." className="caracteristicas-textarea" />
            </div>
          </div>
        ))}
        <button type="button" onClick={onAgregarItem} className="btn-agregar-caracteristicas">➕ Agregar Ítem</button>
      </div>

      <div className="preview-beneficios">
        <strong>Vista previa:</strong>
        <div style={{ marginTop: '8px' }}>
          <h3>{datos.titulo}</h3>
          <p>{datos.subtitulo}</p>
          {(datos.items || []).filter(i => i.titulo?.trim()).map((i, index) => (
            <div key={`item-preview-${i.id || index}`} className="preview-caracteristica-item">
              <div className="preview-caracteristica-header">
                <span className="preview-icono">{i.icono}</span>
                <span className="preview-titulo">{i.titulo}</span>
              </div>
              <div className="preview-descripcion">{i.descripcion}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
