import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2,
  Package,
  Truck,
  Shield,
  CheckCircle,
  Clock,
  Users,
  Award,
  Zap,
  Plus,
  Minus,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { useCarrito } from '../../../../../contextos/CarritoContext'
import { useFavoritos } from '../../../../../contextos/FavoritosContext'
import BotonCarritoAnimado from '../../../../../componentes/ui/BotonCarritoAnimado'
// Eliminado ImagenConFallback - usaremos <img> directo
import './HeroTemu.css'
import ContraEntregaModal from '../../../../../componentes/checkout/ContraEntregaModal'
import ModalPromociones from '../../../../../componentes/checkout/ModalPromociones'

// Función local para formatear precios en pesos colombianos
const formatearPrecioCOP = (precio) => {
  if (!precio && precio !== 0) return '$0'
  
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(precio)
}

/* ============== COMPONENTE STICKY GALERÍA LIMPIO ============== */
function GaleriaSticky({
  distanciaTop = 20,
  className = "",
  children,
  atributoContenedor = "data-contenedor-hero-temu"
}) {
  const ref = useRef(null)
  const [estilos, setEstilos] = useState({})
  const [modo, setModo] = useState("estatico") // estatico | fijo | abajo

  const alturaHeader = () => {
    const valor = getComputedStyle(document.documentElement).getPropertyValue("--header-h") || "0px"
    return parseInt(valor, 10) || 0
  }

  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return

    // Columna izquierda (padre directo)
    const columnaIzquierda = elemento.parentElement

    // Contenedor raíz = el ancestro más cercano con [data-contenedor-hero-temu]
    let contenedorRaiz = columnaIzquierda?.closest(`[${atributoContenedor}]`)
    if (!contenedorRaiz) contenedorRaiz = columnaIzquierda?.parentElement || document.body

    // Asegurar contexto para el modo "abajo"
    const estiloContenedor = getComputedStyle(contenedorRaiz)
    if (estiloContenedor.position === "static") contenedorRaiz.style.position = "relative"

    const medir = () => {
      const topSticky = alturaHeader() + distanciaTop

      // Geometría del contenedor raíz
      const rectContenedor = contenedorRaiz.getBoundingClientRect()
      const topContenedor = window.scrollY + rectContenedor.top
      const bottomContenedor = window.scrollY + rectContenedor.bottom

      // Geometría de la columna izquierda
      const rectIzquierda = columnaIzquierda.getBoundingClientRect()

      // Altura real del elemento sticky
      const alturaElemento = elemento.offsetHeight

      // Posición actual que debería ocupar
      const posicionActual = window.scrollY + topSticky

      if (posicionActual >= topContenedor && posicionActual <= bottomContenedor - alturaElemento) {
        // Fijo mientras no pase el fondo del contenedor
        setModo("fijo")
        setEstilos({
          position: "fixed",
          top: `${topSticky}px`,
          left: `${rectIzquierda.left + window.scrollX}px`,
          width: `${rectIzquierda.width}px`,
          boxSizing: "border-box",
          zIndex: 1000
        })
      } else if (posicionActual > bottomContenedor - alturaElemento) {
        // Pegado al fondo del contenedor
        setModo("abajo")
        const paddingTop = parseFloat(getComputedStyle(contenedorRaiz).paddingTop) || 0
        setEstilos({
          position: "absolute",
          top: `${contenedorRaiz.scrollHeight - elemento.offsetHeight - paddingTop}px`,
          left: "0",
          right: "0",
          width: "100%",
          boxSizing: "border-box"
        })
      } else {
        // Aún no alcanzó el umbral
        setModo("estatico")
        setEstilos({})
      }
    }

    // Medir en arranque y cambios
    medir()
    const alHacerScroll = () => medir()
    const alRedimensionar = () => medir()

    window.addEventListener("scroll", alHacerScroll, { passive: true })
    window.addEventListener("resize", alRedimensionar)

    const observadorRedimension = new ResizeObserver(medir)
    observadorRedimension.observe(elemento)
    observadorRedimension.observe(contenedorRaiz)
    observadorRedimension.observe(columnaIzquierda)

    return () => {
      window.removeEventListener("scroll", alHacerScroll)
      window.removeEventListener("resize", alRedimensionar)
      observadorRedimension.disconnect()
    }
  }, [distanciaTop, atributoContenedor])

  return (
    <div ref={ref} className={className} style={estilos} data-modo-hero-temu={modo}>
      {children}
    </div>
  )
}

/* ============== INDICADOR MODO STICKY ============== */
function IndicadorModoSticky() {
  // Componente deshabilitado - no mostrar indicador en producción
  return null
}

/* ============== COMPONENTE PRINCIPAL HERO TEMU ============== */
const HeroTemu = ({ producto, config, reviews, notificaciones }) => {
  // Hooks del carrito y favoritos
  const { agregarAlCarrito, alternarModal, mostrarNotificacion } = useCarrito()
  const { esFavorito, alternarFavorito } = useFavoritos()
  
  // Estados del componente
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0)
  const [imagenHover, setImagenHover] = useState(null) // Nueva: para manejar hover temporal
  const [cantidad, setCantidad] = useState(1)
  const [varianteSeleccionada, setVarianteSeleccionada] = useState(null)
  const [tiempoRestante, setTiempoRestante] = useState('04:15:08:52')
  const [descripcionExpandida, setDescripcionExpandida] = useState(false)
  const [popupGaleriaAbierto, setPopupGaleriaAbierto] = useState(false)
  const [mostrarFlechas, setMostrarFlechas] = useState(false)
  const [modalContraEntregaAbierto, setModalContraEntregaAbierto] = useState(false)
  const [modalPromocionesAbierto, setModalPromocionesAbierto] = useState(false)
  
  // Estados para el slider de miniaturas
  const [esMobile, setEsMobile] = useState(false)
  const sliderRef = useRef(null)
  
  // Estados para gestos táctiles en el popup
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)

  // Efecto para ocultar/mostrar el chat widget cuando el modal esté abierto
  useEffect(() => {
    const chatWidget = document.querySelector('.chat-widget-container')
    if (chatWidget) {
      if (popupGaleriaAbierto) {
        chatWidget.style.display = 'none'
      } else {
        chatWidget.style.display = 'block'
      }
    }
    
    // Cleanup: asegurar que el chat sea visible cuando el componente se desmonte
    return () => {
      const chatWidget = document.querySelector('.chat-widget-container')
      if (chatWidget) {
        chatWidget.style.display = 'block'
      }
    }
  }, [popupGaleriaAbierto])

  // Configurar altura del header
  useEffect(() => {
    document.documentElement.style.setProperty("--header-h", "0px")
  }, [])

  // Detectar si es móvil
  useEffect(() => {
    const checkMobile = () => {
      setEsMobile(window.innerWidth <= 800)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Contador de tiempo dinámico
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

  // Procesar imágenes del producto con useMemo para evitar re-renders
  const imagenesFinales = useMemo(() => {
    const imagenes = []
    
    console.log('🖼️ Procesando imágenes del producto:', producto?.nombre)
    console.log('📦 Producto completo:', producto)
    
    // Agregar imágenes desde el objeto producto.imagenes (directamente)
    if (producto?.imagenes) {
      console.log('✅ Producto tiene campo imagenes:', producto.imagenes)
      const camposImagenes = [
        'imagen_principal',
        'imagen_secundaria_1', 
        'imagen_secundaria_2',
        'imagen_secundaria_3',
        'imagen_secundaria_4'
      ]

      camposImagenes.forEach(campo => {
        const imagen = producto.imagenes[campo]
        if (imagen && imagen.trim() !== '') {
          console.log(`📸 Agregando imagen ${campo}:`, imagen)
          imagenes.push(imagen.trim())
        }
      })
    }
    
    // También verificar si hay fotos_principales (nuevo formato)
    if (producto?.fotos_principales && Array.isArray(producto.fotos_principales)) {
      console.log('✅ Producto tiene fotos_principales:', producto.fotos_principales)
      producto.fotos_principales.forEach(foto => {
        if (foto && foto.trim() !== '') {
          imagenes.push(foto.trim())
        }
      })
    }
    
    console.log('🎯 Imágenes finales procesadas:', imagenes)
    
    // Si no hay imágenes válidas, usar placeholders
    if (imagenes.length === 0) {
      console.log('⚠️ No se encontraron imágenes, usando placeholders')
      return [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=1200&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200&auto=format&fit=crop"
      ]
    }
    
    return imagenes
  }, [producto?.imagenes, producto?.fotos_principales, producto?.nombre])

  // PRELOAD DE IMÁGENES PARA ELIMINAR LATENCIA
  useEffect(() => {
    if (imagenesFinales.length > 0) {
      console.log('🚀 Iniciando preload de imágenes para eliminar latencia...')
      
      imagenesFinales.forEach((url, index) => {
        const img = new Image()
        img.onload = () => {
          console.log(`✅ Imagen ${index + 1} precargada:`, url.substring(0, 50) + '...')
        }
        img.onerror = () => {
          console.warn(`❌ Error al precargar imagen ${index + 1}:`, url.substring(0, 50) + '...')
        }
        // Precargar con alta prioridad
        img.loading = 'eager'
        img.src = url
      })
    }
  }, [imagenesFinales])

  // Calcular descuento con useMemo
  const descuento = useMemo(() => {
    return producto?.precio_original && producto?.precio 
      ? Math.round(((producto.precio_original - producto.precio) / producto.precio_original) * 100)
      : 0
  }, [producto?.precio_original, producto?.precio])

  // Generar variantes basadas en datos reales con useMemo
  const variantes = useMemo(() => {
    const vars = []
    if (producto?.color) {
      vars.push({ 
        id: 'color', 
        nombre: producto.color, 
        tipo: 'Color'
      })
    }
    if (producto?.material) {
      vars.push({ 
        id: 'material', 
        nombre: producto.material, 
        tipo: 'Material'
      })
    }
    if (producto?.talla) {
      vars.push({ 
        id: 'talla', 
        nombre: producto.talla, 
        tipo: 'Talla'
      })
    }
    return vars
  }, [producto?.color, producto?.material, producto?.talla])

  // Manejadores de eventos - ULTRA OPTIMIZADO CON useCallback
  const manejarCambioImagen = useCallback((index) => {
    // Cambio inmediato sin validaciones innecesarias
    setImagenSeleccionada(index)
    setImagenHover(null) // Limpiar hover al hacer click
    
    // En móvil, scroll instantáneo sin animaciones
    if (esMobile && sliderRef.current) {
      const slider = sliderRef.current
      const miniatura = slider.children[index]
      
      if (miniatura) {
        // Cálculo directo y scroll inmediato
        const scrollLeft = miniatura.offsetLeft - (slider.clientWidth / 2) + (miniatura.clientWidth / 2)
        slider.scrollLeft = scrollLeft // Asignación directa para máxima velocidad
      }
    }
  }, [esMobile])

  // Función para hover temporal - ULTRA OPTIMIZADA
  const manejarHoverMiniatura = useCallback((index) => {
    // Cambio inmediato sin validaciones complejas
    if (!esMobile && !popupGaleriaAbierto) {
      setImagenHover(index)
    }
  }, [esMobile, popupGaleriaAbierto])

  // Función para salir del hover - ULTRA OPTIMIZADA
  const manejarSalirHover = useCallback(() => {
    // Cambio inmediato al salir del hover
    if (imagenHover !== null) {
      setImagenSeleccionada(imagenHover)
      setImagenHover(null)
    }
  }, [imagenHover])

  // Función para obtener la imagen actual - ULTRA OPTIMIZADA
  const obtenerImagenActual = useCallback(() => {
    if (imagenHover !== null && !popupGaleriaAbierto) {
      return imagenHover
    }
    return imagenSeleccionada
  }, [imagenHover, popupGaleriaAbierto, imagenSeleccionada])
  // Navegación con flechas - ULTRA OPTIMIZADA
  const manejarImagenAnterior = useCallback(() => {
    const imagenActual = obtenerImagenActual()
    const nuevoIndice = imagenActual === 0 ? imagenesFinales.length - 1 : imagenActual - 1
    
    // Cambio inmediato según el contexto
    if (popupGaleriaAbierto) {
      setImagenSeleccionada(nuevoIndice)
    } else {
      setImagenHover(nuevoIndice)
    }
  }, [obtenerImagenActual, imagenesFinales.length, popupGaleriaAbierto])

  const manejarImagenSiguiente = useCallback(() => {
    const imagenActual = obtenerImagenActual()
    const nuevoIndice = imagenActual === imagenesFinales.length - 1 ? 0 : imagenActual + 1
    
    // Cambio inmediato según el contexto
    if (popupGaleriaAbierto) {
      setImagenSeleccionada(nuevoIndice)
    } else {
      setImagenHover(nuevoIndice)
    }
  }, [obtenerImagenActual, imagenesFinales.length, popupGaleriaAbierto])

  // Funciones de galería - ULTRA OPTIMIZADAS
  const abrirPopupGaleria = useCallback(() => {
    // Si hay imagen en hover, usarla como seleccionada
    if (imagenHover !== null) {
      setImagenSeleccionada(imagenHover)
      setImagenHover(null)
    }
    setPopupGaleriaAbierto(true)
    // Prevenir scroll inmediatamente
    document.body.style.overflow = 'hidden'
  }, [imagenHover])

  const cerrarPopupGaleria = useCallback(() => {
    setPopupGaleriaAbierto(false)
    setImagenHover(null)
    // Restaurar scroll inmediatamente
    document.body.style.overflow = 'unset'
  }, [])

  const manejarCambioCantidad = (operacion) => {
    if (operacion === 'incrementar') {
      setCantidad(prev => Math.min(prev + 1, producto?.stock || 99))
    } else {
      setCantidad(prev => Math.max(prev - 1, 1))
    }
  }

  const manejarAgregarCarrito = async (producto, cantidad, variante) => {
    if (!producto) return
    
    try {
      // Usar el producto completo tal como viene de la base de datos
      const resultado = await agregarAlCarrito(producto, cantidad, variante)
      
      if (resultado.success) {
        // Abrir el modal del carrito para mostrar confirmación
        alternarModal()
        return resultado
      } else {
        // Mostrar error al usuario
        mostrarNotificacion('error', 'Error al agregar', resultado.message || 'Error al agregar al carrito')
        throw new Error(resultado.message || 'Error al agregar al carrito')
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error al agregar', 'Error al agregar al carrito. Por favor, inténtalo de nuevo.')
      throw error
    }
  }

  const manejarComprarAhora = () => {
    // Abrir el modal de promociones
    setModalPromocionesAbierto(true)
  }

  // Función para truncar texto al 50%
  const truncarTexto = (texto, porcentaje = 50) => {
    if (!texto) return ''
    const palabras = texto.split(' ')
    const limitePalabras = Math.floor(palabras.length * (porcentaje / 100))
    if (palabras.length <= limitePalabras) return texto
    return palabras.slice(0, limitePalabras).join(' ') + '...'
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

  return (
    <div className="hero-temu-contenedor hero-section">
      {/* DEBUG eliminado */}

      {/* Indicador del modo sticky */}
      <IndicadorModoSticky />

      {/* CONTENEDOR PRINCIPAL CON STICKY */}
      <div className="hero-temu-contenido-principal" data-contenedor-hero-temu>
        
        {/* COLUMNA IZQUIERDA - GALERÍA STICKY */}
        <div className="hero-temu-columna-izquierda">
          <GaleriaSticky distanciaTop={20} className="hero-temu-galeria-sticky">
            
            {/* Contenedor de galería con miniaturas a la izquierda */}
            <div className="hero-temu-contenedor-galeria">
              
              {/* Miniaturas verticales a la izquierda */}
              {imagenesFinales.length > 1 && (
                <div 
                  ref={sliderRef}
                  className="hero-temu-miniaturas-verticales"
                  role="tablist"
                  aria-label="Galería de imágenes del producto"
                  onMouseLeave={manejarSalirHover}
                >
                  {imagenesFinales.map((imagen, index) => (
                      <button
                        key={index}
                        className={`hero-temu-miniatura-vertical ${index === obtenerImagenActual() ? 'activa' : ''}`}
                        onMouseEnter={() => {
                          if (!esMobile) {
                            if (popupGaleriaAbierto) {
                              manejarCambioImagen(index)
                            } else {
                              manejarHoverMiniatura(index)
                            }
                          }
                        }}
                        onClick={() => manejarCambioImagen(index)}
                        role="tab"
                        aria-selected={index === obtenerImagenActual()}
                        aria-label={`Ver imagen ${index + 1} de ${imagenesFinales.length}`}
                        tabIndex={index === obtenerImagenActual() ? 0 : -1}
                      >
                        <img
                          src={imagen}
                          alt={`Vista ${index + 1}`}
                          className=""
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          loading="eager"
                        />
                      </button>
                  ))}
                  
                  {/* Indicador de scroll solo en móvil */}
                  {esMobile && imagenesFinales.length > 3 && (
                    <div className="hero-temu-slider-indicador">
                      {obtenerImagenActual() + 1} / {imagenesFinales.length}
                    </div>
                  )}
                </div>
              )}

              {/* Imagen Principal */}
              <div 
                className="hero-temu-imagen-principal"
                onMouseEnter={() => setMostrarFlechas(true)}
                onMouseLeave={() => setMostrarFlechas(false)}
                onClick={abrirPopupGaleria}
                onTouchStart={(e) => {
                  if (imagenesFinales.length <= 1) return;
                  const touch = e.touches[0];
                  setTouchStart(touch.clientX);
                }}
                onTouchMove={(e) => {
                  if (imagenesFinales.length <= 1) return;
                  const touch = e.touches[0];
                  setTouchEnd(touch.clientX);
                }}
                onTouchEnd={(e) => {
                  if (imagenesFinales.length <= 1 || !touchStart || !touchEnd) return;
                  const distance = touchStart - touchEnd;
                  const isLeftSwipe = distance > 50;
                  const isRightSwipe = distance < -50;

                  if (isLeftSwipe) {
                    e.stopPropagation(); // Evitar que se abra el modal
                    manejarImagenSiguiente();
                  }
                  if (isRightSwipe) {
                    e.stopPropagation(); // Evitar que se abra el modal
                    manejarImagenAnterior();
                  }
                  
                  setTouchStart(null);
                  setTouchEnd(null);
                }}
              >
                <img
                  src={imagenesFinales[obtenerImagenActual()]}
                  alt={producto?.nombre || 'Producto'}
                  className="hero-temu-imagen-principal-img"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  loading="eager"
                />
                
                {/* Etiqueta VENDIDO */}
                {producto?.estado === 'vendido' && (
                  <div className="hero-temu-etiqueta-vendido">
                    <span>VENDIDO</span>
                  </div>
                )}

                {/* Indicadores de puntos debajo de la imagen */}
                {imagenesFinales.length > 1 && (
                  <div className="hero-temu-indicadores-puntos">
                    {imagenesFinales.map((_, index) => (
                      <button
                        key={index}
                        className={`hero-temu-punto-indicador ${index === obtenerImagenActual() ? 'activo' : ''}`}
                        onClick={() => manejarCambioImagen(index)}
                        aria-label={`Ir a imagen ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
                
                {/* Badge de descuento */}
                {descuento > 0 && (
                  <div className="hero-temu-badge-descuento">
                    -{descuento}%
                  </div>
                )}
                
                {/* Botón de favoritos - Solo mostrar si el producto NO está vendido */}
                {producto?.estado !== 'vendido' && (
                  <button 
                    className={`hero-temu-boton-favoritos ${esFavorito(producto?.id) ? 'activo' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (producto) {
                        alternarFavorito(producto)
                      }
                    }}
                  >
                    <Heart size={20} fill={esFavorito(producto?.id) ? '#ff4757' : 'none'} />
                  </button>
                )}

                {/* Flechas de navegación en hover */}
                {mostrarFlechas && imagenesFinales.length > 1 && (
                  <>
                    <button 
                      className="hero-temu-flecha-navegacion hero-temu-flecha-izquierda"
                      onClick={(e) => {
                        e.stopPropagation()
                        manejarImagenAnterior()
                      }}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      className="hero-temu-flecha-navegacion hero-temu-flecha-derecha"
                      onClick={(e) => {
                        e.stopPropagation()
                        manejarImagenSiguiente()
                      }}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            </div>
            
          </GaleriaSticky>
        </div>

        {/* COLUMNA DERECHA - CONTENIDO SCROLLABLE */}
        <div className="hero-temu-columna-derecha">
          
          {/* BANNER MEGA OFERTA - COPIA EXACTA DE TEMU */}
          <div className="hero-temu-banner-mega-oferta">
            <div className="hero-temu-etiqueta-mega">
              MEGA<br/>OFERTA
            </div>
            <div className="hero-temu-beneficios-container">
              <span className="hero-temu-beneficio-texto">
                <span className="hero-temu-check-verde">✓</span> Envío gratis
              </span>
              <span className="hero-temu-beneficio-texto">
                <span className="hero-temu-check-verde">✓</span> $4.000 de crédito por retraso
              </span>
            </div>
          </div>
          
          {/* Título del producto mejorado */}
          <h1 className="hero-temu-titulo-producto mobile-order-2">
            {producto?.nombre || 'Bolso Morral al vacío viral Amazon'}
          </h1>
          
          {/* Características clave del producto */}
          <div className="hero-temu-caracteristicas-clave">
            <div className="hero-temu-caracteristicas-lista">
              {/* Mostrar ganchos del producto si existen */}
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
                  <div className="hero-temu-caracteristica-item">
                    <span className="hero-temu-icono-caracteristica">⚡</span>
                    <span>Calidad premium garantizada</span>
                  </div>
                  <div className="hero-temu-caracteristica-item">
                    <span className="hero-temu-icono-caracteristica">🛡️</span>
                    <span>Garantía total incluida</span>
                  </div>
                  <div className="hero-temu-caracteristica-item">
                    <span className="hero-temu-icono-caracteristica">🔒</span>
                    <span>Compra 100% segura</span>
                  </div>
                  <div className="hero-temu-caracteristica-item">
                    <span className="hero-temu-icono-caracteristica">🚚</span>
                    <span>Envío gratis a toda Colombia</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bloque único: (opiniones) ⭐⭐⭐⭐⭐ Verificado */}
          <div className="hero-temu-opiniones-verificado mobile-order-1" aria-label="Opiniones y verificación">
            <span className="hero-temu-opiniones-count">
              ({producto?.testimonios?.estadisticas?.totalResenas?.toLocaleString?.() || '1.559'} opiniones)
            </span>
            <div className="hero-temu-opiniones-stars" aria-hidden="true">
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
              <span>⭐</span>
            </div>
            <span className="hero-temu-opiniones-verified">
              <span className="hero-temu-verified-icon" aria-hidden="true">✓</span>
              <span className="hero-temu-verified-text">Verificado</span>
            </span>
          </div>
          
          {/* Sección de precios súper vendedora */}
          <div className="hero-temu-seccion-precios-vendedora mobile-order-3">
            {/* Etiqueta VENDIDO - Solo se muestra si el producto no está activo */}
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
              <span className="hero-temu-precio-actual-grande">
                {formatearPrecioCOP(producto?.precio || 8498)}
              </span>
              <span className="hero-temu-precio-original-tachado">
                {formatearPrecioCOP(producto?.precio_original || 22480)}
              </span>
              {/* Ahorro a la derecha (móvil visible) */}
              {producto?.precio_original && producto?.precio && producto.precio_original > producto.precio && (
                <span className="hero-temu-ahorro-label">
                  Ahorras: {formatearPrecioCOP(producto.precio_original - producto.precio)}
                </span>
              )}
              {/* Badge de descuento se oculta en móvil vía CSS */}
              <span className="hero-temu-badge-descuento-grande">
                -62% DE DESCUENTO tiempo limitado
              </span>
            </div>
            

          </div>

          {/* Imagen de pagos solo para móvil - aparece después del precio */}
          <div className="hero-temu-imagen-pagos-movil mobile-order-4">
            <img 
              src="/images/Imagen para los pagos.jpg" 
              alt="Métodos de pago disponibles"
            />
          </div>

          {/* Oferta relámpago mejorada - Solo mostrar si el producto NO está vendido */}
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

          {/* Botones de acción principales */}
          <div className="hero-temu-botones-accion mobile-order-5">
            {producto?.activo === false || producto?.estado === 'vendido' ? (
              // Botones deshabilitados cuando el producto está vendido
              <div className="hero-temu-botones-vendido">
                <button 
                  onClick={() => {
                    // Redirigir a la categoría del producto
                    const categoriaSlug = producto?.categorias?.slug || 'productos'
                    window.location.href = `/tienda/categoria/${categoriaSlug}`
                  }}
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
              // Botones normales cuando el producto está disponible
              <>
                <BotonCarritoAnimado
                  producto={producto}
                  cantidad={cantidad}
                  variante={varianteSeleccionada}
                  className="hero-temu-boton-carrito"
                  onAgregar={manejarAgregarCarrito}
                  onError={(error) => console.error('Error en botón animado:', error)}
                >
                  Agregar al carrito
                </BotonCarritoAnimado>
                
                <button 
                  onClick={() => setModalContraEntregaAbierto(true)}
                  className="hero-temu-boton-contra-entrega"
                >
                  <Truck size={18} />
                  Contra entrega
                </button>
                
                <button 
                  onClick={manejarComprarAhora}
                  className="hero-temu-boton-pagar-plataforma"
                >
                  <Zap size={18} />
                  Pagar plataforma
                </button>
              </>
            )}
          </div>

          {/* Imagen de métodos de pago */}
          <div className="hero-temu-metodos-pago">
            <img 
              src="/images/Imagen para los pagos.jpg" 
              alt="Métodos de pago disponibles"
              className="hero-temu-imagen-pagos"
            />
          </div>

          {producto?.descripcion && (
            <div className="hero-temu-seccion-descripcion mobile-order-7">
              {(() => {
                // Soporte para descripción como JSON { titulo, contenido } o como string
                const esObjeto = producto?.descripcion && typeof producto.descripcion === 'object'
                const tituloDescripcion = esObjeto
                  ? (producto.descripcion.titulo || 'Descripción del Producto')
                  : 'Descripción del Producto'
                const textoDescripcion = esObjeto
                  ? (producto.descripcion.contenido || '')
                  : (typeof producto?.descripcion === 'string' ? producto.descripcion : '')

                return (
                  <>
                    <h3 className="hero-temu-titulo-descripcion">
                      {/* Título dinámico con fallback */}
                      📝 {tituloDescripcion}
                    </h3>
                    <div className="hero-temu-texto-descripcion">
                      {descripcionExpandida 
                        ? textoDescripcion
                        : truncarTexto(textoDescripcion, 50)
                      }
                    </div>
                    {textoDescripcion && textoDescripcion.split(' ').length > 10 && (
                      <button 
                        className="hero-temu-boton-expandir"
                        onClick={() => setDescripcionExpandida(!descripcionExpandida)}
                      >
                        <span className={`hero-temu-icono-expandir ${descripcionExpandida ? 'expandido' : ''}`}>
                          🔽
                        </span>
                        {descripcionExpandida ? 'Ver menos' : 'Ver descripción completa'}
                      </button>
                    )}
                  </>
                )
              })()}
            </div>
          )}

          {/* Especificaciones técnicas */}
          <div className="hero-temu-especificaciones-tecnicas mobile-order-8">
            <h3 className="hero-temu-titulo-especificaciones">
              🔧 Especificaciones Técnicas
            </h3>
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
                <p className="hero-temu-subtitulo-porque-elegir">
                  {producto.caracteristicas.subtitulo}
                </p>
              )}
              <div className="hero-temu-beneficios-grid">
                {/* Mostrar solo 4 características principales del producto */}
                {producto.caracteristicas.detalles && producto.caracteristicas.detalles.slice(0, 4).map((detalle, index) => (
                  <div key={`detalle-${index}`} className="hero-temu-beneficio-item">
                    <span className="hero-temu-icono-beneficio">
                      {detalle.icono || '⭐'}
                    </span>
                    <div className="hero-temu-contenido-beneficio">
                      <h4>{detalle.titulo || detalle}</h4>
                      {detalle.descripcion && <p>{detalle.descripcion}</p>}
                    </div>
                  </div>
                ))}
                
                {/* Si no hay detalles, mostrar características del producto principal */}
                {(!producto.caracteristicas.detalles || producto.caracteristicas.detalles.length === 0) && 
                 producto.caracteristicas && producto.caracteristicas.slice(0, 4).map((caracteristica, index) => {
                  const iconos = ['🚀', '⚡', '💎', '🛡️'];
                  return (
                    <div key={`caracteristica-${index}`} className="hero-temu-beneficio-item">
                      <span className="hero-temu-icono-beneficio">
                        {iconos[index] || '⭐'}
                      </span>
                      <div className="hero-temu-contenido-beneficio">
                        <h4>{caracteristica}</h4>
                        <p>Característica destacada del producto</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      {popupGaleriaAbierto && (
        <div className="hero-temu-popup-galeria" onClick={cerrarPopupGaleria}>
          <div className="hero-temu-popup-contenido" onClick={(e) => e.stopPropagation()}>
            
            <div className="hero-temu-popup-header">
              <span className="hero-temu-popup-contador">
                {imagenSeleccionada + 1}/{imagenesFinales.length}
              </span>
              <div className="hero-temu-popup-botones">
                <button 
                  className="hero-temu-popup-compartir"
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: 'Mira este producto increíble',
                        text: 'Te va a encantar este producto que encontré',
                        url: window.location.href
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert('¡Enlace copiado al portapapeles!');
                    }
                  }}
                >
                  <Share2 size={20} />
                </button>
                <button 
                  className="hero-temu-popup-cerrar"
                  onClick={cerrarPopupGaleria}
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="hero-temu-popup-layout-desktop">
              {imagenesFinales.length > 1 && (
                <div className="hero-temu-popup-miniaturas-desktop">
                  {imagenesFinales.map((imagen, index) => (
                    <button
                      key={index}
                      className={`hero-temu-popup-miniatura-desktop ${index === imagenSeleccionada ? 'activa' : ''}`}
                      onClick={() => manejarCambioImagen(index)}
                    >
                      <img 
                        src={imagen} 
                        alt={`Vista ${index + 1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="eager"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="hero-temu-popup-imagen-container">
                <img 
                  src={imagenesFinales[imagenSeleccionada]} 
                  alt={producto?.nombre || 'Producto'}
                  className="hero-temu-popup-imagen"
                  loading="eager"
                />

                {imagenesFinales.length > 1 && (
                  <>
                    <button 
                      className="hero-temu-popup-flecha hero-temu-popup-flecha-izquierda"
                      onClick={manejarImagenAnterior}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button 
                      className="hero-temu-popup-flecha hero-temu-popup-flecha-derecha"
                      onClick={manejarImagenSiguiente}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
              </div>
            </div>

            <div 
              className="hero-temu-popup-layout-mobile"
              onTouchStart={(e) => {
                if (imagenesFinales.length <= 1) return;
                const touch = e.touches[0];
                setTouchStart(touch.clientX);
              }}
              onTouchMove={(e) => {
                if (imagenesFinales.length <= 1) return;
                const touch = e.touches[0];
                setTouchEnd(touch.clientX);
              }}
              onTouchEnd={(e) => {
                if (imagenesFinales.length <= 1 || !touchStart || !touchEnd) return;
                const distance = touchStart - touchEnd;
                const isLeftSwipe = distance > 50;
                const isRightSwipe = distance < -50;

                if (isLeftSwipe) {
                  manejarImagenSiguiente();
                }
                if (isRightSwipe) {
                  manejarImagenAnterior();
                }
                
                setTouchStart(null);
                setTouchEnd(null);
              }}
            >
              <div className="hero-temu-popup-imagen-container-mobile">
                <img 
                  src={imagenesFinales[imagenSeleccionada]} 
                  alt={producto?.nombre || 'Producto'}
                  className="hero-temu-popup-imagen"
                  loading="eager"
                />
              </div>

              {imagenesFinales.length > 1 && (
                <div className="hero-temu-popup-miniaturas-mobile">
                  {imagenesFinales.map((imagen, index) => (
                    <button
                      key={index}
                      className={`hero-temu-popup-miniatura-mobile ${index === imagenSeleccionada ? 'activa' : ''}`}
                      onClick={() => manejarCambioImagen(index)}
                    >
                      <img 
                        src={imagen} 
                        alt={`Vista ${index + 1}`} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        loading="eager"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="hero-temu-popup-acciones">
              <BotonCarritoAnimado
                producto={producto}
                cantidad={cantidad}
                variante={varianteSeleccionada}
                className="hero-temu-popup-boton-carrito"
                onAgregar={async (producto, cantidad, variante) => {
                  await manejarAgregarCarrito(producto, cantidad, variante)
                  cerrarPopupGaleria()
                }}
                onError={(error) => console.error('Error en popup:', error)}
              >
                Añadir al carrito
              </BotonCarritoAnimado>
            </div>
          </div>
        </div>
      )}

      <ContraEntregaModal
        abierto={modalContraEntregaAbierto}
        onCerrar={() => setModalContraEntregaAbierto(false)}
        producto={producto}
        onConfirmar={(payload) => {
          console.log('Pedido COD creado localmente:', payload)
        }}
      />

      <ModalPromociones
        isOpen={modalPromocionesAbierto}
        onClose={() => setModalPromocionesAbierto(false)}
        producto={producto}
        onSeleccionarOferta={(oferta) => {
          console.log('Oferta seleccionada:', oferta)
          // Aquí puedes agregar la lógica para procesar la oferta seleccionada
          // Por ejemplo, redirigir al checkout con la oferta
        }}
      />
    </div>
  )
}

export default HeroTemu
