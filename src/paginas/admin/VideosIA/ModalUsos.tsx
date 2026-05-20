import React from 'react'

interface Props {
  modalUsos: { archivo: any; usos: any[] } | null
  productos: { id: string; nombre: string }[]
  productoSel: string
  setProductoSel: (v: string) => void
  tipoSel: string
  setTipoSel: (v: string) => void
  onCerrar: () => void
  onAsignar: () => void
}

export default function ModalUsos({
  modalUsos,
  productos,
  productoSel,
  setProductoSel,
  tipoSel,
  setTipoSel,
  onCerrar,
  onAsignar
}: Props) {
  if (!modalUsos) return null
  return (
    <div className="modal-subida-ia" onClick={onCerrar}>
      <div className="modal-subida-contenido" onClick={e => e.stopPropagation()}>
        <h2 className="modal-subida-titulo">Usos del video</h2>
        <div className="modal-subida-form">
          <video src={modalUsos.archivo.url} className="video-preview" controls muted preload="metadata" style={{ borderRadius: 8, maxHeight: 200 }} />
          <div>
            <label>Producto</label>
            <select value={productoSel} onChange={e => setProductoSel(e.target.value)}>
              <option value="">Selecciona…</option>
              {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
          </div>
          <div>
            <label>Tipo</label>
            <select value={tipoSel} onChange={e => setTipoSel(e.target.value)}>
              <option value="producto">Producto</option>
              <option value="beneficios">Beneficios</option>
              <option value="anuncio_1">Anuncio 1</option>
              <option value="anuncio_2">Anuncio 2</option>
              <option value="anuncio_3">Anuncio 3</option>
              <option value="testimonio">Testimonio</option>
              <option value="extra">Extra</option>
            </select>
          </div>
        </div>
        <div className="modal-subida-acciones">
          <button className="btn" onClick={onCerrar}>Cerrar</button>
          <button className="btn btn-primario" onClick={onAsignar}>Asignar a producto</button>
        </div>
      </div>
    </div>
  )
}
