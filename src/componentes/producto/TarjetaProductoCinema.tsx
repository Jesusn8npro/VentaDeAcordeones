'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye, Star, Check, Plus } from 'lucide-react'
import { useFavoritos } from '../../contextos/FavoritosContext'
import { useCarrito } from '../../contextos/CarritoContext'
import { optimizarUrlSupabase } from '../ImagenOptimizada'
import './TarjetaProductoCinema.css'



function TarjetaProductoCinema({ producto }: { producto: any }) {
  if (!producto) return null

  const { esFavorito, alternarFavorito } = useFavoritos()
  const { agregarAlCarrito } = useCarrito()
  const [agregado, setAgregado] = React.useState(false)

  const nombre: string = producto?.nombre || 'Producto'
  const slug: string = producto?.slug || ''
  const precio: number | null = producto?.precio ?? null
  const precioOriginal: number | null = producto?.precio_original ?? null
  const marca: string = producto?.marca || producto?.brand || producto?.categorias?.nombre || ''
  const estado: string = (producto?.estado || '').toLowerCase()
  const descuento: number | null = producto?.descuento ?? (
    precioOriginal && precio ? Math.max(0, Math.round((1 - precio / precioOriginal) * 100)) : null
  )

  const scorePromedio: number | null = (() => {
    const v = [producto?.score_promedio, producto?.calificacion_promedio, producto?.calificacion, producto?.rating]
      .find((x) => x !== undefined && x !== null) ?? null
    const n = Number(v)
    return Number.isNaN(n) ? null : n
  })()

  const totalResenas: number | null = (() => {
    const v = [producto?.total_resenas, producto?.reseñas_total, producto?.resenas_total, producto?.reviews_count]
      .find((x) => x !== undefined && x !== null) ?? null
    const n = Number(v)
    return Number.isNaN(n) ? null : n
  })()

  // Imágenes
  let imgPrincipal: string | null = null
  let imgSecundaria: string | null = null
  if (Array.isArray(producto?.producto_imagenes) && producto.producto_imagenes.length > 0) {
    const imgs = producto.producto_imagenes[0]
    imgPrincipal = imgs?.imagen_principal || null
    imgSecundaria = imgs?.imagen_secundaria_1 || null
  }
  if (!imgPrincipal && Array.isArray(producto?.fotos_principales) && producto.fotos_principales.length > 0) {
    imgPrincipal = producto.fotos_principales[0]
    imgSecundaria = producto.fotos_principales[1] || null
  }

  const srcPrincipal = optimizarUrlSupabase(imgPrincipal || '') || null
  const srcSecundaria = optimizarUrlSupabase(imgSecundaria || imgPrincipal || '') || srcPrincipal

  const favorito = esFavorito(producto?.id)

  const tagLabel = descuento ? `-${descuento}%` : (producto?.estado && estado !== 'vendido' ? producto.estado.toUpperCase() : null)
  const tagClase = descuento ? 'cinema-card__tag--sale' : (estado === 'nuevo' || estado === 'new' ? 'cinema-card__tag--new' : '')

  const fmtCOP = (n: number) =>
    `$${new Intl.NumberFormat('es-CO').format(n)}`

  const manejarFavorito = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try { await alternarFavorito(producto) } catch {}
  }

  const manejarAgregar = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await agregarAlCarrito(producto)
      setAgregado(true)
      setTimeout(() => setAgregado(false), 1400)
    } catch {}
  }

  const href = slug ? `/producto/${slug}` : '#'

  return (
    <article className="cinema-card">
      {/* Área de imagen */}
      <Link href={href} className="cinema-card__img" aria-label={`Ver ${nombre}`}>
        {estado === 'vendido' && (
          <div className="cinema-card__vendido">VENDIDO</div>
        )}

        {tagLabel && (
          <span className={`cinema-card__tag ${tagClase}`}>{tagLabel}</span>
        )}

        <button
          className={`cinema-card__fav ${favorito ? 'cinema-card__fav--activo' : ''}`}
          onClick={manejarFavorito}
          aria-label={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
          type="button"
        >
          <Heart size={14} fill={favorito ? '#FFC300' : 'none'} color={favorito ? '#FFC300' : 'currentColor'} />
        </button>

        {srcPrincipal ? (
          <Image
            src={srcPrincipal}
            alt={nombre}
            className="img-principal"
            width={400}
            height={400}
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="img-principal img-placeholder" aria-hidden="true" />
        )}
        {srcSecundaria ? (
          <Image
            src={srcSecundaria}
            alt={`${nombre} alternativa`}
            className="img-secundaria"
            width={400}
            height={400}
            loading="lazy"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="img-secundaria img-placeholder" aria-hidden="true" />
        )}

        {/* Acciones rápidas en hover */}
        <div className="cinema-card__quick">
          <button className="cinema-card__quick-btn" onClick={manejarAgregar} type="button">
            <ShoppingCart size={11} />
            Añadir
          </button>
          <Link
            href={href}
            className="cinema-card__quick-btn"
            onClick={(e) => e.stopPropagation()}
          >
            <Eye size={11} />
            Ver
          </Link>
        </div>
      </Link>

      {/* Info */}
      <div className="cinema-card__info">
        {marca && <div className="cinema-card__brand">{marca}</div>}
        <div className="cinema-card__name">{nombre}</div>

        <div className="cinema-card__meta">
          <div className="cinema-card__price">
            {precio != null && (
              <span className="cinema-card__price-now">{fmtCOP(precio)}</span>
            )}
            {precioOriginal && (
              <span className="cinema-card__price-was">{fmtCOP(precioOriginal)}</span>
            )}
          </div>

          <button
            className={`cinema-card__add ${agregado ? 'cinema-card__add--added' : ''}`}
            onClick={manejarAgregar}
            type="button"
            aria-label="Agregar al carrito"
          >
            {agregado ? (
              <><Check size={11} /> Añadido</>
            ) : (
              <><Plus size={11} /> Añadir</>
            )}
          </button>
        </div>

        {typeof scorePromedio === 'number' && scorePromedio > 0 && (
          <div className="cinema-card__rating">
            <div className="cinema-card__stars">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  size={10}
                  fill={i < Math.round(scorePromedio) ? '#FFC300' : 'none'}
                  color="#FFC300"
                />
              ))}
            </div>
            <span>{scorePromedio.toFixed(1)}</span>
            {typeof totalResenas === 'number' && totalResenas > 0 && (
              <span>· {totalResenas} reseñas</span>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default React.memo(TarjetaProductoCinema)
