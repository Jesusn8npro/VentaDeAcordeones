import React from 'react'

// ─── FAQ ───────────────────────────────────────────────────────────────────────

interface Pregunta {
  id?: number
  pregunta: string
  respuesta: string
}

interface FAQProps {
  datos: { titulo: string; subtitulo: string; preguntas: Pregunta[] }
  onActualizarTitulo: (valor: string) => void
  onActualizarSubtitulo: (valor: string) => void
  onAgregarPregunta: () => void
  onEliminarPregunta: (index: number) => void
  onActualizarPregunta: (index: number, campo: string, valor: string) => void
}

export const EditorFAQ: React.FC<FAQProps> = ({
  datos,
  onActualizarTitulo, onActualizarSubtitulo,
  onAgregarPregunta, onEliminarPregunta, onActualizarPregunta
}) => (
  <div className="convertidor-json">
    <h3>Editor de FAQ (Preguntas Frecuentes)</h3>
    <div className="faq-seccion">
      <h4>Información General</h4>
      <div className="faq-campo">
        <label className="faq-label">Título:</label>
        <input type="text" value={datos.titulo} onChange={(e) => onActualizarTitulo(e.target.value)} placeholder="Preguntas Frecuentes" className="faq-input" />
      </div>
      <div className="faq-campo">
        <label className="faq-label">Subtítulo:</label>
        <input type="text" value={datos.subtitulo} onChange={(e) => onActualizarSubtitulo(e.target.value)} placeholder="Resolvemos todas tus dudas para que compres con total confianza" className="faq-input" />
      </div>
    </div>

    <div className="faq-seccion">
      <h4>Preguntas y Respuestas</h4>
      {datos.preguntas.map((pregunta, index) => (
        <div key={pregunta.id} className="faq-item">
          <div className="faq-item-header">
            <h5>Pregunta {index + 1}</h5>
            {datos.preguntas.length > 1 && (
              <button type="button" onClick={() => onEliminarPregunta(index)} className="btn-eliminar-faq">❌</button>
            )}
          </div>
          <div className="faq-campo">
            <label className="faq-label">Pregunta:</label>
            <input type="text" value={pregunta.pregunta} onChange={(e) => onActualizarPregunta(index, 'pregunta', e.target.value)} placeholder="¿Realmente funciona como prometen?" className="faq-input" />
          </div>
          <div className="faq-campo">
            <label className="faq-label">Respuesta:</label>
            <textarea value={pregunta.respuesta} onChange={(e) => onActualizarPregunta(index, 'respuesta', e.target.value)} placeholder="Sí, el producto está diseñado con tecnología premium..." className="faq-textarea" rows={4} />
          </div>
        </div>
      ))}
      <button type="button" onClick={onAgregarPregunta} className="btn-agregar-faq">➕ Agregar Pregunta</button>
    </div>

    <div className="preview-faq">
      <strong>Vista previa:</strong>
      <div style={{ marginTop: '8px' }}>
        <h3>{datos.titulo}</h3>
        <p>{datos.subtitulo}</p>
        <div className="preview-faq-lista">
          {datos.preguntas.filter(p => p.pregunta?.trim() && p.respuesta?.trim()).map((p, index) => (
            <div key={`pregunta-preview-${p.id || index}`} className="preview-faq-item">
              <div className="preview-faq-pregunta"><strong>❓ {p.pregunta}</strong></div>
              <div className="preview-faq-respuesta">{p.respuesta}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// ─── Garantías ─────────────────────────────────────────────────────────────────

interface Garantia {
  id?: number
  icono: string
  titulo: string
  descripcion: string
}

interface GarantiasProps {
  datos: { titulo: string; subtitulo: string; garantias: Garantia[] }
  onActualizarTitulo: (valor: string) => void
  onActualizarSubtitulo: (valor: string) => void
  onAgregarGarantia: () => void
  onEliminarGarantia: (index: number) => void
  onActualizarGarantia: (index: number, campo: string, valor: string) => void
}

export const EditorGarantias: React.FC<GarantiasProps> = ({
  datos,
  onActualizarTitulo, onActualizarSubtitulo,
  onAgregarGarantia, onEliminarGarantia, onActualizarGarantia
}) => (
  <div className="convertidor-json">
    <h3>Editor de Garantías</h3>
    <div className="garantias-seccion">
      <h4>Información General</h4>
      <div className="garantias-campo">
        <label className="garantias-label">Título:</label>
        <input type="text" value={datos.titulo} onChange={(e) => onActualizarTitulo(e.target.value)} placeholder="Compra con Total Confianza" className="garantias-input" />
      </div>
      <div className="garantias-campo">
        <label className="garantias-label">Subtítulo:</label>
        <input type="text" value={datos.subtitulo} onChange={(e) => onActualizarSubtitulo(e.target.value)} placeholder="Tu satisfacción y seguridad son nuestra prioridad #1" className="garantias-input" />
      </div>
    </div>

    <div className="garantias-seccion">
      <h4>Garantías</h4>
      {datos.garantias.map((garantia, index) => (
        <div key={garantia.id} className="garantias-item">
          <div className="garantias-item-header">
            <h5>Garantía {index + 1}</h5>
            {datos.garantias.length > 1 && (
              <button type="button" onClick={() => onEliminarGarantia(index)} className="btn-eliminar-garantias">❌</button>
            )}
          </div>
          <div className="garantias-fila">
            <div className="garantias-campo">
              <label className="garantias-label">Icono:</label>
              <input type="text" value={garantia.icono} onChange={(e) => onActualizarGarantia(index, 'icono', e.target.value)} placeholder="🛡️" className="garantias-input-small" />
            </div>
            <div className="garantias-campo">
              <label className="garantias-label">Título:</label>
              <input type="text" value={garantia.titulo} onChange={(e) => onActualizarGarantia(index, 'titulo', e.target.value)} placeholder="Garantía 2 Años" className="garantias-input" />
            </div>
          </div>
          <div className="garantias-campo">
            <label className="garantias-label">Descripción:</label>
            <textarea value={garantia.descripcion} onChange={(e) => onActualizarGarantia(index, 'descripcion', e.target.value)} placeholder="Si no funciona como prometemos, te devolvemos el 100% de tu dinero" className="garantias-textarea" rows={3} />
          </div>
        </div>
      ))}
      <button type="button" onClick={onAgregarGarantia} className="btn-agregar-garantias">➕ Agregar Garantía</button>
    </div>

    <div className="preview-garantias">
      <strong>Vista previa:</strong>
      <div style={{ marginTop: '8px' }}>
        <h3>{datos.titulo}</h3>
        <p>{datos.subtitulo}</p>
        <div className="preview-garantias-lista">
          {datos.garantias.filter(g => g.titulo?.trim() && g.descripcion?.trim()).map((g, index) => (
            <div key={`garantia-preview-${g.id || index}`} className="preview-garantias-item">
              <div className="preview-garantias-header">
                <span className="preview-garantias-icono">{g.icono}</span>
                <span className="preview-garantias-titulo">{g.titulo}</span>
              </div>
              <div className="preview-garantias-descripcion">{g.descripcion}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)

// ─── CTA Final ─────────────────────────────────────────────────────────────────

interface CTAFinalData {
  titulo: string
  subtitulo: string
  botonTexto: string
  urgencia: string
  descuento: string
  envio: string
  garantia: string
  precioActual: string
  precioAnterior: string
}

interface CTAFinalProps {
  datos: CTAFinalData
  onActualizarCampo: (campo: string, valor: string) => void
}

const formatearPrecio = (precio: string) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(Number(precio))

export const EditorCTAFinal: React.FC<CTAFinalProps> = ({ datos, onActualizarCampo }) => (
  <div className="convertidor-json">
    <h3>Editor de CTA Final</h3>

    <div className="cta-final-seccion">
      <h4>Información Principal</h4>
      <div className="cta-final-campo">
        <label className="cta-final-label">Título:</label>
        <input type="text" value={datos.titulo} onChange={(e) => onActualizarCampo('titulo', e.target.value)} placeholder="¡ÚLTIMA OPORTUNIDAD!" className="cta-final-input" />
      </div>
      <div className="cta-final-campo">
        <label className="cta-final-label">Subtítulo:</label>
        <textarea value={datos.subtitulo} onChange={(e) => onActualizarCampo('subtitulo', e.target.value)} placeholder="No dejes pasar esta oferta única..." className="cta-final-textarea" rows={3} />
      </div>
      <div className="cta-final-campo">
        <label className="cta-final-label">Texto del botón:</label>
        <input type="text" value={datos.botonTexto} onChange={(e) => onActualizarCampo('botonTexto', e.target.value)} placeholder="¡QUIERO MI TRANSFORMACIÓN AHORA!" className="cta-final-input" />
      </div>
    </div>

    <div className="cta-final-seccion">
      <h4>Elementos de Urgencia</h4>
      <div className="cta-final-campo">
        <label className="cta-final-label">Urgencia:</label>
        <input type="text" value={datos.urgencia} onChange={(e) => onActualizarCampo('urgencia', e.target.value)} placeholder="⚡ Oferta válida solo por hoy" className="cta-final-input" />
      </div>
      <div className="cta-final-campo">
        <label className="cta-final-label">Descuento:</label>
        <input type="text" value={datos.descuento} onChange={(e) => onActualizarCampo('descuento', e.target.value)} placeholder="70% OFF" className="cta-final-input" />
      </div>
    </div>

    <div className="cta-final-seccion">
      <h4>Garantías y Envío</h4>
      <div className="cta-final-campo">
        <label className="cta-final-label">Envío:</label>
        <input type="text" value={datos.envio} onChange={(e) => onActualizarCampo('envio', e.target.value)} placeholder="🚚 Envío GRATIS en 24-48 horas" className="cta-final-input" />
      </div>
      <div className="cta-final-campo">
        <label className="cta-final-label">Garantía:</label>
        <input type="text" value={datos.garantia} onChange={(e) => onActualizarCampo('garantia', e.target.value)} placeholder="🛡️ Garantía de satisfacción del 100% o te devolvemos tu dinero" className="cta-final-input" />
      </div>
    </div>

    <div className="cta-final-seccion">
      <h4>Precios</h4>
      <div className="cta-final-fila">
        <div className="cta-final-campo">
          <label className="cta-final-label">Precio Actual:</label>
          <input type="number" value={datos.precioActual} onChange={(e) => onActualizarCampo('precioActual', e.target.value)} placeholder="4950325" className="cta-final-input" />
        </div>
        <div className="cta-final-campo">
          <label className="cta-final-label">Precio Anterior:</label>
          <input type="number" value={datos.precioAnterior} onChange={(e) => onActualizarCampo('precioAnterior', e.target.value)} placeholder="16501083" className="cta-final-input" />
        </div>
      </div>
    </div>

    <div className="preview-cta-final">
      <strong>Vista previa:</strong>
      <div style={{ marginTop: '8px' }}>
        <div className="preview-cta-final-container">
          <div className="preview-cta-final-urgencia">{datos.urgencia}</div>
          <div className="preview-cta-final-descuento">{datos.descuento}</div>
          <h3 className="preview-cta-final-titulo">{datos.titulo}</h3>
          <p className="preview-cta-final-subtitulo">{datos.subtitulo}</p>
          <div className="preview-cta-final-precios">
            <span className="preview-precio-anterior">{formatearPrecio(datos.precioAnterior)}</span>
            <span className="preview-precio-actual">{formatearPrecio(datos.precioActual)}</span>
          </div>
          <button className="preview-cta-final-boton">{datos.botonTexto}</button>
          <div className="preview-cta-final-garantias">
            <div className="preview-garantia-item">{datos.envio}</div>
            <div className="preview-garantia-item">{datos.garantia}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// ─── Promociones ───────────────────────────────────────────────────────────────

interface Promocion {
  id?: number
  cantidadMinima: number
  descuentoPorcentaje: number
  descripcion: string
  activa: boolean
}

interface PromocionesProps {
  datos: { titulo: string; subtitulo: string; promociones: Promocion[] }
  onActualizarTitulo: (valor: string) => void
  onActualizarSubtitulo: (valor: string) => void
  onAgregarPromocion: () => void
  onEliminarPromocion: (index: number) => void
  onActualizarPromocion: (index: number, campo: string, valor: any) => void
}

export const EditorPromociones: React.FC<PromocionesProps> = ({
  datos,
  onActualizarTitulo, onActualizarSubtitulo,
  onAgregarPromocion, onEliminarPromocion, onActualizarPromocion
}) => (
  <div className="convertidor-json">
    <h3>Editor de Promociones por Cantidad</h3>

    <div className="promociones-seccion">
      <h4>Información General</h4>
      <div className="promociones-campo">
        <label className="promociones-label">Título:</label>
        <input type="text" value={datos.titulo} onChange={(e) => onActualizarTitulo(e.target.value)} placeholder="Promociones por Cantidad" className="promociones-input" />
      </div>
      <div className="promociones-campo">
        <label className="promociones-label">Subtítulo:</label>
        <input type="text" value={datos.subtitulo} onChange={(e) => onActualizarSubtitulo(e.target.value)} placeholder="Configura descuentos automáticos por cantidad de productos" className="promociones-input" />
      </div>
    </div>

    <div className="promociones-seccion">
      <h4>Promociones</h4>
      {datos.promociones.map((promocion, index) => (
        <div key={promocion.id} className="promociones-item">
          <div className="promociones-item-header">
            <span className="promociones-numero">Promoción #{index + 1}</span>
            {datos.promociones.length > 1 && (
              <button type="button" onClick={() => onEliminarPromocion(index)} className="btn-eliminar-promociones">❌</button>
            )}
          </div>
          <div className="promociones-campos">
            <div className="promociones-campo">
              <label className="promociones-label">Cantidad Mínima:</label>
              <input type="number" min="2" value={promocion.cantidadMinima} onChange={(e) => onActualizarPromocion(index, 'cantidadMinima', parseInt(e.target.value))} placeholder="2" className="promociones-input-small" />
            </div>
            <div className="promociones-campo">
              <label className="promociones-label">Descuento (%):</label>
              <input type="number" min="1" max="99" value={promocion.descuentoPorcentaje} onChange={(e) => onActualizarPromocion(index, 'descuentoPorcentaje', parseInt(e.target.value))} placeholder="10" className="promociones-input-small" />
            </div>
          </div>
          <div className="promociones-campo">
            <label className="promociones-label">Descripción:</label>
            <input type="text" value={promocion.descripcion} onChange={(e) => onActualizarPromocion(index, 'descripcion', e.target.value)} placeholder="Descuento por compra múltiple" className="promociones-input" />
          </div>
          <div className="promociones-campo">
            <label className="promociones-checkbox">
              <input type="checkbox" checked={promocion.activa} onChange={(e) => onActualizarPromocion(index, 'activa', e.target.checked)} />
              Promoción activa
            </label>
          </div>
        </div>
      ))}
    </div>

    <button type="button" onClick={onAgregarPromocion} className="btn-agregar-promociones">
      ➕ Agregar Promoción
    </button>

    <div className="preview-promociones">
      <strong>Vista previa:</strong>
      <div style={{ marginTop: '8px' }}>
        <h3>{datos.titulo}</h3>
        <p>{datos.subtitulo}</p>
        <div className="preview-promociones-lista">
          {datos.promociones.filter(p => p.activa && p.cantidadMinima >= 2).map((p, index) => (
            <div key={`promocion-preview-${p.id || index}`} className="preview-promociones-item">
              <div className="preview-promociones-cantidad">Compra {p.cantidadMinima}+ unidades</div>
              <div className="preview-promociones-descuento">{p.descuentoPorcentaje}% OFF</div>
              <div className="preview-promociones-descripcion">{p.descripcion}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
)
