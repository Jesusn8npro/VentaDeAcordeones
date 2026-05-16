import React from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, PhoneCall, ShoppingCart, Package, Truck, ShieldCheck, Info } from 'lucide-react'
import './Ayuda.css'

export default function Ayuda() {
  const categorias = [
    { nombre: 'Electrónica', ruta: '/tienda/categoria/electronica' },
    { nombre: 'Ropa', ruta: '/tienda/categoria/ropa' },
    { nombre: 'Hogar', ruta: '/tienda/categoria/hogar' },
    { nombre: 'Deportes', ruta: '/tienda/categoria/deportes' },
    { nombre: 'Ofertas', ruta: '/ofertas' }
  ]

  const enlacesRapidos = [
    { nombre: 'Carrito', ruta: '/carrito', icono: <ShoppingCart size={18} /> },
    { nombre: 'Favoritos', ruta: '/favoritos', icono: <Package size={18} /> },
    { nombre: 'Tienda', ruta: '/tienda', icono: <Package size={18} /> },
    { nombre: 'Preguntas Frecuentes', ruta: '/preguntas-frecuentes', icono: <Info size={18} /> },
  ]

  return (
    <div className="helpLux-container">
      {/* Hero */}
      <section className="helpLux-hero">
        <div className="helpLux-hero-content">
          <HelpCircle className="helpLux-hero-icon" size={40} />
          <h1 className="helpLux-hero-title">Centro de Ayuda</h1>
          <p className="helpLux-hero-subtitle">
            Encuentra respuestas rápidas, guía de compras y soporte. Estamos aquí para ayudarte.
          </p>
          <div className="helpLux-cta">
            <Link to="/tienda" className="helpLux-btn-primary">Ver productos</Link>
            <Link to="/preguntas-frecuentes" className="helpLux-btn-secondary">Preguntas frecuentes</Link>
          </div>
        </div>
      </section>

      {/* Enlaces a Categorías */}
      <section className="helpLux-categories">
        <h2 className="helpLux-section-title">Explora por categorías</h2>
        <div className="helpLux-category-grid">
          {categorias.map((cat) => (
            <Link key={cat.nombre} to={cat.ruta} className="helpLux-category-card">
              <span className="helpLux-category-name">{cat.nombre}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Guías y soporte */}
      <section className="helpLux-guides">
        <div className="helpLux-guide-card">
          <Truck className="helpLux-guide-icon" />
          <h3 className="helpLux-guide-title">Envíos y Entregas</h3>
          <p className="helpLux-guide-text">
            Información sobre tiempos de entrega, costos de envío y seguimiento de pedidos.
          </p>
          <Link to="/preguntas-frecuentes" className="helpLux-link">Ver detalles</Link>
        </div>
        <div className="helpLux-guide-card">
          <ShieldCheck className="helpLux-guide-icon" />
          <h3 className="helpLux-guide-title">Pagos y Seguridad</h3>
          <p className="helpLux-guide-text">
            Métodos de pago disponibles, seguridad de tus datos y políticas de reembolso.
          </p>
          <Link to="/terminos-condiciones" className="helpLux-link">Políticas</Link>
        </div>
        <div className="helpLux-guide-card">
          <Info className="helpLux-guide-icon" />
          <h3 className="helpLux-guide-title">Atención al Cliente</h3>
          <p className="helpLux-guide-text">
            ¿Necesitas ayuda? Escríbenos por WhatsApp o revisa nuestras preguntas frecuentes.
          </p>
          <a href="https://wa.me/573214892176" target="_blank" rel="noopener noreferrer" className="helpLux-link">WhatsApp</a>
        </div>
      </section>

      {/* Enlaces rápidos */}
      <section className="helpLux-quicklinks">
        <h2 className="helpLux-section-title">Acceso rápido</h2>
        <div className="helpLux-quick-grid">
          {enlacesRapidos.map((link) => (
            <Link key={link.nombre} to={link.ruta} className="helpLux-quick-card">
              <span className="helpLux-quick-icon">{link.icono}</span>
              <span className="helpLux-quick-text">{link.nombre}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Contacto directo */}
      <section className="helpLux-contact">
        <div className="helpLux-contact-card">
          <PhoneCall className="helpLux-contact-icon" />
          <div>
            <h3 className="helpLux-contact-title">¿Necesitas ayuda inmediata?</h3>
            <p className="helpLux-contact-text">Escríbenos por WhatsApp y te ayudamos al instante.</p>
          </div>
          <a href="https://wa.me/573214892176" target="_blank" rel="noopener noreferrer" className="helpLux-btn-primary">Contactar ahora</a>
        </div>
      </section>
    </div>
  )
}