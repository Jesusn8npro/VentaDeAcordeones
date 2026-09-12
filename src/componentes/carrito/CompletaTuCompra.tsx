'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, Loader2, Plus, Sparkles } from 'lucide-react'
import { useCarrito } from '../../contextos/CarritoContext'
import { formatearPrecioCOP } from '../../utilidades/formatoPrecio'
import { calcularProgresoEnvio } from './reglasEnvio'
import './CompletaTuCompra.css'

interface Sugerido {
  id: string
  nombre: string
  slug: string | null
  precio: number
  precio_original: number | null
  stock: number
  activo: boolean
  categoria: string | null
  imagen: string | null
}

/**
 * La ficha pública es /producto/[slug]. Si un producto no tuviera slug, enlazar
 * llevaría a un 404, así que se pinta el mismo bloque sin enlace.
 */
function EnlaceSiHay({ href, children, ...resto }: { href: string | null } & React.ComponentProps<'div'>) {
  if (!href) return <div {...resto}>{children}</div>
  return <Link href={href} {...(resto as any)}>{children}</Link>
}

interface Props {
  /** 'cajon' = dentro del drawer lateral; 'pagina' = página del carrito. */
  variante?: 'pagina' | 'cajon'
  /** El drawer lo pasa para no pedir sugerencias mientras está cerrado. */
  activo?: boolean
  onNavegar?: () => void
}

/**
 * "Completa tu compra": accesorios que encajan con lo que ya hay en el carrito.
 *
 * Por qué así:
 *  - El servidor decide (ver app/api/productos/sugeridos/route.ts): solo productos
 *    activos, con stock y más baratos que el principal. Nada de catálogo aleatorio.
 *  - Máximo 4 tarjetas. Más sugerencias no venden más, dispersan.
 *  - Un clic añade: si hay que salir a la ficha de producto, se pierde la compra.
 *  - Se marca "Con este llegas al envío gratis" cuando el subtotal + ese precio
 *    cruzan el umbral. Es un cálculo real del carrito, no una urgencia inventada.
 */
export default function CompletaTuCompra({ variante = 'pagina', activo = true, onNavegar }: Props) {
  const { items, subtotal, envio, agregarAlCarrito, mostrarNotificacion } = useCarrito() as any

  const [sugeridos, setSugeridos] = useState<Sugerido[]>([])
  const [cargando, setCargando] = useState(false)
  const [anadiendo, setAnadiendo] = useState<string | null>(null)
  const [recienAnadido, setRecienAnadido] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Ids de producto del carrito. Se serializan para que el efecto reaccione al
  // CONTENIDO y no a la identidad del array, que cambia en cada render.
  const idsProducto = useMemo(
    () => (items || []).map((i: any) => i.producto_id || i.productos?.id).filter(Boolean),
    [items]
  )
  const claveIds = idsProducto.join(',')

  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => { if (temporizador.current) clearTimeout(temporizador.current) }, [])

  useEffect(() => {
    if (!activo || !claveIds) { setSugeridos([]); return }

    // AbortController: al cambiar el carrito rápido (añadir, quitar) la respuesta
    // vieja no debe pisar a la nueva.
    const control = new AbortController()
    setCargando(true)
    setError(null)

    fetch('/api/productos/sugeridos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: claveIds.split(',') }),
      signal: control.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('respuesta ' + r.status))))
      .then((d) => setSugeridos(Array.isArray(d?.sugeridos) ? d.sugeridos : []))
      .catch((e) => { if (e?.name !== 'AbortError') { setSugeridos([]); setError('No pudimos cargar las sugerencias.') } })
      .finally(() => { if (!control.signal.aborted) setCargando(false) })

    return () => control.abort()
  }, [claveIds, activo])

  const progreso = calcularProgresoEnvio(subtotal || 0, envio || 0)

  const manejarAnadir = async (producto: Sugerido) => {
    if (anadiendo) return
    setAnadiendo(producto.id)
    try {
      const resultado = await agregarAlCarrito(producto, 1)
      if (!resultado?.success) {
        mostrarNotificacion?.('error', 'No se pudo agregar', resultado?.message || 'Inténtalo de nuevo')
        return
      }
      // Confirmación en el propio botón: el cliente no pierde de vista el carrito.
      setRecienAnadido(producto.id)
      if (temporizador.current) clearTimeout(temporizador.current)
      temporizador.current = setTimeout(() => setRecienAnadido(null), 1800)
    } finally {
      setAnadiendo(null)
    }
  }

  if (!claveIds) return null

  const clases = ['vda-cross', variante === 'cajon' ? 'es-cajon' : ''].filter(Boolean).join(' ')

  if (cargando && sugeridos.length === 0) {
    return (
      <section className={clases} aria-busy="true">
        <div className="vda-cross-cabecera">
          <Sparkles size={18} className="vda-cross-icono" aria-hidden="true" />
          <h3>Completa tu compra</h3>
        </div>
        <p className="vda-cross-sub">Buscando accesorios que encajen con lo que llevas…</p>
        <div className="vda-cross-lista">
          {[0, 1, 2, 3].map((i) => <div key={i} className="vda-cross-esqueleto" />)}
        </div>
      </section>
    )
  }

  if (!sugeridos.length) return null

  return (
    <section className={clases} aria-label="Accesorios para completar tu compra">
      <div className="vda-cross-cabecera">
        <Sparkles size={18} className="vda-cross-icono" aria-hidden="true" />
        <h3>Completa tu compra</h3>
      </div>
      <p className="vda-cross-sub">
        Accesorios compatibles con lo que ya llevas. Se agregan sin salir del carrito.
      </p>

      <ul className="vda-cross-lista">
        {sugeridos.map((p) => {
          const enCurso = anadiendo === p.id
          const listo = recienAnadido === p.id
          // Solo es cierto si el carrito AÚN paga envío y este producto cubre lo que falta.
          const esPuente = !progreso.conseguido && p.precio >= progreso.falta
          const conDescuento = !!p.precio_original && p.precio_original > p.precio
          // La ficha pública es /producto/[slug]; sin slug no hay página a la que ir.
          const enlace = p.slug ? `/producto/${p.slug}` : null

          return (
            <li key={p.id} className="vda-cross-item">
              <EnlaceSiHay href={enlace} className="vda-cross-figura" onClick={onNavegar} aria-label={p.nombre}>
                {p.imagen ? (
                  <Image
                    src={p.imagen}
                    alt={p.nombre}
                    fill
                    sizes="(max-width: 640px) 45vw, 160px"
                    quality={65}
                    loading="lazy"
                  />
                ) : (
                  <span className="vda-cross-sinfoto" aria-hidden="true">{p.nombre.charAt(0)}</span>
                )}
                {esPuente && <span className="vda-cross-puente">Con este llegas al envío gratis</span>}
              </EnlaceSiHay>

              <div className="vda-cross-cuerpo">
                <EnlaceSiHay href={enlace} className="vda-cross-nombre" onClick={onNavegar}>
                  {p.nombre}
                </EnlaceSiHay>

                <div className="vda-cross-precio">
                  {conDescuento && <del>{formatearPrecioCOP(p.precio_original as number)}</del>}
                  {formatearPrecioCOP(p.precio)}
                </div>

                {p.stock > 0 && p.stock <= 3 && (
                  <span className="vda-cross-stock">
                    {p.stock === 1 ? 'Última unidad' : `Quedan ${p.stock}`}
                  </span>
                )}

                <button
                  type="button"
                  className={`vda-cross-boton ${listo ? 'es-anadido' : ''}`}
                  onClick={() => manejarAnadir(p)}
                  disabled={enCurso || listo}
                  aria-label={`Agregar ${p.nombre} al carrito`}
                >
                  {enCurso ? (
                    <><Loader2 size={14} className="animate-spin" aria-hidden="true" /> Agregando</>
                  ) : listo ? (
                    <><Check size={14} aria-hidden="true" /> Agregado</>
                  ) : (
                    <><Plus size={14} aria-hidden="true" /> Agregar</>
                  )}
                </button>
              </div>
            </li>
          )
        })}
      </ul>

      {error && <p className="vda-cross-error">{error}</p>}
    </section>
  )
}
