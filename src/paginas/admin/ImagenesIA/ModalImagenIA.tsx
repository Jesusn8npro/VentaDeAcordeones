import React from 'react'

interface Uso {
  producto_id: string | number
  producto?: { id: string | number; nombre?: string; slug?: string }
  campo: string
  valor?: string
}

interface PreviewProducto {
  producto?: { id: string | number; nombre?: string; slug?: string; precio?: number }
  imagenes?: { imagen_principal?: string }
}

interface ArchivoSeleccionado {
  key?: string
  path: string
  name: string
}

interface ModalImagenIAProps {
  imagenModal: string
  archivoSeleccionado: ArchivoSeleccionado | null
  usos: Uso[]
  previewsProductos: PreviewProducto[]
  presetCompresion: string
  calidadManual: number | null
  tamOriginalKB: number | null
  tamEstimadoKB: number | null
  calculandoTamano: boolean
  actualizarActiva: boolean
  conservarOriginal: boolean
  productoSeleccionadoId: string | null
  campoSeleccionado: string
  nombreDestino: string
  guardandoCampo: boolean
  busquedaProducto: string
  productosSelector: Array<{ id: string | number; nombre: string }>
  cargandoProductos: boolean
  onSetPresetCompresion: (v: string) => void
  onSetCalidadManual: (v: number) => void
  onSetActualizarActiva: (v: boolean) => void
  onSetConservarOriginal: (v: boolean) => void
  onSetProductoSeleccionadoId: (v: string | null) => void
  onSetCampoSeleccionado: (v: string) => void
  onSetNombreDestino: (v: string) => void
  onSetBusquedaProducto: (v: string) => void
  onAplicarCambios: () => Promise<void>
  onCerrar: () => void
}

export default function ModalImagenIA({
  imagenModal, archivoSeleccionado, usos, previewsProductos,
  presetCompresion, calidadManual, tamOriginalKB, tamEstimadoKB, calculandoTamano,
  actualizarActiva, conservarOriginal, productoSeleccionadoId, campoSeleccionado,
  nombreDestino, guardandoCampo, busquedaProducto, productosSelector, cargandoProductos,
  onSetPresetCompresion, onSetCalidadManual, onSetActualizarActiva, onSetConservarOriginal,
  onSetProductoSeleccionadoId, onSetCampoSeleccionado, onSetNombreDestino,
  onSetBusquedaProducto, onAplicarCambios, onCerrar
}: ModalImagenIAProps) {
  return (
    <div className="modal-imagen-ia fade-in" onClick={onCerrar}>
      <div className="modal-contenido-ia slide-up" onClick={e => e.stopPropagation()}>
        <button className="modal-cerrar-ia" onClick={onCerrar}>Cerrar</button>
        <div className="modal-body-ia" style={{ position: 'relative' }}>
          <div className="modal-left">
            <img src={imagenModal} alt="Imagen" className="modal-imagen-preview" />
          </div>
          <div className="modal-right">
            <div className="modal-controles-optim">
              <div className="control">
                <label>Preset de optimización</label>
                <select value={presetCompresion} onChange={e => onSetPresetCompresion(e.target.value)}>
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
                <input type="range" min={0.1} max={0.95} step={0.05}
                  value={typeof calidadManual === 'number' ? calidadManual : 0.8}
                  onChange={e => onSetCalidadManual(parseFloat(e.target.value))}
                />
                <span className="valor">{Math.round(100 * (typeof calidadManual === 'number' ? calidadManual : 0.8))}%</span>
              </div>
              <div className="control">
                <label>Tamaño</label>
                <div className="tam-metrica">
                  <span className="origen">Original: {tamOriginalKB ? `${tamOriginalKB} KB` : '—'}</span>
                  <span className="estimado">{calculandoTamano ? 'Calculando…' : `Optimizado: ${tamEstimadoKB ? `${tamEstimadoKB} KB` : '—'}`}</span>
                </div>
              </div>
              <button className="btn btn-ambar"
                disabled={guardandoCampo || !archivoSeleccionado || !productoSeleccionadoId || !campoSeleccionado}
                onClick={onAplicarCambios}
              >
                Aplicar cambios
              </button>
              {guardandoCampo && <div className="modal-guardando">Guardando…</div>}
            </div>
            <div className="seleccion-guardado">
              <div className="checks">
                <label className="check">
                  <input type="checkbox" checked={actualizarActiva} onChange={e => onSetActualizarActiva(e.target.checked)} />
                  Actualizar imagen (optimizar)
                </label>
                <label className="check">
                  <input type="checkbox" checked={conservarOriginal} onChange={e => onSetConservarOriginal(e.target.checked)} />
                  Conservar original (backup)
                </label>
              </div>
              <div className="grupo">
                <label>Producto</label>
                <input type="text" placeholder="Buscar producto (min 2 letras)" value={busquedaProducto} onChange={e => onSetBusquedaProducto(e.target.value)} />
                <select value={productoSeleccionadoId || ''} onChange={e => onSetProductoSeleccionadoId(e.target.value || null)}>
                  <option value="">Selecciona…</option>
                  {productosSelector.map(p => <option key={`opt-${p.id}`} value={p.id}>{p.nombre}</option>)}
                </select>
                {cargandoProductos && <small>Cargando productos…</small>}
              </div>
              <div className="grupo">
                <label>Campo</label>
                <select value={campoSeleccionado} onChange={e => onSetCampoSeleccionado(e.target.value)}>
                  <option value="">Selecciona campo…</option>
                  {['imagen_principal','imagen_secundaria_1','imagen_secundaria_2','imagen_secundaria_3','imagen_secundaria_4',
                    'imagen_punto_dolor_1','imagen_punto_dolor_2','imagen_solucion_1','imagen_solucion_2',
                    'imagen_testimonio_persona_1','imagen_testimonio_persona_2','imagen_testimonio_persona_3',
                    'imagen_testimonio_producto_1','imagen_testimonio_producto_2','imagen_testimonio_producto_3',
                    'imagen_caracteristicas','imagen_garantias','imagen_cta_final'
                  ].map(campo => <option key={campo} value={campo}>{campo}</option>)}
                </select>
              </div>
              <div className="grupo">
                <label>Nombre de archivo destino</label>
                <input type="text" placeholder={archivoSeleccionado?.name || ''} value={nombreDestino} onChange={e => onSetNombreDestino(e.target.value)} />
              </div>
              <div className="grupo acciones">
                <small className="nota">El botón "Aplicar cambios" optimiza (si está activo), guarda backup original (si está activo) y actualiza el campo seleccionado.</small>
              </div>
            </div>
            <div className="modal-usos-ia">
              <h3>Usos detectados</h3>
              {usos.length === 0 ? (
                <div className="no-usos">No hay usos registrados.</div>
              ) : (
                <ul className="lista-usos">
                  {usos.map(u => (
                    <li key={`m-${u.producto_id}-${u.campo}`} className="item-uso">
                      <div>
                        <div className="uso-id">Producto ID: {u.producto_id}</div>
                        <div className="uso-detalle">{u.producto?.nombre}</div>
                        <div className="uso-detalle">Campo: {u.campo}</div>
                      </div>
                      {u.producto?.slug && (
                        <div className="links-producto">
                          <a href={`/producto/${u.producto.slug}`} className="link-producto">Ver producto</a>
                          <a href={`/landing/${u.producto.slug}`} className="link-producto">Ver landing</a>
                          <button className="btn btn-secundario" onClick={() => { onSetProductoSeleccionadoId(u.producto_id as string); onSetCampoSeleccionado(u.campo) }}>Seleccionar</button>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {previewsProductos.length > 0 && (
              <div className="previews-productos">
                <h3>Productos asociados</h3>
                <div className="grid-previews">
                  {previewsProductos.map((p) => (
                    <div key={`pv-${p.producto?.id}`} className="preview-card">
                      <div className="preview-imagen">
                        {p.imagenes?.imagen_principal ? (
                          <img src={p.imagenes.imagen_principal} alt={p.producto?.nombre} />
                        ) : (
                          <div className="preview-placeholder">Sin imagen</div>
                        )}
                      </div>
                      <div className="preview-info">
                        <div className="preview-titulo">{p.producto?.nombre}</div>
                        {typeof p.producto?.precio === 'number' && (
                          <div className="preview-precio">${p.producto.precio.toLocaleString('es-CO')}</div>
                        )}
                        {p.producto?.slug && (
                          <div className="links-producto">
                            <a href={`/producto/${p.producto.slug}`} className="link-producto">Ver producto</a>
                            <a href={`/landing/${p.producto.slug}`} className="link-producto">Ver landing</a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
