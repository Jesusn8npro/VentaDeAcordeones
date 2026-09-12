'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, ShoppingCart, Eye, Star, Check, Plus } from 'lucide-react'
import { useFavoritos } from '../../contextos/FavoritosContext'
import { useCarrito } from '../../contextos/CarritoContext'
import { optimizarUrlSupabase } from '../ImagenOptimizada'
import './TarjetaProductoCinema.css'

// Ancho real de la foto en cada rejilla (2 col en móvil y tablet, 3 desde 1000 px, 4 desde 1300 px).
// Fuera del componente para no recrear la cadena en cada render de las tarjetas.
const SIZES_TARJETA = '(max-width: 640px) 46vw, (max-width: 1000px) 48vw, (max-width: 1300px) 32vw, 330px'

// Apaga el placeholder del contenedor sin pasar por el estado de React: una rejilla de 24 tarjetas
// no puede permitirse 24 renders extra sólo para quitar un shimmer.
const marcarCargada = (e: React.SyntheticEvent<HTMLImageElement>) => {
  e.currentTarget?.closest('.cinema-card__img')?.setAttribute('data-cargada', '1')
}

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
          <Heart size={14} fill={favorito ? 'var(--vda-oro)' : 'none'} color={favorito ? 'var(--vda-oro)' : 'currentColor'} />
        </button>

        {srcPrincipal ? (
          <Image
            src={srcPrincipal}
            alt={nombre}
            className="img-principal"
            width={400}
            height={400}
            // Aquí la foto va a sangre (object-fit: cover, sin padding), así que el ancho real
            // coincide con el de la tarjeta: 2 columnas en móvil/tablet, 3 desde 1000, 4 desde 1300.
            sizes={SIZES_TARJETA}
            // 65 en vez de 75: a ~170 px de ancho no se distingue y el archivo pesa ~25 % menos.
            quality={65}
            loading="lazy"
            decoding="async"
            onLoad={marcarCargada}
            onError={(e) => { marcarCargada(e); (e.currentTarget as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="img-principal img-placeholder" aria-hidden="true" />
        )}
        {/* Segunda foto SÓLO para el cambio al pasar el ratón. En móvil el CSS la oculta con
            display:none y, al ser lazy, el navegador ni siquiera la pide: una petición por tarjeta
            en vez de dos. Se deja en el HTML para no romper la hidratación. */}
        {srcSecundaria ? (
          <Image
            src={srcSecundaria}
            alt=""
            aria-hidden="true"
            className="img-secundaria"
            width={400}
            height={400}
            sizes={SIZES_TARJETA}
            quality={65}
            loading="lazy"
            decoding="async"
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
          {/* Era un <Link> dentro del <Link> de la imagen: <a> anidado = error de hidratación.
              El contenedor ya navega a la ficha, así que basta un span con el mismo estilo. */}
          <span className="cinema-card__quick-btn">
            <Eye size={11} />
            Ver
          </span>
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
                  fill={i < Math.round(scorePromedio) ? 'var(--vda-oro)' : 'none'}
                  color="var(--vda-oro)"
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
