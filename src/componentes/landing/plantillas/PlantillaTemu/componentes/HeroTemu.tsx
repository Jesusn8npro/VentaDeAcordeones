import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Package, Heart, ChevronLeft, ChevronRight, Share2, X } from 'lucide-react'
import { useCarrito } from '../../../../../contextos/CarritoContext'
import { useFavoritos } from '../../../../../contextos/FavoritosContext'
import './HeroTemu.css'
import ContraEntregaModal from '../../../../../componentes/checkout/ContraEntregaModal'
import ModalPromociones from '../../../../../componentes/checkout/ModalPromociones'
import BotonCarritoAnimado from '../../../../../componentes/ui/BotonCarritoAnimado'
import DetalleProductoHero from './DetalleProductoHero'

interface GaleriaProps {
  distanciaTop?: number
  className?: string
  children: React.ReactNode
  atributoContenedor?: string
}

const GaleriaSticky = ({
  distanciaTop = 20,
  className = '',
  children,
  atributoContenedor = 'data-contenedor-hero-temu'
}: GaleriaProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [estilos, setEstilos] = useState<React.CSSProperties>({})
  const [modo, setModo] = useState<'estatico' | 'fijo' | 'abajo'>('estatico')

  const alturaHeader = () => {
    const valor = getComputedStyle(document.documentElement).getPropertyValue('--header-h') || '0px'
    return parseInt(valor, 10) || 0
  }

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    const columnaIzquierda = elemento.parentElement as HTMLElement
    let contenedorRaiz: HTMLElement = (columnaIzquierda?.closest(`[${atributoContenedor}]`) as HTMLElement)
      || columnaIzquierda?.parentElement
      || document.body

    const estiloContenedor = getComputedStyle(contenedorRaiz)
    if (estiloContenedor.position === 'static') contenedorRaiz.style.position = 'relative'

    const medir = () => {
      const topSticky = alturaHeader() + distanciaTop
      const rectContenedor = contenedorRaiz.getBoundingClientRect()
      const topContenedor = window.scrollY + rectContenedor.top
      const bottomContenedor = window.scrollY + rectContenedor.bottom
      const rectIzquierda = columnaIzquierda.getBoundingClientRect()
      const alturaElemento = elemento.offsetHeight
      const posicionActual = window.scrollY + topSticky

      if (posicionActual >= topContenedor && posicionActual <= bottomContenedor - alturaElemento) {
        setModo('fijo')
        setEstilos({
          position: 'fixed',
          top: `${topSticky}px`,
          left: `${rectIzquierda.left + window.scrollX}px`,
          width: `${rectIzquierda.width}px`,
          boxSizing: 'border-box',
          zIndex: 1000
        })
      } else if (posicionActual > bottomContenedor - alturaElemento) {
        setModo('abajo')
        const paddingTop = parseFloat(getComputedStyle(contenedorRaiz).paddingTop) || 0
        setEstilos({
          position: 'absolute',
          top: `${contenedorRaiz.scrollHeight - elemento.offsetHeight - paddingTop}px`,
          left: '0',
          right: '0',
          width: '100%',
          boxSizing: 'border-box'
        })
      } else {
        setModo('estatico')
        setEstilos({})
      }
    }

    medir()
    window.addEventListener('scroll', medir, { passive: true })
    window.addEventListener('resize', medir)

    const observadorRedimension = new ResizeObserver(medir)
    observadorRedimension.observe(elemento)
    observadorRedimension.observe(contenedorRaiz)
    observadorRedimension.observe(columnaIzquierda)

    return () => {
      window.removeEventListener('scroll', medir)
      window.removeEventListener('resize', medir)
      observadorRedimension.disconnect()
    }
  }, [distanciaTop, atributoContenedor])

  return (
    <div ref={ref} className={className} style={estilos} data-modo-hero-temu={modo}>
      {children}
    </div>
  )
}

interface PopupProps {
  imagenes: string[]
  imagenSeleccionada: number
  producto: any
  cantidad: number
  variante: any
  touchStart: number | null
  touchEnd: number | null
  onCerrar: () => void
  onCambioImagen: (index: number) => void
  onImagenAnterior: () => void
  onImagenSiguiente: () => void
  onTouchStart: (x: number) => void
  onTouchMove: (x: number) => void
  onTouchEnd: () => void
  onAgregarCarrito: (producto: any, cantidad: number, variante: any) => Promise<any>
}

const PopupGaleria = ({
  imagenes,
  imagenSeleccionada,
  producto,
  cantidad,
  variante,
  onCerrar,
  onCambioImagen,
  onImagenAnterior,
  onImagenSiguiente,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onAgregarCarrito
}: PopupProps) => {
  return (
    <div className="hero-temu-popup-galeria" onClick={onCerrar}>
      <div className="hero-temu-popup-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="hero-temu-popup-header">
          <span className="hero-temu-popup-contador">{imagenSeleccionada + 1}/{imagenes.length}</span>
          <div className="hero-temu-popup-botones">
            <button
              className="hero-temu-popup-compartir"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: 'Mira este producto increíble', text: 'Te va a encantar este producto que encontré', url: window.location.href })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  alert('¡Enlace copiado al portapapeles!')
                }
              }}
            >
              <Share2 size={20} />
            </button>
            <button className="hero-temu-popup-cerrar" onClick={onCerrar}>
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="hero-temu-popup-layout-desktop">
          {imagenes.length > 1 && (
            <div className="hero-temu-popup-miniaturas-desktop">
              {imagenes.map((imagen, index) => (
                <button
                  key={index}
                  className={`hero-temu-popup-miniatura-desktop ${index === imagenSeleccionada ? 'activa' : ''}`}
                  onClick={() => onCambioImagen(index)}
                >
                  <img src={imagen} alt={`Vista ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="eager" />
                </button>
              ))}
            </div>
          )}
          <div className="hero-temu-popup-imagen-container">
            <img src={imagenes[imagenSeleccionada]} alt={producto?.nombre || 'Producto'} className="hero-temu-popup-imagen" loading="eager" />
            {imagenes.length > 1 && (
              <>
                <button className="hero-temu-popup-flecha hero-temu-popup-flecha-izquierda" onClick={onImagenAnterior}>
                  <ChevronLeft size={24} />
                </button>
                <button className="hero-temu-popup-flecha hero-temu-popup-flecha-derecha" onClick={onImagenSiguiente}>
                  <ChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>

        <div
          className="hero-temu-popup-layout-mobile"
          onTouchStart={(e) => { if (imagenes.length <= 1) return; onTouchStart(e.touches[0].clientX) }}
          onTouchMove={(e) => { if (imagenes.length <= 1) return; onTouchMove(e.touches[0].clientX) }}
          onTouchEnd={onTouchEnd}
        >
          <div className="hero-temu-popup-imagen-container-mobile">
            <img src={imagenes[imagenSeleccionada]} alt={producto?.nombre || 'Producto'} className="hero-temu-popup-imagen" loading="eager" />
          </div>
          {imagenes.length > 1 && (
            <div className="hero-temu-popup-miniaturas-mobile">
              {imagenes.map((imagen, index) => (
                <button
                  key={index}
                  className={`hero-temu-popup-miniatura-mobile ${index === imagenSeleccionada ? 'activa' : ''}`}
                  onClick={() => onCambioImagen(index)}
                >
                  <img src={imagen} alt={`Vista ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="eager" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hero-temu-popup-acciones">
          <BotonCarritoAnimado
            producto={producto}
            cantidad={cantidad}
            variante={variante}
            className="hero-temu-popup-boton-carrito"
            onAgregar={async (p, c, v) => { await onAgregarCarrito(p, c, v); onCerrar() }}
            onError={() => {}}
          >
            Añadir al carrito
          </BotonCarritoAnimado>
        </div>
      </div>
    </div>
  )
}

const HeroTemu = ({ producto, config, reviews, notificaciones }) => {
  const { agregarAlCarrito, alternarModal, mostrarNotificacion } = useCarrito()
  const { esFavorito, alternarFavorito } = useFavoritos()

  const [imagenSeleccionada, setImagenSeleccionada] = useState(0)
  const [imagenHover, setImagenHover] = useState(null)
  const [cantidad, setCantidad] = useState(1)
  const [varianteSeleccionada] = useState(null)
  const [tiempoRestante, setTiempoRestante] = useState('04:15:08:52')
  const [popupGaleriaAbierto, setPopupGaleriaAbierto] = useState(false)
  const [mostrarFlechas, setMostrarFlechas] = useState(false)
  const [modalContraEntregaAbierto, setModalContraEntregaAbierto] = useState(false)
  const [modalPromocionesAbierto, setModalPromocionesAbierto] = useState(false)
  const [esMobile, setEsMobile] = useState(false)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const sliderRef = useRef(null)

  useEffect(() => {
    const chatWidget = document.querySelector('.chat-widget-container') as HTMLElement | null
    if (chatWidget) chatWidget.style.display = popupGaleriaAbierto ? 'none' : 'block'
    return () => {
      const w = document.querySelector('.chat-widget-container') as HTMLElement | null
      if (w) w.style.display = 'block'
    }
  }, [popupGaleriaAbierto])

  useEffect(() => {
    document.documentElement.style.setProperty('--header-h', '0px')
  }, [])

  useEffect(() => {
    const checkMobile = () => setEsMobile(window.innerWidth <= 800)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const ahora = new Date()
      const horas = String(4 - (ahora.getHours() % 5)).padStart(2, '0')
      const minutos = String(59 - ahora.getMinutes()).padStart(2, '0')
      const segundos = String(59 - ahora.getSeconds()).padStart(2, '0')
      setTiempoRestante(`${horas}:${minutos}:${segundos}`)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const imagenesFinales = useMemo(() => {
    const imagenes: string[] = []
    if (producto?.imagenes) {
      const campos = ['imagen_principal', 'imagen_secundaria_1', 'imagen_secundaria_2', 'imagen_secundaria_3', 'imagen_secundaria_4']
      campos.forEach(campo => {
        const img = producto.imagenes[campo]
        if (img && img.trim()) imagenes.push(img.trim())
      })
    }
    if (producto?.fotos_principales && Array.isArray(producto.fotos_principales)) {
      producto.fotos_principales.forEach(foto => { if (foto && foto.trim()) imagenes.push(foto.trim()) })
    }
    return imagenes.length > 0 ? imagenes : [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop'
    ]
  }, [producto?.imagenes, producto?.fotos_principales])

  useEffect(() => {
    imagenesFinales.forEach(url => { const img = new Image(); img.loading = 'eager'; img.src = url })
  }, [imagenesFinales])

  const descuento = useMemo(() => {
    return producto?.precio_original && producto?.precio
      ? Math.round(((producto.precio_original - producto.precio) / producto.precio_original) * 100)
      : 0
  }, [producto?.precio_original, producto?.precio])

  const obtenerImagenActual = useCallback(() => {
    if (imagenHover !== null && !popupGaleriaAbierto) return imagenHover
    return imagenSeleccionada
  }, [imagenHover, popupGaleriaAbierto, imagenSeleccionada])

  const manejarCambioImagen = useCallback((index) => {
    setImagenSeleccionada(index)
    setImagenHover(null)
    if (esMobile && sliderRef.current) {
      const slider = sliderRef.current as HTMLElement
      const miniatura = slider.children[index] as HTMLElement
      if (miniatura) slider.scrollLeft = miniatura.offsetLeft - (slider.clientWidth / 2) + (miniatura.clientWidth / 2)
    }
  }, [esMobile])

  const manejarHoverMiniatura = useCallback((index) => {
    if (!esMobile && !popupGaleriaAbierto) setImagenHover(index)
  }, [esMobile, popupGaleriaAbierto])

  const manejarSalirHover = useCallback(() => {
    if (imagenHover !== null) { setImagenSeleccionada(imagenHover); setImagenHover(null) }
  }, [imagenHover])

  const manejarImagenAnterior = useCallback(() => {
    const actual = obtenerImagenActual()
    const nuevo = actual === 0 ? imagenesFinales.length - 1 : actual - 1
    popupGaleriaAbierto ? setImagenSeleccionada(nuevo) : setImagenHover(nuevo)
  }, [obtenerImagenActual, imagenesFinales.length, popupGaleriaAbierto])

  const manejarImagenSiguiente = useCallback(() => {
    const actual = obtenerImagenActual()
    const nuevo = actual === imagenesFinales.length - 1 ? 0 : actual + 1
    popupGaleriaAbierto ? setImagenSeleccionada(nuevo) : setImagenHover(nuevo)
  }, [obtenerImagenActual, imagenesFinales.length, popupGaleriaAbierto])

  const abrirPopupGaleria = useCallback(() => {
    if (imagenHover !== null) { setImagenSeleccionada(imagenHover); setImagenHover(null) }
    setPopupGaleriaAbierto(true)
    document.body.style.overflow = 'hidden'
  }, [imagenHover])

  const cerrarPopupGaleria = useCallback(() => {
    setPopupGaleriaAbierto(false)
    setImagenHover(null)
    document.body.style.overflow = 'unset'
  }, [])

  const manejarAgregarCarrito = async (producto, cantidad, variante) => {
    if (!producto) return
    try {
      const resultado = await agregarAlCarrito(producto, cantidad, variante)
      if (resultado.success) { alternarModal(); return resultado }
      mostrarNotificacion('error', 'Error al agregar', resultado.message || 'Error al agregar al carrito')
      throw new Error(resultado.message || 'Error al agregar al carrito')
    } catch (error) {
      mostrarNotificacion('error', 'Error al agregar', 'Error al agregar al carrito. Por favor, inténtalo de nuevo.')
      throw error
    }
  }

  const manejarTouchEnd = () => {
    if (imagenesFinales.length <= 1 || !touchStart || !touchEnd) return
    const d = touchStart - touchEnd
    if (d > 50) manejarImagenSiguiente()
    if (d < -50) manejarImagenAnterior()
    setTouchStart(null)
    setTouchEnd(null)
  }

  if (!producto) {
    return (
      <div className="hero-temu-producto-no-encontrado">
        <Package size={64} color="#6c757d" />
        <h2>Producto no encontrado</h2>
        <p>El producto que buscas no está disponible</p>
      </div>
    )
  }

  const imagenActual = obtenerImagenActual()

  return (
    <div className="hero-temu-contenedor hero-section">
      <div className="hero-temu-contenido-principal" data-contenedor-hero-temu>

        <div className="hero-temu-columna-izquierda">
          <GaleriaSticky distanciaTop={20} className="hero-temu-galeria-sticky">
            <div className="hero-temu-contenedor-galeria">
              {imagenesFinales.length > 1 && (
                <div ref={sliderRef} className="hero-temu-miniaturas-verticales" role="tablist" aria-label="Galería de imágenes del producto" onMouseLeave={manejarSalirHover}>
                  {imagenesFinales.map((imagen, index) => (
                    <button
                      key={index}
                      className={`hero-temu-miniatura-vertical ${index === imagenActual ? 'activa' : ''}`}
                      onMouseEnter={() => { if (!esMobile) { popupGaleriaAbierto ? manejarCambioImagen(index) : manejarHoverMiniatura(index) } }}
                      onClick={() => manejarCambioImagen(index)}
                      role="tab"
                      aria-selected={index === imagenActual}
                      aria-label={`Ver imagen ${index + 1} de ${imagenesFinales.length}`}
                      tabIndex={index === imagenActual ? 0 : -1}
                    >
                      <img src={imagen} alt={`Vista ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="eager" />
                    </button>
                  ))}
                  {esMobile && imagenesFinales.length > 3 && (
                    <div className="hero-temu-slider-indicador">{imagenActual + 1} / {imagenesFinales.length}</div>
                  )}
                </div>
              )}

              <div
                className="hero-temu-imagen-principal"
                onMouseEnter={() => setMostrarFlechas(true)}
                onMouseLeave={() => setMostrarFlechas(false)}
                onClick={abrirPopupGaleria}
                onTouchStart={(e) => { if (imagenesFinales.length <= 1) return; setTouchStart(e.touches[0].clientX) }}
                onTouchMove={(e) => { if (imagenesFinales.length <= 1) return; setTouchEnd(e.touches[0].clientX) }}
                onTouchEnd={(e) => {
                  if (imagenesFinales.length <= 1 || !touchStart || !touchEnd) return
                  const d = touchStart - touchEnd
                  if (d > 50) { e.stopPropagation(); manejarImagenSiguiente() }
                  if (d < -50) { e.stopPropagation(); manejarImagenAnterior() }
                  setTouchStart(null); setTouchEnd(null)
                }}
              >
                <img src={imagenesFinales[imagenActual]} alt={producto?.nombre || 'Producto'} className="hero-temu-imagen-principal-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="eager" />

                {producto?.estado === 'vendido' && (
                  <div className="hero-temu-etiqueta-vendido"><span>VENDIDO</span></div>
                )}
                {imagenesFinales.length > 1 && (
                  <div className="hero-temu-indicadores-puntos">
                    {imagenesFinales.map((_, index) => (
                      <button key={index} className={`hero-temu-punto-indicador ${index === imagenActual ? 'activo' : ''}`} onClick={() => manejarCambioImagen(index)} aria-label={`Ir a imagen ${index + 1}`} />
                    ))}
                  </div>
                )}
                {descuento > 0 && <div className="hero-temu-badge-descuento">-{descuento}%</div>}
                {producto?.estado !== 'vendido' && (
                  <button className={`hero-temu-boton-favoritos ${esFavorito(producto?.id) ? 'activo' : ''}`} onClick={(e) => { e.stopPropagation(); if (producto) alternarFavorito(producto) }}>
                    <Heart size={20} fill={esFavorito(producto?.id) ? '#ff4757' : 'none'} />
                  </button>
                )}
                {mostrarFlechas && imagenesFinales.length > 1 && (
                  <>
                    <button className="hero-temu-flecha-navegacion hero-temu-flecha-izquierda" onClick={(e) => { e.stopPropagation(); manejarImagenAnterior() }}><ChevronLeft size={24} /></button>
                    <button className="hero-temu-flecha-navegacion hero-temu-flecha-derecha" onClick={(e) => { e.stopPropagation(); manejarImagenSiguiente() }}><ChevronRight size={24} /></button>
                  </>
                )}
              </div>
            </div>
          </GaleriaSticky>
        </div>

        <DetalleProductoHero
          producto={producto}
          cantidad={cantidad}
          varianteSeleccionada={varianteSeleccionada}
          tiempoRestante={tiempoRestante}
          onAgregarCarrito={manejarAgregarCarrito}
          onAbrirContraEntrega={() => setModalContraEntregaAbierto(true)}
          onComprarAhora={() => setModalPromocionesAbierto(true)}
        />
      </div>

      {popupGaleriaAbierto && (
        <PopupGaleria
          imagenes={imagenesFinales}
          imagenSeleccionada={imagenSeleccionada}
          producto={producto}
          cantidad={cantidad}
          variante={varianteSeleccionada}
          touchStart={touchStart}
          touchEnd={touchEnd}
          onCerrar={cerrarPopupGaleria}
          onCambioImagen={manejarCambioImagen}
          onImagenAnterior={manejarImagenAnterior}
          onImagenSiguiente={manejarImagenSiguiente}
          onTouchStart={setTouchStart}
          onTouchMove={setTouchEnd}
          onTouchEnd={manejarTouchEnd}
          onAgregarCarrito={manejarAgregarCarrito}
        />
      )}

      <ContraEntregaModal
        abierto={modalContraEntregaAbierto}
        onCerrar={() => setModalContraEntregaAbierto(false)}
        producto={producto}
        onConfirmar={() => {}}
      />
      <ModalPromociones
        isOpen={modalPromocionesAbierto}
        onClose={() => setModalPromocionesAbierto(false)}
        producto={producto}
        onSeleccionarOferta={() => {}}
      />
    </div>
  )
}

export default HeroTemu
