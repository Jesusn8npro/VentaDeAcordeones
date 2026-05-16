import React from 'react'
import { Search, Package, Tag } from 'lucide-react'

interface Producto {
  id: string | number
  nombre: string
  categoria_id?: string | number | null
}

interface Categoria {
  id: string | number
  nombre: string
  total_productos?: number
}

interface PanelAsignacionProductosProps {
  productosFiltrados: Producto[]
  categorias: Categoria[]
  busquedaProductos: string
  soloSinCategoria: boolean
  dragOverCategoriaId: string | number | null
  obtenerNombreCategoria: (id: string | number) => string | null
  onBusquedaProductos: (valor: string) => void
  onSoloSinCategoria: (valor: boolean) => void
  onDragInicioProducto: (e: React.DragEvent, producto: Producto) => void
  onDropEnCategoria: (e: React.DragEvent, categoria: Categoria) => void
  onDropSinCategoria: (e: React.DragEvent) => void
  onDragOverCategoria: (id: string | number) => void
  onDragLeaveCategoria: () => void
}

export default function PanelAsignacionProductos({
  productosFiltrados,
  categorias,
  busquedaProductos,
  soloSinCategoria,
  dragOverCategoriaId,
  obtenerNombreCategoria,
  onBusquedaProductos,
  onSoloSinCategoria,
  onDragInicioProducto,
  onDropEnCategoria,
  onDropSinCategoria,
  onDragOverCategoria,
  onDragLeaveCategoria
}: PanelAsignacionProductosProps) {
  return (
    <div className="asignacion-panel">
      <div className="asignacion-col izquierda">
        <div className="asignacion-header">
          <h3>Productos</h3>
          <div className="asignacion-filtros">
            <div className="filtro-busqueda">
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={busquedaProductos}
                onChange={(e) => onBusquedaProductos(e.target.value)}
                className="input-busqueda-pequeno"
              />
            </div>
            <label className="filtro-checkbox">
              <input
                type="checkbox"
                checked={soloSinCategoria}
                onChange={(e) => onSoloSinCategoria(e.target.checked)}
              />
              Solo sin categoría
            </label>
          </div>
        </div>

        <div className="productos-lista">
          {productosFiltrados.map(producto => (
            <div
              key={producto.id}
              className="producto-item"
              draggable
              onDragStart={(e) => onDragInicioProducto(e, producto)}
            >
              <div className="producto-info">
                <h4>{producto.nombre}</h4>
              </div>
              {producto.categoria_id && (
                <span className="producto-categoria-actual">
                  {obtenerNombreCategoria(producto.categoria_id)}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="asignacion-col derecha">
        <div className="asignacion-header">
          <h3>Zonas de Asignación</h3>
        </div>

        <div
          className="dropzone sin-categoria"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDropSinCategoria}
        >
          <Package size={24} />
          <h4>Sin Categoría</h4>
          <p>Arrastra productos aquí para quitar su categoría</p>
        </div>

        <div className="categorias-dropzones">
          {categorias.map(categoria => (
            <div
              key={categoria.id}
              className={`dropzone categoria-dropzone ${dragOverCategoriaId === categoria.id ? 'activa' : ''}`}
              onDragOver={(e) => e.preventDefault()}
              onDragEnter={() => onDragOverCategoria(categoria.id)}
              onDragLeave={onDragLeaveCategoria}
              onDrop={(e) => onDropEnCategoria(e, categoria)}
            >
              <Tag size={20} />
              <h4>{categoria.nombre}</h4>
              <p>{categoria.total_productos || 0} productos</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
