'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Icono from '@/componentes/ui/Icono'
import { clienteSupabase } from '@/configuracion/supabase'
import { optimizarUrlSupabase } from '@/componentes/ImagenOptimizada'
import { useCarrito } from '@/contextos/CarritoContext'

const fmtCOP = (n: number) => `$${n.toLocaleString('es-CO')} COP`

// Se eliminó FALLBACK_PRODUCTOS: eran 8 productos con precios inventados que se pintaban cuando
// Supabase no devolvía nada (Blanco Tricolor a $9.600.000 cuando vale $5.290.000, Premium Dorado
// a $14.500.000 "antes $16.800.000" cuando vale $5.390.000 antes $5.900.000). Mostrar precios que
// no existen es peor que no mostrar la sección, así que ahora sin datos la sección no se pinta.

// "Más Vendidos" era falso: la consulta ordena por fecha de creación, no por ventas.
const PESTAÑAS = [
  { id: 'todos',     etiqueta: 'Destacados' },
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
            // La tarjeta mide ~260px en escritorio: sin `sizes` Next servía el candidato de 1080px+.
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 260px"
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

/**
 * `iniciales` llega desde el Server Component (app/page.tsx): con los productos ya
 * consultados, las tarjetas salen dentro del HTML y no hay hueco ni salto de layout
 * mientras el navegador pide los datos. Si no llegan (por ejemplo, si falla la
 * consulta del servidor), se piden desde el navegador como antes.
 */
export default function ProductosDestacados({ iniciales }: { iniciales?: any[] }) {
  const [pestaña, setPestaña] = useState('todos')
  const [todos, setTodos] = useState<any[]>(iniciales || [])
  const [cargando, setCargando] = useState(!iniciales?.length)

  useEffect(() => {
    if (iniciales?.length) return
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

  const lista = (() => {
    if (pestaña === 'descuento') {
      // Si no hay rebajas vigentes la pestaña se queda vacía. Antes caía de vuelta a `fuente`,
      // así que enseñaba productos a precio de lista bajo el rótulo "Oferta Especial".
      return todos.filter((p) => p.precio_original && p.precio_original > p.precio).slice(0, 4)
    }
    return todos.slice(0, 4)
  })()

  // Sin datos reales no se pinta la sección (antes entraban aquí los productos de relleno).
  if (!cargando && todos.length === 0) return null

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
      {cargando ? (
        <div className="prod-grid">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : lista.length > 0 ? (
        <div className="prod-grid">
          {lista.map((p) => <TarjetaProducto key={p.id + '-' + pestaña} producto={p} />)}
        </div>
      ) : (
        /* Solo ocurre en la pestaña de ofertas cuando no hay ninguna rebaja vigente. */
        <p style={{ textAlign: 'center', padding: '56px 16px', color: 'var(--vda-tinta-muted)' }}>
          Ahora mismo no tenemos productos rebajados. Mira el catálogo completo.
        </p>
      )}
      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <Link href="/tienda" className="btn btn-ghost">
          Ver Catálogo Completo
          <span className="arrow"><Icono nombre="flecha" tamaño={14} /></span>
        </Link>
      </div>
    </section>
  )
}
