import React from 'react'
import { Filter, ChevronDown } from 'lucide-react'

interface Categoria {
  id: string
  nombre: string
  icono?: string
}

interface FiltrosInternos {
  categoria: string
  precioMin: string
  precioMax: string
  ordenar: string
  soloOfertas: boolean
  soloStock: boolean
}

interface Props {
  mostrar: boolean
  filtros: FiltrosInternos
  categorias: Categoria[]
  mostrarMovil: boolean
  onToggleMovil: () => void
  onFiltroChange: (filtro: Partial<FiltrosInternos>) => void
  onLimpiar: () => void
}

export default function FiltrosInternosGrid({
  mostrar,
  filtros,
  categorias,
  mostrarMovil,
  onToggleMovil,
  onFiltroChange,
  onLimpiar
}: Props) {
  if (!mostrar) return null

  return (
    <>
      <button className="filtros-movil-toggle" onClick={onToggleMovil}>
        <Filter size={20} />
        Filtros
        <ChevronDown className={mostrarMovil ? 'rotado' : ''} />
      </button>

      <div className={`filtros-container ${mostrarMovil ? 'visible' : ''}`}>
        <div className="filtros-grid">
          <div className="filtro-grupo">
            <label>Categoría</label>
            <select
              value={filtros.categoria}
              onChange={(e) => onFiltroChange({ categoria: e.target.value })}
              className="filtro-select"
            >
              <option value="">Todas las categorías</option>
              {categorias.map(categoria => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.icono} {categoria.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-grupo">
            <label>Precio mínimo</label>
            <input
              type="number"
              placeholder="$0"
              value={filtros.precioMin}
              onChange={(e) => onFiltroChange({ precioMin: e.target.value })}
              className="filtro-input"
            />
          </div>

          <div className="filtro-grupo">
            <label>Precio máximo</label>
            <input
              type="number"
              placeholder="Sin límite"
              value={filtros.precioMax}
              onChange={(e) => onFiltroChange({ precioMax: e.target.value })}
              className="filtro-input"
            />
          </div>

          <div className="filtro-grupo">
            <label className="filtro-checkbox">
              <input
                type="checkbox"
                checked={filtros.soloOfertas}
                onChange={(e) => onFiltroChange({ soloOfertas: e.target.checked })}
              />
              <span className="checkmark"></span>
              Solo ofertas
            </label>
          </div>

          <div className="filtro-grupo">
            <label className="filtro-checkbox">
              <input
                type="checkbox"
                checked={filtros.soloStock}
                onChange={(e) => onFiltroChange({ soloStock: e.target.checked })}
              />
              <span className="checkmark"></span>
              Solo disponibles
            </label>
          </div>

          <div className="filtro-grupo">
            <button onClick={onLimpiar} className="btn-limpiar">
              Limpiar filtros
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
