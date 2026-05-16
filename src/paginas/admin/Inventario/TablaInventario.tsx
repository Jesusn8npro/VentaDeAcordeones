import React from 'react'
import { Package, Warehouse, Edit, Eye } from 'lucide-react'

interface Categoria {
  id: string | number
  nombre: string
  icono?: string
}

interface ItemInventario {
  id: string
  cantidad: number
  stock_minimo: number
  ubicacion?: string
  productos?: {
    id: string
    nombre?: string
    slug?: string
    precio?: number
    categoria_id?: string | number
  }
}

interface EstadoStock {
  estado: string
  texto: string
  clase: string
  icono: React.ElementType
}

interface TablaInventarioProps {
  cargando: boolean
  inventario: ItemInventario[]
  categorias: Categoria[]
  obtenerEstadoStock: (item: ItemInventario) => EstadoStock
  formatearPrecio: (precio: number) => string
  onAjustar: (item: ItemInventario) => void
}

export default function TablaInventario({
  cargando,
  inventario,
  categorias,
  obtenerEstadoStock,
  formatearPrecio,
  onAjustar
}: TablaInventarioProps) {
  if (cargando) {
    return (
      <div className="cargando-inventario">
        <div className="spinner"></div>
        <p>Cargando inventario...</p>
      </div>
    )
  }

  if (inventario.length === 0) {
    return (
      <div className="inventario-vacio">
        <Warehouse className="vacio-icono" />
        <h3>No hay productos en inventario</h3>
        <p>Los productos aparecerán aquí cuando agregues stock</p>
      </div>
    )
  }

  return (
    <table className="tabla-inventario">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Slug</th>
          <th>Categoría</th>
          <th>Stock Actual</th>
          <th>Stock Mínimo</th>
          <th>Estado</th>
          <th>Valor</th>
          <th>Ubicación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {inventario.map(item => {
          const estadoStock = obtenerEstadoStock(item)
          const IconoEstado = estadoStock.icono
          const valorTotal = item.cantidad * (item.productos?.precio || 0)
          const categoriaEncontrada = categorias?.find(cat => cat.id === item.productos?.categoria_id) || null

          return (
            <tr key={item.id} className="fila-inventario">
              <td className="celda-producto">
                <div className="producto-info">
                  <div className="producto-imagen">
                    <div className="imagen-placeholder"><Package /></div>
                  </div>
                  <div className="producto-detalles">
                    <h4 className="producto-nombre">{item.productos?.nombre}</h4>
                    <p className="producto-precio">{formatearPrecio(item.productos?.precio || 0)}</p>
                  </div>
                </div>
              </td>
              <td className="celda-sku">
                {item.productos?.slug ? (
                  <a href={`/producto/${item.productos.slug}`} target="_blank" rel="noopener noreferrer" className="slug-link">
                    <code className="sku-codigo">{item.productos.slug}</code>
                  </a>
                ) : (
                  <code className="sku-codigo">—</code>
                )}
              </td>
              <td className="celda-categoria">
                {categoriaEncontrada?.nombre ? (
                  <div className="categoria-container">
                    <span className="categoria-badge categoria-premium">
                      <span className="categoria-icono-wrapper">{categoriaEncontrada.icono || '🏷️'}</span>
                      <span className="categoria-nombre-elegante">{categoriaEncontrada.nombre}</span>
                    </span>
                  </div>
                ) : (
                  <div className="categoria-container">
                    <span className="categoria-badge categoria-sin-asignar-elegante">
                      <span className="categoria-icono-wrapper">❓</span>
                      <span className="categoria-nombre-elegante">Sin categoría</span>
                    </span>
                  </div>
                )}
              </td>
              <td className="celda-stock-actual">
                <div className="stock-cantidad">
                  <span className="cantidad-numero">{item.cantidad}</span>
                  <span className="cantidad-unidad">unidades</span>
                </div>
              </td>
              <td className="celda-stock-minimo">
                <span className="stock-minimo">{item.stock_minimo}</span>
              </td>
              <td className="celda-estado">
                <span className={`estado-badge ${estadoStock.clase}`}>
                  <IconoEstado className="estado-icono" />
                  {estadoStock.texto}
                </span>
              </td>
              <td className="celda-valor">
                <span className="valor-total">{formatearPrecio(valorTotal)}</span>
              </td>
              <td className="celda-ubicacion">
                <span className="ubicacion-texto">{item.ubicacion || 'No especificada'}</span>
              </td>
              <td className="celda-acciones">
                <div className="acciones-inventario">
                  <button onClick={() => onAjustar(item)} className="accion-boton ajustar" title="Ajustar stock">
                    <Edit />
                  </button>
                  <button className="accion-boton ver" title="Ver historial">
                    <Eye />
                  </button>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
