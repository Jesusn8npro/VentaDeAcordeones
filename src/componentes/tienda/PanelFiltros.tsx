'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Search, X, Star, ChevronDown, Check } from 'lucide-react'
import { clienteSupabase } from '../../configuracion/supabase'
import {
  FILTROS_VACIOS,
  formatearCOP,
  normalizarMarca,
  etiquetaMarca,
  type FiltrosTienda,
} from '../../paginas/ecommerce/PaginaTienda/filtrosTienda'
import './PanelFiltros.css'

/* ───────────────────────── Facetas (una sola consulta, cacheada por sesión) ───────────────────────── */

interface Categoria { id: string; nombre: string; slug: string; cantidad: number }
interface Marca { clave: string; etiqueta: string; cantidad: number }
interface Facetas {
  categorias: Categoria[]
  marcas: Marca[]
  precioMin: number
  precioMax: number
  hayRating: boolean
}

const FACETAS_VACIAS: Facetas = { categorias: [], marcas: [], precioMin: 0, precioMax: 10_000_000, hayRating: false }
let cacheFacetas: Promise<Facetas> | null = null

const slugDesdeNombre = (n: string) =>
  n.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')

async function cargarFacetas(): Promise<Facetas> {
  const [{ data: cats, error: e1 }, { data: prods, error: e2 }] = await Promise.all([
    clienteSupabase.from('categorias').select('id, nombre, slug').eq('activo', true).order('nombre'),
    clienteSupabase
      .from('productos')
      .select('categoria_id, marca, precio, calificacion_promedio')
      .eq('activo', true)
      .or('stock.gt.0,estado.eq.vendido'),
  ])
  if (e1 || e2) throw e1 || e2

  const porCategoria = new Map<string, number>()
  const porMarca = new Map<string, number>()
  let precioMin = Infinity
  let precioMax = 0
  let hayRating = false
  for (const p of prods || []) {
    if (p.categoria_id) porCategoria.set(p.categoria_id, (porCategoria.get(p.categoria_id) || 0) + 1)
    if (p.marca) {
      const clave = normalizarMarca(p.marca)
      if (clave && clave !== 'NO ESPECIFICADA') porMarca.set(clave, (porMarca.get(clave) || 0) + 1)
    }
    if (typeof p.precio === 'number' && p.precio > 0) {
      precioMin = Math.min(precioMin, p.precio)
      precioMax = Math.max(precioMax, p.precio)
    }
    if (typeof p.calificacion_promedio === 'number' && p.calificacion_promedio > 0) hayRating = true
  }

  return {
    categorias: (cats || [])
      .map(c => ({ id: c.id, nombre: c.nombre, slug: c.slug || slugDesdeNombre(c.nombre), cantidad: porCategoria.get(c.id) || 0 }))
      .filter(c => c.cantidad > 0)
      .sort((a, b) => b.cantidad - a.cantidad),
    marcas: [...porMarca.entries()]
      .map(([clave, cantidad]) => ({ clave, etiqueta: etiquetaMarca(clave), cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad || a.etiqueta.localeCompare(b.etiqueta)),
    precioMin: Number.isFinite(precioMin) ? precioMin : 0,
    precioMax: precioMax || 10_000_000,
    hayRating,
  }
}

function usarFacetas() {
  const [facetas, setFacetas] = useState<Facetas>(FACETAS_VACIAS)
  const [cargando, setCargando] = useState(true)
  useEffect(() => {
    let activo = true
    if (!cacheFacetas) cacheFacetas = cargarFacetas().catch(err => { cacheFacetas = null; throw err })
    cacheFacetas
      .then(f => { if (activo) setFacetas(f) })
      .catch(() => { /* la tienda sigue funcionando sin facetas */ })
      .finally(() => { if (activo) setCargando(false) })
    return () => { activo = false }
  }, [])
  return { facetas, cargando }
}

/* ───────────────────────── Sección colapsable ───────────────────────── */

function Seccion({
  titulo, badge, abiertaInicial = true, children,
}: { titulo: string; badge?: React.ReactNode; abiertaInicial?: boolean; children: React.ReactNode }) {
  const [abierta, setAbierta] = useState(abiertaInicial)
  return (
    <section className={`filtro-seccion ${abierta ? 'abierta' : ''}`}>
      <button type="button" className="filtro-header" onClick={() => setAbierta(a => !a)} aria-expanded={abierta}>
        <span className="filtro-titulo">{titulo}</span>
        <span className="filtro-header-der">
          {badge}
          <ChevronDown size={16} className="filtro-chevron" aria-hidden="true" />
        </span>
      </button>
      <div className="filtro-cuerpo">
        <div className="filtro-cuerpo-interno">{children}</div>
      </div>
    </section>
  )
}

const Badge = ({ n }: { n: number }) => (n > 0 ? <span className="filtro-badge">{n}</span> : null)

/* ───────────────────────── Rango de precio (doble slider) ───────────────────────── */

const soloDigitos = (s: string) => parseInt(s.replace(/\D/g, ''), 10)
const conMiles = (n: number) => new Intl.NumberFormat('es-CO').format(n)

function RangoPrecio({
  limiteMin, limiteMax, valorMin, valorMax, onCommit,
}: {
  limiteMin: number; limiteMax: number
  valorMin: number | null; valorMax: number | null
  onCommit: (min: number | null, max: number | null) => void
}) {
  const paso = useMemo(() => {
    const rango = Math.max(1, limiteMax - limiteMin)
    return Math.max(1000, 10 ** Math.floor(Math.log10(rango / 200)))
  }, [limiteMin, limiteMax])

  const [a, setA] = useState(valorMin ?? limiteMin)
  const [b, setB] = useState(valorMax ?? limiteMax)
  const [txtA, setTxtA] = useState('')
  const [txtB, setTxtB] = useState('')
  const arrastrando = useRef(false)

  // Sincroniza con la URL/límites cuando no se está arrastrando
  useEffect(() => {
    if (arrastrando.current) return
    const na = valorMin ?? limiteMin
    const nb = valorMax ?? limiteMax
    setA(na); setB(nb); setTxtA(conMiles(na)); setTxtB(conMiles(nb))
  }, [valorMin, valorMax, limiteMin, limiteMax])

  const clamp = (n: number) => Math.min(limiteMax, Math.max(limiteMin, n))
  const commit = (min: number, max: number) => {
    const lo = clamp(Math.min(min, max))
    const hi = clamp(Math.max(min, max))
    setA(lo); setB(hi); setTxtA(conMiles(lo)); setTxtB(conMiles(hi))
    onCommit(lo <= limiteMin ? null : lo, hi >= limiteMax ? null : hi)
  }

  const pct = (v: number) => ((v - limiteMin) / Math.max(1, limiteMax - limiteMin)) * 100
  const soltar = () => { arrastrando.current = false; commit(a, b) }

  return (
    <div className="precio-rango">
      <div className="precio-slider" style={{ '--a': `${pct(a)}%`, '--b': `${pct(b)}%` } as React.CSSProperties}>
        <div className="precio-slider-riel" />
        <div className="precio-slider-relleno" />
        <input
          type="range" min={limiteMin} max={limiteMax} step={paso} value={a}
          aria-label="Precio mínimo"
          style={{ zIndex: a >= limiteMax - paso ? 5 : 3 }}
          onPointerDown={() => { arrastrando.current = true }}
          onChange={e => { const v = Math.min(+e.target.value, b - paso); setA(v); setTxtA(conMiles(v)) }}
          onPointerUp={soltar} onKeyUp={soltar} onBlur={soltar}
        />
        <input
          type="range" min={limiteMin} max={limiteMax} step={paso} value={b}
          aria-label="Precio máximo"
          onPointerDown={() => { arrastrando.current = true }}
          onChange={e => { const v = Math.max(+e.target.value, a + paso); setB(v); setTxtB(conMiles(v)) }}
          onPointerUp={soltar} onKeyUp={soltar} onBlur={soltar}
        />
      </div>

      <div className="precio-inputs">
        <label className="precio-campo">
          <span>Mínimo</span>
          <div className="precio-campo-caja">
            <b>$</b>
            <input
              type="text" inputMode="numeric" value={txtA}
              onChange={e => setTxtA(e.target.value)}
              onBlur={() => { const n = soloDigitos(txtA); Number.isFinite(n) ? commit(n, b) : setTxtA(conMiles(a)) }}
              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
            />
          </div>
        </label>
        <span className="precio-guion" aria-hidden="true">—</span>
        <label className="precio-campo">
          <span>Máximo</span>
          <div className="precio-campo-caja">
            <b>$</b>
            <input
              type="text" inputMode="numeric" value={txtB}
              onChange={e => setTxtB(e.target.value)}
              onBlur={() => { const n = soloDigitos(txtB); Number.isFinite(n) ? commit(a, n) : setTxtB(conMiles(b)) }}
              onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
            />
          </div>
        </label>
      </div>
      <p className="precio-leyenda">{formatearCOP(a)} – {formatearCOP(b)}</p>
    </div>
  )
}

/* ───────────────────────── Panel ───────────────────────── */

interface Props {
  filtros: FiltrosTienda
  onCambiar: (parcial: Partial<FiltrosTienda>) => void
  /** slug de la categoría fijada por la ruta actual (se resalta en la lista) */
  categoriaSlug?: string | null
}

const CATEGORIAS_VISIBLES = 7
const MARCAS_VISIBLES = 10

export default function PanelFiltros({ filtros = FILTROS_VACIOS, onCambiar, categoriaSlug = null }: Props) {
  const { facetas, cargando } = usarFacetas()
  const [verTodasCategorias, setVerTodasCategorias] = useState(false)
  const [verTodasMarcas, setVerTodasMarcas] = useState(false)

  // Búsqueda con debounce (la URL se actualiza 350 ms después de dejar de escribir)
  const [busqueda, setBusqueda] = useState(filtros.busqueda)
  useEffect(() => { setBusqueda(filtros.busqueda) }, [filtros.busqueda])
  useEffect(() => {
    if (busqueda === filtros.busqueda) return
    const t = setTimeout(() => onCambiar({ busqueda: busqueda.trim() }), 350)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busqueda])

  const alternarMarca = (clave: string) =>
    onCambiar({ marcas: filtros.marcas.includes(clave) ? filtros.marcas.filter(m => m !== clave) : [...filtros.marcas, clave] })

  // La categoría activa siempre se muestra aunque quede fuera de las primeras N
  const categorias = useMemo(() => {
    if (verTodasCategorias) return facetas.categorias
    const visibles = facetas.categorias.slice(0, CATEGORIAS_VISIBLES)
    const activa = categoriaSlug && facetas.categorias.find(c => c.slug === categoriaSlug)
    return activa && !visibles.includes(activa) ? [...visibles, activa] : visibles
  }, [facetas.categorias, verTodasCategorias, categoriaSlug])
  const marcas = verTodasMarcas ? facetas.marcas : facetas.marcas.slice(0, MARCAS_VISIBLES)
  const totalProductos = facetas.categorias.reduce((s, c) => s + c.cantidad, 0)

  return (
    <div className={`sidebar-filtros ${cargando ? 'cargando' : ''}`}>
      {/* Buscar */}
      <div className="filtro-seccion filtro-seccion-busqueda">
        <div className="busqueda-container">
          <Search size={16} className="busqueda-icono" aria-hidden="true" />
          <input
            type="search"
            className="busqueda-input"
            placeholder="Buscar en la tienda…"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            aria-label="Buscar productos"
          />
          {busqueda && (
            <button type="button" className="busqueda-limpiar" onClick={() => { setBusqueda(''); onCambiar({ busqueda: '' }) }} aria-label="Borrar búsqueda">
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Categorías */}
      <Seccion titulo="Categorías">
        <ul className="categorias-lista">
          <li>
            <Link href="/tienda" className={`categoria-item ${!categoriaSlug ? 'activa' : ''}`}>
              <span className="categoria-nombre">Todos los productos</span>
              <span className="categoria-cantidad">{totalProductos || ''}</span>
            </Link>
          </li>
          {categorias.map(c => (
            <li key={c.id}>
              <Link href={`/tienda/categoria/${c.slug}`} className={`categoria-item ${categoriaSlug === c.slug ? 'activa' : ''}`}>
                <span className="categoria-nombre">{c.nombre}</span>
                <span className="categoria-cantidad">{c.cantidad}</span>
              </Link>
            </li>
          ))}
        </ul>
        {facetas.categorias.length > CATEGORIAS_VISIBLES && (
          <button type="button" className="btn-ver-mas" onClick={() => setVerTodasCategorias(v => !v)}>
            {verTodasCategorias ? 'Ver menos' : `Ver todas (${facetas.categorias.length})`}
          </button>
        )}
      </Seccion>

      {/* Precio */}
      <Seccion titulo="Precio" badge={<Badge n={filtros.precioMin != null || filtros.precioMax != null ? 1 : 0} />}>
        <RangoPrecio
          limiteMin={facetas.precioMin}
          limiteMax={facetas.precioMax}
          valorMin={filtros.precioMin}
          valorMax={filtros.precioMax}
          onCommit={(min, max) => onCambiar({ precioMin: min, precioMax: max })}
        />
      </Seccion>

      {/* Marcas */}
      {facetas.marcas.length > 0 && (
        <Seccion titulo="Marcas" badge={<Badge n={filtros.marcas.length} />}>
          <div className="marcas-chips" role="group" aria-label="Marcas">
            {marcas.map(m => {
              const activa = filtros.marcas.includes(m.clave)
              return (
                <button
                  key={m.clave} type="button"
                  className={`marca-chip ${activa ? 'activa' : ''}`}
                  aria-pressed={activa}
                  onClick={() => alternarMarca(m.clave)}
                >
                  {activa && <Check size={12} aria-hidden="true" />}
                  <span>{m.etiqueta}</span>
                  <small>{m.cantidad}</small>
                </button>
              )
            })}
          </div>
          {facetas.marcas.length > MARCAS_VISIBLES && (
            <button type="button" className="btn-ver-mas" onClick={() => setVerTodasMarcas(v => !v)}>
              {verTodasMarcas ? 'Ver menos' : `Ver todas (${facetas.marcas.length})`}
            </button>
          )}
        </Seccion>
      )}

      {/* Calificación — solo si existen productos calificados */}
      {facetas.hayRating && (
        <Seccion titulo="Calificación" badge={<Badge n={filtros.rating > 0 ? 1 : 0} />}>
          <div className="rating-lista">
            {[4, 3, 2, 1].map(r => (
              <button
                key={r} type="button"
                className={`rating-opcion ${filtros.rating === r ? 'activo' : ''}`}
                onClick={() => onCambiar({ rating: filtros.rating === r ? 0 : r })}
              >
                <span className="estrellas" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map(i => <Star key={i} size={14} className={i < r ? 'llena' : ''} />)}
                </span>
                <span>{r} estrellas y más</span>
              </button>
            ))}
          </div>
        </Seccion>
      )}

      {/* Disponibilidad */}
      <Seccion titulo="Disponibilidad" badge={<Badge n={(filtros.enStock ? 1 : 0) + (filtros.conDescuento ? 1 : 0)} />}>
        <label className="filtro-switch">
          <input type="checkbox" checked={filtros.enStock} onChange={e => onCambiar({ enStock: e.target.checked })} />
          <span className="switch-pista" aria-hidden="true"><span className="switch-bola" /></span>
          <span className="switch-texto">Solo en stock</span>
        </label>
        <label className="filtro-switch">
          <input type="checkbox" checked={filtros.conDescuento} onChange={e => onCambiar({ conDescuento: e.target.checked })} />
          <span className="switch-pista" aria-hidden="true"><span className="switch-bola" /></span>
          <span className="switch-texto">Con descuento</span>
        </label>
      </Seccion>
    </div>
  )
}
