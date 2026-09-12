'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Icono from '@/componentes/ui/Icono'
import { clienteSupabase } from '@/configuracion/supabase'
import { optimizarUrlSupabase } from '@/componentes/ImagenOptimizada'
import { useCarrito } from '@/contextos/CarritoContext'

const fmtCOP = (n: number) => `$${n.toLocaleString('es-CO')} COP`

// Se eliminaron dos cosas falsas de esta sección:
//
// 1) El contador `Cuenta()`, que arrancaba en 6:17:56, bajaba en bucle y al llegar a cero volvía
//    a 11:59:59. No había ninguna promoción detrás: era urgencia inventada (y un setInterval de
//    1 s repintando la home sin razón).
// 2) El FALLBACK_FLASH, con precios que no existen: "Rey del Vallenato $6.615.000 antes
//    $9.450.000" cuando el precio real es $3.610.000 y ese producto no tiene descuento; o
//    "Premium Dorado $11.160.000" cuando vale $5.390.000. Si Supabase no responde ahora la
//    sección no se pinta, en vez de mostrar precios inventados.

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

/** `iniciales` viene del servidor (app/page.tsx) para que las ofertas salgan ya en el HTML. */
export default function VentaRelampago({ iniciales }: { iniciales?: any[] }) {
  const [productos, setProductos] = useState<any[]>(iniciales || [])

  useEffect(() => {
    if (iniciales?.length) return
    // Solo productos con precio_original: son los que de verdad están rebajados. Antes, si había
    // menos de dos, se rellenaba con "los 4 más nuevos" bajo un título de ofertas, así que se
    // anunciaban como rebajados productos a precio de lista.
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
      .then(({ data }) => setProductos((data as any[]) || []))
  }, [])

  // Sin rebajas vigentes no hay nada que anunciar: la sección desaparece.
  if (productos.length === 0) return null

  return (
    <section className="section" id="flash">
      <div className="flash reveal">
        <div className="flash-head">
          <div className="flash-title">
            <div className="flash-bolt">
              <Icono nombre="rayo" tamaño={24} />
            </div>
            <div>
              <div className="flash-name">Ofertas <span className="gd">Vigentes</span></div>
              <div className="flash-meta">Rebajas reales sobre el precio de lista · Envío a toda Colombia</div>
            </div>
          </div>
          <div className="flash-nav">
            <button aria-label="Anterior"><Icono nombre="flecha" tamaño={16} /></button>
            <button className="primary" aria-label="Ver todos"><Icono nombre="flecha" tamaño={16} /></button>
          </div>
        </div>
        <div className="prod-grid">
          {productos.map((p) => (
            <TarjetaFlash key={p.id} producto={p} />
          ))}
        </div>
      </div>
    </section>
  )
}
