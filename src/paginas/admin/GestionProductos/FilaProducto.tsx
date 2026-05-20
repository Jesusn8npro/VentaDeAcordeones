'use client'

import React from 'react'
import Link from 'next/link'
import { Edit, Trash2, Eye, Package } from 'lucide-react'

interface Props {
  producto: any
  seleccionado: boolean
  formatearPrecio: (v: any) => string
  obtenerEstadoStock: (p: any) => { estado: string; texto: string }
  onToggle: (id: string) => void
  onAlternarEstado: (producto: any) => void
  onEliminar: (id: string) => void
}

export default function FilaProducto({ producto, seleccionado, formatearPrecio, obtenerEstadoStock, onToggle, onAlternarEstado, onEliminar }: Props) {
  const estadoStock = obtenerEstadoStock(producto)
  return (
    <tr className={`gestion-fila ${seleccionado ? 'gestion-fila-seleccionada' : ''}`}>
      <td className="gestion-td-check">
        <input type="checkbox" checked={seleccionado} onChange={() => onToggle(producto.id)} className="gestion-checkbox" />
      </td>
      <td>
        <div className="gestion-producto">
          <div className="gestion-imagen">
            {producto.fotos_principales?.[0] ? (
              <img src={producto.fotos_principales[0]} alt={producto.nombre} className="gestion-miniatura" />
            ) : (
              <div className="gestion-placeholder"><Package /></div>
            )}
          </div>
          <div className="gestion-detalles">
            <h4 className="gestion-nombre">{producto.nombre}</h4>
            <p className="gestion-id">ID: {producto.id}</p>
          </div>
        </div>
      </td>
      <td>
        {producto.categoria?.nombre ? (
          <span className="gestion-badge gestion-badge-categoria">
            <span className="gestion-badge-icono">{producto.categoria.icono}</span>
            <span className="gestion-badge-texto">{producto.categoria.nombre}</span>
          </span>
        ) : (
          <span className="gestion-badge gestion-badge-sin-categoria">
            <span className="gestion-badge-icono">❓</span>
            <span className="gestion-badge-texto">Sin categoría</span>
          </span>
        )}
      </td>
      <td className="gestion-precio">{formatearPrecio(producto.precio)}</td>
      <td>
        <div className="gestion-stock">
          <span className="gestion-stock-cantidad">{producto.stock || 0}</span>
          <span className={`gestion-stock-estado ${estadoStock.estado}`}>{estadoStock.texto}</span>
        </div>
      </td>
      <td>
        <button className={`gestion-toggle ${producto.activo ? 'activo' : 'inactivo'}`} onClick={() => onAlternarEstado(producto)}>
          {producto.activo ? 'Activo' : 'Inactivo'}
        </button>
      </td>
      <td>{new Date(producto.creado_el).toLocaleDateString('es-CO')}</td>
      <td>
        <div className="gestion-acciones">
          <Link href={`/admin/productos/editar/${encodeURIComponent(producto.slug || producto.nombre || producto.id)}`} className="gestion-accion" title="Editar"><Edit /></Link>
          <Link href={`/producto/${producto.slug || producto.id}`} className="gestion-accion" title="Ver"><Eye /></Link>
          <button onClick={() => onEliminar(producto.id)} className="gestion-accion eliminar" title="Eliminar"><Trash2 /></button>
        </div>
      </td>
    </tr>
  )
}
