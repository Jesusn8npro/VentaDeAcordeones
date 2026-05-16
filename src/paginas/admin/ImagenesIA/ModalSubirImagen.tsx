import React from 'react'

const BUCKETS = ['imagenes', 'imagenes_tienda', 'imagenes_categorias', 'imagenes_articulos']

interface ModalSubirImagenProps {
  archivoNuevo: File | null
  nombreNuevo: string
  bucketDestino: string
  optimizarNuevo: boolean
  presetNuevo: string
  calidadNueva: number | null
  conservarOriginalNuevo: boolean
  subiendoNuevo: boolean
  urlPreviewNuevo: string | null
  tamOriginalNuevoKB: number | null
  tamEstimadoNuevoKB: number | null
  calculandoTamanoNuevo: boolean
  onSetArchivoNuevo: (file: File | null) => void
  onSetNombreNuevo: (nombre: string) => void
  onSetBucketDestino: (bucket: string) => void
  onSetOptimizarNuevo: (v: boolean) => void
  onSetPresetNuevo: (v: string) => void
  onSetCalidadNueva: (v: number | null) => void
  onSetConservarOriginalNuevo: (v: boolean) => void
  onSubir: () => Promise<void>
  onCerrar: () => void
}

export default function ModalSubirImagen({
  archivoNuevo, nombreNuevo, bucketDestino, optimizarNuevo, presetNuevo,
  calidadNueva, conservarOriginalNuevo, subiendoNuevo, urlPreviewNuevo,
  tamOriginalNuevoKB, tamEstimadoNuevoKB, calculandoTamanoNuevo,
  onSetArchivoNuevo, onSetNombreNuevo, onSetBucketDestino, onSetOptimizarNuevo,
  onSetPresetNuevo, onSetCalidadNueva, onSetConservarOriginalNuevo, onSubir, onCerrar
}: ModalSubirImagenProps) {
  const handleCancelar = () => {
    onCerrar()
    onSetArchivoNuevo(null)
    onSetNombreNuevo('')
    onSetCalidadNueva(null)
  }

  return (
    <div className="modal-subida-ia" onClick={onCerrar}>
      <div className="modal-subida-contenido" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-subida-titulo">Subir imagen al bucket</h2>
        <div className="modal-subida-form">
          <input type="file" accept="image/*" onChange={e => onSetArchivoNuevo(e.target.files?.[0] || null)} />
          <input type="text" placeholder="Nombre del archivo (opcional)" value={nombreNuevo} onChange={e => onSetNombreNuevo(e.target.value)} />
          <select className="select-preset" value={bucketDestino} onChange={e => onSetBucketDestino(e.target.value)}>
            {BUCKETS.map((b) => <option key={`bkt-${b}`} value={b}>{b}</option>)}
          </select>
          {urlPreviewNuevo && (
            <div className="preview-subida">
              <img src={urlPreviewNuevo} alt="Previsualización" />
              <div className="preview-info">
                <div>Nombre seleccionado: <b>{archivoNuevo?.name}</b></div>
                <div>Tamaño original: {tamOriginalNuevoKB ? `${tamOriginalNuevoKB} KB` : '—'}</div>
                <div>Optimizado: {calculandoTamanoNuevo ? 'Calculando…' : (tamEstimadoNuevoKB ? `${tamEstimadoNuevoKB} KB` : '—')}</div>
              </div>
            </div>
          )}
          <label className="check">
            <input type="checkbox" checked={optimizarNuevo} onChange={e => onSetOptimizarNuevo(e.target.checked)} />
            Optimizar imagen
          </label>
          <select className="select-preset" value={presetNuevo} onChange={e => onSetPresetNuevo(e.target.value)}>
            <option value="producto">Producto (90%)</option>
            <option value="web">Web (80%)</option>
            <option value="movil">Móvil (75%)</option>
            <option value="thumbnail">Thumbnail (70%)</option>
            <option value="ultra">Ultra (60%)</option>
            <option value="extremo">Extremo (35%)</option>
          </select>
          <input type="range" min={0.1} max={0.95} step={0.05}
            value={typeof calidadNueva === 'number' ? calidadNueva : 0.8}
            onChange={e => onSetCalidadNueva(parseFloat(e.target.value))}
          />
          <label className="check">
            <input type="checkbox" checked={conservarOriginalNuevo} onChange={e => onSetConservarOriginalNuevo(e.target.checked)} />
            Conservar original (backup)
          </label>
        </div>
        <div className="modal-subida-acciones">
          <button className="btn" onClick={handleCancelar}>Cancelar</button>
          <button className="btn btn-primario" disabled={!archivoNuevo || subiendoNuevo} onClick={onSubir}>
            {subiendoNuevo ? 'Subiendo...' : 'Subir'}
          </button>
        </div>
      </div>
    </div>
  )
}
