import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Users, Award, Heart, Star, ShieldCheck, ShoppingBag } from 'lucide-react'
import { useTituloPagina } from '../../../hooks/useTitulosPagina'
import './QuienesSomos.css'

export default function QuienesSomos() {
  useTituloPagina('Quiénes Somos')
  const valores = [
    { icono: Award, titulo: 'Experiencia musical', descripcion: 'Conocemos cada instrumento que vendemos. Somos músicos y apasionados por el acordeón.' },
    { icono: Users, titulo: 'Asesoría experta', descripcion: 'Te guiamos en tu elección por WhatsApp antes de comprar, sin compromiso.' },
    { icono: ShieldCheck, titulo: 'Garantía real', descripcion: 'Garantía de 6 meses en acordeones nuevos contra defectos de fábrica.' },
    { icono: Heart, titulo: 'Envío seguro', descripcion: 'Empaque especializado y envío por SERVIENTREGA a toda Colombia.' },
  ]

  const equipo = [
    { nombre: 'Equipo de Asesoría', rol: 'Conocimiento musical', descripcion: 'Te ayudamos a elegir el acordeón ideal según tu nivel y estilo.' },
    { nombre: 'Equipo de Ventas', rol: 'Atención personalizada', descripcion: 'Consúltanos por WhatsApp, email o formulario de contacto.' },
    { nombre: 'Equipo de Logística', rol: 'Envíos a Colombia', descripcion: 'Despachamos tu pedido de forma segura a cualquier municipio.' },
  ]

  const stats = [
    { label: 'Acordeones vendidos', value: '500+' },
    { label: 'Años de experiencia', value: '10+' },
    { label: 'Satisfacción garantizada', value: '100%' },
    { label: 'Envíos a toda Colombia', value: '✓' },
  ]

  return (
    <section className="luxAbout">
      <div className="luxAbout-container">
        {/* Hero premium */}
        <header className="luxAbout-hero">
          <div className="luxAbout-badge">
            <ShieldCheck size={18} />
            <span>Garantía y confianza</span>
          </div>
          <h1 className="luxAbout-title">
            Somos <span>VentaDeAcordeones.com</span>
          </h1>
          <p className="luxAbout-subtitle">
            La tienda online líder en acordeones de Colombia. Más de 10 años conectando músicos con sus instrumentos ideales.
          </p>

          <div className="luxAbout-cta">
            <Link to="/tienda" className="luxAbout-btn luxAbout-btn-primary">
              <ShoppingBag size={18} /> Ver Tienda
            </Link>
            <a href="https://wa.me/573208492093" target="_blank" rel="noopener noreferrer" className="luxAbout-btn luxAbout-btn-secondary">
              <Phone size={18} /> WhatsApp
            </a>
          </div>
        </header>

        {/* Métricas */}
        <section className="luxAbout-stats">
          {stats.map((s, i) => (
            <div key={i} className="luxAbout-stat-card">
              <div className="luxAbout-stat-value">{s.value}</div>
              <div className="luxAbout-stat-label">{s.label}</div>
            </div>
          ))}
        </section>

        {/* Valores */}
        <section className="luxAbout-values">
          <div className="luxAbout-section-head">
            <Star size={20} />
            <h2>Nuestros valores</h2>
            <p>Principios que guían nuestro trabajo y decisiones.</p>
          </div>
          <div className="luxAbout-values-grid">
            {valores.map((valor, index) => {
              const Icon = valor.icono
              return (
                <div key={index} className="luxAbout-value-card">
                  <div className="luxAbout-value-icon"><Icon size={28} /></div>
                  <h3 className="luxAbout-value-title">{valor.titulo}</h3>
                  <p className="luxAbout-value-desc">{valor.descripcion}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Historia */}
        <section className="luxAbout-story">
          <div className="luxAbout-section-head">
            <ShieldCheck size={20} />
            <h2>Nuestra historia</h2>
            <p>Más de 10 años vendiendo acordeones en Colombia.</p>
          </div>
          <div className="luxAbout-story-grid">
            <div className="luxAbout-story-card">
              <h3>2014 — Los comienzos</h3>
              <p>Empezamos vendiendo acordeones diatónicos de segunda mano, conectando músicos con instrumentos de calidad a precios justos.</p>
            </div>
            <div className="luxAbout-story-card">
              <h3>Crecimiento</h3>
              <p>Ampliamos el catálogo con acordeones nuevos de Hohner, Gabbanelli, Guerrini y más marcas reconocidas.</p>
            </div>
            <div className="luxAbout-story-card">
              <h3>Hoy</h3>
              <p>Somos una de las tiendas online más completas de Colombia, con acordeones para principiantes hasta profesionales.</p>
            </div>
          </div>
        </section>

        {/* Equipo */}
        <section className="luxAbout-team">
          <div className="luxAbout-section-head">
            <Users size={20} />
            <h2>Nuestro equipo</h2>
            <p>Apasionados por la música y el servicio al cliente.</p>
          </div>
          <div className="luxAbout-team-grid">
            {equipo.map((miembro, index) => (
              <div key={index} className="luxAbout-team-card">
                <h3 className="luxAbout-team-name">{miembro.nombre}</h3>
                <p className="luxAbout-team-role">{miembro.rol}</p>
                <p className="luxAbout-team-desc">{miembro.descripcion}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section className="luxAbout-contact">
          <div className="luxAbout-contact-card">
            <h2>¿Listo para comenzar?</h2>
            <p>Estamos aquí para ayudarte. Escríbenos antes de comprar.</p>
            <div className="luxAbout-contact-info">
              <div className="luxAbout-contact-item"><Phone size={18} /> +57 320 849 2093</div>
              <div className="luxAbout-contact-item"><Mail size={18} /> acordeon91@gmail.com</div>
              <div className="luxAbout-contact-item"><MapPin size={18} /> Colombia — envíos nacionales</div>
            </div>
            <div className="luxAbout-contact-actions">
              <a href="https://wa.me/573208492093" target="_blank" rel="noopener noreferrer" className="luxAbout-btn luxAbout-btn-primary">
                <Phone size={18} /> WhatsApp
              </a>
              <Link to="/tienda" className="luxAbout-btn luxAbout-btn-secondary">
                <ShoppingBag size={18} /> Ver Tienda
              </Link>
            </div>
          </div>
        </section>
      </div>
    </section>
  )
}