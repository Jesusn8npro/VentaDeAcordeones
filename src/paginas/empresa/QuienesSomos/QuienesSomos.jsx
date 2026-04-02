import { Link } from 'react-router-dom'
import { Phone, Mail, MapPin, Users, Award, Heart, Star, ShieldCheck, ShoppingBag } from 'lucide-react'
import './QuienesSomos.css'

export default function QuienesSomos() {
  const valores = [
    { icono: Users, titulo: 'Compromiso', descripcion: 'Atención personalizada y servicio excepcional en cada compra.' },
    { icono: Award, titulo: 'Calidad', descripcion: 'Seleccionamos productos con altos estándares y garantía real.' },
    { icono: Heart, titulo: 'Pasión', descripcion: 'Vivimos el e-commerce y trabajamos para superar expectativas.' },
  ]

  const equipo = [
    { nombre: 'Equipo Fundador', rol: 'Visión y Estrategia', descripcion: 'Experiencia en comercio digital y servicio al cliente.' },
    { nombre: 'Equipo de Ventas', rol: 'Atención Personalizada', descripcion: 'Consultores que te acompañan a elegir mejor.' },
    { nombre: 'Equipo de Soporte', rol: 'Soporte 24/7', descripcion: 'Resolución ágil de dudas e incidencias.' },
  ]

  const stats = [
    { label: 'Clientes felices', value: '50k+' },
    { label: 'Productos evaluados', value: '2k+' },
    { label: 'Tasa de satisfacción', value: '98%' },
    { label: 'Entregas a tiempo', value: '99%' },
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
            Somos <span>Me Llevo Esto</span>
          </h1>
          <p className="luxAbout-subtitle">
            Una plataforma que combina producto, servicio y experiencia para que comprar online sea impecable.
          </p>

          <div className="luxAbout-cta">
            <Link to="/tienda" className="luxAbout-btn luxAbout-btn-primary">
              <ShoppingBag size={18} /> Ver Tienda
            </Link>
            <a href="https://wa.me/573214892176" target="_blank" rel="noopener noreferrer" className="luxAbout-btn luxAbout-btn-secondary">
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
            <p>Construimos una experiencia de compra confiable y memorable.</p>
          </div>
          <div className="luxAbout-story-grid">
            <div className="luxAbout-story-card">
              <h3>Inicio</h3>
              <p>Nacimos con la misión de ofrecer productos de calidad con un servicio que realmente acompaña.</p>
            </div>
            <div className="luxAbout-story-card">
              <h3>Crecer con propósito</h3>
              <p>Mejoramos los procesos de selección, envío y soporte para elevar el estándar del e-commerce.</p>
            </div>
            <div className="luxAbout-story-card">
              <h3>Hoy</h3>
              <p>Somos una plataforma que cuida cada detalle para que tu compra sea impecable.</p>
            </div>
          </div>
        </section>

        {/* Equipo */}
        <section className="luxAbout-team">
          <div className="luxAbout-section-head">
            <Users size={20} />
            <h2>Nuestro equipo</h2>
            <p>Personas comprometidas con tu satisfacción.</p>
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
            <p>Estamos aquí para ayudarte. Escríbenos o visita la tienda.</p>
            <div className="luxAbout-contact-info">
              <div className="luxAbout-contact-item"><Phone size={18} /> +57 321 489 2176</div>
              <div className="luxAbout-contact-item"><Mail size={18} /> info@mellevoesto.com</div>
              <div className="luxAbout-contact-item"><MapPin size={18} /> Bogotá, Colombia</div>
            </div>
            <div className="luxAbout-contact-actions">
              <a href="https://wa.me/573214892176" target="_blank" rel="noopener noreferrer" className="luxAbout-btn luxAbout-btn-primary">
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