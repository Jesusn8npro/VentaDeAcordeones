'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, SlidersHorizontal, X } from 'lucide-react'
import { clienteSupabase } from '../../../configuracion/supabase'
import { usarProductos } from '../../../hooks/usarProductos'
import TarjetaProductoLujo from '../../../componentes/producto/TarjetaProductoLujo'
import './PaginaCategoria.css'

const OPCIONES_ORDEN = [
  { label: 'Más recientes',         valor: { campo: 'creado_el',          ascendente: false } },
  { label: 'Precio: menor a mayor', valor: { campo: 'precio',              ascendente: true  } },
  { label: 'Precio: mayor a menor', valor: { campo: 'precio',              ascendente: false } },
  { label: 'Más vendidos',          valor: { campo: 'numero_de_ventas',    ascendente: false } },
  { label: 'Mejor calificados',     valor: { campo: 'calificacion_promedio', ascendente: false } },
]

export default function PaginaCategoria() {
  const params = useParams()
  const slug = params.slug as string
  const [categoria, setCategoria] = useState(null)
  const [cargandoCat, setCargandoCat] = useState(true)
  const [filtros, setFiltros] = useState({ precioMin: '', precioMax: '', ordenar: null })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)

  useEffect(() => {
    if (!slug) return
    setCargandoCat(true)
    setCategoria(null)
    clienteSupabase
      .from('categorias')
      .select('*')
      .eq('slug', slug)
      .eq('activo', true)
      .single()
      .then(({ data }) => { setCategoria(data); setCargandoCat(false) })
      .catch(() => setCargandoCat(false))
  }, [slug])

  const filtrosProductos = {
    ...(categoria?.id   && { categoria:  categoria.id }),
    ...(filtros.precioMin && { precioMin: Number(filtros.precioMin) }),
    ...(filtros.precioMax && { precioMax: Number(filtros.precioMax) }),
    ...(filtros.ordenar   && { ordenar:   filtros.ordenar }),
    limite: 48
  }

  const { productos, cargando } = usarProductos(categoria?.id ? filtrosProductos : { limite: 0 })

  const limpiarFiltros = () => setFiltros({ precioMin: '', precioMax: '', ordenar: null })

  if (cargandoCat) {
    return (
      <div className="pagina-categoria">
        <div className="categoria-skeleton-header" />
        <div className="grid-productos-categoria">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton-card-cat" />)}
        </div>
      </div>
    )
  }

  if (!categoria) {
    return (
      <div className="pagina-categoria pagina-categoria--error">
        <h2>Categoría no encontrada</h2>
        <p>La categoría que buscas no existe o fue removida.</p>
        <Link href="/tienda" className="enlace-tienda">Ver toda la tienda</Link>
      </div>
    )
  }

  return (
    <div className="pagina-categoria">

      {/* Breadcrumb */}
      <nav className="breadcrumb-categoria" aria-label="breadcrumb">
        <Link href="/">Inicio</Link>
        <ChevronRight size={14} />
        <Link href="/tienda">Tienda</Link>
        <ChevronRight size={14} />
        <span>{categoria.nombre}</span>
      </nav>

      {/* Header */}
      <div className="header-categoria">
        <div className="header-categoria__info">
          {categoria.icono && <span className="header-categoria__icono">{categoria.icono}</span>}
          <div>
            <h1 className="header-categoria__nombre">{categoria.nombre}</h1>
            {categoria.descripcion && <p className="header-categoria__desc">{categoria.descripcion}</p>}
          </div>
        </div>
        <button className="boton-filtros" onClick={() => setMostrarFiltros(v => !v)}>
          <SlidersHorizontal size={18} />
          Filtros
        </button>
      </div>

      {/* Panel de filtros */}
      {mostrarFiltros && (
        <div className="panel-filtros">
          <div className="filtro-grupo">
            <label>Precio mínimo (COP)</label>
            <input
              type="number"
              value={filtros.precioMin}
              onChange={e => setFiltros(f => ({ ...f, precioMin: e.target.value }))}
              placeholder="0"
            />
          </div>
          <div className="filtro-grupo">
            <label>Precio máximo (COP)</label>
            <input
              type="number"
              value={filtros.precioMax}
              onChange={e => setFiltros(f => ({ ...f, precioMax: e.target.value }))}
              placeholder="Sin límite"
            />
          </div>
          <div className="filtro-grupo">
            <label>Ordenar por</label>
            <select
              value={filtros.ordenar ? JSON.stringify(filtros.ordenar) : ''}
              onChange={e => setFiltros(f => ({
                ...f,
                ordenar: e.target.value ? JSON.parse(e.target.value) : null
              }))}
            >
              <option value="">Por defecto</option>
              {OPCIONES_ORDEN.map(op => (
                <option key={op.label} value={JSON.stringify(op.valor)}>{op.label}</option>
              ))}
            </select>
          </div>
          <button className="boton-limpiar-filtros" onClick={limpiarFiltros}>
            <X size={14} /> Limpiar filtros
          </button>
        </div>
      )}

      {/* Contador */}
      <p className="contador-productos-cat">
        {cargando ? 'Cargando productos...' : `${productos.length} producto${productos.length !== 1 ? 's' : ''}`}
      </p>

      {/* Grid */}
      {cargando ? (
        <div className="grid-productos-categoria">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton-card-cat" />)}
        </div>
      ) : productos.length === 0 ? (
        <div className="sin-productos-cat">
          <p>No hay productos disponibles en esta categoría aún.</p>
          <Link href="/tienda" className="enlace-tienda">Ver toda la tienda</Link>
        </div>
      ) : (
        <div className="grid-productos-categoria">
          {productos.map(p => <TarjetaProductoLujo key={p.id} producto={p} />)}
        </div>
      )}
    </div>
  )
}
