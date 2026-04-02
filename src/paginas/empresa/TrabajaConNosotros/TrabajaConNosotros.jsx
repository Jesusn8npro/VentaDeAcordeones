import { useState } from 'react'
import { Users, Briefcase, Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'
import './TrabajaConNosotros.css'

export default function TrabajaConNosotros() {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    cargo: '',
    experiencia: '',
    mensaje: ''
  })
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const oportunidades = [
    {
      cargo: 'Especialista en Ventas',
      tipo: 'Tiempo completo',
      descripcion: 'Gestión de clientes y cierre de ventas en productos digitales.'
    },
    {
      cargo: 'Atención al Cliente',
      tipo: 'Tiempo completo',
      descripcion: 'Soporte y asesoría a clientes con excelencia en servicio.'
    },
    {
      cargo: 'Marketing Digital',
      tipo: 'Medio tiempo',
      descripcion: 'Gestión de campañas digitales y estrategias de crecimiento.'
    }
  ]

  const beneficios = [
    'Trabajo remoto flexible',
    'Crecimiento profesional',
    'Ambiente colaborativo',
    'Capacitación continua',
    'Compensación competitiva'
  ]

  const manejarCambio = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const manejarEnvio = async (e) => {
    e.preventDefault()
    setEnviando(true)
    
    // Simular envío
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setEnviado(true)
    setEnviando(false)
    setFormData({ 
      nombre: '', 
      email: '', 
      telefono: '', 
      cargo: '', 
      experiencia: '', 
      mensaje: ''
    })
  }

  return (
    <div className="trabaja-minimal">
      <div className="trabaja-container">
        {/* Hero Section */}
        <section className="trabaja-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              Trabaja con <span className="hero-highlight">Nosotros</span>
            </h1>
            <p className="hero-subtitle">
              Únete a un equipo dinámico y en crecimiento. 
              Buscamos talento apasionado por el servicio y la excelencia.
            </p>
          </div>
        </section>

        {/* Oportunidades */}
        <section className="oportunidades-section">
          <div className="section-header">
            <h2 className="section-title">Oportunidades Actuales</h2>
            <p className="section-subtitle">Posiciones disponibles en nuestro equipo</p>
          </div>
          <div className="oportunidades-grid">
            {oportunidades.map((oportunidad, index) => (
              <div key={index} className="oportunidad-card">
                <div className="oportunidad-header">
                  <h3 className="oportunidad-cargo">{oportunidad.cargo}</h3>
                  <span className="oportunidad-tipo">{oportunidad.tipo}</span>
                </div>
                <p className="oportunidad-descripcion">{oportunidad.descripcion}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Beneficios */}
        <section className="beneficios-section">
          <div className="section-header">
            <h2 className="section-title">Por qué Unirte</h2>
            <p className="section-subtitle">Lo que ofrecemos a nuestro equipo</p>
          </div>
          <div className="beneficios-grid">
            {beneficios.map((beneficio, index) => (
              <div key={index} className="beneficio-item">
                <CheckCircle className="beneficio-icon" size={20} />
                <span className="beneficio-text">{beneficio}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Formulario */}
        <section className="formulario-section">
          <div className="formulario-container">
            <div className="formulario-header">
              <h2 className="section-title">Aplica Ahora</h2>
              <p className="section-subtitle">Completa el formulario y nos pondremos en contacto</p>
            </div>
            
            {enviado ? (
              <div className="mensaje-exito">
                <CheckCircle className="exito-icon" size={48} />
                <h3>¡Gracias por tu interés!</h3>
                <p>Hemos recibido tu aplicación. Nos pondremos en contacto contigo pronto.</p>
              </div>
            ) : (
              <form className="trabaja-form" onSubmit={manejarEnvio}>
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="nombre">Nombre Completo</label>
                    <input
                      type="text"
                      id="nombre"
                      name="nombre"
                      value={formData.nombre}
                      onChange={manejarCambio}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email">Correo Electrónico</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={manejarCambio}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="telefono">Teléfono</label>
                    <input
                      type="tel"
                      id="telefono"
                      name="telefono"
                      value={formData.telefono}
                      onChange={manejarCambio}
                      required
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="cargo">Cargo de Interés</label>
                    <select
                      id="cargo"
                      name="cargo"
                      value={formData.cargo}
                      onChange={manejarCambio}
                      required
                      className="form-input"
                    >
                      <option value="">Selecciona un cargo</option>
                      {oportunidades.map((op, index) => (
                        <option key={index} value={op.cargo}>{op.cargo}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="experiencia">Experiencia Laboral</label>
                  <textarea
                    id="experiencia"
                    name="experiencia"
                    value={formData.experiencia}
                    onChange={manejarCambio}
                    required
                    rows="4"
                    className="form-textarea"
                    placeholder="Describe tu experiencia laboral relevante..."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="mensaje">Mensaje Adicional</label>
                  <textarea
                    id="mensaje"
                    name="mensaje"
                    value={formData.mensaje}
                    onChange={manejarCambio}
                    rows="3"
                    className="form-textarea"
                    placeholder="Cuéntanos por qué quieres unirte a nuestro equipo..."
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={enviando}
                >
                  {enviando ? (
                    <>
                      <div className="spinner"></div>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Enviar Aplicación
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Contacto */}
        <section className="contacto-section">
          <div className="contacto-card">
            <h2 className="contacto-title">¿Tienes Preguntas?</h2>
            <p className="contacto-text">
              Estamos aquí para aclarar cualquier duda sobre las oportunidades laborales.
            </p>
            <div className="contacto-info">
              <div className="contacto-item">
                <Phone size={20} />
                <span>WhatsApp: +57 321 489 2176</span>
              </div>
              <div className="contacto-item">
                <Mail size={20} />
                <span>talento@mellevolesto.com</span>
              </div>
              <div className="contacto-item">
                <MapPin size={20} />
                <span>Bogotá, Colombia</span>
              </div>
            </div>
            <a 
              href="https://wa.me/573214892176" 
              className="whatsapp-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Phone size={20} />
              Contactar por WhatsApp
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}










