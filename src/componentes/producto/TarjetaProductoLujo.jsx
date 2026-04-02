import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, ShoppingCart, Star, BadgePercent, Flame, Clock, CircleDollarSign, AlertCircle, Zap, TrendingUp, Info } from 'lucide-react'
import { clienteSupabase } from '../../configuracion/supabase'
import { useFavoritos } from '../../contextos/FavoritosContext'
import { useCarrito } from '../../contextos/CarritoContext'
import EtiquetaVendido from './EtiquetaVendido'
import './TarjetaProductoLujo.es.css'

/**
 * TarjetaProductoLujo
 * \- Tarjeta premium enfocada en conversión y estética limpia.
 * \- Efecto hover: cambio de imagen principal a secundaria con transición sutil.
 * \- Gatillos mentales: descuento, más vendido, urgencia de stock.
 * \- Preparada para métricas futuras: score promedio y ventas totales.
 */
export default function TarjetaProductoLujo({ producto, modoAccion = 'auto' }) {
  if (!producto) return null

  const navigate = useNavigate()
  const { esFavorito, alternarFavorito } = useFavoritos()
  const { agregarAlCarrito } = useCarrito()
  const [tiempoRestante, setTiempoRestante] = React.useState(null)
  const [stockActual, setStockActual] = React.useState(producto?.stock ?? null)
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

  // Placeholders simples si falta imagen
  const placeholder = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop'
  const srcPrincipal = imagenPrincipal || placeholder
  const srcSecundaria = imagenSecundaria || srcPrincipal

  // Cuenta regresiva: objetivo aleatorio entre 1 y 12 horas
  React.useEffect(() => {
    const horas = Math.floor(Math.random() * 12) + 1
    const minutos = Math.floor(Math.random() * 60)
    const segundos = Math.floor(Math.random() * 60)
    const objetivo = Date.now() + ((horas * 3600 + minutos * 60 + segundos) * 1000)
    const intervalo = setInterval(() => {
      const diff = objetivo - Date.now()
      if (diff <= 0) {
        setTiempoRestante({ h: 0, m: 0, s: 0 })
        clearInterval(intervalo)
        return
      }
      const h = Math.floor(diff / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      const s = Math.floor((diff % 60000) / 1000)
      setTiempoRestante({ h, m, s })
    }, 1000)
    return () => clearInterval(intervalo)
  }, [])

  const dos = (n) => String(n).padStart(2, '0')

  // Suscripción en tiempo real al stock del producto (Supabase)
  React.useEffect(() => {
    if (!producto?.id) return
    const canal = clienteSupabase.channel(`stock-producto-${producto.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'productos', filter: `id=eq.${producto.id}` }, (payload) => {
        if (typeof payload?.new?.stock === 'number') {
          setStockActual(payload.new.stock)
        }
      })
      .subscribe()
    return () => clienteSupabase.removeChannel(canal)
  }, [producto?.id])

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

  // Nombre real de la categoría (prioriza relación cargada desde Supabase)
  const nombreCategoria = producto?.categorias?.nombre 
    || producto?.categoria_nombre 
    || producto?.categoria 
    || producto?.categoria_principal 
    || producto?.categoria?.nombre 
    || 'la categoría'

  // Mensaje contextual sin mostrar textos básicos como 'nuevo'
  const estadoSanitizado = (estado ?? '').toString().trim().toLowerCase()
  const estadoValido = estadoSanitizado && !['nuevo','new','novedad','nuevo!'].includes(estadoSanitizado) ? estado : null
  const mensajeContextual = descuentoCalculado
    ? `Ahorro disponible: ${descuentoCalculado}%`
    : (destacado ? 'Vendedor estrella' : (estadoValido || 'Entrega rápida'))

  // Fallback rápido en caso de error de carga
  const manejarErrorImagen = (e) => {
    e.currentTarget.src = placeholder
  }

  // Futuros campos: score y ventas (robusto con distintos nombres/tipos)
  const leerScorePromedio = () => {
    const candidatos = [
      producto?.score_promedio,
      producto?.calificacion_promedio,
      producto?.calificacion,
      producto?.rating,
      producto?.puntuacion,
      producto?.valoracion
    ]
    const valor = candidatos.find((v) => v !== undefined && v !== null)
    if (valor === undefined || valor === null) return null
    if (typeof valor === 'number') return valor
    if (typeof valor === 'string') {
      const limpio = valor.replace(/[^\d.]/g, '')
      const num = Number(limpio)
      return Number.isNaN(num) ? null : num
    }
    return null
  }
  const scorePromedio = leerScorePromedio()
  const leerTotalResenas = () => {
    const candidatos = [
      producto?.total_resenas,
      producto?.reseñas_total,
      producto?.resenas_total,
      producto?.reviews_count,
      producto?.cantidad_resenas,
      producto?.total_reviews
    ]
    const valor = candidatos.find((v) => v !== undefined && v !== null)
    if (valor === undefined || valor === null) return null
    if (typeof valor === 'number') return valor
    if (typeof valor === 'string') {
      const limpio = valor.replace(/[^\d.-]/g, '')
      const num = Number(limpio)
      return Number.isNaN(num) ? null : num
    }
    return null
  }
  const totalResenas = leerTotalResenas()
  const leerNumeroVentas = () => {
    const candidatos = [
      producto?.numero_de_ventas,
      producto?.ventas_totales,
      producto?.total_ventas,
      producto?.ventas,
      producto?.vendidos
    ]
    const valor = candidatos.find((v) => v !== undefined && v !== null)
    if (valor === undefined || valor === null) return null
    if (typeof valor === 'number') return valor
    if (typeof valor === 'string') {
      const limpio = valor.replace(/[^\d.-]/g, '')
      const num = Number(limpio)
      return Number.isNaN(num) ? null : num
    }
    return null
  }
  const totalVentasRaw = leerNumeroVentas()
  const formatearAbreviado = (n) => {
    const num = Number(n)
    if (Number.isNaN(num) || num < 0) return null
    if (num >= 1_000_000) {
      return `${(num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1)}M`
    }
    if (num >= 10_000) {
      return `${Math.round(num / 1_000)}k`
    }
    if (num >= 1_000) {
      return `${(num / 1_000).toFixed(1)}k`
    }
    return new Intl.NumberFormat('es-CO').format(num)
  }
  const totalVentas = totalVentasRaw === null ? null : formatearAbreviado(totalVentasRaw)

  const manejarFavorito = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await alternarFavorito(producto)
    } catch (err) {
      console.error('Error al alternar favorito:', err)
    }
  }

  const manejarVistaRapida = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (slug) {
      navigate(`/producto/${slug}`)
    }
  }

  const manejarAgregarCarrito = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await agregarAlCarrito(producto)
    } catch (err) {
      console.error('Error al agregar al carrito desde tarjeta lujo:', err)
    }
  }

  // Determinar texto del botón (Agregar / Ver)
  const preferenciaAccion = React.useMemo(() => {
    // Prioridad: prop modoAccion -> campo del producto -> automático por stock
    if (modoAccion === 'agregar' || modoAccion === 'ver') return modoAccion
    const preferida = producto?.accion_preferida
    if (preferida === 'agregar' || preferida === 'ver') return preferida
    const enStock = (stockActual ?? stock ?? 0) > 0
    return enStock ? 'agregar' : 'ver'
  }, [modoAccion, producto?.accion_preferida, stockActual, stock])

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
      <Link to={slug ? `/producto/${slug}` : '#'} className="zona-imagen-lujo" aria-label={`Ver ${nombre}`}>
        {/* Etiqueta VENDIDO */}
        {estado === 'vendido' && (
          <EtiquetaVendido 
            tamaño="normal"
            posicion="superior-derecha"
            mostrarIcono={true}
            variante="premium"
          />
        )}
        
        <img 
          src={srcPrincipal} 
          alt={nombre} 
          className="imagen imagen-principal" 
          loading="lazy" 
          decoding="async"
          fetchpriority="low"
          width={320}
          height={320}
          referrerPolicy="no-referrer" 
          crossOrigin="anonymous"
          onError={manejarErrorImagen}
        />
        <img 
          src={srcSecundaria} 
          alt={`${nombre} alternativa`} 
          className="imagen imagen-secundaria" 
          loading="lazy" 
          decoding="async"
          fetchpriority="low"
          width={320}
          height={320}
          referrerPolicy="no-referrer" 
          crossOrigin="anonymous"
          onError={manejarErrorImagen}
        />

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
              to={slug ? `/producto/${slug}` : '#'}
              className="btn-precio-accion ver"
              aria-label="Ver producto"
            >
              Ver
            </Link>
          )}
        </div>

        {ahorroValor !== null && (
          <div className="info-secundaria">
            <div className="insignia-ahorro" role="note" aria-label="Ahorro y tiempo restante">
              <div className="lado-izquierdo">
                <CircleDollarSign size={12} color="#fff" />
                <span>${new Intl.NumberFormat('es-CO').format(ahorroValor)} Ahorro extra</span>
              </div>
              {tiempoRestante && (
                <div className="lado-derecho">
                  <Clock size={11} color="#ff7a00" />
                  <span className="tiempo">{`${dos(tiempoRestante.h)}:${dos(tiempoRestante.m)}:${dos(tiempoRestante.s)}`}</span>
                  <AlertCircle size={11} color="#ff7a00" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contenedor fijo de stock eliminado a solicitud */}

        {/* Contenedor dinámico: cambia contenido con fade, fondo blanco y sin imágenes */}
        <div className="info-dinamica" aria-live="polite">
          {infoIndex === 0 && (
            <div className="item-informacion aparecer" key={`info-${infoIndex}`}>
              <Zap size={12} className="icono-informacion" />
              <span>Unidades disponibles: {stockActual ?? stock ?? '—'}</span>
            </div>
          )}
          {infoIndex === 1 && (
            <div className="item-informacion aparecer" key={`info-${infoIndex}`}>
              <TrendingUp size={12} className="icono-informacion" />
              <span><span className="mas-comprados">Más comprados</span> en categoría: {nombreCategoria}</span>
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
                <Star key={`rt-${i}`} size={16} className="estrella" fill={lleno ? '#ff7a00' : 'none'} color="#ff7a00" />
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