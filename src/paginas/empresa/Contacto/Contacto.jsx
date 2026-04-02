import React, { useState } from 'react'
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from 'lucide-react'
import './Contacto.css'

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    asunto: '',
    mensaje: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aquí iría la lógica de envío del formulario
    console.log('Formulario enviado:', formData)
    alert('Gracias por contactarnos. Te responderemos pronto.')
    setFormData({ nombre: '', email: '', asunto: '', mensaje: '' })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="contacto-minimal">
      <div className="contacto-container">
        {/* Header */}
        <div className="contacto-header">
          <h1 className="contacto-title">Contacto</h1>
          <p className="contacto-subtitle">
            Estamos aquí para ayudarte. Contáctanos por tu medio preferido.
          </p>
        </div>

        <div className="contacto-content">
          {/* Información de contacto */}
          <div className="info-section">
            <h2 className="section-title">Información de contacto</h2>
            
            <div className="info-grid">
              <div className="info-item">
                <div className="info-icon">
                  <MessageCircle size={24} />
                </div>
                <div className="info-content">
                  <h3>WhatsApp</h3>
                  <a href="https://wa.me/573214892176" className="info-link">
                    +57 321 489 2176
                  </a>
                  <p className="info-detail">Respuesta inmediata</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Mail size={24} />
                </div>
                <div className="info-content">
                  <h3>Correo electrónico</h3>
                  <a href="mailto:hola@mellevoesto.com" className="info-link">
                    hola@mellevoesto.com
                  </a>
                  <p className="info-detail">Respondemos en 24h</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Phone size={24} />
                </div>
                <div className="info-content">
                  <h3>Teléfono</h3>
                  <a href="tel:+573214892176" className="info-link">
                    +57 321 489 2176
                  </a>
                  <p className="info-detail">Lunes a viernes</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <Clock size={24} />
                </div>
                <div className="info-content">
                  <h3>Horario de atención</h3>
                  <p className="info-text">Lunes a viernes</p>
                  <p className="info-detail">8:00 AM - 6:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de contacto */}
          <div className="form-section">
            <h2 className="section-title">Envíanos un mensaje</h2>
            
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-group">
                <label htmlFor="nombre">Nombre completo</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="Tu nombre"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="tu@email.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="asunto">Asunto</label>
                <input
                  type="text"
                  id="asunto"
                  name="asunto"
                  value={formData.asunto}
                  onChange={handleChange}
                  required
                  className="form-input"
                  placeholder="¿Cómo podemos ayudarte?"
                />
              </div>

              <div className="form-group">
                <label htmlFor="mensaje">Mensaje</label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  value={formData.mensaje}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="form-textarea"
                  placeholder="Cuéntanos más..."
                />
              </div>

              <button type="submit" className="submit-button">
                <Send size={18} />
                Enviar mensaje
              </button>
            </form>
          </div>
        </div>

        {/* WhatsApp destacado */}
        <div className="whatsapp-destacado">
          <div className="whatsapp-content">
            <MessageCircle size={32} className="whatsapp-icon" />
            <div className="whatsapp-text">
              <h3>¿Necesitas ayuda inmediata?</h3>
              <p>Escríbenos por WhatsApp para una respuesta instantánea</p>
            </div>
            <a 
              href="https://wa.me/573214892176" 
              target="_blank" 
              rel="noopener noreferrer"
              className="whatsapp-button"
            >
              <MessageCircle size={20} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Contacto