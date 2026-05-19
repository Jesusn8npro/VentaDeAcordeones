'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'
import './PlantillaClaude.css'

const fmtCOP = (n: number) => `$${n.toLocaleString('es-CO')} COP`

export interface ProductoPlantilla {
  id: string
  etiqueta?: string
  claseEtiqueta?: string
  marca: string
  nombre: string
  precio: number
  precioAntes?: number | null
  categoria: string
}

interface MetaPagina {
  titulo: string
  italica: string
  acento: string
  intro: string
}

interface PropsTarjeta {
  producto: ProductoPlantilla
}

function TarjetaCatalogo({ producto: p }: PropsTarjeta) {
  const [agregado, setAgregado] = useState(false)
  const [favorito, setFavorito] = useState(false)

  return (
    <Link href={`/producto/${p.id}`} className="pc-tarjeta">
      <div className="pc-tarjeta-img">
        {p.etiqueta && (
          <span className={`pc-tarjeta-tag ${p.claseEtiqueta ?? ''}`}>{p.etiqueta}</span>
        )}
        <button
          className={`pc-tarjeta-fav${favorito ? ' activo' : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFavorito((f) => !f) }}
          aria-label="Favorito"
        >
          <Icono nombre="corazon" tamaño={13} />
        </button>
        <div className="pc-tarjeta-visual">
          <Icono nombre="cat-acordeon" tamaño={72} />
        </div>
        <div className="pc-tarjeta-quick">
          <span><Icono nombre="buscar" tamaño={11} /> Ver producto</span>
        </div>
      </div>
      <div className="pc-tarjeta-info">
        <div className="pc-tarjeta-marca">{p.marca}</div>
        <div className="pc-tarjeta-nombre">{p.nombre}</div>
        <div className="pc-tarjeta-meta">
          <div className="pc-tarjeta-precio">
            <span className="pc-tarjeta-precio-ahora">{fmtCOP(p.precio)}</span>
            {p.precioAntes && <span className="pc-tarjeta-precio-antes">{fmtCOP(p.precioAntes)}</span>}
          </div>
          <button
            className={`pc-tarjeta-añadir${agregado ? ' agregado' : ''}`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setAgregado(true)
              setTimeout(() => setAgregado(false), 1400)
            }}
          >
            {agregado
              ? <><Icono nombre="estrella" tamaño={11} /> Añadido</>
              : <><Icono nombre="carrito" tamaño={11} /> Añadir</>
            }
          </button>
        </div>
      </div>
    </Link>
  )
}

interface PropsPlantillaClaude {
  productos: ProductoPlantilla[]
  metaPagina: MetaPagina
  migasUrl?: { etiqueta: string; href: string }[]
  mostrarFiltros?: boolean
}

const OPCIONES_ORDEN = [
  { valor: 'relevancia', etiqueta: 'Relevancia' },
  { valor: 'precio-asc', etiqueta: 'Precio: menor a mayor' },
  { valor: 'precio-desc', etiqueta: 'Precio: mayor a menor' },
  { valor: 'nuevo', etiqueta: 'Más nuevo' },
]

const RANGOS_PRECIO = [
  { valor: 'all', etiqueta: 'Todos los precios' },
  { valor: '<5m', etiqueta: 'Menos de $5.000.000' },
  { valor: '5-10', etiqueta: '$5M – $10M' },
  { valor: '>10', etiqueta: 'Más de $10M' },
]

export default function PlantillaClaude({
  productos,
  metaPagina,
  migasUrl = [],
  mostrarFiltros = true,
}: PropsPlantillaClaude) {
  const [orden, setOrden] = useState('relevancia')
  const [rango, setRango] = useState('all')
  const [marcasFiltro, setMarcasFiltro] = useState<Record<string, boolean>>({})
  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false)

  const marcasUnicas = useMemo(
    () => [...new Set(productos.map((p) => p.marca))],
    [productos]
  )

  const productosFiltrados = useMemo(() => {
    let lista = [...productos]
    const marcasActivas = Object.keys(marcasFiltro).filter((k) => marcasFiltro[k])
    if (marcasActivas.length) {
      lista = lista.filter((p) =>
        marcasActivas.some((m) => p.marca.toLowerCase().includes(m.toLowerCase()))
      )
    }
    if (rango === '<5m') lista = lista.filter((p) => p.precio < 5_000_000)
    if (rango === '5-10') lista = lista.filter((p) => p.precio >= 5_000_000 && p.precio < 10_000_000)
    if (rango === '>10') lista = lista.filter((p) => p.precio >= 10_000_000)
    if (orden === 'precio-asc') lista.sort((a, b) => a.precio - b.precio)
    if (orden === 'precio-desc') lista.sort((a, b) => b.precio - a.precio)
    return lista
  }, [productos, orden, rango, marcasFiltro])

  const toggleMarca = (marca: string) =>
    setMarcasFiltro((prev) => ({ ...prev, [marca]: !prev[marca] }))

  const limpiarFiltros = () => { setMarcasFiltro({}); setRango('all'); setOrden('relevancia') }
  const hayFiltros = Object.values(marcasFiltro).some(Boolean) || rango !== 'all'

  return (
    <div className="pc-wrap">
      {/* Migas de pan */}
      {migasUrl.length > 0 && (
        <nav className="pc-migas" aria-label="Ruta de navegación">
          <div className="pc-migas-inner">
            <Link href="/" className="pc-miga">Inicio</Link>
            {migasUrl.map((m, i) => (
              <span key={i} className="pc-miga-grupo">
                <span className="pc-miga-sep">/</span>
                {i === migasUrl.length - 1
                  ? <span className="pc-miga pc-miga--actual">{m.etiqueta}</span>
                  : <Link href={m.href} className="pc-miga">{m.etiqueta}</Link>
                }
              </span>
            ))}
          </div>
        </nav>
      )}

      {/* Cabecera de página */}
      <header className="pc-cabecera">
        <div className="pc-cabecera-inner">
          <div className="vda-eyebrow pc-eyebrow">— Catálogo</div>
          <h1 className="vda-display pc-titulo">
            {metaPagina.titulo.split(' ').slice(0, -1).join(' ')}{' '}
            <em className="vda-italica">{metaPagina.italica}</em>{' '}
            <span className="pc-acento">{metaPagina.acento}</span>
          </h1>
          <p className="pc-intro">{metaPagina.intro}</p>
          <div className="pc-cabecera-stat">
            <span className="pc-total">{productosFiltrados.length} productos</span>
            {hayFiltros && (
              <button className="pc-limpiar" onClick={limpiarFiltros}>
                Limpiar filtros ×
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Layout principal */}
      <div className="pc-main">
        {/* Barra lateral de filtros */}
        {mostrarFiltros && (
          <>
            <button
              className="pc-filtros-toggle"
              onClick={() => setFiltrosAbiertos((o) => !o)}
              aria-expanded={filtrosAbiertos}
            >
              <Icono nombre="herramienta" tamaño={14} />
              Filtros {hayFiltros && <span className="pc-filtros-badge">·</span>}
              <span className="pc-filtros-chev">{filtrosAbiertos ? '▲' : '▼'}</span>
            </button>
            <aside className={`pc-barra${filtrosAbiertos ? ' abierta' : ''}`}>
              {/* Orden */}
              <div className="pc-filtro-grupo">
                <div className="pc-filtro-titulo">Ordenar por</div>
                {OPCIONES_ORDEN.map((o) => (
                  <label key={o.valor} className={`pc-filtro-opcion${orden === o.valor ? ' activa' : ''}`}>
                    <input
                      type="radio"
                      name="orden"
                      value={o.valor}
                      checked={orden === o.valor}
                      onChange={() => setOrden(o.valor)}
                    />
                    {o.etiqueta}
                  </label>
                ))}
              </div>

              {/* Precio */}
              <div className="pc-filtro-grupo">
                <div className="pc-filtro-titulo">Precio</div>
                {RANGOS_PRECIO.map((r) => (
                  <label key={r.valor} className={`pc-filtro-opcion${rango === r.valor ? ' activa' : ''}`}>
                    <input
                      type="radio"
                      name="rango"
                      value={r.valor}
                      checked={rango === r.valor}
                      onChange={() => setRango(r.valor)}
                    />
                    {r.etiqueta}
                  </label>
                ))}
              </div>

              {/* Marcas */}
              <div className="pc-filtro-grupo">
                <div className="pc-filtro-titulo">Marcas</div>
                {marcasUnicas.map((marca) => (
                  <label key={marca} className={`pc-filtro-opcion${marcasFiltro[marca] ? ' activa' : ''}`}>
                    <input
                      type="checkbox"
                      checked={!!marcasFiltro[marca]}
                      onChange={() => toggleMarca(marca)}
                    />
                    {marca}
                  </label>
                ))}
              </div>
            </aside>
          </>
        )}

        {/* Grilla de productos */}
        <div className="pc-contenido">
          {productosFiltrados.length === 0 ? (
            <div className="pc-vacio">
              <Icono nombre="buscar" tamaño={40} />
              <p>No hay productos con los filtros seleccionados.</p>
              <button className="vda-btn vda-btn-fantasma" onClick={limpiarFiltros}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <div className="pc-grilla">
              {productosFiltrados.map((p) => (
                <TarjetaCatalogo key={p.id} producto={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
