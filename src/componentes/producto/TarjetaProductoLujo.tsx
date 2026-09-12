'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, Eye, ShoppingCart, Star, BadgePercent, Flame, CircleDollarSign, Zap, TrendingUp, Info } from 'lucide-react'
import { useFavoritos } from '../../contextos/FavoritosContext'
import { useCarrito } from '../../contextos/CarritoContext'
import EtiquetaVendido from './EtiquetaVendido'
import { optimizarUrlSupabase } from '../ImagenOptimizada'
import './TarjetaProductoLujo.es.css'

// Ancho real de la foto dentro de la tarjeta en cada rejilla (2 col móvil, 2 tablet, 3 desde
// 1000 px, 4 desde 1300 px), descontando el padding 7 % de `.imagen`. Va fuera del componente
// para no recrear la cadena en cada render de las 24 tarjetas de la tienda.
const SIZES_TARJETA = '(max-width: 640px) 40vw, (max-width: 1000px) 41vw, (max-width: 1300px) 26vw, 240px'

// Apaga el placeholder animado del contenedor en cuanto la foto está en pantalla. Se marca con un
// atributo en el DOM en vez de con estado: así una rejilla de 24 tarjetas no dispara 24 renders.
const marcarCargada = (e) => {
  e.currentTarget?.closest('.zona-imagen-lujo')?.setAttribute('data-cargada', '1')
}

function TarjetaProductoLujo({ producto, modoAccion = 'auto' }) {
  if (!producto) return null

  const router = useRouter()
  const { esFavorito, alternarFavorito } = useFavoritos()
  const { agregarAlCarrito } = useCarrito()
  const [infoIndex, setInfoIndex] = React.useState(0)

  const nombre = producto?.nombre || 'Producto'
  const slug = producto?.slug || ''
  const precio = producto?.precio ?? null
  const precioOriginal = producto?.precio_original ?? null
  const descuentoCalculado = producto?.descuento ?? (
    precioOriginal && precio ? Math.max(0, Math.round((1 - (precio / precioOriginal)) * 100)) : null
  )
  const estado = producto?.estado || null
  const destacado = !!producto?.destacado
  const stock = producto?.stock ?? null
  const stockMinimo = producto?.stock_minimo ?? 0
  const pocasUnidades = typeof stock === 'number' && stockMinimo > 0 && stock <= stockMinimo
  const mostrarMegaOferta = typeof descuentoCalculado === 'number' && descuentoCalculado >= 50
  const ahorroValor = (typeof precio === 'number' && typeof precioOriginal === 'number' && precioOriginal > precio)
    ? (precioOriginal - precio)
    : null

  const favorito = esFavorito(producto?.id)

  // Imágenes: prioriza relación producto_imagenes, luego fotos_principales
  let imagenPrincipal = null
  let imagenSecundaria = null
  if (Array.isArray(producto?.producto_imagenes) && producto.producto_imagenes.length > 0) {
    const img = producto.producto_imagenes[0]
    imagenPrincipal = img?.imagen_principal || null
    imagenSecundaria = img?.imagen_secundaria_1 || null
  }
  if (!imagenPrincipal && Array.isArray(producto?.fotos_principales) && producto.fotos_principales.length > 0) {
    imagenPrincipal = producto.fotos_principales[0]
    imagenSecundaria = producto.fotos_principales[1] || imagenSecundaria
  }

  const srcPrincipal = optimizarUrlSupabase(imagenPrincipal || '') || null
  const srcSecundaria = optimizarUrlSupabase(imagenSecundaria || imagenPrincipal || '') || srcPrincipal

  // Se eliminó la cuenta regresiva de la tarjeta. El objetivo se sorteaba con Math.random() entre
  // 1 y 12 horas en CADA carga, así que la misma rebaja "vencía" a una hora distinta en cada
  // visita: urgencia inventada sobre una promoción que no tiene fecha de fin. De paso desaparece
  // un setInterval de 1 s por tarjeta (una rejilla de 12+ productos repintaba 12+ veces/segundo).

  // Sin canal Realtime aquí: cada tarjeta abría un websocket `stock-producto-{id}`, así que un
  // listado de 12+ productos consumía 12+ conexiones del plan Supabase y JS en cada render.
  // El stock de un listado no necesita ser en vivo; llega por props y la ficha de producto
  // (donde sí importa el stock exacto antes de comprar) es la que mantiene el tiempo real.

  // Rotación de mensajes en contenedor dinámico (desincronizada por tarjeta)
  React.useEffect(() => {
    // Índice inicial aleatorio para que no todos comiencen igual
    setInfoIndex(Math.floor(Math.random() * 3))
    // Intervalo aleatorio por tarjeta (3.5s a 6s)
    const intervaloMs = 3500 + Math.floor(Math.random() * 2500)
    const intervalo = setInterval(() => {
      setInfoIndex((i) => (i + 1) % 3)
    }, intervaloMs)
    return () => clearInterval(intervalo)
  }, [])

  const estadoSanitizado = (estado ?? '').toString().trim().toLowerCase()
  const estadoValido = estadoSanitizado && !['nuevo','new','novedad','nuevo!'].includes(estadoSanitizado) ? estado : null
  const mensajeContextual = descuentoCalculado
    ? `Ahorro disponible: ${descuentoCalculado}%`
    : (destacado ? 'Vendedor estrella' : (estadoValido || 'Entrega rápida'))

  // Imagen rota → se pasa al placeholder por ESTADO. Antes se reasignaba e.currentTarget.src, pero
  // next/image vuelve a poner la URL original en cada render → onError → bucle infinito de peticiones
  // a /_next/image (la página de categoría nunca terminaba de cargar).
  const [errPrincipal, setErrPrincipal] = React.useState(false)
  const [errSecundaria, setErrSecundaria] = React.useState(false)

  const leerCampo = (candidatos) => {
    const v = candidatos.find((c) => c !== undefined && c !== null) ?? null
    if (v === null) return null
    if (typeof v === 'number') return v
    const num = Number(String(v).replace(/[^\d.-]/g, ''))
    return Number.isNaN(num) ? null : num
  }
  const scorePromedio = leerCampo([producto?.score_promedio, producto?.calificacion_promedio, producto?.calificacion, producto?.rating, producto?.puntuacion, producto?.valoracion])
  const totalResenas = leerCampo([producto?.total_resenas, producto?.reseñas_total, producto?.resenas_total, producto?.reviews_count, producto?.cantidad_resenas, producto?.total_reviews])
  const totalVentasRaw = leerCampo([producto?.numero_de_ventas, producto?.ventas_totales, producto?.total_ventas, producto?.ventas, producto?.vendidos])
  const formatearAbreviado = (n) => {
    const num = Number(n)
    if (Number.isNaN(num) || num < 0) return null
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`
    if (num >= 10_000) return `${Math.round(num / 1_000)}k`
    if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k`
    return new Intl.NumberFormat('es-CO').format(num)
  }
  const totalVentas = totalVentasRaw === null ? null : formatearAbreviado(totalVentasRaw)

  const manejarFavorito = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await alternarFavorito(producto)
    } catch {}
  }

  const manejarVistaRapida = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (slug) {
      router.push(`/producto/${slug}`)
    }
  }

  const manejarAgregarCarrito = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await agregarAlCarrito(producto)
    } catch {}
  }

  // Determinar texto del botón (Agregar / Ver)
  const preferenciaAccion = React.useMemo(() => {
    // Prioridad: prop modoAccion -> campo del producto -> automático por stock
    if (modoAccion === 'agregar' || modoAccion === 'ver') return modoAccion
    const preferida = producto?.accion_preferida
    if (preferida === 'agregar' || preferida === 'ver') return preferida
    const enStock = (stock ?? 0) > 0
    return enStock ? 'agregar' : 'ver'
  }, [modoAccion, producto?.accion_preferida, stock])

  return (
    <article className="tarjeta-lujo" aria-label={`Tarjeta de ${nombre}`}>
      {/* Badges superiores */}
      <div className="insignias-lujo">
        {descuentoCalculado ? (
          <span className="insignia insignia-descuento"><BadgePercent size={14} /> {descuentoCalculado}% OFF</span>
        ) : null}
        {destacado ? <span className="insignia insignia-destacado"><Flame size={14} /> Destacado</span> : null}
        {/* Badge de estado eliminado a solicitud (antes mostraba 'NUEVO', etc.) */}
      </div>

      {/* Imagen con cambio al hover */}
      <Link href={slug ? `/producto/${slug}` : '#'} className="zona-imagen-lujo" aria-label={`Ver ${nombre}`}>
        {/* Etiqueta VENDIDO */}
        {estado === 'vendido' && (
          <EtiquetaVendido 
            tamaño="normal"
            posicion="superior-derecha"
            mostrarIcono={true}
            variante="premium"
          />
        )}
        
        {srcPrincipal && !errPrincipal ? (
          <Image
            src={srcPrincipal}
            alt={nombre}
            className="imagen imagen-principal"
            loading="lazy"
            decoding="async"
            width={320}
            height={320}
            // El ancho REAL que ocupa la foto, no el de la tarjeta: `.imagen` lleva padding 7 %, así
            // que en móvil (rejilla de 2) son ~145 px de 375 → 40vw, no 45vw. Pedir de más obligaba
            // al navegador a bajar el escalón de 384 px en cada miniatura.
            sizes={SIZES_TARJETA}
            // 65 en vez de 75: a este tamaño no se nota y cada archivo pesa ~25 % menos.
            quality={65}
            onLoad={marcarCargada}
            onError={(e) => { marcarCargada(e); setErrPrincipal(true) }}
          />
        ) : (
          <div className="imagen imagen-principal imagen-placeholder" aria-hidden="true" />
        )}
        {/* Segunda foto SÓLO para el cambio al pasar el ratón. En móvil el CSS la oculta con
            display:none y, al ser lazy, el navegador ni siquiera la pide: la rejilla pasa de 2
            peticiones por tarjeta a 1. Se deja en el HTML (no en un condicional de cliente) para
            no romper la hidratación ni provocar un segundo render de toda la rejilla. */}
        {srcSecundaria && !errSecundaria ? (
          <Image
            src={srcSecundaria}
            alt=""
            aria-hidden="true"
            className="imagen imagen-secundaria"
            loading="lazy"
            decoding="async"
            width={320}
            height={320}
            sizes={SIZES_TARJETA}
            quality={65}
            onError={() => setErrSecundaria(true)}
          />
        ) : (
          <div className="imagen imagen-secundaria imagen-placeholder" aria-hidden="true" />
        )}

        {/* Acciones flotantes */}
        <div className="acciones-flotantes">
          <button 
            className={`accion-flotante ${favorito ? 'activo' : ''}`} 
            title={favorito ? 'Quitar de favoritos' : 'Agregar a favoritos'} 
            type="button" 
            aria-label="Alternar favorito"
            onClick={manejarFavorito}
          >
            <Heart size={16} fill={favorito ? '#ff4757' : 'none'} color={favorito ? '#ff4757' : 'currentColor'} />
          </button>
          <button 
            className="accion-flotante" 
            title="Vista rápida" 
            type="button" 
            aria-label="Vista rápida"
            onClick={manejarVistaRapida}
          >
            <Eye size={16} />
          </button>
          <button 
            className="accion-flotante" 
            title="Agregar al carrito" 
            type="button" 
            aria-label="Agregar al carrito"
            onClick={manejarAgregarCarrito}
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </Link>

      {/* Contenido */}
      <div className="contenido-lujo">
        <div className="fila-titulo">
          {mostrarMegaOferta && (
            <span className="cinta-mega-oferta" aria-label="Mega oferta activa">
              <span className="linea-mega">MEGA</span>
              <span className="linea-mega">OFERTA</span>
            </span>
          )}
          <h3 className="nombre-producto" title={nombre}>{nombre}</h3>
        </div>

        {/* Contenedor de puntaje y ventas eliminado a solicitud */}

        {/* Precio */}
        <div className="precio">
          <div className="precio-info">
            {precio != null && (
              <span className={`precio-actual ${descuentoCalculado ? 'naranja' : 'negro'}`}>
                ${new Intl.NumberFormat('es-CO').format(precio)}
              </span>
            )}
            {precioOriginal && (
              <span className="precio-original">${new Intl.NumberFormat('es-CO').format(precioOriginal)}</span>
            )}
            {totalVentasRaw !== null && (
              <span className="ventas-pie">{totalVentas} ventas</span>
            )}
          </div>
          {/* Botón de acción estilo Temu */}
          {preferenciaAccion === 'agregar' ? (
            <button
              type="button"
              className="btn-precio-accion agregar"
              onClick={manejarAgregarCarrito}
              aria-label="Agregar al carrito"
            >
              Agregar
            </button>
          ) : (
            <Link
              href={slug ? `/producto/${slug}` : '#'}
              className="btn-precio-accion ver"
              aria-label="Ver producto"
            >
              Ver
            </Link>
          )}
        </div>

        {ahorroValor !== null && (
          <div className="info-secundaria">
            <div className="insignia-ahorro" role="note" aria-label="Ahorro sobre el precio de lista">
              <div className="lado-izquierdo">
                {/* currentColor: el icono sigue al texto de la insignia, que cambia con el tema */}
                <CircleDollarSign size={12} color="currentColor" />
                <span>${new Intl.NumberFormat('es-CO').format(ahorroValor)} Ahorro extra</span>
              </div>
            </div>
          </div>
        )}

        {/* Contenedor fijo de stock eliminado a solicitud */}

        {/* Contenedor dinámico: cambia contenido con fade, fondo blanco y sin imágenes */}
        <div className="info-dinamica" aria-live="polite">
          {infoIndex === 0 && (
            <div className="item-informacion aparecer" key={`info-${infoIndex}`}>
              <Zap size={12} className="icono-informacion" />
              <span>Unidades disponibles: {stock ?? '—'}</span>
            </div>
          )}
          {/* Antes decía "Más comprados en categoría: X" en todas las tarjetas por igual, sin
              ningún dato de ventas detrás. Se cambia por un hecho comprobable del negocio. */}
          {infoIndex === 1 && (
            <div className="item-informacion aparecer" key={`info-${infoIndex}`}>
              <TrendingUp size={12} className="icono-informacion" />
              <span><span className="mas-comprados">Envío a toda Colombia</span> · taller propio en Bogotá</span>
            </div>
          )}
          {infoIndex === 2 && (
            <div className="item-informacion aparecer" key={`info-${infoIndex}`}>
              <Info size={12} className="icono-informacion" />
              <span>{mensajeContextual}</span>
            </div>
          )}
        </div>

        {/* Calificación: estrellas + nota (debajo del bloque dinámico) */}
        {typeof scorePromedio === 'number' && scorePromedio > 0 && (
          <div className="calificacion" aria-label={`Calificación ${scorePromedio.toFixed(1)} de 5`}>
            {[0,1,2,3,4].map((i) => {
              const lleno = i < Math.round(scorePromedio)
              return (
                // currentColor: el naranja sale del token `--vda-naranja` vía `.estrella`, que en
                // tema claro es más oscuro. Quemado a #ff7a00 quedaba casi invisible sobre blanco.
                <Star key={`rt-${i}`} size={16} className="estrella" fill={lleno ? 'currentColor' : 'none'} color="currentColor" />
              )
            })}
            {/* En móvil ocultamos promedio y reseñas y mostramos ventas */}
            <span className="conteo-calificacion">{scorePromedio.toFixed(1)}</span>
            {typeof totalResenas === 'number' && totalResenas > 0 && (
              <span className="resenas-calificacion">· {totalResenas} reseñas</span>
            )}
            {totalVentasRaw !== null && (
              <span className="ventas-en-linea">· {totalVentas} ventas</span>
            )}
          </div>
        )}

        {/* Escasez controlada */}
        {pocasUnidades && (
          <div className="escasez">¡Quedan sólo {stock} unidades!</div>
        )}
      </div>
    </article>
  )
}

export default React.memo(TarjetaProductoLujo)