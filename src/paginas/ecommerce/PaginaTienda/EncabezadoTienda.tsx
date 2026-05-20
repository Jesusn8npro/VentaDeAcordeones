'use client'

import React from 'react'
import { Flame, TrendingUp, Package, Zap, SlidersHorizontal, X, Grid, List } from 'lucide-react'

interface Props {
  categoriaActual: any
  filtrosActivos: number
  limpiarFiltros: () => void
  ordenar: string
  onOrdenarChange: (v: string) => void
  vista: string
  onVistaChange: (v: string) => void
}

export default function EncabezadoTienda({
  categoriaActual,
  filtrosActivos,
  limpiarFiltros,
  ordenar,
  onOrdenarChange,
  vista,
  onVistaChange
}: Props) {
  return (
    <div className="tienda-header">
      <div className="tienda-info-categoria">
        {categoriaActual ? (
          <>
            <div className="categoria-badges">
              {categoriaActual.productos_en_oferta > 0 && (
                <span className="categoria-badge badge-ofertas">
                  <Flame size={14} />
                  {categoriaActual.productos_en_oferta} Ofertas Activas
                </span>
              )}
              {categoriaActual.descuento_promedio > 0 && (
                <span className="categoria-badge badge-descuento">
                  <TrendingUp size={14} />
                  Hasta {categoriaActual.descuento_promedio}% OFF
                </span>
              )}
            </div>

            <h1 className="tienda-titulo">{categoriaActual.nombre}</h1>
            <p className="tienda-descripcion">
              {categoriaActual.descripcion || `Explora nuestra selección de ${categoriaActual.nombre.toLowerCase()}`}
            </p>

            <div className="categoria-stats">
              <div className="stat-item">
                <Package size={18} />
                <span><strong>{categoriaActual.total_productos}+</strong> Productos</span>
              </div>
              <div className="stat-item">
                <Zap size={18} />
                <span><strong>24h</strong> Envío Express</span>
              </div>
              <div className="stat-item">
                <TrendingUp size={18} />
                <span><strong>TOP</strong> Ventas</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <h1 className="tienda-titulo">Todos los productos</h1>
            <p className="tienda-descripcion">
              Descubre nuestra colección completa con los mejores precios
            </p>
          </>
        )}
      </div>

      <div className="tienda-controles">
        {filtrosActivos > 0 && (
          <div className="filtros-activos-grupo">
            <div className="filtros-activos">
              <SlidersHorizontal size={16} />
              <span>{filtrosActivos} filtro{filtrosActivos !== 1 ? 's' : ''} activo{filtrosActivos !== 1 ? 's' : ''}</span>
            </div>
            <button onClick={limpiarFiltros} className="btn-limpiar-filtros" title="Limpiar todos los filtros">
              <X size={16} />
              Limpiar
            </button>
          </div>
        )}

        <div className="control-grupo">
          <label htmlFor="ordenar">Ordenar por:</label>
          <select
            id="ordenar"
            value={ordenar}
            onChange={(e) => onOrdenarChange(e.target.value)}
            className="control-select"
          >
            <option value="relevancia">Relevancia</option>
            <option value="precio-menor">Precio: menor a mayor</option>
            <option value="precio-mayor">Precio: mayor a menor</option>
            <option value="nombre">Nombre A-Z</option>
            <option value="nuevo">Más recientes</option>
            <option value="popular">Más populares</option>
          </select>
        </div>

        <div className="control-grupo">
          <label>Vista:</label>
          <div className="vista-botones">
            <button
              onClick={() => onVistaChange('grid')}
              className={`vista-btn ${vista === 'grid' ? 'activo' : ''}`}
              title="Vista en cuadrícula"
            >
              <Grid size={18} />
            </button>
            <button
              onClick={() => onVistaChange('lista')}
              className={`vista-btn ${vista === 'lista' ? 'activo' : ''}`}
              title="Vista en lista"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
