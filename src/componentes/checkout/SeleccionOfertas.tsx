import React from 'react'
import { formatearPrecioCOP } from '../../utilidades/formatoPrecio'

interface Oferta {
  id: number
  titulo: string
  subtitulo: string
  cantidad: number
  descuento: number
}

interface SeleccionOfertasProps {
  ofertas: Oferta[]
  ofertaSeleccionada: Oferta | null
  onSeleccionar: (oferta: Oferta) => void
  precioUnitario: number
}

const SeleccionOfertas = ({ ofertas, ofertaSeleccionada, onSeleccionar, precioUnitario }: SeleccionOfertasProps) => (
  <div className="cod-ofertas">
    <h3 className="cod-ofertas-titulo">Selecciona tu oferta:</h3>
    <div className="cod-ofertas-lista">
      {ofertas && ofertas.length > 0 ? ofertas.map((o) => (
        <label
          key={o.id}
          className={`cod-oferta ${ofertaSeleccionada?.id === o.id ? 'cod-oferta-seleccionada' : ''}`}
          data-descuento={o.descuento}
        >
          <input
            type="radio"
            name="oferta"
            value={o.id}
            checked={ofertaSeleccionada?.id === o.id}
            onChange={() => onSeleccionar(o)}
          />
          <div className="cod-oferta-contenido">
            <div className="cod-oferta-info">
              <h4 className="cod-oferta-titulo">{o.titulo}</h4>
              <p className="cod-oferta-subtitulo">{o.subtitulo}</p>
            </div>
            <div className="cod-oferta-precio">
              {formatearPrecioCOP(precioUnitario * (1 - (o.descuento || 0) / 100) * o.cantidad)}
            </div>
          </div>
          {o.descuento > 0 && (
            <div className="cod-oferta-descuento">-{o.descuento}%</div>
          )}
        </label>
      )) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
          Cargando ofertas...
        </div>
      )}
    </div>
  </div>
)

export default SeleccionOfertas
