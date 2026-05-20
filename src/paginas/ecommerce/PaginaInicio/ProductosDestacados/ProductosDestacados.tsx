'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'

const fmtCOP = (n: number) => `$${n.toLocaleString('es-CO')} COP`

const PRODUCTOS = [
  { id: 't1', etiqueta: 'NUEVO',      claseEtiqueta: 'new',  marca: 'Hohner',           nombre: 'Rey Vallenato Nácar Blanco',  precio: 9450000,  cat: 'bestseller', visual: 'acc' },
  { id: 't2', etiqueta: 'OFICIAL',    claseEtiqueta: '',     marca: 'Hohner Oficial',    nombre: 'Anacleto Edición Oro',        precio: 12800000, cat: 'oficial',    visual: 'acc' },
  { id: 't3', etiqueta: 'TENDENCIA',  claseEtiqueta: 'new',  marca: 'Fender',            nombre: 'Stratocaster Player Plus',    precio: 5450000,  cat: 'trending',   visual: 'guitar' },
  { id: 't4', etiqueta: '-15%',       claseEtiqueta: 'sale', marca: 'Hohner Compadre',   nombre: 'Compadre Cuero Vintage',      precio: 4156500,  precioAntes: 4890000, cat: 'descuento', visual: 'acc' },
  { id: 't5', etiqueta: 'CODICIADO',  claseEtiqueta: '',     marca: 'Yamaha',            nombre: 'TRBX604 Bajo Activo',         precio: 3990000,  cat: 'codiciado',  visual: 'guitar' },
  { id: 't6', etiqueta: 'BESTSELLER', claseEtiqueta: 'new',  marca: 'Pearl',             nombre: 'Export 5pc Sunset',           precio: 8200000,  cat: 'bestseller', visual: 'drums' },
  { id: 't7', etiqueta: '-20%',       claseEtiqueta: 'sale', marca: 'JBL',               nombre: 'EON 715 Activo 1300W',        precio: 4920000,  precioAntes: 6150000, cat: 'descuento', visual: 'speaker' },
  { id: 't8', etiqueta: 'NUEVO',      claseEtiqueta: 'new',  marca: 'Hohner',            nombre: 'Pancho Rada Edición',         precio: 11400000, cat: 'trending',   visual: 'acc' },
]

const PESTAÑAS = [
  { id: 'bestseller', etiqueta: 'Más Vendidos' },
  { id: 'trending',   etiqueta: 'En Tendencia' },
  { id: 'descuento',  etiqueta: 'Oferta Especial' },
  { id: 'oficial',    etiqueta: 'Tienda Oficial' },
  { id: 'codiciado',  etiqueta: 'Más Codiciados' },
]

function VisualProducto({ tipo }: { tipo: string }) {
  if (tipo === 'guitar') return (
    <div className="mini-guitar">
      <div className="mini-guitar-neck" />
      <div className="mini-guitar-head" />
      <div className="mini-guitar-body" />
    </div>
  )
  if (tipo === 'drums') return (
    <div className="mini-drums">
      <div className="d-cymbal" />
      <div className="d-tom t1" />
      <div className="d-tom t2" />
      <div className="d-snare" />
      <div className="d-kick" />
    </div>
  )
  if (tipo === 'speaker') return (
    <div className="mini-speaker">
      <div className="s-tw" />
      <div className="s-mid" />
      <div className="s-sub" />
    </div>
  )
  return (
    <div className="mini-acc">
      <div className="h t" />
      <div className="b" />
      <div className="h b" />
    </div>
  )
}

interface PropsProducto {
  etiqueta: string
  claseEtiqueta: string
  marca: string
  nombre: string
  precio: number
  precioAntes?: number
  visual: string
}

function TarjetaProducto({ etiqueta, claseEtiqueta, marca, nombre, precio, precioAntes, visual }: PropsProducto) {
  const [agregado, setAgregado] = useState(false)
  const [favorito, setFavorito] = useState(false)

  return (
    <Link href="/tienda" className="prod clickable">
      <div className="prod-img">
        {etiqueta && (
          <span className={`prod-tag${claseEtiqueta === 'new' ? ' new' : claseEtiqueta === 'sale' ? ' sale' : ''}`}>
            {etiqueta}
          </span>
        )}
        <button
          className={`prod-fav${favorito ? ' liked' : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFavorito((f) => !f) }}
          aria-label="Favorito"
        >
          <Icono nombre="corazon" tamaño={14} />
        </button>
        <VisualProducto tipo={visual} />
        <div className="prod-glow" />
        <div className="prod-quick">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation() }}>
            <Icono nombre="buscar" tamaño={10} /> Ver
          </button>
          <button
            className={agregado ? 'added' : ''}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setAgregado(true)
              setTimeout(() => setAgregado(false), 1400)
            }}
          >
            <Icono nombre="carrito" tamaño={10} /> Añadir
          </button>
        </div>
      </div>
      <div className="prod-info">
        <div className="prod-brand">{marca}</div>
        <div className="prod-name">{nombre}</div>
        <div className="prod-meta">
          <div className="prod-price">
            <span className="now">{fmtCOP(precio)}</span>
            {precioAntes && <span className="was">{fmtCOP(precioAntes)}</span>}
          </div>
          <button
            className={`prod-add${agregado ? ' added' : ''}`}
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

export default function ProductosDestacados() {
  const [pestaña, setPestaña] = useState('bestseller')
  const filtrados = useMemo(() => PRODUCTOS.filter((p) => p.cat === pestaña), [pestaña])
  const lista = filtrados.length ? filtrados.slice(0, 4) : PRODUCTOS.slice(0, 4)

  return (
    <section className="section" id="productos">
      <div className="today-head">
        <div className="today-title">
          <h2 className="display">Hoy <em className="italic">para</em> Ti</h2>
        </div>
        <div className="today-tabs">
          {PESTAÑAS.map((t) => (
            <button
              key={t.id}
              className={`today-tab${pestaña === t.id ? ' active' : ''}`}
              onClick={() => setPestaña(t.id)}
            >
              {t.etiqueta}
            </button>
          ))}
        </div>
      </div>
      <div className="prod-grid">
        {lista.map((p) => (
          <TarjetaProducto key={p.id + '-' + pestaña} {...p} />
        ))}
      </div>
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link href="/tienda" className="btn btn-ghost">
          Ver Catálogo Completo
          <span className="arrow"><Icono nombre="flecha" tamaño={14} /></span>
        </Link>
      </div>
    </section>
  )
}
