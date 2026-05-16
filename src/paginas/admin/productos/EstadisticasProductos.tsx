import React from 'react'
import { Package, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'

interface Estadisticas {
  totalProductos: number
  productosActivos: number
  valorInventario: number
  productosBajoStock: number
}

interface EstadisticasProductosProps {
  estadisticas: Estadisticas
  formatearPrecio: (valor: number) => string
}

const EstadisticasProductos = ({ estadisticas, formatearPrecio }: EstadisticasProductosProps) => (
  <div className="estadisticas-grid">
    <div className="estadistica-card estadistica-total">
      <div className="estadistica-icono"><Package /></div>
      <div className="estadistica-contenido">
        <h3>Total Productos</h3>
        <p className="estadistica-numero">{estadisticas.totalProductos}</p>
        <span className="estadistica-cambio positivo">{estadisticas.productosActivos} activos</span>
      </div>
    </div>
    <div className="estadistica-card estadistica-valor">
      <div className="estadistica-icono"><DollarSign /></div>
      <div className="estadistica-contenido">
        <h3>Valor Inventario</h3>
        <p className="estadistica-numero">{formatearPrecio(estadisticas.valorInventario)}</p>
        <span className="estadistica-cambio">Total en stock</span>
      </div>
    </div>
    <div className="estadistica-card estadistica-stock">
      <div className="estadistica-icono"><TrendingUp /></div>
      <div className="estadistica-contenido">
        <h3>Productos Activos</h3>
        <p className="estadistica-numero">{estadisticas.productosActivos}</p>
        <span className="estadistica-cambio positivo">
          {((estadisticas.productosActivos / estadisticas.totalProductos) * 100).toFixed(1)}%
        </span>
      </div>
    </div>
    <div className="estadistica-card estadistica-alerta">
      <div className="estadistica-icono"><AlertCircle /></div>
      <div className="estadistica-contenido">
        <h3>Bajo Stock</h3>
        <p className="estadistica-numero">{estadisticas.productosBajoStock}</p>
        <span className="estadistica-cambio negativo">Requieren atención</span>
      </div>
    </div>
  </div>
)

export default EstadisticasProductos
