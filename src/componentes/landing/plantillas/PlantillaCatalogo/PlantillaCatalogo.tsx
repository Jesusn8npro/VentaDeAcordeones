'use client'

import React, { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ImageOff,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { useCarrito } from '../../../../contextos/CarritoContext'
import { formatearPrecioCOP } from '../../../../utilidades/formatoPrecio'
import SeccionResenas from './SeccionResenas'
import './PlantillaCatalogo.css'

/**
 * PlantillaCatalogo — ficha para TODO lo que no es un instrumento de alto valor:
 * correas, fuelles, parrillas, micrófonos, audífonos, cajas, baterías, repuestos.
 *
 * POR QUÉ EXISTE ASÍ: antes esta plantilla era un volcado de administración
 * (mostraba el ID, el slug, "Plantilla: Catálogo Estándar", las fechas de creación,
 * el meta title y las palabras clave del SEO) y los 174 productos se pintaban con
 * PlantillaCinema, una ficha de varios metros pensada para un acordeón de 5 millones.
 * Para una correa de $120.000 esa ficha exagera y promete cosas que no lleva.
 *
 * REGLA DE CONTENIDO: aquí no se inventa NADA. Sin reseñas falsas, sin contadores
 * de urgencia, sin "bestseller", sin prometer estuche ni correa. Si un dato no está
 * en la base, su sección no se pinta. Las cifras de envío, garantía y retracto salen
 * del código y de las páginas legales reales del sitio:
 *   · envío gratis desde $50.000  → src/contextos/carritoReducer.ts
 *   · retracto 5 días hábiles     → /cambios-devoluciones (art. 47, Ley 1480 de 2011)
 */

const WHATSAPP = '573144865310' // +57 314 486 5310
const ENVIO_GRATIS_DESDE = 50000 // misma regla que aplica el carrito al cobrar el envío
const SITIO = 'https://ventadeacordeones.com'

/**
 * El importador dejó literales "No especificado" en material, talla, dimensiones y
 * origen. Para la ficha eso es exactamente igual de vacío que un NULL.
 */
const util = (valor: unknown): string => {
  const s = String(valor ?? '').replace(/\s+/g, ' ').trim()
  if (!s || /^no\s+especificad/i.test(s) || s === '-') return ''
  return s
}

/** `descripcion` es JSONB: puede llegar como string o como {titulo, contenido}. */
const textoDescripcion = (d: any): string => {
  if (!d) return ''
  if (typeof d === 'string') return d
  return String(d.contenido || d.texto || d.titulo || '')
}

export default function PlantillaCatalogo({ producto, reviews }: { producto?: any; reviews?: any[] }) {
  const { agregarAlCarrito, mostrarNotificacion } = useCarrito()
  const [imgActiva, setImgActiva] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [agregado, setAgregado] = useState(false)
  const [errorCarrito, setErrorCarrito] = useState('')

  // Las fotos ya llegan aplanadas por src/servicios/consultaProducto.ts (mismo
  // normalizador en servidor y navegador), así que no hay que volver a mirar
  // dentro de producto_imagenes.
  const fotos: string[] = useMemo(() => {
    const p = producto || {}
    return [...(p.fotos_principales || []), ...(p.fotos_secundarias || [])].filter(Boolean)
  }, [producto])

  const parrafos: string[] = useMemo(
    () =>
      textoDescripcion(producto?.descripcion)
        .split(/\n+/)
        .map((t) => t.trim())
        .filter(Boolean),
    [producto]
  )

  if (!producto) {
    return (
      <div className="pcat">
        <div className="pcat-vacio">
          <AlertCircle size={44} color="var(--vda-peligro)" />
          <h2>Producto no encontrado</h2>
          <p>El producto que buscas no existe o ya no está disponible.</p>
          <Link href="/tienda" className="pcat-btn pcat-btn--oro">
            <ArrowLeft size={16} /> Ver el catálogo
          </Link>
        </div>
      </div>
    )
  }

  const nombre = util(producto.nombre) || 'Producto'
  const marca = util(producto.marca)
  const categoria = producto.categorias?.nombre || ''
  const categoriaSlug = producto.categorias?.slug || ''
  const garantiaMeses = Number(producto.garantia_meses) || 0

  const precio = Number(producto.precio) || 0
  const precioAntes = Number(producto.precio_original) || 0
  // El porcentaje se calcula con los dos precios REALES: la columna `descuento` de la
  // base viene a 0 o desfasada en varios productos y no se puede publicar como rebaja.
  const hayRebaja = precioAntes > precio && precio > 0
  const rebajaPct = hayRebaja ? Math.round(((precioAntes - precio) / precioAntes) * 100) : 0

  const stock = Number(producto.stock) || 0
  const retirado = producto.estado === 'vendido' || producto.estado === 'agotado'
  const disponible = stock > 0 && !retirado && producto.activo !== false
  const pocasUnidades = disponible && stock <= 3
  // El carrito rechaza más de 10 unidades por producto (CarritoContext), así que el
  // selector no deja pedir algo que va a fallar al pulsar.
  const maximo = Math.min(stock, 10)

  const condicion = ['nuevo', 'usado'].includes(String(producto.estado)) ? String(producto.estado) : ''

  const mensajeWa = encodeURIComponent(
    `Hola, me interesa ${nombre}${precio > 0 ? ` (${formatearPrecioCOP(precio)})` : ''}. ` +
      `${SITIO}/producto/${producto.slug}`
  )
  const enlaceWa = `https://wa.me/${WHATSAPP}?text=${mensajeWa}`

  const especificaciones = [
    ['Marca', marca],
    ['Modelo', util(producto.modelo)],
    ['Color', util(producto.color)],
    ['Material', util(producto.material)],
    ['Talla', util(producto.talla)],
    ['Peso', Number(producto.peso) > 0 ? `${producto.peso} kg` : ''],
    ['Garantía', garantiaMeses > 0 ? `${garantiaMeses} meses` : ''],
    ['Condición', condicion ? condicion[0].toUpperCase() + condicion.slice(1) : ''],
    ['Categoría', categoria],
  ].filter(([, valor]) => Boolean(valor)) as [string, string][]
  // `origen_pais` no se publica: la base dice "Colombia" en 168 de 174 productos,
  // también en los Hohner y los Takstar. Publicarlo sería afirmar algo falso.

  const añadir = async () => {
    setErrorCarrito('')
    // Una sola llamada con la cantidad: el contexto ya valida stock y máximos. Antes
    // (en la otra plantilla) se llamaba N veces en un bucle, una petición por unidad.
    const res = await agregarAlCarrito(producto, cantidad)
    if (res?.success === false) {
      setErrorCarrito(res.message || 'No se pudo añadir al carrito')
      mostrarNotificacion?.('error', 'No se pudo añadir', res.message || 'Inténtalo de nuevo')
      return
    }
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2200)
  }

  return (
    <div className="pcat">
      {/* Migas: mismo camino que el BreadcrumbList del JSON-LD del servidor. */}
      <nav className="pcat-camino" aria-label="Ruta de navegación">
        <Link href="/">Inicio</Link>
        <span className="pcat-camino-sep">›</span>
        <Link href="/tienda">Tienda</Link>
        {categoria && (
          <>
            <span className="pcat-camino-sep">›</span>
            {categoriaSlug ? (
              <Link href={`/tienda/categoria/${categoriaSlug}`}>{categoria}</Link>
            ) : (
              <span>{categoria}</span>
            )}
          </>
        )}
        <span className="pcat-camino-sep">›</span>
        <span className="pcat-camino-actual" aria-current="page">{nombre}</span>
      </nav>

      <div className="pcat-principal">
        {/* ── Galería ─────────────────────────────────────────────── */}
        <div className="pcat-galeria pcat-anim">
          <figure className="pcat-foto">
            <div className="pcat-insignias">
              {hayRebaja && <span className="pcat-insignia">−{rebajaPct}%</span>}
              {retirado && <span className="pcat-insignia pcat-insignia--agotado">{producto.estado === 'vendido' ? 'VENDIDO' : 'AGOTADO'}</span>}
            </div>
            {fotos[imgActiva] ? (
              <Image
                key={fotos[imgActiva]}
                src={fotos[imgActiva]}
                alt={`${nombre}${marca ? ` ${marca}` : ''}`}
                width={760}
                height={760}
                sizes="(max-width: 900px) 92vw, 46vw"
                priority
              />
            ) : (
              <div className="pcat-foto-vacia">
                <ImageOff size={34} />
                <span>Sin imagen</span>
              </div>
            )}
          </figure>

          {/* Las miniaturas sólo aparecen si de verdad hay más de una foto:
              dos de cada tres productos tienen únicamente la principal. */}
          {fotos.length > 1 && (
            <div className="pcat-miniaturas" role="tablist" aria-label="Fotos del producto">
              {fotos.map((foto, i) => (
                <button
                  key={foto}
                  type="button"
                  role="tab"
                  aria-selected={imgActiva === i}
                  aria-label={`Ver foto ${i + 1} de ${fotos.length}`}
                  className={`pcat-miniatura ${imgActiva === i ? 'activa' : ''}`}
                  onClick={() => setImgActiva(i)}
                >
                  <Image src={foto} alt="" width={72} height={72} sizes="72px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Compra ──────────────────────────────────────────────── */}
        <div className="pcat-compra pcat-anim pcat-anim-2">
          {categoria &&
            (categoriaSlug ? (
              <Link href={`/tienda/categoria/${categoriaSlug}`} className="pcat-eyebrow">— {categoria}</Link>
            ) : (
              <span className="pcat-eyebrow">— {categoria}</span>
            ))}

          <h1 className="pcat-titulo">{nombre}</h1>

          {marca && <span className="pcat-marca">{marca}</span>}

          <div className="pcat-precios">
            <strong className="pcat-precio">{formatearPrecioCOP(precio)}</strong>
            {hayRebaja && (
              <>
                <s className="pcat-precio-antes">{formatearPrecioCOP(precioAntes)}</s>
                <span className="pcat-rebaja">Ahorras {formatearPrecioCOP(precioAntes - precio)}</span>
              </>
            )}
          </div>
          <p className="pcat-precio-nota">Precio en pesos colombianos, IVA incluido.</p>

          <div className={`pcat-stock ${!disponible ? 'pcat-stock--sin' : pocasUnidades ? 'pcat-stock--bajo' : ''}`}>
            <span className="pcat-punto" aria-hidden="true" />
            {/* Disponibilidad real: sale del stock de la base, no de un contador de urgencia. */}
            {!disponible
              ? producto.estado === 'vendido'
                ? 'Vendido · escríbenos y te conseguimos otro'
                : 'Agotado por ahora · escríbenos y te avisamos'
              : pocasUnidades
                ? `Últimas ${stock} ${stock === 1 ? 'unidad' : 'unidades'} disponibles`
                : `Disponible · ${stock} unidades en bodega`}
          </div>

          <div className="pcat-acciones">
            <div className="pcat-cantidad">
              <button type="button" onClick={() => setCantidad((c) => Math.max(1, c - 1))} disabled={!disponible || cantidad <= 1} aria-label="Quitar una unidad">
                <Minus size={15} />
              </button>
              <span aria-live="polite">{cantidad}</span>
              <button type="button" onClick={() => setCantidad((c) => Math.min(maximo, c + 1))} disabled={!disponible || cantidad >= maximo} aria-label="Añadir una unidad">
                <Plus size={15} />
              </button>
            </div>

            <button
              type="button"
              className={`pcat-btn ${agregado ? 'pcat-btn--hecho' : 'pcat-btn--oro'}`}
              onClick={añadir}
              disabled={!disponible}
            >
              {!disponible ? (
                <>No disponible</>
              ) : agregado ? (
                <><Check size={16} /> Añadido al carrito</>
              ) : (
                <>Añadir al carrito <ShoppingCart size={16} className="pcat-btn-icono" /></>
              )}
            </button>
          </div>

          {errorCarrito && (
            <p className="pcat-error"><AlertCircle size={15} /> {errorCarrito}</p>
          )}

          <a className="pcat-btn pcat-btn--fantasma" href={enlaceWa} target="_blank" rel="noopener noreferrer">
            <MessageCircle size={16} /> Preguntar por WhatsApp
          </a>

          <div className="pcat-confianza">
            <div className="pcat-confianza-item">
              <Truck size={19} />
              <div>
                <strong>Envío gratis</strong>
                <span>Desde {formatearPrecioCOP(ENVIO_GRATIS_DESDE)}</span>
              </div>
            </div>
            {garantiaMeses > 0 && (
              <div className="pcat-confianza-item">
                <ShieldCheck size={19} />
                <div>
                  <strong>Garantía {garantiaMeses} meses</strong>
                  <span>Defectos de fábrica</span>
                </div>
              </div>
            )}
            <div className="pcat-confianza-item">
              <MapPin size={19} />
              <div>
                <strong>Taller en Bogotá</strong>
                <span>Despacho propio</span>
              </div>
            </div>
          </div>

          {/* Primer párrafo como resumen; el resto va abajo, sin repetir texto. */}
          {parrafos[0] && <p className="pcat-resumen">{parrafos[0]}</p>}
        </div>
      </div>

      {/* ── Detalle ───────────────────────────────────────────────── */}
      <div className="pcat-detalle pcat-anim pcat-anim-3">
        <div className="pcat-columna">
          {parrafos.length > 1 && (
            <section className="pcat-bloque">
              <h2>Sobre este producto</h2>
              {parrafos.slice(1).map((p, i) => <p key={i}>{p}</p>)}
            </section>
          )}

          <section className="pcat-bloque">
            <h2>Envíos y devoluciones</h2>
            <p>
              Despachamos desde nuestro taller en Bogotá con Servientrega. Ciudades principales:
              1–2 días hábiles. Otras ciudades y municipios: 2–5 días hábiles. Recibes número de
              guía para rastrear el pedido.
            </p>
            <p>
              El envío es <strong>gratis en compras desde {formatearPrecioCOP(ENVIO_GRATIS_DESDE)}</strong>;
              por debajo de ese monto el carrito cobra {formatearPrecioCOP(5000)}.{' '}
              <Link href="/politica-envio">Ver política de envíos</Link>.
            </p>
            <p>
              Tienes <strong>5 días hábiles de retracto</strong> desde la entrega (art. 47, Ley 1480
              de 2011): el producto debe volver sin uso y con su empaque original.{' '}
              <Link href="/cambios-devoluciones">Ver cambios y devoluciones</Link>.
            </p>
            {garantiaMeses > 0 && (
              <p>
                Este producto incluye <strong>{garantiaMeses} meses de garantía</strong> contra
                defectos de fabricación en uso normal.
              </p>
            )}
          </section>
        </div>

        <div className="pcat-columna">
          {especificaciones.length > 0 && (
            <section className="pcat-bloque">
              <h2>Especificaciones</h2>
              <div className="pcat-specs">
                {especificaciones.map(([etiqueta, valor]) => (
                  <div key={etiqueta} className="pcat-spec">
                    <span>{etiqueta}</span>
                    <strong>{valor}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="pcat-bloque">
            <h2>Compra con respaldo</h2>
            <ul className="pcat-lista">
              <li>Factura a tu nombre en cada pedido.</li>
              <li>Pago con tarjeta, PSE, Nequi o contra entrega.</li>
              <li>Asesoría por WhatsApp antes y después de la compra.</li>
              <li>Empaque reforzado para que llegue intacto.</li>
            </ul>
            <p style={{ marginTop: 16 }}>
              <RotateCcw size={14} style={{ display: 'inline', verticalAlign: '-2px', marginRight: 6 }} />
              ¿Dudas con la referencia? <a href={enlaceWa} target="_blank" rel="noopener noreferrer">Escríbenos por WhatsApp</a>{' '}
              y te confirmamos compatibilidad antes de que pagues.
            </p>
          </section>
        </div>
      </div>

      {/* Reseñas reales de la base. Si no hay, la sección entera no existe. */}
      <SeccionResenas reviews={reviews || []} />
    </div>
  )
}
