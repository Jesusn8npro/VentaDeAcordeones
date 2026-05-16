import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  Search,
  ShoppingCart,
  Menu,
  Home,
  Store,
  Heart,
  UserCircle,
  Package,
  Tag,
  MapPin,
  Globe,
  Phone,
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
import NavDesktop from './NavDesktop'
import BotonUsuario from './BotonUsuario'
import { useCategoriasMenu, obtenerIconoCategoria } from './useCategoriasMenu'

const PAGINAS_MENU = [
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
  const [productAbierto, setProductAbierto] = useState(false)
  const [modalBusquedaAbierto, setModalBusquedaAbierto] = useState(false)
  const [modalAutenticacionAbierto, setModalAutenticacionAbierto] = useState(false)
  const { categorias, cargandoCategorias } = useCategoriasMenu()
  const [headerSticky, setHeaderSticky] = useState(false)
  const [menuUsuarioAbierto, setMenuUsuarioAbierto] = useState(false)
  const [productosMenu, setProductosMenu] = useState([])
  const hoverTimersRef = useRef({ productos: null, departamentos: null, paginas: null })
  const headerRef = useRef(null)

  useEffect(() => {
    const manejarClickFuera = (evento) => {
      if (headerRef.current && !headerRef.current.contains(evento.target)) {
        setDepartamentosAbierto(false)
        setHomeLayoutAbierto(false)
        setProductAbierto(false)
        setMenuUsuarioAbierto(false)
      }
    }
    document.addEventListener('mousedown', manejarClickFuera)
    return () => document.removeEventListener('mousedown', manejarClickFuera)
  }, [])

  useEffect(() => {
    const cargarProductosParaMenu = async () => {
      try {
        const { data, error } = await clienteSupabase
          .from('productos')
          .select(`
            id, nombre, slug, precio, precio_original, estado, destacado, stock, stock_minimo, categoria_id,
            categorias ( id, nombre, icono ),
            producto_imagenes (
              imagen_principal, imagen_secundaria_1, imagen_secundaria_2, imagen_secundaria_3, imagen_secundaria_4
            )
          `)
          .eq('activo', true)
          .gt('stock', 0)
          .order('creado_el', { ascending: false })
          .limit(8)

        if (error) throw error
        setProductosMenu(data || [])
      } catch (error) {
        setProductosMenu([])
      }
    }
    cargarProductosParaMenu()
  }, [])

  const manejarNavegacionCategoria = (categoria) => {
    setMenuMovilAbierto(false)
    navigate(`/tienda/categoria/${categoria.slug}`)
  }

  const esPaginaProducto = location.pathname.startsWith('/producto/')
  const esPaginaTienda = location.pathname.startsWith('/tienda')

  useEffect(() => {
    const verificarContenidoSuficiente = () =>
      document.documentElement.scrollHeight > window.innerHeight + 200

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
          const shouldBeSticky = scrollY > 120
          if (shouldBeSticky !== headerSticky && Math.abs(scrollY - lastScrollY) > 10) {
            setHeaderSticky(shouldBeSticky)
            lastScrollY = scrollY
          }
          ticking = false
        })
        ticking = true
      }
    }

    const manejarResize = () => {
      if (!verificarContenidoSuficiente()) setHeaderSticky(false)
    }

    window.addEventListener('scroll', manejarScroll, { passive: true })
    window.addEventListener('resize', manejarResize, { passive: true })
    manejarResize()

    return () => {
      window.removeEventListener('scroll', manejarScroll)
      window.removeEventListener('resize', manejarResize)
    }
  }, [headerSticky, esPaginaProducto, esPaginaTienda])

  const alternarMenuMovil = useCallback(() => setMenuMovilAbierto(prev => !prev), [])

  const manejarCerrarSesion = useCallback(async () => {
    try {
      await cerrarSesion()
      navigate('/sesion-cerrada')
      setMenuUsuarioAbierto(false)
    } catch (error) {
      // silencioso
    }
  }, [cerrarSesion, navigate])

  const navegarAAdmin = () => { setMenuUsuarioAbierto(false); navigate('/admin') }
  const navegarAProductosAdmin = () => { setMenuUsuarioAbierto(false); navigate('/admin/productos') }
  const navegarAAgregarProducto = () => { setMenuUsuarioAbierto(false); navigate('/admin/productos/creador-pr') }
  const navegarAPerfil = () => { setMenuUsuarioAbierto(false); navigate('/perfil') }
  const navegarAFavoritos = () => { setMenuUsuarioAbierto(false); navigate('/favoritos') }

  const manejarNavegacion = useCallback((ruta) => {
    setHomeLayoutAbierto(false)
    setProductAbierto(false)
    setDepartamentosAbierto(false)
    navigate(ruta)
  }, [navigate])

  const obtenerNombreUsuario = () => {
    if (typeof usuario.nombre === 'string' && usuario.nombre.trim() && !usuario.nombre.includes('{')) {
      return usuario.nombre
    }
    if (typeof usuario.nombre === 'string' && usuario.nombre.includes('{')) {
      try {
        const parsed = JSON.parse(usuario.nombre)
        if (parsed.nombre) return parsed.nombre
        if (parsed.apellido) return parsed.apellido
      } catch (e) {
        // fallback
      }
    }
    return usuario.email?.split('@')[0] || usuario.user_metadata?.nombre || 'Usuario'
  }

  return (
    <header className={`header-principal ${headerSticky ? 'sticky' : ''} ${chatAbierto ? 'chat-abierto' : ''}`} ref={headerRef}>
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

      <div className="header-contenido">
        <div className="contenedor-header">
          <div className="menu-logo-contenedor">
            <button className="menu-movil-boton" onClick={alternarMenuMovil}>
              <Menu size={24} />
            </button>
            <Link to="/" className="logo-contenedor">
              <img
                src="/logo.svg"
                alt="VentaDeAcordeones.com"
                className="logo-imagen"
              />
            </Link>
          </div>

          <Link to="/" className="logo-contenedor logo-escritorio">
            <img
              src="/logo.svg"
              alt="VentaDeAcordeones.com"
              className="logo-imagen logo-imagen-escritorio"
            />
          </Link>

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

          <div className="acciones-header">
            <Link to="/favoritos" className="accion-item favoritos-enlace">
              <div className="favoritos-contenedor">
                <Heart size={24} />
                {favoritos.length > 0 && (
                  <span className="favoritos-contador">{favoritos.length}</span>
                )}
              </div>
            </Link>
            <button className="accion-item carrito-enlace" onClick={alternarModal} title="Abrir carrito">
              <div className="carrito-contenedor">
                <ShoppingCart size={24} />
                {totalItems > 0 && (
                  <span className="carrito-contador">{totalItems}</span>
                )}
              </div>
            </button>

            <BotonUsuario
              sesionInicializada={sesionInicializada}
              usuario={usuario}
              menuUsuarioAbierto={menuUsuarioAbierto}
              setMenuUsuarioAbierto={setMenuUsuarioAbierto}
              esAdmin={esAdmin}
              obtenerNombreUsuario={obtenerNombreUsuario}
              navegarAAdmin={navegarAAdmin}
              navegarAProductosAdmin={navegarAProductosAdmin}
              navegarAAgregarProducto={navegarAAgregarProducto}
              navegarAPerfil={navegarAPerfil}
              navegarAFavoritos={navegarAFavoritos}
              manejarCerrarSesion={manejarCerrarSesion}
              onAbrirAutenticacion={() => setModalAutenticacionAbierto(true)}
            />
          </div>
        </div>
      </div>

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

      <NavDesktop
        departamentosAbierto={departamentosAbierto}
        setDepartamentosAbierto={setDepartamentosAbierto}
        homeLayoutAbierto={homeLayoutAbierto}
        setHomeLayoutAbierto={setHomeLayoutAbierto}
        productAbierto={productAbierto}
        setProductAbierto={setProductAbierto}
        categorias={categorias}
        cargandoCategorias={cargandoCategorias}
        obtenerIconoCategoria={obtenerIconoCategoria}
        paginasMenu={PAGINAS_MENU}
        productosMenu={productosMenu}
        manejarNavegacion={manejarNavegacion}
        hoverTimersRef={hoverTimersRef}
      />

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

      {!esPaginaProducto && (
        <div className={`navegacion-movil-inferior ${chatAbierto ? 'chat-abierto' : ''}`}>
          <button className="nav-movil-item" onClick={alternarMenuMovil}>
            <div className="nav-icono-contenedor"><Menu size={22} /></div>
            <span>Menú</span>
          </button>
          <button className="nav-movil-item" onClick={() => setModalBusquedaAbierto(true)}>
            <div className="nav-icono-contenedor"><Search size={22} /></div>
            <span>Buscar</span>
          </button>
          <Link to="/tienda" className="nav-movil-item nav-movil-destacado">
            <div className="nav-icono-contenedor-destacado"><Store size={24} /></div>
            <span>Tienda</span>
          </Link>
          <button className="nav-movil-item" onClick={alternarModal}>
            <div className="nav-icono-contenedor carrito-contenedor-movil">
              <ShoppingCart size={22} />
              {totalItems > 0 && <span className="notificacion-circulo">{totalItems}</span>}
            </div>
            <span>Carrito</span>
          </button>
          <Link to="/favoritos" className="nav-movil-item">
            <div className="nav-icono-contenedor"><Heart size={22} /></div>
            <span>Favoritos</span>
          </Link>
        </div>
      )}

      <ModalBusqueda abierto={modalBusquedaAbierto} onCerrar={() => setModalBusquedaAbierto(false)} />
      <ModalAutenticacionIsolado abierto={modalAutenticacionAbierto} onCerrar={() => setModalAutenticacionAbierto(false)} />
      <ModalCarrito abierto={modalAbierto} onCerrar={alternarModal} />

      {(modalBusquedaAbierto || menuMovilAbierto) && (
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
