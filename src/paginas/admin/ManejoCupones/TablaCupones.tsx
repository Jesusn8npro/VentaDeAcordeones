import React from 'react'
import { Eye, Edit, Trash2, Copy, Percent, DollarSign, CheckCircle, XCircle, RefreshCw, Tag, Plus } from 'lucide-react'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'

interface Cupon {
  id: string
  codigo: string
  nombre: string
  descripcion?: string
  tipo_descuento: string
  valor_descuento: number
  monto_minimo_compra?: number
  usos_actuales?: number
  usos_maximos?: number
  fecha_inicio?: string
  fecha_fin?: string
  activo: boolean
}

interface EstadoCupon { texto: string; clase: string }

interface TablaCuponesProps {
  cargando: boolean
  cuponesFiltrados: Cupon[]
  busqueda: string
  filtroEstado: string
  filtroTipo: string
  obtenerEstadoCupon: (cupon: Cupon) => EstadoCupon
  formatearFecha: (fecha?: string) => string
  copiarCodigo: (codigo: string) => void
  abrirModal: (modo: string, cupon?: Cupon) => void
  cambiarEstadoCupon: (id: string, estado: boolean) => void
  eliminarCupon: (id: string) => void
  seleccionados: string[]
  toggleUno: (id: string) => void
  todosSeleccionados: boolean
  toggleTodos: () => void
}

export default function TablaCupones({
  cargando, cuponesFiltrados, busqueda, filtroEstado, filtroTipo,
  obtenerEstadoCupon, formatearFecha, copiarCodigo, abrirModal,
  cambiarEstadoCupon, eliminarCupon,
  seleccionados, toggleUno, todosSeleccionados, toggleTodos
}: TablaCuponesProps) {

  if (cargando) {
    return (
      <div className="cargando-cupones">
        <RefreshCw size={28} className="girando" />
        <p>Cargando cupones...</p>
      </div>
    )
  }

  if (cuponesFiltrados.length === 0) {
    return (
      <div className="sin-cupones">
        <Tag size={40} />
        <h3>No se encontraron cupones</h3>
        <p>{busqueda || filtroEstado !== 'todos' || filtroTipo !== 'todos'
          ? 'Intenta ajustar los filtros de búsqueda'
          : 'Crea tu primer cupón de descuento'}</p>
        {!busqueda && filtroEstado === 'todos' && filtroTipo === 'todos' && (
          <button className="boton-crear-vacio" onClick={() => abrirModal('crear')}>
            <Plus size={16} /> Crear Primer Cupón
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="cupones-tabla-contenedor">
      <table className="cupones-tabla">
        <thead>
          <tr>
            <th><input type="checkbox" checked={todosSeleccionados} onChange={toggleTodos} /></th>
            <th>Código</th>
            <th>Nombre</th>
            <th>Tipo / Valor</th>
            <th>Usos / Límite</th>
            <th>Válido hasta</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cuponesFiltrados.map(cupon => {
            const estado = obtenerEstadoCupon(cupon)
            const selec = seleccionados.includes(cupon.id)
            return (
              <tr key={cupon.id} className={`cupones-fila${selec ? ' cup-seleccionada' : ''}`}>
                <td><input type="checkbox" checked={selec} onChange={() => toggleUno(cupon.id)} /></td>
                <td>
                  <div className="cupones-codigo">
                    <span className="codigo-texto">{cupon.codigo}</span>
                    <button className="boton-copiar" onClick={() => copiarCodigo(cupon.codigo)} title="Copiar código">
                      <Copy size={13} />
                    </button>
                  </div>
                </td>
                <td>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-texto)' }}>{cupon.nombre}</div>
                    {cupon.descripcion && (
                      <div style={{ fontSize: '0.78rem', color: 'var(--color-texto-secundario)', marginTop: '0.1rem' }}>{cupon.descripcion}</div>
                    )}
                  </div>
                </td>
                <td>
                  <div className="cup-descuento-valor">
                    {cupon.tipo_descuento === 'porcentaje'
                      ? <><Percent size={14} />{cupon.valor_descuento}%</>
                      : <><DollarSign size={14} />{formatearPrecioCOP(cupon.valor_descuento)}</>}
                  </div>
                  {cupon.monto_minimo_compra && (
                    <div className="cup-descuento-min">Mín: {formatearPrecioCOP(cupon.monto_minimo_compra)}</div>
                  )}
                </td>
                <td>
                  <span className="cup-usos">
                    {cupon.usos_actuales || 0}
                    <span className="cup-usos-sep">/</span>
                    <span className="cup-usos-max">{cupon.usos_maximos || '∞'}</span>
                  </span>
                </td>
                <td>
                  <div className="cup-fecha">
                    {cupon.fecha_fin ? formatearFecha(cupon.fecha_fin) : 'Sin límite'}
                  </div>
                </td>
                <td>
                  <span className={`cup-badge ${estado.clase}`}>{estado.texto}</span>
                </td>
                <td>
                  <div className="cupones-acciones">
                    <button className="cupones-accion" onClick={() => abrirModal('ver', cupon)} title="Ver detalles">
                      <Eye size={14} />
                    </button>
                    <button className="cupones-accion" onClick={() => abrirModal('editar', cupon)} title="Editar">
                      <Edit size={14} />
                    </button>
                    <button
                      className={`cupones-accion ${cupon.activo ? 'desactivar' : 'activar'}`}
                      onClick={() => cambiarEstadoCupon(cupon.id, !cupon.activo)}
                      title={cupon.activo ? 'Desactivar' : 'Activar'}
                    >
                      {cupon.activo ? <XCircle size={14} /> : <CheckCircle size={14} />}
                    </button>
                    <button className="cupones-accion eliminar" onClick={() => eliminarCupon(cupon.id)} title="Eliminar">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
