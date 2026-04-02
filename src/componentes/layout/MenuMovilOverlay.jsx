import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  X,
  Home,
  Store,
  Search,
  LayoutGrid,
  ChevronDown,
  ChevronRight,
  Tag,
  Zap,
  UserCircle,
  Heart,
  ShoppingCart,
  Package
} from 'lucide-react'
import './MenuMovilOverlay.css'

// Componente: Overlay de menú móvil (rediseñado)
const MenuMovilOverlay = ({
  abierto,
  onCerrar,
  onAbrirBusqueda,
  categorias,
  cargandoCategorias,
  obtenerIconoCategoria,
  onNavegarCategoria,
  onAbrirAutenticacion,
  totalItems,
  onAlternarCarrito,
  sesionInicializada,
  usuario
}) => {
  const [categoriasAbiertas, setCategoriasAbiertas] = useState(true)

  // Bloquear scroll del body cuando el menú esté abierto
  useEffect(() => {
    if (abierto) {
      document.body.classList.add('menu-movil-abierto');
    } else {
      document.body.classList.remove('menu-movil-abierto');
    }

    // Cleanup: restaurar scroll cuando el componente se desmonte
    return () => {
      document.body.classList.remove('menu-movil-abierto');
    };
  }, [abierto]);

  const handleCartClick = () => {
    onAlternarCarrito && onAlternarCarrito()
    onCerrar && onCerrar()
  }

  return (
    <div className={`menu-movil-overlay ${abierto ? 'activo' : ''}`}>
      <div className="menu-movil-contenido overlay-panel">
        {/* Encabezado */}
        <div className="overlay-header">
          <div className="overlay-brand">
            <div className="overlay-logo">
              <span className="overlay-logo-text">MeLlevo</span>
              <span className="overlay-logo-accent">Esto</span>
            </div>
            <span className="overlay-tagline">Tu tienda online</span>
          </div>
          <button className="overlay-close" onClick={onCerrar}>
            <X size={20} />
          </button>
        </div>

        {/* Usuario / Login */}
        <div className="overlay-user">
          {sesionInicializada ? (
            <div className="overlay-user-row">
              <div className="overlay-avatar" aria-hidden="true">{usuario?.email?.[0]?.toUpperCase() || 'U'}</div>
              <div className="overlay-user-info">
                <span className="overlay-user-label">Bienvenido</span>
                <span className="overlay-user-name">{usuario?.email}</span>
              </div>
            </div>
          ) : (
            <button className="overlay-login-btn" onClick={onAbrirAutenticacion}>
              <UserCircle size={18} />
              <span>Bienvenido - Iniciar sesión</span>
            </button>
          )}
        </div>

        {/* Buscador */}
        <div className="overlay-search" onClick={onAbrirBusqueda} role="button" tabIndex={0}>
          <Search size={18} />
          <input
            type="text"
            className="overlay-search-input"
            placeholder="Buscar en la tienda..."
            readOnly
          />
        </div>

        <div className="overlay-body">
          {/* Sección Menú */}
          <div className="overlay-section">
            <div className="overlay-section-title">Menú</div>
            <Link to="/" className="overlay-item" onClick={onCerrar}>
              <Home size={20} />
              <span>Inicio</span>
              <ChevronRight className="overlay-item-chevron" size={16} />
            </Link>
            <Link to="/tienda" className="overlay-item" onClick={onCerrar}>
              <Store size={20} />
              <span>Tienda</span>
              <ChevronRight className="overlay-item-chevron" size={16} />
            </Link>
            {sesionInicializada && usuario && (
              <Link to="/perfil" className="overlay-item" onClick={onCerrar}>
                <UserCircle size={20} />
                <span>Mi Cuenta</span>
                <ChevronRight className="overlay-item-chevron" size={16} />
              </Link>
            )}
            <Link to="/favoritos" className="overlay-item" onClick={onCerrar}>
              <Heart size={20} />
              <span>Favoritos</span>
              <ChevronRight className="overlay-item-chevron" size={16} />
            </Link>
            <button className="overlay-item" onClick={handleCartClick}>
              <ShoppingCart size={20} />
              <span>Carrito</span>
              {totalItems > 0 && <span className="overlay-badge">{totalItems}</span>}
              <ChevronRight className="overlay-item-chevron" size={16} />
            </button>
          </div>

          {/* Sección Categorías */}
          <div className="overlay-section">
            <div
              className="overlay-section-header"
              onClick={() => setCategoriasAbiertas(!categoriasAbiertas)}
            >
              <div className="overlay-section-title with-icon">
                <LayoutGrid size={18} />
                <span>Categorías</span>
              </div>
              <ChevronDown
                size={18}
                className={`overlay-section-chevron ${categoriasAbiertas ? 'rotado' : ''}`}
              />
            </div>
            {categoriasAbiertas && (
              <div className="overlay-categories">
                {cargandoCategorias ? (
                  <div className="overlay-cat-item">
                    <Zap size={18} className="overlay-cat-icon" />
                    <div className="overlay-cat-info">
                      <span className="overlay-cat-name">Cargando...</span>
                    </div>
                  </div>
                ) : categorias && categorias.length > 0 ? (
                  categorias.map((categoria) => (
                    <button
                      key={categoria.id}
                      className="overlay-cat-item"
                      onClick={() => onNavegarCategoria && onNavegarCategoria(categoria)}
                    >
                      <div className="overlay-cat-icon">
                        {obtenerIconoCategoria ? obtenerIconoCategoria(categoria) : <Tag size={18} />}
                      </div>
                      <div className="overlay-cat-info">
                        <span className="overlay-cat-name">{categoria.nombre}</span>
                        <span className="overlay-cat-count">{categoria.cantidad} productos</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="overlay-cat-item">
                    <Tag size={18} className="overlay-cat-icon" />
                    <div className="overlay-cat-info">
                      <span className="overlay-cat-name">No hay categorías</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sección Información (solo páginas existentes para usuarios) */}
          <div className="overlay-section">
            <div className="overlay-section-title">Información</div>
            <Link to="/quienes-somos" className="overlay-item" onClick={onCerrar}>
              <Package size={20} />
              <span>Quiénes Somos</span>
              <ChevronRight className="overlay-item-chevron" size={16} />
            </Link>
            <Link to="/contacto" className="overlay-item" onClick={onCerrar}>
              <Package size={20} />
              <span>Contacto</span>
              <ChevronRight className="overlay-item-chevron" size={16} />
            </Link>
            <Link to="/preguntas-frecuentes" className="overlay-item" onClick={onCerrar}>
              <Package size={20} />
              <span>Preguntas Frecuentes</span>
              <ChevronRight className="overlay-item-chevron" size={16} />
            </Link>
            <Link to="/terminos-condiciones" className="overlay-item" onClick={onCerrar}>
              <Package size={20} />
              <span>Términos y Condiciones</span>
              <ChevronRight className="overlay-item-chevron" size={16} />
            </Link>
            <Link to="/politica-privacidad" className="overlay-item" onClick={onCerrar}>
              <Package size={20} />
              <span>Política de Privacidad</span>
              <ChevronRight className="overlay-item-chevron" size={16} />
            </Link>
            <Link to="/trabaja-con-nosotros" className="overlay-item" onClick={onCerrar}>
              <Package size={20} />
              <span>Trabaja con Nosotros</span>
              <ChevronRight className="overlay-item-chevron" size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MenuMovilOverlay