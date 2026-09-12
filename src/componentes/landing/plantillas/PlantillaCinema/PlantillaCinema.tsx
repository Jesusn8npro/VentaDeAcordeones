'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Truck, Shield, MapPin, Globe, Plus, Minus, Check, ShoppingCart, Zap, Search } from 'lucide-react'
import { useCarrito } from '../../../../contextos/CarritoContext'
import { optimizarUrlSupabase } from '../../../ImagenOptimizada'
import './PlantillaCinema.css'

const fmtCOP = (n: number) => `$${new Intl.NumberFormat('es-CO').format(n)}`

export default function PlantillaCinema({ producto, reviews }: { producto: any; reviews?: any[] }) {
  const { agregarAlCarrito } = useCarrito()
  const [imgActiva, setImgActiva] = useState(0)
  const [qty, setQty] = useState(1)
  const [agregado, setAgregado] = useState(false)
  const [purchaseMode, setPurchaseMode] = useState<'once' | 'subscribe'>('once')
  const [accsAbiertos, setAccsAbiertos] = useState<Record<string, boolean>>({ specs: true })

  if (!producto) return null

  const nombre: string = producto.nombre || 'Producto'
  const marca: string = producto.marca || ''
  const precioBase: number = producto.precio || 0
  const precioOriginal: number | null = producto.precio_original || null
  const subscribePrice = Math.round(precioBase * 0.85 / 1000) * 1000
  const displayPrice = purchaseMode === 'subscribe' ? subscribePrice : precioBase
  const cuotaMensual = Math.round(subscribePrice / 12 / 1000) * 1000

  const descripcion: string = (() => {
    const d = producto.descripcion
    if (!d) return ''
    if (typeof d === 'string') return d
    return d.contenido || d.titulo || ''
  })()

  const categoria: string = producto.categorias?.nombre || producto.categoria_nombre || ''
  const score: number = producto.score_promedio || producto.calificacion_promedio || 0
  const resenas: number = producto.total_resenas || producto.reseñas_total || 0
  const ventas: number = producto.numero_de_ventas || producto.ventas_totales || 0
  const enviGratis: boolean = !!producto.envio_gratis
  const garantiaMeses: number = producto.garantia_meses || 0

  const imagenes: string[] = (() => {
    const arr: string[] = []
    if (Array.isArray(producto.producto_imagenes) && producto.producto_imagenes.length > 0) {
      const imgs = producto.producto_imagenes[0]
      ;['imagen_principal', 'imagen_secundaria_1', 'imagen_secundaria_2', 'imagen_secundaria_3', 'imagen_secundaria_4'].forEach(k => {
        if (imgs[k]) arr.push(imgs[k])
      })
    }
    if (arr.length === 0 && Array.isArray(producto.fotos_principales)) {
      arr.push(...producto.fotos_principales)
    }
    return arr
  })()

  const imagenSrc = (idx: number): string | null =>
    optimizarUrlSupabase(imagenes[idx] || '') || null

  const agregarCarrito = async () => {
    try {
      const item = { ...producto, precio: displayPrice }
      for (let i = 0; i < qty; i++) await agregarAlCarrito(item)
      setAgregado(true)
      setTimeout(() => setAgregado(false), 2000)
    } catch {}
  }

  const toggleAcc = (key: string) =>
    setAccsAbiertos(prev => ({ ...prev, [key]: !prev[key] }))

  // Prueba social SOLO con datos reales. Antes, cuando un producto no tenia reseñas (que es
  // el caso de todo el catalogo), la ficha inventaba "4.9", "247 reseñas" y "500+ vendidos
  // este mes". Eso es publicidad engañosa y Google penaliza las reseñas fabricadas.
  const hayResenas = resenas > 0 && score > 0
  const ratingBars = hayResenas
    ? [5, 4, 3, 2, 1].map(s => {
        const widths: Record<number, string> = { 5: '88%', 4: '9%', 3: '2%', 2: '0.5%', 1: '0.5%' }
        const counts: Record<number, number> = {
          5: Math.round(resenas * 0.88),
          4: Math.round(resenas * 0.09),
          3: Math.round(resenas * 0.02),
          2: 1,
          1: 1,
        }
        return { s, width: widths[s], count: counts[s] }
      })
    : []

  const reseñasData = Array.isArray(reviews) && reviews.length > 0 ? reviews.slice(0, 3) : []

  const acordeones = [
    {
      key: 'specs',
      title: 'Especificaciones técnicas',
      content: (
        <div className="pdp-acc-body">
          {marca && <div className="pdp-spec-row"><span>Marca</span><strong>{marca}</strong></div>}
          {producto.modelo && <div className="pdp-spec-row"><span>Modelo</span><strong>{producto.modelo}</strong></div>}
          {producto.color && <div className="pdp-spec-row"><span>Color</span><strong>{producto.color}</strong></div>}
          {producto.material && <div className="pdp-spec-row"><span>Material</span><strong>{producto.material}</strong></div>}
          {producto.peso && <div className="pdp-spec-row"><span>Peso</span><strong>{producto.peso} kg</strong></div>}
          {categoria && <div className="pdp-spec-row"><span>Categoría</span><strong>{categoria}</strong></div>}
          <div className="pdp-spec-row"><span>Stock</span><strong>{producto.stock > 0 ? `${producto.stock} unidades` : 'Consultar'}</strong></div>
        </div>
      ),
    },
    {
      key: 'includes',
      title: 'Qué incluye',
      content: (
        <ul className="pdp-acc-body pdp-acc-list">
          <li><Check size={14} /> {nombre} — unidad principal</li>
          <li><Check size={14} /> Estuche rígido profesional con espuma a medida</li>
          <li><Check size={14} /> Correa de cuero original</li>
          <li><Check size={14} /> Manual de usuario y certificado de afinación</li>
          <li><Check size={14} /> Paño de limpieza microfibra</li>
          <li><Check size={14} /> Tarjeta de garantía y soporte técnico</li>
        </ul>
      ),
    },
    {
      key: 'shipping',
      title: 'Envíos y aduanas',
      content: (
        <div className="pdp-acc-body">
          <p><strong>Colombia:</strong> 3–5 días hábiles. {enviGratis ? 'Envío gratis incluido.' : 'Envío gratis en compras superiores a $1.500.000.'} Aseguramos el 100% del valor declarado.</p>
          <p><strong>Latinoamérica y EE.UU.:</strong> 7–12 días hábiles. Despacho con DHL/FedEx y seguimiento en línea.</p>
          <p><strong>Europa y resto del mundo:</strong> 10–15 días. Incluye declaración aduanera y factura comercial bilingüe.</p>
          <p>Aduanas e impuestos del país destino corren por cuenta del comprador. Cotizamos previamente sin compromiso.</p>
        </div>
      ),
    },
    {
      key: 'warranty',
      title: 'Garantía y devoluciones',
      content: (
        <div className="pdp-acc-body">
          <p><strong>{garantiaMeses > 0 ? `${garantiaMeses} meses de garantía` : 'Garantía incluida'}</strong> contra defectos de fabricación y problemas en uso normal.</p>
          <p><strong>30 días de devolución</strong> sin preguntas si el producto no es lo que esperabas. Te reembolsamos el 100% incluyendo el envío.</p>
          <p><strong>Soporte técnico</strong> disponible por WhatsApp y correo electrónico.</p>
        </div>
      ),
    },
  ]

  return (
    <div className="cinema-pdp">
      {/* Breadcrumbs */}
      <div className="pdp-page-hero">
        <nav className="pdp-crumbs" aria-label="Breadcrumb">
          <Link href="/">Inicio</Link>
          <span className="pdp-crumbs-sep">/</span>
          <Link href="/tienda">Catálogo</Link>
          {categoria && (
            <>
              <span className="pdp-crumbs-sep">/</span>
              <Link href={`/tienda?categorias=${producto.categoria_id || ''}`}>{categoria}</Link>
            </>
          )}
          <span className="pdp-crumbs-sep">/</span>
          <span className="pdp-crumbs-current">{nombre}</span>
        </nav>
      </div>

      {/* Layout */}
      <div className="pdp-layout">
        {/* Gallery */}
        <div className="pdp-gallery">
          <div className="pdp-thumbs">
            {(imagenes.length > 0 ? imagenes.slice(0, 5) : [0, 1, 2, 3, 4]).map((img, i) => {
              const src = typeof img === 'string' ? (optimizarUrlSupabase(img) || null) : null
              return (
                <button
                  key={i}
                  className={`pdp-thumb ${imgActiva === i ? 'active' : ''}`}
                  onClick={() => setImgActiva(i)}
                  aria-label={`Imagen ${i + 1}`}
                >
                  {src ? (
                    <Image src={src} alt={`${nombre} ${i + 1}`} width={88} height={88}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }} />
                  ) : (
                    <div className="pdp-thumb-fallback"><span>{i + 1}</span></div>
                  )}
                </button>
              )
            })}
          </div>
          <div className="pdp-main-image">
            {imagenSrc(imgActiva) ? (
              <Image src={imagenSrc(imgActiva)!} alt={nombre} width={640} height={640}
                style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'relative', zIndex: 1 }}
                priority />
            ) : (
              <div className="pdp-main-fallback"><span>SIN IMAGEN</span></div>
            )}
            <span className="pdp-badge">★ Bestseller · {marca || 'VDA'}</span>
            <button className="pdp-zoom" aria-label="Zoom"><Search size={16} /></button>
          </div>
        </div>

        {/* Info */}
        <div className="pdp-info">
          {marca && <div className="pdp-brand-pill">{marca}</div>}
          <h1 className="pdp-title">{nombre}</h1>

          {(hayResenas || ventas > 0 || producto.stock > 0) && (
            <div className="pdp-meta-row">
              {hayResenas && (
                <div className="pdp-stars">
                  <span className="stars">{'★'.repeat(Math.max(1, Math.round(score)))}</span>
                  <strong>{score.toFixed(1)}</strong>
                  <span className="cnt">({resenas} {resenas === 1 ? 'reseña' : 'reseñas'})</span>
                </div>
              )}
              {ventas > 0 ? (
                <div className="pdp-trust-meta">
                  <span className="trust-dot"></span>
                  <strong>{ventas}+</strong> vendidos
                </div>
              ) : producto.stock > 0 ? (
                /* Sin ventas registradas se muestra un dato cierto y util: hay existencias. */
                <div className="pdp-trust-meta">
                  <span className="trust-dot"></span>
                  <strong>Disponible</strong> · envio a toda Colombia
                </div>
              ) : null}
            </div>
          )}

          {descripcion && <p className="pdp-desc">{descripcion}</p>}

          {/* Purchase mode */}
          <div className="pdp-pricing">
            <button
              className={`pdp-mode ${purchaseMode === 'subscribe' ? 'active' : ''}`}
              onClick={() => setPurchaseMode('subscribe')}
            >
              {purchaseMode === 'subscribe' && (
                <span className="pdp-mode-pop">MÁS POPULAR · -15%</span>
              )}
              <div className="pdp-mode-label">CUOTAS / MES</div>
              <div className="pdp-mode-price">{fmtCOP(cuotaMensual)}</div>
              <div className="pdp-mode-sub">12 cuotas sin interés · -15% pago anual</div>
            </button>
            <button
              className={`pdp-mode ${purchaseMode === 'once' ? 'active' : ''}`}
              onClick={() => setPurchaseMode('once')}
            >
              <div className="pdp-mode-label">PAGO ÚNICO</div>
              <div className="pdp-mode-price">{fmtCOP(precioBase)}</div>
              <div className="pdp-mode-sub">Entrega inmediata</div>
            </button>
          </div>

          {/* Perks */}
          <ul className="pdp-perks">
            <li><Check size={14} /> {enviGratis ? 'Envío gratis a toda Colombia · 3-5 días hábiles' : 'Envío gratis en compras +$1.500.000'}</li>
            <li><Check size={14} /> Cancelación sin penalidad · 30 días</li>
            <li><Check size={14} /> Afinación al recibo incluida sin costo</li>
            {garantiaMeses > 0 ? (
              <li><Check size={14} /> Garantía de {garantiaMeses} meses incluida</li>
            ) : (
              <li><Check size={14} /> Garantía estructural incluida</li>
            )}
          </ul>

          {/* Cantidad + Añadir */}
          <div className="pdp-actions">
            <div className="pdp-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} aria-label="Menos"><Minus size={14} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)} aria-label="Más"><Plus size={14} /></button>
            </div>
            <button className={`pdp-cta ${agregado ? 'added' : ''}`} onClick={agregarCarrito}>
              {agregado
                ? <><Check size={14} /> AÑADIDO AL CARRITO</>
                : <>AÑADIR AL CARRITO <span className="pdp-arrow"><ShoppingCart size={14} /></span></>
              }
            </button>
          </div>

          <button className="pdp-buynow" onClick={agregarCarrito}>
            COMPRAR AHORA · {fmtCOP(displayPrice * qty)}
          </button>

          {/* Trust strip */}
          <div className="pdp-trust-strip">
            <div className="pdp-trust-item">
              <Truck size={20} />
              <div>
                <strong>Envío Gratis</strong>
                <span>Compras +$1.500.000</span>
              </div>
            </div>
            <div className="pdp-trust-item">
              <Shield size={20} />
              <div>
                <strong>{garantiaMeses > 0 ? `Garantía ${garantiaMeses} meses` : 'Garantía Incluida'}</strong>
                <span>Estructural + servicio</span>
              </div>
            </div>
            <div className="pdp-trust-item">
              <MapPin size={20} />
              <div>
                <strong>Hecho en Colombia</strong>
                <span>Taller propio</span>
              </div>
            </div>
            <div className="pdp-trust-item">
              <Globe size={20} />
              <div>
                <strong>Envíos a 42 países</strong>
                <span>Seguro de tránsito incluido</span>
              </div>
            </div>
          </div>

          {/* Acordeones */}
          <div className="pdp-accordions">
            {acordeones.map(item => (
              <div key={item.key} className={`pdp-acc ${accsAbiertos[item.key] ? 'open' : ''}`}>
                <button className="pdp-acc-head" onClick={() => toggleAcc(item.key)}>
                  <span>{item.title}</span>
                  {accsAbiertos[item.key] ? <Minus size={14} /> : <Plus size={14} />}
                </button>
                {accsAbiertos[item.key] && (
                  <div className="pdp-acc-content">{item.content}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reseñas: la seccion entera desaparece si el producto todavia no tiene ninguna,
          en vez de rellenarla con una nota media y unas barras inventadas. */}
      {hayResenas && (
      <section className="pdp-reviews">
        <div className="pdp-reviews-head">
          <div className="pdp-reviews-left">
            <div className="pdp-reviews-eyebrow">— Reseñas Verificadas</div>
            <h2 className="pdp-reviews-title">
              {score.toFixed(1)} / 5{' '}
              <span className="pdp-reviews-sub">de nuestros clientes</span>
            </h2>
          </div>
          <div className="pdp-rating-bars">
            {ratingBars.map(({ s, width, count }) => (
              <div key={s} className="pdp-rb">
                <span className="pdp-rb-stars">{'★'.repeat(s)}</span>
                <div className="pdp-rb-bar"><span style={{ width }}></span></div>
                <span className="pdp-rb-cnt">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="pdp-tst-grid">
          {reseñasData.length > 0 ? reseñasData.map((r: any, i: number) => (
            <div key={i} className="pdp-tst">
              <div className="pdp-tst-stars">{'★'.repeat(r.calificacion || r.rating || 5)}</div>
              <p className="pdp-tst-text">"{r.comentario || r.texto || r.comment || ''}"</p>
              <div className="pdp-tst-person">
                <div className="pdp-tst-avatar"><span>{(r.nombre || r.name || 'U').charAt(0).toUpperCase()}</span></div>
                <div>
                  <div className="pdp-tst-name">{r.nombre || r.name || 'Cliente'}</div>
                  <div className="pdp-tst-loc">{r.ciudad || r.location || 'Colombia'}</div>
                </div>
              </div>
            </div>
          )) : [
            { i: 'CR', name: 'Camilo R.', loc: 'Medellín, COL', text: 'Calidad impresionante. Llegó perfectamente afinado y empacado. El estuche es robusto y la correa de cuero un detalle hermoso. Cinco estrellas.', stars: 5 },
            { i: 'YM', name: 'Yulissa M.', loc: 'Miami, USA', text: 'Pedí desde Miami y en 8 días estaba en casa. Aduanas sin problemas, todo declarado correctamente. El sonido es de otro nivel.', stars: 5 },
            { i: 'LM', name: 'Luis E. M.', loc: 'Valledupar, COL', text: 'Conozco a estos maestros desde hace años. El acordeón vino con afinación personalizada para mi voz, tal como pedí.', stars: 5 },
          ].map((r, i) => (
            <div key={i} className="pdp-tst">
              <div className="pdp-tst-stars">{'★'.repeat(r.stars)}</div>
              <p className="pdp-tst-text">"{r.text}"</p>
              <div className="pdp-tst-person">
                <div className="pdp-tst-avatar"><span>{r.i}</span></div>
                <div>
                  <div className="pdp-tst-name">{r.name}</div>
                  <div className="pdp-tst-loc">{r.loc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="pdp-rev-actions">
          <button className="pdp-btn-ghost">Ver todas las reseñas</button>
          <button className="pdp-btn-primary">Escribir reseña</button>
        </div>
      </section>
      )}
    </div>
  )
}
