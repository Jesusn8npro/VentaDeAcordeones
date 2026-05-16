import React from 'react'
import { FolderOpen, Tag, Hash, Eye } from 'lucide-react'

interface Estadisticas {
  totalCategorias: number
  categoriasActivas: number
  categoriasConProductos: number
  categoriasSinProductos: number
}

interface EstadisticasCategoriasProps {
  estadisticas: Estadisticas
}

export default function EstadisticasCategorias({ estadisticas }: EstadisticasCategoriasProps) {
  const porcentajeConProductos = estadisticas.totalCategorias > 0
    ? ((estadisticas.categoriasConProductos / estadisticas.totalCategorias) * 100).toFixed(1)
    : 0

  return (
    <div className="estadisticas-grid">
      <div className="estadistica-card">
        <div className="estadistica-icono"><FolderOpen /></div>
        <div className="estadistica-contenido">
          <h3>Total Categorías</h3>
          <p className="estadistica-numero">{estadisticas.totalCategorias}</p>
          <span className="estadistica-cambio">{estadisticas.categoriasActivas} activas</span>
        </div>
      </div>

      <div className="estadistica-card">
        <div className="estadistica-icono"><Tag /></div>
        <div className="estadistica-contenido">
          <h3>Con Productos</h3>
          <p className="estadistica-numero">{estadisticas.categoriasConProductos}</p>
          <span className="estadistica-cambio positivo">{porcentajeConProductos}%</span>
        </div>
      </div>

      <div className="estadistica-card">
        <div className="estadistica-icono"><Hash /></div>
        <div className="estadistica-contenido">
          <h3>Sin Productos</h3>
          <p className="estadistica-numero">{estadisticas.categoriasSinProductos}</p>
          <span className="estadistica-cambio">Necesitan contenido</span>
        </div>
      </div>

      <div className="estadistica-card">
        <div className="estadistica-icono"><Eye /></div>
        <div className="estadistica-contenido">
          <h3>Activas</h3>
          <p className="estadistica-numero">{estadisticas.categoriasActivas}</p>
          <span className="estadistica-cambio positivo">Visibles al público</span>
        </div>
      </div>
    </div>
  )
}
