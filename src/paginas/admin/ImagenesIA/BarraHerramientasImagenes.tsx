import React from 'react'

const BUCKETS = ['imagenes', 'imagenes_tienda', 'imagenes_categorias', 'imagenes_articulos']

interface BarraHerramientasImagenesProps {
  bucketSeleccionado: string
  busqueda: string
  orden: string
  tamMinKB: string
  tamMaxKB: string
  seleccionadosSize: number
  onSetBucket: (v: string) => void
  onSetBusqueda: (v: string) => void
  onSetOrden: (v: string) => void
  onSetTamMinKB: (v: string) => void
  onSetTamMaxKB: (v: string) => void
  onAbrirSubir: () => void
  onEliminarSeleccionadas: () => void
}

export default function BarraHerramientasImagenes({
  bucketSeleccionado, busqueda, orden, tamMinKB, tamMaxKB, seleccionadosSize,
  onSetBucket, onSetBusqueda, onSetOrden, onSetTamMinKB, onSetTamMaxKB,
  onAbrirSubir, onEliminarSeleccionadas
}: BarraHerramientasImagenesProps) {
  return (
    <div className="barra-herramientas">
      <label>Bucket</label>
      <select value={bucketSeleccionado} onChange={e => onSetBucket(e.target.value)}>
        {BUCKETS.map(b => <option key={b} value={b}>{b}</option>)}
      </select>
      <input placeholder="Buscar por nombre..." value={busqueda} onChange={e => onSetBusqueda(e.target.value)} />
      <select value={orden} onChange={e => onSetOrden(e.target.value)}>
        <option value="recientes">Más recientes</option>
        <option value="antiguas">Más antiguas</option>
        <option value="tamano_mayor">Tamaño mayor</option>
        <option value="tamano_menor">Tamaño menor</option>
        <option value="nombre">Nombre A-Z</option>
      </select>
      <div className="filtro-tamano">
        <input type="number" min="0" placeholder="Tamaño min (KB)" value={tamMinKB} onChange={e => onSetTamMinKB(e.target.value)} />
        <input type="number" min="0" placeholder="Tamaño max (KB)" value={tamMaxKB} onChange={e => onSetTamMaxKB(e.target.value)} />
      </div>
      <button className="btn btn-primario" onClick={onAbrirSubir}>Subir archivo</button>
      <button className="btn btn-peligro" disabled={seleccionadosSize === 0} onClick={onEliminarSeleccionadas}>
        Eliminar seleccionadas
      </button>
    </div>
  )
}
