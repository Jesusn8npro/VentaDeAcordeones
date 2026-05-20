import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { Package, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { useCarrito } from '../../../../../contextos/CarritoContext'
import { useFavoritos } from '../../../../../contextos/FavoritosContext'
import './HeroTemu.css'
import ModalContraEntrega from '../../../../../componentes/checkout/ModalContraEntrega'
import ModalPromociones from '../../../../../componentes/checkout/ModalPromociones'
import GaleriaSticky from './GaleriaSticky'
import PopupGaleria from './PopupGaleria'
import DetalleProductoHero from './DetalleProductoHero'

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

      <ModalContraEntrega
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
