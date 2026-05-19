import Link from 'next/link'
import { Phone, Mail, Clock, Truck, MessageCircle, ShieldCheck, CreditCard, Music, Package, Wrench } from 'lucide-react'
import { useTituloPagina } from '../../../hooks/useTitulosPagina'
import './SobreLaTienda.css'

export default function SobreLaTienda() {
  useTituloPagina('Sobre la Tienda')
  return (
    <div className="slt">

      {/* Hero */}
      <section className="slt-hero">
        <div className="slt-hero-overlay" />
        <div className="slt-hero-content">
          <span className="slt-hero-badge">Tienda online desde 2014</span>
          <h1 className="slt-hero-title">Más de 10 años llevando la música<br />vallenata a tu hogar</h1>
          <p className="slt-hero-sub">Somos la tienda online líder en acordeones de Colombia.<br />Desde principiantes hasta profesionales, tenemos el instrumento ideal para ti.</p>
          <div className="slt-hero-actions">
            <Link href="/tienda" className="slt-btn slt-btn-primary">Ver catálogo</Link>
            <a href="https://wa.me/573208492093" target="_blank" rel="noopener noreferrer" className="slt-btn slt-btn-ghost">
              <MessageCircle size={18} /> WhatsApp
            </a>
          </div>
        </div>
      </section>

      <div className="slt-container">

        {/* Historia */}
        <section className="slt-section">
          <div className="slt-section-label">Nuestra historia</div>
          <h2 className="slt-section-title">Fundados en 2014 en Colombia</h2>
          <div className="slt-historia-grid">
            <div className="slt-historia-card">
              <div className="slt-historia-year">2014</div>
              <h3>Los comienzos</h3>
              <p>Empezamos vendiendo acordeones diatónicos de segunda mano, conectando músicos con instrumentos de calidad a precios justos.</p>
            </div>
            <div className="slt-historia-card">
              <div className="slt-historia-year">2018</div>
              <h3>Crecimiento</h3>
              <p>Ampliamos nuestro catálogo con acordeones nuevos de las mejores marcas: Hohner, Gabbanelli, Guerrini y más.</p>
            </div>
            <div className="slt-historia-card">
              <div className="slt-historia-year">Hoy</div>
              <h3>Tienda completa</h3>
              <p>Somos una de las tiendas online más completas de Colombia, con acordeones para todos los niveles y accesorios especializados.</p>
            </div>
          </div>
        </section>

        {/* Qué vendemos */}
        <section className="slt-section slt-productos-section">
          <div className="slt-section-label">Nuestro catálogo</div>
          <h2 className="slt-section-title">Qué encontrarás en nuestra tienda</h2>
          <div className="slt-productos-grid">
            <div className="slt-producto-card">
              <div className="slt-producto-icon"><Music size={28} /></div>
              <h3>Acordeones diatónicos</h3>
              <p>Para vallenato y cumbia. La elección de los músicos colombianos. Botones en La, Sol, Re y más.</p>
            </div>
            <div className="slt-producto-card">
              <div className="slt-producto-icon"><Music size={28} /></div>
              <h3>Acordeones cromáticos</h3>
              <p>Versátiles y completos. Ideales para intérpretes que buscan mayor rango tonal.</p>
            </div>
            <div className="slt-producto-card">
              <div className="slt-producto-icon"><Music size={28} /></div>
              <h3>Acordeones de piano</h3>
              <p>Teclado clásico con bajo. Para músicos que vienen del piano o buscan otro sonido.</p>
            </div>
            <div className="slt-producto-card">
              <div className="slt-producto-icon"><Package size={28} /></div>
              <h3>Accesorios</h3>
              <p>Correas, estuches, fundas protectoras y micrófonos especiales para acordeón.</p>
            </div>
            <div className="slt-producto-card">
              <div className="slt-producto-icon"><Wrench size={28} /></div>
              <h3>Repuestos</h3>
              <p>Láminas, bajos, correas de cuero y repuestos originales para mantenimiento.</p>
            </div>
            <div className="slt-producto-card slt-marcas-card">
              <div className="slt-producto-icon"><ShieldCheck size={28} /></div>
              <h3>Marcas que manejamos</h3>
              <ul className="slt-marcas-lista">
                <li>Hohner</li>
                <li>Gabbanelli</li>
                <li>Guerrini</li>
                <li>Scandalli</li>
                <li>Pantera</li>
                <li>Rex</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Servicios */}
        <section className="slt-section">
          <div className="slt-section-label">Cómo te ayudamos</div>
          <h2 className="slt-section-title">Nuestros servicios</h2>
          <div className="slt-servicios-grid">
            <div className="slt-servicio-item">
              <div className="slt-servicio-icon"><Truck size={24} /></div>
              <div>
                <h3>Envío a toda Colombia</h3>
                <p>Despachamos por SERVIENTREGA a cualquier municipio del país. Empaque seguro garantizado.</p>
              </div>
            </div>
            <div className="slt-servicio-item">
              <div className="slt-servicio-icon"><MessageCircle size={24} /></div>
              <div>
                <h3>Asesoría gratuita por WhatsApp</h3>
                <p>Antes de comprar, cuéntanos tu nivel y estilo musical. Te recomendamos el acordeón ideal.</p>
              </div>
            </div>
            <div className="slt-servicio-item">
              <div className="slt-servicio-icon"><ShieldCheck size={24} /></div>
              <div>
                <h3>Garantía de 6 meses</h3>
                <p>Todos los acordeones nuevos incluyen garantía real de 6 meses contra defectos de fábrica.</p>
              </div>
            </div>
            <div className="slt-servicio-item">
              <div className="slt-servicio-icon"><CreditCard size={24} /></div>
              <div>
                <h3>Pago seguro con ePayco</h3>
                <p>Aceptamos tarjetas débito y crédito, PSE y efectivo (Efecty, Baloto). También contra-entrega.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Contacto */}
        <section className="slt-contacto">
          <div className="slt-contacto-card">
            <h2>Escríbenos antes de comprar</h2>
            <p>Te asesoramos sin compromiso. Nuestro equipo conoce cada instrumento que vendemos.</p>
            <div className="slt-contacto-datos">
              <a href="https://wa.me/573208492093" target="_blank" rel="noopener noreferrer" className="slt-contacto-item">
                <MessageCircle size={20} />
                <span>+57 320 849 2093</span>
              </a>
              <a href="mailto:acordeon91@gmail.com" className="slt-contacto-item">
                <Mail size={20} />
                <span>acordeon91@gmail.com</span>
              </a>
              <div className="slt-contacto-item">
                <Clock size={20} />
                <span>Lun – Sáb · 8am a 6pm</span>
              </div>
              <div className="slt-contacto-item">
                <Truck size={20} />
                <span>Envíos a toda Colombia</span>
              </div>
            </div>
            <div className="slt-contacto-actions">
              <a href="https://wa.me/573208492093" target="_blank" rel="noopener noreferrer" className="slt-btn slt-btn-primary">
                <Phone size={18} /> Contactar por WhatsApp
              </a>
              <Link href="/tienda" className="slt-btn slt-btn-outline">Ver tienda</Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
