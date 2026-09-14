import React, { useState, useEffect, useRef } from 'react'
import './TestimoniosTemu.css'

const TestimoniosTemu = ({ 
  testimoniosData = null,
  mostrarAnimaciones = true,
  mostrarContador = true,
  producto = null
}) => {
  
  const [contadorClientes, setContadorClientes] = useState(0)
  const [testimonioActivo, setTestimonioActivo] = useState(null)
  const [mostrarTodos, setMostrarTodos] = useState(false)
  const sectionRef = useRef(null)
  
  // La sección sólo existe si el producto trae testimonios de verdad (columna `testimonios`).
  // Antes, cuando no había, se rellenaba con seis clientes inventados.
  const SIN_TESTIMONIOS: any = { titulo: '', subtitulo: '', estadisticas: null, testimonios: [] }

  // Normalizar estructura entrante
  const datos = (() => {
    if (!testimoniosData) return SIN_TESTIMONIOS

    // Si llega como array de testimonios
    if (Array.isArray(testimoniosData)) {
      return {
        titulo: 'Lo que dicen quienes ya lo tienen',
        subtitulo: '',
        estadisticas: null,
        testimonios: testimoniosData,
      }
    }

    // Si llega como objeto con diferentes claves
    if (typeof testimoniosData === 'object') {
      const base = { ...SIN_TESTIMONIOS }
      const arr = 
        Array.isArray(testimoniosData.testimonios) ? testimoniosData.testimonios :
        Array.isArray(testimoniosData.items) ? testimoniosData.items :
        []
      const estadisticas = testimoniosData.estadisticas || base.estadisticas || null
      return {
        titulo: testimoniosData.titulo || base.titulo,
        subtitulo: testimoniosData.subtitulo || base.subtitulo,
        estadisticas,
        testimonios: arr.length ? arr : base.testimonios
      }
    }

    return testimoniosFicticios
  })()

  useEffect(() => {
    if (!mostrarContador) return
    
    let inicio = 0
    const final = (datos?.estadisticas?.totalClientes ?? 0)
    const duracion = 2000
    const incremento = final / (duracion / 16)
    
    const timer = setInterval(() => {
      inicio += incremento
      if (inicio >= final) {
        setContadorClientes(final)
        clearInterval(timer)
      } else {
        setContadorClientes(Math.floor(inicio))
      }
    }, 16)
    
    return () => clearInterval(timer)
  }, [mostrarContador, datos?.estadisticas?.totalClientes])

  useEffect(() => {
    if (!mostrarAnimaciones) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('temu-testimonials-ultra-item-visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const items = sectionRef.current?.querySelectorAll('.temu-testimonials-ultra-card')
    items?.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [mostrarAnimaciones])

  const formatearNumero = (numero) => {
    return numero.toLocaleString('es-CO')
  }

  const abrirTestimonio = (testimonio) => {
    setTestimonioActivo(testimonio)
  }

  const cerrarTestimonio = () => {
    setTestimonioActivo(null)
  }

  const toggleMostrarTodos = () => {
    setMostrarTodos(!mostrarTodos)
  }

  const testimoniosConImagenes = (Array.isArray(datos.testimonios) ? datos.testimonios : []).slice(0, 3).map((testimonio, index) => ({
    ...testimonio,
    imagen: producto?.imagenes?.[`imagen_testimonio_persona_${index + 1}`] || testimonio.imagen,
    imagenProducto: producto?.imagenes?.[`imagen_testimonio_producto_${index + 1}`] || testimonio.imagenProducto
  }))

  const testimoniosAMostrar = mostrarTodos ? testimoniosConImagenes : testimoniosConImagenes.slice(0, 3)

  // Mejor una ficha más corta que una llena de gente que nunca compró nada.
  if (!testimoniosAMostrar.length) return null

  return (
    <section className="temu-testimonials-ultra-section" ref={sectionRef}>
      
      <div className="temu-testimonials-ultra-header">
        
        <h2 className="temu-testimonials-ultra-titulo">
          {datos.titulo}
        </h2>
        
        <p className="temu-testimonials-ultra-subtitulo">
          {datos.subtitulo}
        </p>

        {datos.estadisticas ? (
        <div className="temu-testimonials-ultra-estadisticas">
          <div className="temu-testimonials-ultra-stat">
            <div className="temu-testimonials-ultra-stat-numero">
              +{formatearNumero(contadorClientes)}
            </div>
            <div className="temu-testimonials-ultra-stat-texto">
              Clientes Satisfechos
            </div>
          </div>
          
          <div className="temu-testimonials-ultra-stat">
            <div className="temu-testimonials-ultra-stat-numero">
              {datos.estadisticas.satisfaccion}⭐
            </div>
            <div className="temu-testimonials-ultra-stat-texto">
              Calificación Promedio
            </div>
          </div>
          
          <div className="temu-testimonials-ultra-stat">
            <div className="temu-testimonials-ultra-stat-numero">
              {datos.estadisticas.recomiendan}%
            </div>
            <div className="temu-testimonials-ultra-stat-texto">
              Lo Recomiendan
            </div>
          </div>
        </div>
        ) : null}
      </div>

      <div className="temu-testimonials-ultra-grid">
        {testimoniosAMostrar.map((testimonio, index) => (
          <div 
            key={testimonio.id}
            className="temu-testimonials-ultra-card"
            style={{ animationDelay: `${index * 0.1}s` }}
            onClick={() => abrirTestimonio(testimonio)}
          >
            
            <div className="temu-testimonials-ultra-card-header">
              <div className="temu-testimonials-ultra-avatar-wrapper">
                <img 
                  src={testimonio.imagen} 
                  alt={testimonio.nombre}
                  className="temu-testimonials-ultra-person-avatar"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {testimonio.verificado && (
                  <div className="temu-testimonials-ultra-verified-badge">
                    ✓
                  </div>
                )}
              </div>
              
              <div className="temu-testimonials-ultra-person-info">
                <h4 className="temu-testimonials-ultra-person-name">
                  {testimonio.nombre}
                </h4>
                <p className="temu-testimonials-ultra-person-location">
                  📍 {testimonio.ubicacion}
                </p>
                <div className="temu-testimonials-ultra-person-date">
                  {testimonio.fecha}
                </div>
              </div>

              <div className="temu-testimonials-ultra-rating-stars">
                {[...Array(testimonio.rating)].map((_, i) => (
                  <span key={i} className="temu-testimonials-ultra-star">⭐</span>
                ))}
              </div>
            </div>

            {testimonio.imagenProducto && (
              <div className="temu-testimonials-ultra-product-image-container">
                <img 
                  src={testimonio.imagenProducto} 
                  alt="Cliente usando el producto"
                  className="temu-testimonials-ultra-product-image"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div className="temu-testimonials-ultra-product-overlay">
                  <span className="temu-testimonials-ultra-zoom-icon">🔍</span>
                </div>
              </div>
            )}

            <div className="temu-testimonials-ultra-comment-section">
              <p className="temu-testimonials-ultra-comment-text">
                {testimonio.comentario}
              </p>
            </div>

            <div className="temu-testimonials-ultra-card-footer">
              {testimonio.compraVerificada && (
                <div className="temu-testimonials-ultra-verified-purchase">
                  ✅ Compra Verificada
                </div>
              )}
              
              <div className="temu-testimonials-ultra-likes-count">
                ❤️ {testimonio.likes} personas encontraron esto útil
              </div>
            </div>

          </div>
        ))}
      </div>

      {testimoniosConImagenes.length > 3 && (
        <div className="temu-testimonials-ultra-show-more">
          <button 
            className="temu-testimonials-ultra-show-more-button"
            onClick={toggleMostrarTodos}
          >
            {mostrarTodos ? '👆 Ver Menos Testimonios' : '👇 Ver Más Testimonios'}
          </button>
          <p className="temu-testimonials-ultra-show-more-text">
              {mostrarTodos 
                ? `Mostrando todos los ${testimoniosConImagenes.length} testimonios`
                : `Mostrando 3 de ${testimoniosConImagenes.length} testimonios`
              }
          </p>
        </div>
      )}

      {testimonioActivo && (
        <div className="temu-testimonials-ultra-modal" onClick={cerrarTestimonio}>
          <div className="temu-testimonials-ultra-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              className="temu-testimonials-ultra-modal-close"
              onClick={cerrarTestimonio}
            >
              ✕
            </button>
            
            <div className="temu-testimonials-ultra-modal-header">
              <img 
                src={testimonioActivo.imagen} 
                alt={testimonioActivo.nombre}
                className="temu-testimonials-ultra-modal-avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div>
                <h3>{testimonioActivo.nombre}</h3>
                <p>{testimonioActivo.ubicacion}</p>
                <div className="temu-testimonials-ultra-modal-rating">
                  {[...Array(testimonioActivo.rating)].map((_, i) => (
                    <span key={i}>⭐</span>
                  ))}
                </div>
              </div>
            </div>

            {testimonioActivo.imagenProducto && (
              <img 
                src={testimonioActivo.imagenProducto} 
                alt="Producto en uso"
                className="temu-testimonials-ultra-modal-image"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            )}

            <p className="temu-testimonials-ultra-modal-comment">
              "{testimonioActivo.comentario}"
            </p>
          </div>
        </div>
      )}

    </section>
  )
}

export default TestimoniosTemu

