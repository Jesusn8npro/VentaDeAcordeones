'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'

const fmtCOP = (n: number) => `$${n.toLocaleString('es-CO')} COP`

const PRODUCTOS_FLASH = [
  { id: 'f1', etiqueta: '-30%', claseEtiqueta: 'sale', marca: 'Hohner',          nombre: 'Rey Vallenato Sol',     precio: 6915000,  precioAntes: 9450000,  vendido: 9, stock: 10, visual: 'acc' },
  { id: 'f2', etiqueta: '-25%', claseEtiqueta: 'sale', marca: 'Edición Maestro', nombre: 'Onix Oro 24K',          precio: 10650000, precioAntes: 14200000, vendido: 6, stock: 10, visual: 'acc' },
  { id: 'f3', etiqueta: '-18%', claseEtiqueta: 'sale', marca: 'Fender',          nombre: 'Stratocaster Sunburst', precio: 4290000,  precioAntes: 5230000,  vendido: 5, stock: 10, visual: 'guitar' },
  { id: 'f4', etiqueta: '-22%', claseEtiqueta: 'sale', marca: 'Pearl',           nombre: 'Export 5pc Negro',      precio: 6580000,  precioAntes: 8430000,  vendido: 8, stock: 10, visual: 'drums' },
]

function VisualProducto({ tipo }: { tipo: string }) {
  if (tipo === 'guitar') {
    return (
      <div className="mini-guitar">
        <div className="mini-guitar-neck" />
        <div className="mini-guitar-head" />
        <div className="mini-guitar-body" />
      </div>
    )
  }
  if (tipo === 'drums') {
    return (
      <div className="mini-drums">
        <div className="d-cymbal" />
        <div className="d-tom t1" />
        <div className="d-tom t2" />
        <div className="d-snare" />
        <div className="d-kick" />
      </div>
    )
  }
  return (
    <div className="mini-acc">
      <div className="h t" />
      <div className="b" />
      <div className="h b" />
    </div>
  )
}

function Cuenta() {
  const [t, setT] = useState({ h: 6, m: 17, s: 56 })
  useEffect(() => {
    const iv = setInterval(() => {
      setT((prev) => {
        let { h, m, s } = prev
        s -= 1
        if (s < 0) { s = 59; m -= 1 }
        if (m < 0) { m = 59; h -= 1 }
        if (h < 0) { h = 11; m = 59; s = 59 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [])
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <div className="flash-countdown">
      <div className="flash-cd-box">{pad(t.h)}</div>
      <div className="flash-cd-sep">:</div>
      <div className="flash-cd-box">{pad(t.m)}</div>
      <div className="flash-cd-sep">:</div>
      <div className="flash-cd-box">{pad(t.s)}</div>
    </div>
  )
}

interface PropsTarjeta {
  etiqueta: string
  claseEtiqueta: string
  marca: string
  nombre: string
  precio: number
  precioAntes?: number
  vendido?: number
  stock?: number
  visual: string
}

function TarjetaFlash({ etiqueta, claseEtiqueta, marca, nombre, precio, precioAntes, vendido, stock, visual }: PropsTarjeta) {
  const [agregado, setAgregado] = useState(false)
  const [favorito, setFavorito] = useState(false)
  const porcentaje = vendido && stock ? (vendido / stock) * 100 : 0

  return (
    <Link href="/tienda" className="prod clickable">
      <div className="prod-img">
        <span className={`prod-tag${claseEtiqueta === 'sale' ? ' sale' : ''}`}>{etiqueta}</span>
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
            {agregado ? <><Icono nombre="estrella" tamaño={11} /> Añadido</> : <><Icono nombre="carrito" tamaño={11} /> Añadir</>}
          </button>
        </div>
        {vendido !== undefined && stock !== undefined && (
          <div className="prod-sale">
            <div className="prod-sale-bar" style={{ '--p': `${porcentaje}%` } as React.CSSProperties} />
            <span>{vendido}/{stock} Vendido</span>
          </div>
        )}
      </div>
    </Link>
  )
}

export default function VentaRelampago() {
  return (
    <section className="section" id="flash">
      <div className="flash reveal">
        <div className="flash-head">
          <div className="flash-title">
            <div className="flash-bolt">
              <Icono nombre="rayo" tamaño={24} />
            </div>
            <div>
              <div className="flash-name">Flash Sale <span className="gd">Hoy</span></div>
              <div className="flash-meta">Termina en pocas horas · Stock limitado</div>
            </div>
          </div>
          <Cuenta />
          <div className="flash-nav">
            <button aria-label="Anterior"><Icono nombre="flecha" tamaño={16} /></button>
            <button className="primary" aria-label="Ver todos"><Icono nombre="flecha" tamaño={16} /></button>
          </div>
        </div>
        <div className="prod-grid">
          {PRODUCTOS_FLASH.map((p) => (
            <TarjetaFlash key={p.id} {...p} />
          ))}
        </div>
      </div>
    </section>
  )
}
