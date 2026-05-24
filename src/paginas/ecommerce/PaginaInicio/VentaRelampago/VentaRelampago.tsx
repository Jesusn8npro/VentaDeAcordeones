'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Icono from '@/componentes/ui/Icono'
import { clienteSupabase } from '@/configuracion/supabase'
import { optimizarUrlSupabase } from '@/componentes/ImagenOptimizada'
import { useCarrito } from '@/contextos/CarritoContext'

const fmtCOP = (n: number) => `$${n.toLocaleString('es-CO')} COP`

const BASE = 'https://ventadeacordeones.com/storage'

const FALLBACK_FLASH = [
  { id: 'ff1', nombre: 'Rey del Vallenato', marca: 'Hohner', precio: 6615000, precio_original: 9450000, slug: 'acordeon-rey-del-vallenato',   producto_imagenes: [{ imagen_principal: `${BASE}/2024/01/Acordeon-Rey-Vallenato.jpg` }] },
  { id: 'ff2', nombre: 'Premium Dorado',    marca: 'Hohner', precio: 11160000, precio_original: 14500000, slug: 'acordeon-hohner-premium-dorado-elegancia-musical-en-oro', producto_imagenes: [{ imagen_principal: `${BASE}/2023/08/Acordeon-blanco-premium-con-botones-dorados.jpg` }] },
  { id: 'ff3', nombre: 'Xtreme Azul',       marca: 'Hohner', precio: 8400000, precio_original: 10500000, slug: 'acordeon-hohner-xtreme-color-azul', producto_imagenes: [{ imagen_principal: `${BASE}/2023/08/Acordeon-hohner-XTREME-azul-personalizado-600x600.jpg` }] },
  { id: 'ff4', nombre: 'Verde Personalizado', marca: 'Hohner', precio: 8640000, precio_original: 10800000, slug: 'acordeon-hohner-xtreme-color-verde', producto_imagenes: [{ imagen_principal: `${BASE}/2023/08/Acordeon-hohner-color-verde-personalizado-600x600.jpg` }] },
]

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

function TarjetaFlash({ producto }: { producto: any }) {
  const [agregado, setAgregado] = useState(false)
  const [favorito, setFavorito] = useState(false)
  const { agregarAlCarrito } = useCarrito()

  const imgUrl = optimizarUrlSupabase(
    (Array.isArray(producto.producto_imagenes) && producto.producto_imagenes[0]?.imagen_principal) || ''
  )

  const descuento = producto.precio_original && producto.precio_original > producto.precio
    ? Math.round((1 - producto.precio / producto.precio_original) * 100)
    : null

  const href = producto.slug ? `/producto/${producto.slug}` : '/tienda'
  const marca = producto.marca || producto.categorias?.nombre || ''

  const manejarAgregar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try { await agregarAlCarrito(producto) } catch {}
    setAgregado(true)
    setTimeout(() => setAgregado(false), 1400)
  }

  return (
    <Link href={href} className="prod clickable">
      <div className="prod-img">
        {descuento && (
          <span className="prod-tag sale">-{descuento}%</span>
        )}
        <button
          className={`prod-fav${favorito ? ' liked' : ''}`}
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFavorito((f) => !f) }}
          aria-label="Favorito"
        >
          <Icono nombre="corazon" tamaño={14} />
        </button>
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={producto.nombre || 'Producto'}
            width={400}
            height={400}
            style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '14px' }}
            loading="lazy"
          />
        ) : (
          <div className="mini-acc"><div className="h t" /><div className="b" /><div className="h b" /></div>
        )}
        <div className="prod-glow" />
        <div className="prod-quick">
          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = href }}>
            <Icono nombre="buscar" tamaño={10} /> Ver
          </button>
          <button
            className={agregado ? 'added' : ''}
            onClick={manejarAgregar}
          >
            <Icono nombre="carrito" tamaño={10} /> Añadir
          </button>
        </div>
      </div>
      <div className="prod-info">
        <div className="prod-brand">{marca}</div>
        <div className="prod-name">{producto.nombre}</div>
        <div className="prod-meta">
          <div className="prod-price">
            <span className="now">{fmtCOP(producto.precio)}</span>
            {producto.precio_original && <span className="was">{fmtCOP(producto.precio_original)}</span>}
          </div>
          <button
            className={`prod-add${agregado ? ' added' : ''}`}
            onClick={manejarAgregar}
          >
            {agregado ? <><Icono nombre="estrella" tamaño={11} /> Añadido</> : <><Icono nombre="carrito" tamaño={11} /> Añadir</>}
          </button>
        </div>
      </div>
    </Link>
  )
}

export default function VentaRelampago() {
  const [productos, setProductos] = useState<any[]>([])

  useEffect(() => {
    // Prefer discounted products; fallback to newest
    clienteSupabase
      .from('productos')
      .select(`
        id, nombre, slug, precio, precio_original, marca, estado,
        categorias(nombre),
        producto_imagenes(imagen_principal)
      `)
      .eq('activo', true)
      .gt('stock', 0)
      .not('precio_original', 'is', null)
      .order('creado_el', { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data && data.length >= 2) {
          setProductos(data as any[])
          return
        }
        // Fallback: any 4 products
        clienteSupabase
          .from('productos')
          .select(`
            id, nombre, slug, precio, precio_original, marca, estado,
            categorias(nombre),
            producto_imagenes(imagen_principal)
          `)
          .eq('activo', true)
          .gt('stock', 0)
          .order('creado_el', { ascending: false })
          .limit(4)
          .then(({ data: fallback }) => setProductos((fallback as any[]) || []))
      })
  }, [])

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
          {(productos.length > 0 ? productos : FALLBACK_FLASH as any[]).map((p) => (
            <TarjetaFlash key={p.id} producto={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
