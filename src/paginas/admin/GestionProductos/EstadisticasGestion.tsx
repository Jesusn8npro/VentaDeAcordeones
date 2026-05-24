import { Package, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

interface Props {
  totalProductos: number
  productosActivos: number
  valorInventario: number
  productosBajoStock: number
  formatearPrecio: (v: number) => string
}

export default function EstadisticasGestion({ totalProductos, productosActivos, valorInventario, productosBajoStock, formatearPrecio }: Props) {
  return (
    <div className="gestion-estadisticas">
      <div className="gestion-card">
        <div className="gestion-card-icono"><Package /></div>
        <div>
          <h4>Total</h4>
          <p className="gestion-card-numero">{totalProductos}</p>
        </div>
      </div>
      <div className="gestion-card">
        <div className="gestion-card-icono"><DollarSign /></div>
        <div>
          <h4>Inventario</h4>
          <p className="gestion-card-numero">{formatearPrecio(valorInventario)}</p>
        </div>
      </div>
      <div className="gestion-card">
        <div className="gestion-card-icono"><TrendingUp /></div>
        <div>
          <h4>Activos</h4>
          <p className="gestion-card-numero">{productosActivos}</p>
        </div>
      </div>
      <div className="gestion-card">
        <div className="gestion-card-icono"><AlertCircle /></div>
        <div>
          <h4>Bajo stock</h4>
          <p className="gestion-card-numero">{productosBajoStock}</p>
        </div>
      </div>
    </div>
  )
}
