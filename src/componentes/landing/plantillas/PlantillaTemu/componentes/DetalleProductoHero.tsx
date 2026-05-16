import React, { useState } from 'react'
import { Package, Truck, Zap } from 'lucide-react'
import BotonCarritoAnimado from '../../../../../componentes/ui/BotonCarritoAnimado'

const formatearPrecioCOP = (precio) => {
  if (!precio && precio !== 0) return '$0'
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio)
}

interface Props {
  producto: any
  cantidad: number
  varianteSeleccionada: any
  tiempoRestante: string
  onAgregarCarrito: (producto: any, cantidad: number, variante: any) => Promise<any>
  onAbrirContraEntrega: () => void
  onComprarAhora: () => void
}

const DetalleProductoHero = ({
  producto,
  cantidad,
  varianteSeleccionada,
  tiempoRestante,
  onAgregarCarrito,
  onAbrirContraEntrega,
  onComprarAhora
}: Props) => {
  const [descripcionExpandida, setDescripcionExpandida] = useState(false)

  const productoVendido = producto?.activo === false || producto?.estado === 'vendido'

  const truncarTexto = (texto, porcentaje = 50) => {
    if (!texto) return ''
    const palabras = texto.split(' ')
    const limite = Math.floor(palabras.length * (porcentaje / 100))
    if (palabras.length <= limite) return texto
    return palabras.slice(0, limite).join(' ') + '...'
  }

  const textoDescripcion = (() => {
    if (!producto?.descripcion) return ''
    if (typeof producto.descripcion === 'object') return producto.descripcion.contenido || ''
    return typeof producto.descripcion === 'string' ? producto.descripcion : ''
  })()

  const tituloDescripcion = typeof producto?.descripcion === 'object'
    ? (producto.descripcion.titulo || 'Descripción del Producto')
    : 'Descripción del Producto'

  return (
    <div className="hero-temu-columna-derecha">
      <div className="hero-temu-banner-mega-oferta">
        <div className="hero-temu-etiqueta-mega">MEGA<br/>OFERTA</div>
        <div className="hero-temu-beneficios-container">
          <span className="hero-temu-beneficio-texto"><span className="hero-temu-check-verde">✓</span> Envío gratis</span>
          <span className="hero-temu-beneficio-texto"><span className="hero-temu-check-verde">✓</span> $4.000 de crédito por retraso</span>
        </div>
      </div>

      <h1 className="hero-temu-titulo-producto mobile-order-2">
        {producto?.nombre || 'Producto'}
      </h1>

      <div className="hero-temu-caracteristicas-clave">
        <div className="hero-temu-caracteristicas-lista">
          {producto?.ganchos && producto.ganchos.length > 0 ? (
            producto.ganchos.slice(0, 4).map((gancho, index) => (
              <div key={index} className="hero-temu-caracteristica-item">
                <span className="hero-temu-icono-caracteristica">
                  {index === 0 ? '⚡' : index === 1 ? '🛡️' : index === 2 ? '🔒' : '🚚'}
                </span>
                <span>{gancho.replace(/^[🔥💎⭐🚨✅🎯💰🇨🇴]\s*/, '')}</span>
              </div>
            ))
          ) : (
            <>
              <div className="hero-temu-caracteristica-item"><span className="hero-temu-icono-caracteristica">⚡</span><span>Calidad premium garantizada</span></div>
              <div className="hero-temu-caracteristica-item"><span className="hero-temu-icono-caracteristica">🛡️</span><span>Garantía total incluida</span></div>
              <div className="hero-temu-caracteristica-item"><span className="hero-temu-icono-caracteristica">🔒</span><span>Compra 100% segura</span></div>
              <div className="hero-temu-caracteristica-item"><span className="hero-temu-icono-caracteristica">🚚</span><span>Envío gratis a toda Colombia</span></div>
            </>
          )}
        </div>
      </div>

      <div className="hero-temu-opiniones-verificado mobile-order-1" aria-label="Opiniones y verificación">
        <span className="hero-temu-opiniones-count">
          ({producto?.testimonios?.estadisticas?.totalResenas?.toLocaleString?.() || '1.559'} opiniones)
        </span>
        <div className="hero-temu-opiniones-stars" aria-hidden="true">
          <span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span><span>⭐</span>
        </div>
        <span className="hero-temu-opiniones-verified">
          <span className="hero-temu-verified-icon" aria-hidden="true">✓</span>
          <span className="hero-temu-verified-text">Verificado</span>
        </span>
      </div>

      <div className="hero-temu-seccion-precios-vendedora mobile-order-3">
        {producto?.activo === false && (
          <div className="hero-temu-etiqueta-vendido">
            <div className="hero-temu-vendido-contenido">
              <span className="hero-temu-vendido-icono">🔥</span>
              <span className="hero-temu-vendido-texto">VENDIDO</span>
              <span className="hero-temu-vendido-subtext">¡Se agotó por alta demanda!</span>
            </div>
            <div className="hero-temu-vendido-overlay"></div>
          </div>
        )}
        <div className={`hero-temu-precio-principal-container ${producto?.activo === false ? 'vendido' : ''}`}>
          <span className="hero-temu-precio-actual-grande">{formatearPrecioCOP(producto?.precio || 8498)}</span>
          <span className="hero-temu-precio-original-tachado">{formatearPrecioCOP(producto?.precio_original || 22480)}</span>
          {producto?.precio_original && producto?.precio && producto.precio_original > producto.precio && (
            <span className="hero-temu-ahorro-label">Ahorras: {formatearPrecioCOP(producto.precio_original - producto.precio)}</span>
          )}
          <span className="hero-temu-badge-descuento-grande">-62% DE DESCUENTO tiempo limitado</span>
        </div>
      </div>

      <div className="hero-temu-imagen-pagos-movil mobile-order-4">
        <img src="/images/Imagen para los pagos.jpg" alt="Métodos de pago disponibles" />
      </div>

      {producto?.estado !== 'vendido' && (
        <div className="hero-temu-oferta-relampago mobile-order-6">
          <div className="hero-temu-oferta-header">
            <span className="hero-temu-oferta-titulo">⚡ Oferta relámpago</span>
            <div className="hero-temu-contador-tiempo">
              <span className="hero-temu-icono-reloj">⏰</span>
              <span>Termina en</span>
              <span className="hero-temu-tiempo-numero">{tiempoRestante}</span>
            </div>
          </div>
        </div>
      )}

      <div className="hero-temu-botones-accion mobile-order-5">
        {productoVendido ? (
          <div className="hero-temu-botones-vendido">
            <button
              onClick={() => { window.location.href = `/tienda/categoria/${producto?.categorias?.slug || 'productos'}` }}
              className="hero-temu-boton-producto-vendido"
            >
              <Package size={18} />
              Este producto ya fue vendido - Ver más productos
            </button>
            <button className="hero-temu-boton-notificar">
              <span>🔔</span>
              Notificarme cuando esté disponible
            </button>
          </div>
        ) : (
          <>
            <BotonCarritoAnimado
              producto={producto}
              cantidad={cantidad}
              variante={varianteSeleccionada}
              className="hero-temu-boton-carrito"
              onAgregar={onAgregarCarrito}
              onError={() => {}}
            >
              Agregar al carrito
            </BotonCarritoAnimado>
            <button onClick={onAbrirContraEntrega} className="hero-temu-boton-contra-entrega">
              <Truck size={18} />Contra entrega
            </button>
            <button onClick={onComprarAhora} className="hero-temu-boton-pagar-plataforma">
              <Zap size={18} />Pagar plataforma
            </button>
          </>
        )}
      </div>

      <div className="hero-temu-metodos-pago">
        <img src="/images/Imagen para los pagos.jpg" alt="Métodos de pago disponibles" className="hero-temu-imagen-pagos" />
      </div>

      {textoDescripcion && (
        <div className="hero-temu-seccion-descripcion mobile-order-7">
          <h3 className="hero-temu-titulo-descripcion">📝 {tituloDescripcion}</h3>
          <div className="hero-temu-texto-descripcion">
            {descripcionExpandida ? textoDescripcion : truncarTexto(textoDescripcion, 50)}
          </div>
          {textoDescripcion.split(' ').length > 10 && (
            <button className="hero-temu-boton-expandir" onClick={() => setDescripcionExpandida(!descripcionExpandida)}>
              <span className={`hero-temu-icono-expandir ${descripcionExpandida ? 'expandido' : ''}`}>🔽</span>
              {descripcionExpandida ? 'Ver menos' : 'Ver descripción completa'}
            </button>
          )}
        </div>
      )}

      <div className="hero-temu-especificaciones-tecnicas mobile-order-8">
        <h3 className="hero-temu-titulo-especificaciones">🔧 Especificaciones Técnicas</h3>
        <div className="hero-temu-grid-especificaciones">
          {producto?.marca && <div><strong>Marca:</strong> {producto.marca}</div>}
          {producto?.modelo && <div><strong>Modelo:</strong> {producto.modelo}</div>}
          {producto?.material && <div><strong>Material:</strong> {producto.material}</div>}
          {producto?.peso && <div><strong>Peso:</strong> {producto.peso} kg</div>}
          {producto?.color && <div><strong>Color:</strong> {producto.color}</div>}
          {producto?.talla && <div><strong>Talla:</strong> {producto.talla}</div>}
          {producto?.garantia_meses && <div><strong>Garantía:</strong> {producto.garantia_meses} meses</div>}
          {producto?.origen_pais && <div><strong>Origen:</strong> {producto.origen_pais}</div>}
        </div>
      </div>

      {producto?.caracteristicas && (
        <div className="hero-temu-seccion-porque-elegir mobile-order-9">
          <h3 className="hero-temu-titulo-porque-elegir">
            ⭐ {producto.caracteristicas.titulo || 'Por qué elegir este producto'}
          </h3>
          {producto.caracteristicas.subtitulo && (
            <p className="hero-temu-subtitulo-porque-elegir">{producto.caracteristicas.subtitulo}</p>
          )}
          <div className="hero-temu-beneficios-grid">
            {producto.caracteristicas.detalles && producto.caracteristicas.detalles.slice(0, 4).map((detalle, index) => (
              <div key={`detalle-${index}`} className="hero-temu-beneficio-item">
                <span className="hero-temu-icono-beneficio">{detalle.icono || '⭐'}</span>
                <div className="hero-temu-contenido-beneficio">
                  <h4>{detalle.titulo || detalle}</h4>
                  {detalle.descripcion && <p>{detalle.descripcion}</p>}
                </div>
              </div>
            ))}
            {(!producto.caracteristicas.detalles || producto.caracteristicas.detalles.length === 0) &&
              Array.isArray(producto.caracteristicas) && producto.caracteristicas.slice(0, 4).map((caracteristica, index) => {
                const iconos = ['🚀', '⚡', '💎', '🛡️']
                return (
                  <div key={`caracteristica-${index}`} className="hero-temu-beneficio-item">
                    <span className="hero-temu-icono-beneficio">{iconos[index] || '⭐'}</span>
                    <div className="hero-temu-contenido-beneficio">
                      <h4>{caracteristica}</h4>
                      <p>Característica destacada del producto</p>
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}

export default DetalleProductoHero
