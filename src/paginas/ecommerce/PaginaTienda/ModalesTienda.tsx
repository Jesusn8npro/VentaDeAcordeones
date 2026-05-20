import React from 'react'
import { X, Check } from 'lucide-react'
import PanelFiltros from '../../../componentes/tienda/PanelFiltros'

const FILTROS_VACIOS = {
  busqueda: '',
  categorias: [],
  precioMin: 0,
  precioMax: 10000000,
  marcas: [],
  rating: 0,
  enStock: false
}

interface ModalFiltrosProps {
  abierto: boolean
  filtros: typeof FILTROS_VACIOS
  onCerrar: () => void
  onFiltrosChange: (filtros: typeof FILTROS_VACIOS) => void
}

export const ModalFiltrosMovil = ({ abierto, filtros, onCerrar, onFiltrosChange }: ModalFiltrosProps) => {
  if (!abierto) return null

  return (
    <div className="modal-filtros-overlay">
      <div className="modal-filtros-container">
        <div className="modal-filtros-header">
          <h2>Filtros</h2>
          <button className="modal-close-btn" onClick={onCerrar}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-filtros-refine-header">
          <h3>Refinar por</h3>
          <button className="clear-all-btn" onClick={() => onFiltrosChange(FILTROS_VACIOS)}>
            Limpiar todo
          </button>
        </div>
        <div className="modal-filtros-contenido">
          <PanelFiltros filtros={filtros} onFiltrosChange={onFiltrosChange} />
        </div>
      </div>
    </div>
  )
}

interface OpcionOrdenar {
  value: string
  label: string
}

interface ModalOrdenarProps {
  abierto: boolean
  ordenar: string
  opciones: OpcionOrdenar[]
  onCerrar: () => void
  onOrdenarChange: (valor: string) => void
}

export const ModalOrdenarMovil = ({ abierto, ordenar, opciones, onCerrar, onOrdenarChange }: ModalOrdenarProps) => {
  if (!abierto) return null

  return (
    <div className="modal-ordenar-overlay" onClick={onCerrar}>
      <div className="modal-ordenar-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ordenar-header">
          <h3>Ordenar por</h3>
          <button className="modal-close-btn" onClick={onCerrar}>
            <X size={24} />
          </button>
        </div>
        <div className="modal-ordenar-opciones">
          {opciones.map((opcion) => (
            <button
              key={opcion.value}
              className={`opcion-ordenar ${ordenar === opcion.value ? 'activo' : ''}`}
              onClick={() => {
                onOrdenarChange(opcion.value)
                onCerrar()
              }}
            >
              <span>{opcion.label}</span>
              {ordenar === opcion.value && <Check size={20} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
