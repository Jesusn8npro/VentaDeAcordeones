import { Link } from 'react-router-dom'
import {
  Home,
  ArrowLeft,
  MessageCircle,
  ShoppingBag,
  ArrowRight,
  Star,
  Compass,
} from 'lucide-react'
import './PaginaNoEncontrada.css'

export default function PaginaNoEncontrada() {
  return (
    <section className="lux404">
      <div className="lux404-container">
        {/* Encabezado premium */}
        <div className="lux404-header">
          <div className="lux404-badge">
            <Star className="lux404-badge-icon" size={18} />
            <span>Experiencia Premium</span>
          </div>
          <div className="lux404-code">404</div>
          <h1 className="lux404-title">Página no encontrada</h1>
          <p className="lux404-subtitle">
            La URL que intentaste abrir no existe o fue movida. Regresemos al lugar correcto.
          </p>
        </div>

        {/* CTA principal hacia Tienda */}
        <div className="lux404-actions">
          <Link to="/tienda" className="lux404-btn lux404-btn-primary">
            <ShoppingBag size={18} />
            <span>Ir a la tienda</span>
            <ArrowRight size={18} className="lux404-btn-icon" />
          </Link>
          <Link to="/" className="lux404-btn lux404-btn-secondary">
            <Home size={18} />
            <span>Volver al inicio</span>
          </Link>
          <button className="lux404-btn lux404-btn-tertiary" onClick={() => window.history.back()}>
            <ArrowLeft size={18} />
            <span>Página anterior</span>
          </button>
        </div>

        {/* Sugerencias y atajos */}
        <div className="lux404-suggestions">
          <div className="lux404-card">
            <div className="lux404-card-icon">
              <Compass size={22} />
            </div>
            <div className="lux404-card-content">
              <h3>Explorar categorías</h3>
              <p>Descubre nuestros productos organizados por categorías.</p>
            </div>
            <Link to="/tienda" className="lux404-card-link">
              Ver catálogo <ArrowRight size={16} />
            </Link>
          </div>

          <div className="lux404-card">
            <div className="lux404-card-icon">
              <Star size={22} />
            </div>
            <div className="lux404-card-content">
              <h3>Ofertas y destacados</h3>
              <p>Aprovecha descuentos y productos recomendados.</p>
            </div>
            <Link to="/ofertas" className="lux404-card-link">
              Ver ofertas <ArrowRight size={16} />
            </Link>
          </div>

          <div className="lux404-card">
            <div className="lux404-card-icon">
              <MessageCircle size={22} />
            </div>
            <div className="lux404-card-content">
              <h3>¿Necesitas ayuda?</h3>
              <p>Escríbenos por WhatsApp y te orientamos.</p>
            </div>
            <a
              href="https://wa.me/573214892176"
              target="_blank"
              rel="noopener noreferrer"
              className="lux404-card-link"
            >
              Abrir WhatsApp <ArrowRight size={16} />
            </a>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="lux404-contact">
          <MessageCircle size={18} />
          <span>¿Dudas? Escríbenos al </span>
          <a
            href="https://wa.me/573214892176"
            target="_blank"
            rel="noopener noreferrer"
            className="lux404-contact-link"
          >
            +57 321 489 2176
          </a>
        </div>
      </div>
    </section>
  )
}
