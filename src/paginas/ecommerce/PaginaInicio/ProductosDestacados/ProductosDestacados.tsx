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

// Shown when Supabase returns no products
const FALLBACK_PRODUCTOS = [
  { id: 'fb1', nombre: 'Rey del Vallenato',          marca: 'Hohner',           precio: 9450000,  slug: 'acordeon-rey-del-vallenato',             producto_imagenes: [{ imagen_principal: `${BASE}/2024/01/Acordeon-Rey-Vallenato.jpg` }] },
  { id: 'fb2', nombre: 'Blanco Original',             marca: 'Hohner',           precio: 8200000,  slug: 'acordeon-hohner-blanco-total',            producto_imagenes: [{ imagen_principal: `${BASE}/2023/08/Acordeon-Blanco-HOHNER-ORIGINAL-600x600.jpg` }] },
  { id: 'fb3', nombre: 'Xtreme Azul Personalizado',  marca: 'Hohner',           precio: 10500000, slug: 'acordeon-hohner-xtreme-color-azul',        producto_imagenes: [{ imagen_principal: `${BASE}/2023/08/Acordeon-hohner-XTREME-azul-personalizado-600x600.jpg` }] },
  { id: 'fb4', nombre: 'Azul de Lujo',               marca: 'Hohner',           precio: 9800000,  slug: 'acordeon-hohner-azul-de-lujo',            producto_imagenes: [{ imagen_principal: `${BASE}/2023/08/Acordeon-vallenato-hohner-azul-personalizado-600x600.jpg` }] },
  { id: 'fb5', nombre: 'Dos Colores Personalizado',  marca: 'Hohner',           precio: 11200000, slug: 'acordeon-hohner-personalizado-de-dos-colores', producto_imagenes: [{ imagen_principal: `${BASE}/2023/08/Acordeon-de-botones-de-dos-colores-600x600.jpg` }] },
  { id: 'fb6', nombre: 'Verde Personalizado',        marca: 'Hohner',           precio: 10800000, slug: 'acordeon-hohner-xtreme-color-verde',       producto_imagenes: [{ imagen_principal: `${BASE}/2023/08/Acordeon-hohner-color-verde-personalizado-600x600.jpg` }] },
  { id: 'fb7', nombre: 'Blanco Tricolor Colombia',   marca: 'Hohner',           precio: 9600000,  slug: 'acordeon-hohner-blanco-tricolor',          producto_imagenes: [{ imagen_principal: `${BASE}/2023/08/Acordeon-hohner-con-bandera-de-colombia-600x600.jpg` }] },
  { id: 'fb8', nombre: 'Premium Dorado',             marca: 'Hohner',           precio: 14500000, precio_original: 16800000, slug: 'acordeon-hohner-premium-dorado-elegancia-musical-en-oro', producto_imagenes: [{ imagen_principal: `${BASE}/2023/08/Acordeon-blanco-premium-con-botones-dorados.jpg` }] },
]

const PESTAÑAS = [
  { id: 'todos',     etiqueta: 'Más Vendidos' },
  { id: 'descuento', etiqueta: 'Oferta Especial' },
  { id: 'nuevo',     etiqueta: 'Novedades' },
]

function TarjetaProducto({ producto }: { producto: any }) {
  const [agregado, setAgregado] = useState(false)
  const [favorito, setFavorito] = useState(false)
  const { agregarAlCarrito } = useCarrito()

  const imgUrl = optimizarUrlSupabase(
    (Array.isArray(producto.producto_imagenes) && producto.producto_imagenes[0]?.imagen_principal) || ''
  )

  const descuento = producto.precio_original && producto.precio_original > producto.precio
    ? Math.round((1 - producto.precio / producto.precio_original) * 100)
    : null

  const etiqueta = descuento ? `-${descuento}%` : (producto.estado?.toUpperCase() || 'NUEVO')
  const claseEtiqueta = descuento ? 'sale' : 'new'
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
        <span className={`prod-tag${claseEtiqueta === 'sale' ? ' sale' : ' new'}`}>{etiqueta}</span>
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
          <button
            className="prod-quick-btn"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.location.href = href }}
          >
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

function SkeletonCard() {
  return (
    <div className="prod">
      <div className="prod-img" style={{ minHeight: 200, background: 'var(--vda-superficie)' }} />
      <div className="prod-info">
        <div style={{ height: 10, width: '40%', background: 'var(--vda-linea)', marginBottom: 8 }} />
        <div style={{ height: 16, width: '80%', background: 'var(--vda-linea)', marginBottom: 12 }} />
        <div style={{ height: 12, width: '60%', background: 'var(--vda-linea)' }} />
      </div>
    </div>
  )
}

export default function ProductosDestacados() {
  const [pestaña, setPestaña] = useState('todos')
  const [todos, setTodos] = useState<any[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
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
      .limit(8)
      .then(({ data }) => {
        setTodos((data as any[]) || [])
        setCargando(false)
      })
  }, [])

  const fuente = todos.length > 0 ? todos : FALLBACK_PRODUCTOS as any[]

  const lista = (() => {
    if (pestaña === 'descuento') {
      const oferta = fuente.filter((p) => p.precio_original && p.precio_original > p.precio)
      return (oferta.length ? oferta : fuente).slice(0, 4)
    }
    return fuente.slice(0, 4)
  })()

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
        {cargando
          ? [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
          : lista.map((p) => <TarjetaProducto key={p.id + '-' + pestaña} producto={p} />)
        }
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
