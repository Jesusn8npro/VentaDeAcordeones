import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { 
  Search, 
  User, 
  ShoppingCart, 
  Menu, 
  X, 
  ChevronDown, 
  Home, 
  Store, 
  Heart, 
  UserCircle,
  Package,
  LayoutGrid,
  ChevronRight,
  ChevronLeft,
  Tag,
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Watch,
  Gamepad2,
  Shirt,
  Zap,
  MapPin,
  Globe,
  Phone,
  LogOut,
  Settings,
  ShoppingBag
} from 'lucide-react'
import { clienteSupabase } from '../../configuracion/supabase'
import ModalBusqueda from '../busqueda/ModalBusqueda'
import ModalAutenticacionIsolado from '../autenticacion/ModalAutenticacionIsolado'
import ModalCarrito from '../carrito/CarritoFlotante'
import { useFavoritos } from '../../contextos/FavoritosContext'
import { useAuth } from '../../contextos/ContextoAutenticacion'
import { useCarrito } from '../../contextos/CarritoContext'
import { useChat } from '../../contextos/ChatContext'
import './HeaderPrincipal.css'
import MenuMovilOverlay from './MenuMovilOverlay'
import SliderInformacion from './SliderInformacion'
import TarjetaProductoLujo from '../producto/TarjetaProductoLujo'

const HeaderPrincipal = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { favoritos } = useFavoritos()
const { usuario, sesionInicializada, cerrarSesion, esAdmin } = useAuth()
  const { totalItems, modalAbierto, alternarModal } = useCarrito()
  const { chatAbierto } = useChat()
  const [busqueda, setBusqueda] = useState('')
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false)
  const [departamentosAbierto, setDepartamentosAbierto] = useState(false)
  const [homeLayoutAbierto, setHomeLayoutAbierto] = useState(false)
  const [categoryAbierto, setCategoryAbierto] = useState(false)
  const [productAbierto, setProductAbierto] = useState(false)
  const [blogAbierto, setBlogAbierto] = useState(false)
  const [modalBusquedaAbierto, setModalBusquedaAbierto] = useState(false)
  const [modalAutenticacionAbierto, setModalAutenticacionAbierto] = useState(false)
  const [categorias, setCategorias] = useState([])
  const [categoriasAbiertas, setCategoriasAbiertas] = useState(false)
  const [cargandoCategorias, setCargandoCategorias] = useState(false)
  const [headerSticky, setHeaderSticky] = useState(false)
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false)
  const [productosMenu, setProductosMenu] = useState([])
  const sliderProductosRef = useRef(null)
  const hoverTimersRef = useRef({ productos: null, departamentos: null, paginas: null })
  
  // Lista de páginas para el menú (visibles al público)
  const paginasMenu = [
    { ruta: '/', titulo: 'Inicio', Icono: Home },
    { ruta: '/tienda', titulo: 'Tienda', Icono: Store },
    { ruta: '/blog', titulo: 'Blog', Icono: Tag },
    { ruta: '/favoritos', titulo: 'Favoritos', Icono: Heart },
    { ruta: '/carrito', titulo: 'Carrito', Icono: ShoppingBag },
    { ruta: '/checkout', titulo: 'Checkout', Icono: Package },
    { ruta: '/quienes-somos', titulo: 'Quiénes somos', Icono: Globe },
    { ruta: '/contacto', titulo: 'Contacto', Icono: Phone },
    { ruta: '/preguntas-frecuentes', titulo: 'Preguntas frecuentes', Icono: Settings },
    { ruta: '/terminos-condiciones', titulo: 'Términos y condiciones', Icono: Settings },
    { ruta: '/politica-privacidad', titulo: 'Política de privacidad', Icono: Settings },
    { ruta: '/trabaja-con-nosotros', titulo: 'Trabaja con nosotros', Icono: MapPin },
    { ruta: '/ayuda', titulo: 'Ayuda', Icono: Settings },
    { ruta: '/login', titulo: 'Ingresar', Icono: UserCircle },
    { ruta: '/registro', titulo: 'Registrarse', Icono: UserCircle },
    { ruta: '/perfil', titulo: 'Mi perfil', Icono: UserCircle },
    { ruta: '/restablecer-contrasena', titulo: 'Restablecer contraseña', Icono: Settings },
  ]
  
  const headerRef = useRef(null)

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const manejarClickFuera = (evento) => {
      if (headerRef.current && !headerRef.current.contains(evento.target)) {
        setDepartamentosAbierto(false)
        setHomeLayoutAbierto(false)
        setCategoryAbierto(false)
        setProductAbierto(false)
        setBlogAbierto(false)
        setMenuUsuarioAbierto(false)
      }
    }

    document.addEventListener('mousedown', manejarClickFuera)
    return () => document.removeEventListener('mousedown', manejarClickFuera)
  }, [])

  // Cargar productos para el menú
  useEffect(() => {
    const cargarProductosParaMenu = async () => {
      try {
        const { data, error } = await clienteSupabase
          .from('productos')
          .select(`
            id,
            nombre,
            slug,
            precio,
            precio_original,
            estado,
            destacado,
            stock,
            stock_minimo,
            categoria_id,
            categorias (
              id,
              nombre,
              icono
            ),
            producto_imagenes (
              imagen_principal,
              imagen_secundaria_1,
              imagen_secundaria_2,
              imagen_secundaria_3,
              imagen_secundaria_4
            )
          `)
          .eq('activo', true)
          .gt('stock', 0)
          .order('creado_el', { ascending: false })
          .limit(8)

        if (error) throw error
        setProductosMenu(data || [])
      } catch (error) {
        console.error('Error cargando productos para menú:', error?.message || error)
        setProductosMenu([])
      }
    }
    cargarProductosParaMenu()
  }, [])

  // Cargar categorías para el menú móvil
  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarCategorias = async () => {
    setCargandoCategorias(true)
    try {
      // Cargar categorías
      const { data: categoriasData, error: categoriasError } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, slug, icono, descripcion, orden')
        .eq('activo', true)
        .order('orden', { ascending: true })
        .order('nombre', { ascending: true })

      if (categoriasError) throw categoriasError

      // Contar productos por categoría
      const categoriasConConteo = await Promise.all(
        (categoriasData || []).map(async (categoria) => {
          const { count, error: countError } = await clienteSupabase
            .from('productos')
            .select('*', { count: 'exact', head: true })
            .eq('categoria_id', categoria.id)
            .eq('activo', true)

          if (countError) {
            // Error silencioso para producción
            return { ...categoria, cantidad: 0 }
          }

          // Si la categoría no tiene slug, generarlo desde el nombre
          const slugFinal = categoria.slug || categoria.nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')

          return { ...categoria, slug: slugFinal, cantidad: count || 0 }
        })
      )

      // Mostrar todas las categorías activas, incluso con 0 productos
      setCategorias(categoriasConConteo)
    } catch (error) {
      // Error silencioso para producción
      setCategorias([])
    } finally {
      setCargandoCategorias(false)
    }
  }

  // Función para obtener icono de categoría
  const obtenerIconoCategoria = (categoria) => {
    const nombre = categoria.nombre?.toLowerCase() || ''
    const icono = categoria.icono?.toLowerCase() || ''
    
    if (nombre.includes('electrón') || nombre.includes('tecnolog') || icono.includes('smartphone')) {
      return <Smartphone size={20} />
    }
    if (nombre.includes('computador') || nombre.includes('laptop') || icono.includes('laptop')) {
      return <Laptop size={20} />
    }
    if (nombre.includes('audio') || nombre.includes('audífono') || icono.includes('headphones')) {
      return <Headphones size={20} />
    }
    if (nombre.includes('cámara') || nombre.includes('foto') || icono.includes('camera')) {
      return <Camera size={20} />
    }
    if (nombre.includes('reloj') || nombre.includes('watch') || icono.includes('watch')) {
      return <Watch size={20} />
    }
    if (nombre.includes('juego') || nombre.includes('gaming') || icono.includes('gamepad')) {
      return <Gamepad2 size={20} />
    }
    if (nombre.includes('ropa') || nombre.includes('moda') || icono.includes('shirt')) {
      return <Shirt size={20} />
    }
    if (nombre.includes('hogar') || nombre.includes('casa') || icono.includes('home')) {
      return <Home size={20} />
    }
    
    // Icono por defecto
    return <Tag size={20} />
  }

  const manejarNavegacionCategoria = (categoria) => {
    setMenuMovilAbierto(false)
    navigate(`/tienda/categoria/${categoria.slug}`)
  }

  // Manejar búsqueda
  const manejarBusqueda = (e) => {
    e.preventDefault()
    // Búsqueda manejada por el componente ModalBusqueda
  }

  // Detectar si estamos en una página de producto o tienda para desactivar sticky
  const esPaginaProducto = location.pathname.startsWith('/producto/')
  const esPaginaTienda = location.pathname.startsWith('/tienda')

  // Detectar scroll para header sticky con mejor lógica
  useEffect(() => {
    // Verificar si la página tiene suficiente contenido para scroll
    const verificarContenidoSuficiente = () => {
      const alturaVentana = window.innerHeight
      const alturaDocumento = document.documentElement.scrollHeight
      return alturaDocumento > alturaVentana + 200 // Margen de 200px
    }

    // Si estamos en páginas específicas o no hay suficiente contenido, desactivar sticky
    if (esPaginaProducto || esPaginaTienda || !verificarContenidoSuficiente()) {
      setHeaderSticky(false)
      return
    }

    let ticking = false
    let lastScrollY = 0

    const manejarScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollY = window.scrollY
          const shouldBeSticky = scrollY > 120 // Activar sticky después de 120px de scroll
          
          // Solo actualizar si hay un cambio real y suficiente diferencia
          if (shouldBeSticky !== headerSticky && Math.abs(scrollY - lastScrollY) > 10) {
            setHeaderSticky(shouldBeSticky)
            lastScrollY = scrollY
          }
          
          ticking = false
        })
        ticking = true
      }
    }

    // Verificar contenido al cargar y redimensionar
    const manejarResize = () => {
      if (!verificarContenidoSuficiente()) {
        setHeaderSticky(false)
      }
    }

    window.addEventListener('scroll', manejarScroll, { passive: true })
    window.addEventListener('resize', manejarResize, { passive: true })
    
    // Verificación inicial
    manejarResize()
    
    return () => {
      window.removeEventListener('scroll', manejarScroll)
      window.removeEventListener('resize', manejarResize)
    }
  }, [headerSticky, esPaginaProducto, esPaginaTienda])

  // Alternar menú móvil
  const alternarMenuMovil = () => {
    setMenuMovilAbierto(!menuMovilAbierto)
  }

  // Manejar cierre de sesión
  const manejarCerrarSesion = async () => {
    try {
      await cerrarSesion()
      navigate('/sesion-cerrada')
      setMenuUsuarioAbierto(false)
    } catch (error) {
      // Error silencioso para producción
    }
  }

  // Detectar si estamos en área admin o cliente
  const estaEnAdmin = location?.pathname?.startsWith('/admin')

  // Navegar a admin
  const navegarAAdmin = () => {
    setMenuUsuarioAbierto(false)
    navigate('/admin')
  }

  // Navegar a productos admin
  const navegarAProductosAdmin = () => {
    setMenuUsuarioAbierto(false)
    navigate('/admin/productos')
  }

  // Navegar a agregar producto
  const navegarAAgregarProducto = () => {
    setMenuUsuarioAbierto(false)
    navigate('/admin/productos/creador-pr')
  }

  // Navegaciones cliente
  const navegarAPerfil = () => {
    setMenuUsuarioAbierto(false)
    navigate('/perfil')
  }

  const navegarAFavoritos = () => {
    setMenuUsuarioAbierto(false)
    navigate('/favoritos')
  }

  const manejarNavegacion = (ruta) => {
    setHomeLayoutAbierto(false)
    setCategoryAbierto(false)
    setProductAbierto(false)
    setBlogAbierto(false)
    setDepartamentosAbierto(false)
    navigate(ruta)
  }

  return (
    <header className={`header-principal ${headerSticky ? 'sticky' : ''} ${chatAbierto ? 'chat-abierto' : ''}`} ref={headerRef}>
      {/* Barra Promocional Superior eliminada por solicitud */}

      {/* Barra de Información Superior - Componente encapsulado */}
      <SliderInformacion
        items={[
          '✅ Contra entrega disponible',
          '🛍️ Plataforma Multiproductos',
          '🚚 Envío rápido a todo el país',
          '💳 Pagos seguros 100%',
          '📞 Atención al cliente 24/7',
          '🔥 Ofertas nuevas cada día',
        ]}
        speed={35}
      />

      {/* Header Principal */}
      <div className="header-contenido">
        <div className="contenedor-header">
          {/* Contenedor Menú + Logo (Solo Móvil) */}
          <div className="menu-logo-contenedor">
            <button className="menu-movil-boton" onClick={alternarMenuMovil}>
              <Menu size={24} />
            </button>
            <Link to="/" className="logo-contenedor">
              <img 
                src="/MeLlevoEsto.Com Logo.png" 
                alt="ME LLEVO ESTO" 
                className="logo-imagen"
                onError={(e) => { e.currentTarget.src = '/images/Logo oficial me llevo esto.jpg' }}
              />
            </Link>
          </div>

          {/* Logo para Escritorio */}
          <Link to="/" className="logo-contenedor logo-escritorio">
            <img 
              src="/MeLlevoEsto.Com Logo.png" 
              alt="ME LLEVO ESTO" 
              className="logo-imagen logo-imagen-escritorio"
              onError={(e) => { e.currentTarget.src = '/images/Logo oficial me llevo esto.jpg' }}
            />
          </Link>

          {/* Buscador Central (Desktop) */}
          <div className="buscador-contenedor">
            <div className="buscador-form">
              <input
                type="text"
                placeholder="Busca lo que necesitas..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="buscador-input"
                onClick={() => setModalBusquedaAbierto(true)}
                readOnly
              />
              <button type="button" className="buscador-boton" onClick={() => setModalBusquedaAbierto(true)}>
                <Search size={20} />
              </button>
            </div>
          </div>

          {/* Acciones del Header (Derecha) */}
          <div className="acciones-header">
            <Link to="/favoritos" className="accion-item favoritos-enlace">
              <div className="favoritos-contenedor">
                <Heart size={24} />
                {favoritos.length > 0 && (
                  <span className="favoritos-contador">{favoritos.length}</span>
                )}
              </div>
            </Link>
            <button 
              className="accion-item carrito-enlace" 
              onClick={alternarModal}
              title="Abrir carrito"
            >
              <div className="carrito-contenedor">
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="carrito-contador">{totalItems}</span>
                )}
              </div>
            </button>
            {!sesionInicializada ? (
              <div className="usuario-logueado">
                <button className="accion-item" disabled>
                  <User className="icono-usuario-header" />
                  <div className="usuario-info">
                    <span className="usuario-texto">Cargando…</span>
                    <span className="usuario-subtexto">Mi Cuenta</span>
                  </div>
                </button>
              </div>
            ) : sesionInicializada && usuario ? (
              <div className="usuario-logueado">
                <button 
                  className="accion-item" 
                  onClick={() => setMenuUsuarioAbierto(!menuUsuarioAbierto)}
                >
                  <User className="icono-usuario-header" />
                  <div className="usuario-info">
                    <span className="usuario-texto">
                      {
                        (() => {
                          // Si usuario.nombre es un string válido y no contiene JSON
                          if (typeof usuario.nombre === 'string' && usuario.nombre.trim() && !usuario.nombre.includes('{')) {
                            return usuario.nombre;
                          }
                          
                          // Si usuario.nombre contiene JSON, intentar extraer el nombre
                          if (typeof usuario.nombre === 'string' && usuario.nombre.includes('{')) {
                            try {
                              const parsed = JSON.parse(usuario.nombre);
                              if (parsed.nombre) return parsed.nombre;
                              if (parsed.apellido) return parsed.apellido;
                            } catch (e) {
                              // Si no se puede parsear, continuar con otras opciones
                            }
                          }
                          
                          // Fallback a email o user_metadata
                          return usuario.email?.split('@')[0] || 
                                 usuario.user_metadata?.nombre || 
                                 'Usuario';
                        })()
                      }
                    </span>
                    <span className="usuario-subtexto">Mi Cuenta</span>
                  </div>
                  <ChevronDown size={12} className={`flecha-usuario ${menuUsuarioAbierto ? 'rotado' : ''}`} />
                </button>
                
                {menuUsuarioAbierto && (
                  <div className="dropdown-usuario">
                    {esAdmin?.() ? (
                      <>
                        <button className="dropdown-item" onClick={navegarAAdmin}>
                          <Settings size={16} />
                          Panel Admin
                        </button>
                        <button className="dropdown-item" onClick={navegarAProductosAdmin}>
                          <ShoppingCart size={16} />
                          Productos
                        </button>
                        <button className="dropdown-item" onClick={navegarAAgregarProducto}>
                          <Package size={16} />
                          Agregar Producto
                        </button>
                        <div className="dropdown-divider"></div>
                      </>
                    ) : (
                      <>
                        <button className="dropdown-item" onClick={navegarAPerfil}>
                          <UserCircle size={16} />
                          Perfil
                        </button>
                        <button className="dropdown-item" onClick={navegarAFavoritos}>
                          <Heart size={16} />
                          Favoritos
                        </button>
                        {esAdmin?.() && (
                          <>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item" onClick={navegarAAdmin}>
                              <Settings size={16} />
                              Ir al Panel Admin
                            </button>
                          </>
                        )}
                        <div className="dropdown-divider"></div>
                      </>
                    )}
                    <button className="dropdown-item logout-item" onClick={manejarCerrarSesion}>
                      <LogOut size={16} />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="accion-item usuario-enlace" onClick={() => setModalAutenticacionAbierto(true)}>
                <User className="icono-usuario-header" />
                <div className="usuario-info">
                  <span className="usuario-texto">Iniciar Sesión</span>
                  <span className="usuario-subtexto">Registrarse</span>
                </div>
              </button>
            )}

            {/* Indicador de autenticación en desarrollo eliminado */}
          </div>
        </div>
      </div>

      {/* Barra de Búsqueda Móvil */}
      <div className="buscador-movil">
        <div className="buscador-movil-form">
          <input
            type="text"
            placeholder="Busca lo que necesitas..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="buscador-movil-input"
            onClick={() => setModalBusquedaAbierto(true)}
            readOnly
          />
          <button type="button" className="buscador-movil-boton" onClick={() => setModalBusquedaAbierto(true)}>
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* Menú de Navegación */}
      <nav className="menu-navegacion">
        <div className="contenedor-menu">
          {/* Comprar por Categorías */}
          <div 
            className="menu-departamentos"
            onMouseEnter={() => {
              if (hoverTimersRef.current.departamentos) {
                clearTimeout(hoverTimersRef.current.departamentos)
                hoverTimersRef.current.departamentos = null
              }
              setDepartamentosAbierto(true)
            }}
            onMouseLeave={() => {
              if (hoverTimersRef.current.departamentos) clearTimeout(hoverTimersRef.current.departamentos)
              hoverTimersRef.current.departamentos = setTimeout(() => setDepartamentosAbierto(false), 500)
            }}
          >
            <button 
              className="boton-departamentos"
              aria-haspopup="true"
              aria-expanded={departamentosAbierto}
              onFocus={() => setDepartamentosAbierto(true)}
              onBlur={() => setDepartamentosAbierto(false)}
            >
              <LayoutGrid size={18} />
              <span>Comprar por categorías</span>
              <ChevronDown size={16} className={departamentosAbierto ? 'rotado' : ''} />
            </button>
            {departamentosAbierto && (
              <div className="dropdown-departamentos">
                {cargandoCategorias ? (
                  <div className="dropdown-item">Cargando...</div>
                ) : (
                  categorias.map(categoria => (
                    <Link 
                      key={categoria.id} 
                      to={`/tienda/categoria/${categoria.slug}`} 
                      className="dropdown-item"
                      onClick={() => setDepartamentosAbierto(false)}
                    >
                      {obtenerIconoCategoria(categoria)}
                      <span>{categoria.nombre}</span>
                      <span className="cantidad-productos">{categoria.cantidad}</span>
                    </Link>
                  ))
                )}
                <Link 
                  to="/tienda" 
                  className="dropdown-item ver-todas"
                  onClick={() => setDepartamentosAbierto(false)}
                >
                  <Store size={20} />
                  <span>Ver todas las categorías</span>
                </Link>
              </div>
            )}
          </div>

          {/* Menú Principal */}
          <div className="menu-principal">
            <div 
              className="menu-item dropdown"
              onMouseEnter={() => {
                if (hoverTimersRef.current.paginas) {
                  clearTimeout(hoverTimersRef.current.paginas)
                  hoverTimersRef.current.paginas = null
                }
                setHomeLayoutAbierto(true)
              }}
              onMouseLeave={() => {
                if (hoverTimersRef.current.paginas) clearTimeout(hoverTimersRef.current.paginas)
                hoverTimersRef.current.paginas = setTimeout(() => setHomeLayoutAbierto(false), 500)
              }}
            >
              <button 
                className="menu-enlace"
                aria-haspopup="true"
                aria-expanded={homeLayoutAbierto}
                onFocus={() => setHomeLayoutAbierto(true)}
                onBlur={() => setHomeLayoutAbierto(false)}
              >
                Páginas
                <ChevronDown size={14} className={homeLayoutAbierto ? 'rotado' : ''} />
              </button>
              {homeLayoutAbierto && (
                <div className="dropdown-menu dropdown-paginas">
                  {paginasMenu.map(({ ruta, titulo, Icono }) => (
                    <Link 
                      key={ruta}
                      to={ruta}
                      className="dropdown-item pagina-item"
                      onClick={() => manejarNavegacion(ruta)}
                    >
                      {Icono ? <Icono size={18} /> : <Tag size={18} />}
                      <span className="pagina-titulo">{titulo}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div 
              className="menu-item dropdown"
              onMouseEnter={() => {
                if (hoverTimersRef.current.productos) {
                  clearTimeout(hoverTimersRef.current.productos)
                  hoverTimersRef.current.productos = null
                }
                setProductAbierto(true)
              }}
              onMouseLeave={() => {
                if (hoverTimersRef.current.productos) clearTimeout(hoverTimersRef.current.productos)
                hoverTimersRef.current.productos = setTimeout(() => setProductAbierto(false), 500)
              }}
            >
              <button 
                className="menu-enlace"
                aria-haspopup="true"
                aria-expanded={productAbierto}
                onFocus={() => setProductAbierto(true)}
                onBlur={() => setProductAbierto(false)}
              >
                Productos
                <ChevronDown size={14} className={productAbierto ? 'rotado' : ''} />
              </button>
              {productAbierto && (
                <div className="dropdown-menu dropdown-productos">
                  {productosMenu.length > 0 ? (
                    <div className="productos-slider-wrapper">
                      <button className="slider-btn izquierda" aria-label="Anterior" onClick={() => desplazarSlider('izq')}>
                        <ChevronLeft size={18} />
                      </button>
                      <div className="productos-slider" ref={sliderProductosRef}>
                        {productosMenu.map((producto) => {
                          const p = normalizarProductoMenu(producto)
                          return (
                            <div key={producto.id} className="producto-slide" onClick={() => setProductAbierto(false)}>
                              <TarjetaProductoLujo producto={p} />
                            </div>
                          )
                        })}
                      </div>
                      <button className="slider-btn derecha" aria-label="Siguiente" onClick={() => desplazarSlider('der')}>
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="dropdown-item">Cargando productos...</div>
                  )}
                  <div className="dropdown-divider"></div>
                  <Link to="/tienda" className="dropdown-item ver-todos-productos" onClick={() => setProductAbierto(false)}>
                    Ver todos los productos
                  </Link>
                </div>
              )}
            </div>

            <Link to="/blog" className="menu-enlace">Blog</Link>
            <Link to="/contacto" className="menu-enlace">Contacto</Link>
          </div>

          {/* Información de Contacto */}
          <div className="info-contacto">
            <a href="https://wa.me/573208492093" target="_blank" rel="noopener noreferrer" className="whatsapp-enlace">
              <Phone size={16} />
              <span>Línea Directa: +57 320 849 2093</span>
            </a>
          </div>
        </div>
      </nav>

      {/* Menú móvil overlay extraído a componente */}
      <MenuMovilOverlay
        abierto={menuMovilAbierto}
        onCerrar={() => setMenuMovilAbierto(false)}
        onAbrirBusqueda={() => setModalBusquedaAbierto(true)}
        categorias={categorias}
        cargandoCategorias={cargandoCategorias}
        obtenerIconoCategoria={obtenerIconoCategoria}
        onNavegarCategoria={manejarNavegacionCategoria}
        onAbrirAutenticacion={() => setModalAutenticacionAbierto(true)}
        totalItems={totalItems}
        onAlternarCarrito={alternarModal}
        sesionInicializada={sesionInicializada}
        usuario={usuario}
      />

      {/* Navegación Móvil Inferior - Oculta en páginas de productos */}
      {!esPaginaProducto && (
        <div className={`navegacion-movil-inferior ${chatAbierto ? 'chat-abierto' : ''}`}>
        <button className="nav-movil-item" onClick={alternarMenuMovil}>
          <div className="nav-icono-contenedor">
            <Menu size={22} />
          </div>
          <span>Menú</span>
        </button>
        
        <button className="nav-movil-item" onClick={() => setModalBusquedaAbierto(true)}>
          <div className="nav-icono-contenedor">
            <Search size={22} />
          </div>
          <span>Buscar</span>
        </button>
        
        <Link to="/tienda" className="nav-movil-item nav-movil-destacado">
          <div className="nav-icono-contenedor-destacado">
            <Store size={24} />
          </div>
          <span>Tienda</span>
        </Link>
        
        <button className="nav-movil-item" onClick={alternarModal}>
          <div className="nav-icono-contenedor carrito-contenedor-movil">
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="notificacion-circulo">{totalItems}</span>
            )}
          </div>
          <span>Carrito</span>
        </button>
        
        <Link to="/favoritos" className="nav-movil-item">
          <div className="nav-icono-contenedor">
            <Heart size={22} />
          </div>
          <span>Favoritos</span>
        </Link>
        </div>
      )}

      {/* Modales */}
      <ModalBusqueda 
        abierto={modalBusquedaAbierto} 
        onCerrar={() => setModalBusquedaAbierto(false)} 
      />
      <ModalAutenticacionIsolado 
        abierto={modalAutenticacionAbierto} 
        onCerrar={() => setModalAutenticacionAbierto(false)} 
      />
      <ModalCarrito abierto={modalAbierto} onCerrar={alternarModal} />

      {/* Overlay para ocultar elementos cuando el modal de búsqueda está abierto */}
      {modalBusquedaAbierto && (
        <style>
          {`
            .boton-whatsapp,
            .contenedor-widget-chat {
              opacity: 0 !important;
              pointer-events: none !important;
              transition: opacity 0.3s ease !important;
            }
          `}
        </style>
      )}

      {/* Overlay para ocultar elementos cuando el menú móvil está abierto */}
      {menuMovilAbierto && (
        <style>
          {`
            .boton-whatsapp,
            .contenedor-widget-chat {
              opacity: 0 !important;
              pointer-events: none !important;
              transition: opacity 0.3s ease !important;
            }
          `}
        </style>
      )}
    </header>
  )
}

export default HeaderPrincipal
  // Normalizar producto para la tarjeta vendedora
  const normalizarProductoMenu = (p) => {
    // Derivar fotos_principales desde relación producto_imagenes (objeto o array) o fallbacks
    let imagenPrincipal = null
    let imagenSecundaria = null
    const rel = p?.producto_imagenes
    if (rel) {
      if (Array.isArray(rel)) {
        imagenPrincipal = rel[0]?.imagen_principal || null
        imagenSecundaria = rel[0]?.imagen_secundaria_1 || null
      } else {
        imagenPrincipal = rel.imagen_principal || null
        imagenSecundaria = rel.imagen_secundaria_1 || null
      }
    }

    const fotos = Array.isArray(p?.fotos_principales) && p.fotos_principales.length > 0
      ? p.fotos_principales
      : [imagenPrincipal, imagenSecundaria].filter(Boolean)

    return {
      ...p,
      precio: typeof p?.precio === 'number' ? p.precio : 0,
      fotos_principales: fotos
    }
  }

  const desplazarSlider = (direccion) => {
    const cont = sliderProductosRef.current
    if (!cont) return
    const paso = Math.min(360, cont.clientWidth * 0.4)
    cont.scrollBy({ left: direccion === 'izq' ? -paso : paso, behavior: 'smooth' })
  }
