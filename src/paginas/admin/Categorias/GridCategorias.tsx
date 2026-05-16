import React from 'react'
import { FolderOpen, Tag, Eye, EyeOff, Package, Edit, Trash2, Plus } from 'lucide-react'

interface Categoria {
  id: string | number
  nombre: string
  descripcion?: string
  slug?: string
  imagen_url?: string
  icono?: string
  activo: boolean
  destacado?: boolean
  orden?: number
  total_productos?: number
}

interface GridCategoriasProps {
  cargando: boolean
  categoriasFiltradas: Categoria[]
  dragOverCategoriaId: string | number | null
  seleccionadas: (string | number)[]
  onToggleSeleccion: (id: string | number) => void
  onNuevaCategoria: () => void
  onEditar: (categoria: Categoria) => void
  onEliminar: (id: string | number) => void
  onAlternarEstado: (id: string | number, activo: boolean) => void
  onDropEnCategoria: (e: React.DragEvent, categoria: Categoria) => void
  onDragOverCategoria: (id: string | number) => void
  onDragLeaveCategoria: () => void
}

export default function GridCategorias({
  cargando,
  categoriasFiltradas,
  dragOverCategoriaId,
  seleccionadas,
  onToggleSeleccion,
  onNuevaCategoria,
  onEditar,
  onEliminar,
  onAlternarEstado,
  onDropEnCategoria,
  onDragOverCategoria,
  onDragLeaveCategoria
}: GridCategoriasProps) {
  if (cargando) {
    return (
      <div className="cargando-categorias">
        <div className="spinner"></div>
        <p>Cargando categorías...</p>
      </div>
    )
  }

  if (categoriasFiltradas.length === 0) {
    return (
      <div className="categorias-vacio">
        <FolderOpen className="vacio-icono" />
        <h3>No hay categorías</h3>
        <p>Comienza creando tu primera categoría</p>
        <button onClick={onNuevaCategoria} className="boton-primario">
          <Plus size={16} />
          Nueva Categoría
        </button>
      </div>
    )
  }

  return (
    <div className="categorias-grid-lista">
      {categoriasFiltradas.map(categoria => {
        const estaSeleccionada = seleccionadas.includes(categoria.id)
        return (
          <div
            key={categoria.id}
            className={`categoria-card ${dragOverCategoriaId === categoria.id ? 'dropzone-activa' : ''} ${estaSeleccionada ? 'seleccionada' : ''}`}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => onDragOverCategoria(categoria.id)}
            onDragLeave={onDragLeaveCategoria}
            onDrop={(e) => onDropEnCategoria(e, categoria)}
          >
            <input
              type="checkbox"
              className="categoria-checkbox-bulk"
              checked={estaSeleccionada}
              onChange={() => onToggleSeleccion(categoria.id)}
              title="Seleccionar categoría"
            />

            <div className="categoria-imagen">
              {categoria.imagen_url ? (
                <img
                  src={categoria.imagen_url}
                  alt={categoria.nombre}
                  className="categoria-imagen-img"
                  onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/150x150?text=Sin+Imagen' }}
                />
              ) : (
                <div className="categoria-imagen-placeholder">
                  <Tag size={24} />
                </div>
              )}
              <div className="categoria-estado-overlay">
                <button
                  onClick={() => onAlternarEstado(categoria.id, categoria.activo)}
                  className={`estado-boton ${categoria.activo ? 'activo' : 'inactivo'}`}
                  title={categoria.activo ? 'Desactivar categoría' : 'Activar categoría'}
                >
                  {categoria.activo ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
              </div>
            </div>

            <div className="categoria-contenido">
              <div className="categoria-info">
                <h3 className="categoria-nombre">
                  {categoria.icono && <span className="categoria-icono">{categoria.icono}</span>}
                  {categoria.nombre}
                </h3>
                <p className="categoria-descripcion">{categoria.descripcion}</p>
                <div className="categoria-meta">
                  <span className="categoria-productos">
                    <Package size={12} />
                    {categoria.total_productos || 0} productos
                  </span>
                  <span className="categoria-orden">Orden: {categoria.orden}</span>
                </div>
              </div>
              <div className="categoria-acciones">
                <button onClick={() => onEditar(categoria)} className="accion-boton editar" title="Editar categoría">
                  <Edit size={16} />
                  Editar
                </button>
                <button onClick={() => onEliminar(categoria.id)} className="accion-boton eliminar" title="Eliminar categoría">
                  <Trash2 size={16} />
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
