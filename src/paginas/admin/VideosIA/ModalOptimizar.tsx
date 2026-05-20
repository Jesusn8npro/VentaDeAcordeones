import React from 'react'

interface Props {
  modalOptimizar: any | null
  tamanos: Record<string, number>
  tamOriginalModalKB: number | null
  tamanioOptimizado: number | null
  optimizacionPreset: string
  setOptimizacionPreset: (v: string) => void
  optimizacionCalidad: number
  setOptimizacionCalidad: (v: number) => void
  conservarOriginal: boolean
  setConservarOriginal: (v: boolean) => void
  actualizarVideo: boolean
  setActualizarVideo: (v: boolean) => void
  nombreOptimizado: string
  setNombreOptimizado: (v: string) => void
  optimizacionCargando: boolean
  onCerrar: () => void
  onAplicar: () => void
}

export default function ModalOptimizar({
  modalOptimizar,
  tamanos,
  tamOriginalModalKB,
  tamanioOptimizado,
  optimizacionPreset,
  setOptimizacionPreset,
  optimizacionCalidad,
  setOptimizacionCalidad,
  conservarOriginal,
  setConservarOriginal,
  actualizarVideo,
  setActualizarVideo,
  nombreOptimizado,
  setNombreOptimizado,
  optimizacionCargando,
  onCerrar,
  onAplicar
}: Props) {
  if (!modalOptimizar) return null
  return (
    <div className="modal-subida-ia" onClick={onCerrar}>
      <div className="modal-subida-contenido modal-optimizacion" onClick={e => e.stopPropagation()}>
        <h2 className="modal-subida-titulo">Optimizar video</h2>
        <div className="modal-optimizacion-body">
          <div className="video-preview-container">
            <video src={modalOptimizar.url} className="video-preview" controls muted preload="metadata" />
          </div>
          <div className="optimizacion-config">
            <div>
              <label>Preset de optimización</label>
              <select value={optimizacionPreset} onChange={e => setOptimizacionPreset(e.target.value)}>
                <option value="web">Web (80%)</option>
                <option value="mobile">Móvil (60%)</option>
                <option value="high">Alta calidad (90%)</option>
                <option value="low">Baja calidad (40%)</option>
              </select>
            </div>
            <div>
              <label>Calidad manual</label>
              <div className="slider-container">
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={optimizacionCalidad}
                  onChange={e => setOptimizacionCalidad(parseInt(e.target.value))}
                  onMouseUp={e => e.stopPropagation()}
                  onTouchEnd={e => e.stopPropagation()}
                  disabled={optimizacionPreset !== 'web'}
                />
                <span className="slider-valor">{optimizacionCalidad}%</span>
              </div>
            </div>
            <div className="info-tamanio">
              <div>Original: {tamOriginalModalKB ? `${tamOriginalModalKB} KB` : (tamanos[modalOptimizar.url] ? `${Math.round(tamanos[modalOptimizar.url] / 1024)} KB` : '—')}</div>
              <div>Optimizado: {tamanioOptimizado ? `${Math.round(tamanioOptimizado / 1024)} KB` : 'Calculando...'}</div>
              {tamanioOptimizado && tamanos[modalOptimizar.url] && (
                <div className="ahorro-info">
                  Ahorro: {Math.round((1 - tamanioOptimizado / tamanos[modalOptimizar.url]) * 100)}%
                </div>
              )}
            </div>
            <label className="checkbox-label">
              <input type="checkbox" checked={conservarOriginal} onChange={e => setConservarOriginal(e.target.checked)} onClick={e => e.stopPropagation()} />
              Conservar original (backup)
            </label>
            <label className="checkbox-label">
              <input type="checkbox" checked={actualizarVideo} onChange={e => setActualizarVideo(e.target.checked)} onClick={e => e.stopPropagation()} />
              Actualizar este video (sobrescribir)
            </label>
            {!actualizarVideo && (
              <div>
                <label>Nombre de archivo destino</label>
                <input
                  type="text"
                  value={nombreOptimizado}
                  onChange={e => setNombreOptimizado(e.target.value)}
                  placeholder="nombre_del_archivo"
                />
              </div>
            )}
          </div>
        </div>
        <div className="modal-subida-acciones">
          <button className="btn" onClick={onCerrar}>Cancelar</button>
          <button className="btn btn-primario" onClick={onAplicar} disabled={optimizacionCargando}>
            {optimizacionCargando ? 'Optimizando...' : actualizarVideo ? 'Actualizar video' : 'Aplicar cambios'}
          </button>
        </div>
      </div>
    </div>
  )
}
