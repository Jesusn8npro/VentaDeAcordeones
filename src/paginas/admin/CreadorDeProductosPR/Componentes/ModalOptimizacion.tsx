import React from 'react'

interface ModalOptimizacionProps {
  imagenModal: string | null
  campoModalKey: string | null
  guardandoCampo: boolean
  productoId: string | null
  presetsPorImagen: Record<string, string>
  presetCompresion: string
  calidadPorImagen: Record<string, number>
  statsPorImagen: Record<string, any>
  actualizarPorImagen: Record<string, boolean>
  conservarOriginalPorImagen: Record<string, boolean>
  nombreDestinoPorImagen: Record<string, string>
  setPresetsPorImagen: (fn: (prev: any) => any) => void
  setCalidadPorImagen: (fn: (prev: any) => any) => void
  setActualizarPorImagen: (fn: (prev: any) => any) => void
  setConservarOriginalPorImagen: (fn: (prev: any) => any) => void
  setNombreDestinoPorImagen: (fn: (prev: any) => any) => void
  cerrarModalCampo: () => void
  aplicarCambiosCampo: () => void
}

const ModalOptimizacion: React.FC<ModalOptimizacionProps> = ({
  imagenModal, campoModalKey, guardandoCampo, productoId,
  presetsPorImagen, presetCompresion, calidadPorImagen, statsPorImagen,
  actualizarPorImagen, conservarOriginalPorImagen, nombreDestinoPorImagen,
  setPresetsPorImagen, setCalidadPorImagen, setActualizarPorImagen,
  setConservarOriginalPorImagen, setNombreDestinoPorImagen,
  cerrarModalCampo, aplicarCambiosCampo
}) => {
  if (!imagenModal) return null
  const calidadActual = typeof calidadPorImagen[campoModalKey] === 'number' ? calidadPorImagen[campoModalKey] : 0.8

  return (
    <div className="modal-imagen-ia fade-in" onClick={cerrarModalCampo}>
      <div className="modal-contenido-ia slide-up" onClick={e => e.stopPropagation()}>
        <button className="modal-cerrar-ia" onClick={cerrarModalCampo} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '13px', fontWeight: '500' }}>Cerrar</button>
        <div className="modal-body-ia" style={{ position: 'relative' }}>
          <div className="modal-left">
            <img src={imagenModal} alt="Imagen" className="modal-imagen-preview" />
          </div>
          <div className="modal-right">
            <div className="modal-controles-optim">
              <div className="control">
                <label>Preset de optimización</label>
                <select value={presetsPorImagen[campoModalKey] || presetCompresion} onChange={e => setPresetsPorImagen(prev => ({ ...prev, [campoModalKey]: e.target.value }))}>
                  <option value="producto">Producto (90%)</option>
                  <option value="web">Web (80%)</option>
                  <option value="movil">Móvil (75%)</option>
                  <option value="thumbnail">Thumbnail (70%)</option>
                  <option value="ultra">Ultra (60%, WebP)</option>
                  <option value="extremo">Extremo (35%, WebP, 800×600)</option>
                </select>
              </div>
              <div className="control">
                <label>Calidad manual</label>
                <input type="range" min={0.1} max={0.95} step={0.05} value={calidadActual} onChange={e => setCalidadPorImagen(prev => ({ ...prev, [campoModalKey]: parseFloat(e.target.value) }))} />
                <span className="valor">{Math.round(100 * calidadActual)}%</span>
              </div>
              <div className="control">
                <label>Tamaño</label>
                <div className="tam-metrica">
                  <span className="origen">Original: {statsPorImagen[campoModalKey]?.tamaño?.originalFormateado || '—'}</span>
                  <span className="estimado">Optimizado: {statsPorImagen[campoModalKey]?.tamaño?.comprimidoFormateado || '—'}</span>
                </div>
              </div>
            </div>
            <div className="seleccion-guardado">
              <div className="checks">
                <label className="check">
                  <input type="checkbox" checked={actualizarPorImagen[campoModalKey] ?? true} onChange={e => setActualizarPorImagen(prev => ({ ...prev, [campoModalKey]: e.target.checked }))} />
                  Actualizar imagen (optimizar)
                </label>
                <label className="check">
                  <input type="checkbox" checked={conservarOriginalPorImagen[campoModalKey] ?? true} onChange={e => setConservarOriginalPorImagen(prev => ({ ...prev, [campoModalKey]: e.target.checked }))} />
                  Conservar original (backup)
                </label>
              </div>
              <div className="grupo">
                <label>Nombre de archivo destino</label>
                <input type="text" value={nombreDestinoPorImagen[campoModalKey] || ''} onChange={e => setNombreDestinoPorImagen(prev => ({ ...prev, [campoModalKey]: e.target.value }))} placeholder={campoModalKey ? `${campoModalKey}.webp` : 'nombre.ext'} />
              </div>
              <div className="grupo acciones">
                <small className="nota">El botón "Aplicar cambios" optimiza (si está activo), guarda backup original (si está activo) y actualiza el campo seleccionado.</small>
              </div>
            </div>
            <div className="modal-usos-ia">
              <h3>Información de uso</h3>
              <div className="no-usos">Campo: {campoModalKey}</div>
              <div className="no-usos">Producto ID: {productoId}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button className="btn" onClick={cerrarModalCampo}>Cancelar</button>
              <button className="btn btn-primario" disabled={guardandoCampo} onClick={aplicarCambiosCampo}>{guardandoCampo ? 'Guardando…' : 'Aplicar cambios'}</button>
            </div>
            {guardandoCampo && <div className="modal-guardando">Guardando…</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ModalOptimizacion
