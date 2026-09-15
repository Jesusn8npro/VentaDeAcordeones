'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Edit, Trash2, Eye } from 'lucide-react'
import MiniaturaProducto from './MiniaturaProducto'

interface Props {
  producto: any
  seleccionado: boolean
  formatearPrecio: (v: any) => string
  obtenerEstadoStock: (p: any) => { estado: string; texto: string }
  onToggle: (id: string) => void
  onAlternarEstado: (producto: any) => void
  onEliminar: (id: string) => void
  categorias?: any[]
  onGuardarCampo?: (producto: any, campo: string, valor: any) => void | Promise<void>
}

/**
 * Celda que se convierte en campo al hacer clic. Antes había que abrir la ficha entera para
 * cambiar una categoría o un precio; con 249 productos eso es media tarde de ida y vuelta.
 *
 * Se guarda al salir del campo o con Enter, y se cancela con Escape.
 */
function CeldaEditable({
  valor, mostrar, tipo = 'texto', opciones, onGuardar, titulo,
}: {
  valor: any
  mostrar: React.ReactNode
  tipo?: 'texto' | 'numero' | 'select'
  opciones?: { id: string; nombre: string }[]
  onGuardar?: (v: any) => void
  titulo?: string
}) {
  const [editando, setEditando] = useState(false)
  const [borrador, setBorrador] = useState(valor)
  const ref = useRef<any>(null)

  useEffect(() => { setBorrador(valor) }, [valor])
  useEffect(() => { if (editando && ref.current) { ref.current.focus(); ref.current.select?.() } }, [editando])

  if (!onGuardar) return <>{mostrar}</>

  const cerrar = (guardar: boolean) => {
    setEditando(false)
    if (guardar) onGuardar(tipo === 'numero' ? Number(borrador) || 0 : borrador)
    else setBorrador(valor)
  }

  if (!editando) {
    return (
      <button
        type="button"
        className="gestion-celda-editable"
        onClick={() => setEditando(true)}
        title={titulo || 'Clic para editar'}
      >
        {mostrar}
      </button>
    )
  }

  if (tipo === 'select') {
    return (
      <select
        ref={ref}
        className="gestion-celda-campo"
        value={borrador ?? ''}
        onChange={(e) => { setBorrador(e.target.value); setEditando(false); onGuardar(e.target.value) }}
        onBlur={() => cerrar(false)}
      >
        <option value="">Sin categoría</option>
        {(opciones || []).map((o) => <option key={o.id} value={o.id}>{o.nombre}</option>)}
      </select>
    )
  }

  return (
    <input
      ref={ref}
      className="gestion-celda-campo"
      type={tipo === 'numero' ? 'number' : 'text'}
      value={borrador ?? ''}
      onChange={(e) => setBorrador(e.target.value)}
      onBlur={() => cerrar(true)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') { e.preventDefault(); cerrar(true) }
        if (e.key === 'Escape') { e.preventDefault(); cerrar(false) }
      }}
    />
  )
}

export default function FilaProducto({
  producto, seleccionado, formatearPrecio, obtenerEstadoStock,
  onToggle, onAlternarEstado, onEliminar, categorias, onGuardarCampo,
}: Props) {
  const estadoStock = obtenerEstadoStock(producto)
  const guardar = (campo: string) => onGuardarCampo ? (v: any) => onGuardarCampo(producto, campo, v) : undefined

  return (
    <tr className={`gestion-fila ${seleccionado ? 'gestion-fila-seleccionada' : ''}`}>
      <td className="gestion-td-check">
        <input type="checkbox" checked={seleccionado} onChange={() => onToggle(producto.id)} className="gestion-checkbox" />
      </td>
      <td>
        <div className="gestion-producto">
          <MiniaturaProducto producto={producto} />
          <div className="gestion-detalles">
            <CeldaEditable
              valor={producto.nombre}
              onGuardar={guardar('nombre')}
              titulo="Clic para cambiar el nombre"
              mostrar={<h4 className="gestion-nombre">{producto.nombre}</h4>}
            />
            <p className="gestion-id">ID: {producto.id}</p>
          </div>
        </div>
      </td>
      <td>
        <CeldaEditable
          valor={producto.categoria_id}
          tipo="select"
          opciones={categorias}
          onGuardar={guardar('categoria_id')}
          titulo="Clic para cambiar la categoría"
          mostrar={producto.categoria?.nombre ? (
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
        />
      </td>
      <td className="gestion-precio">
        <CeldaEditable
          valor={producto.precio}
          tipo="numero"
          onGuardar={guardar('precio')}
          titulo="Clic para cambiar el precio"
          mostrar={<>{formatearPrecio(producto.precio)}</>}
        />
      </td>
      <td>
        <CeldaEditable
          valor={producto.stock}
          tipo="numero"
          onGuardar={guardar('stock')}
          titulo="Clic para cambiar el stock"
          mostrar={(
            <div className="gestion-stock">
              <span className="gestion-stock-cantidad">{producto.stock || 0}</span>
              <span className={`gestion-stock-estado ${estadoStock.estado}`}>{estadoStock.texto}</span>
            </div>
          )}
        />
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
