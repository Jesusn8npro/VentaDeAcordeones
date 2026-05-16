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
  
  const testimoniosFicticios = {
    titulo: "¡+15.847 CLIENTES YA TRANSFORMARON SU VIDA!",
    subtitulo: "Lee lo que dicen nuestros clientes reales sobre su experiencia",
    estadisticas: {
      totalClientes: 15847,
      satisfaccion: 4.9,
      recomiendan: 98
    },
    testimonios: [
      {
        id: 1,
        nombre: "María González",
        ubicacion: "Bogotá, Colombia",
        rating: 5,
        fecha: "Hace 2 días",
        comentario: "¡INCREÍBLE! No puedo creer lo bien que funciona. En solo 3 días ya veo resultados. Mi familia está sorprendida. ¡100% recomendado!",
        imagen: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        imagenProducto: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
        verificado: true,
        compraVerificada: true,
        likes: 234
      },
      {
        id: 2,
        nombre: "Carlos Rodríguez",
        ubicacion: "Medellín, Colombia",
        rating: 5,
        fecha: "Hace 1 semana",
        comentario: "Excelente producto. Llevo 2 semanas usándolo y la diferencia es notable. Mi esposa dice que parezco otra persona. ¡Gracias!",
        imagen: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        imagenProducto: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
        verificado: true,
        compraVerificada: true,
        likes: 189
      },
      {
        id: 3,
        nombre: "Ana Martínez",
        ubicacion: "Cali, Colombia",
        rating: 5,
        fecha: "Hace 3 días",
        comentario: "¡Increíble! Esto cambió mi vida completamente. Antes sufría todos los días, ahora soy otra persona. Lo recomiendo completamente.",
        imagen: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        imagenProducto: "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=300&h=200&fit=crop",
        verificado: true,
        compraVerificada: true,
        likes: 312
      },
      {
        id: 4,
        nombre: "Javier Pérez",
        ubicacion: "Barranquilla, Colombia",
        rating: 5,
        fecha: "Hace 5 días",
        comentario: "Excelente producto. Pensé que era mentira pero funciona de verdad. Ya pedí 3 más para mi familia. ¡Recomendado!",
        imagen: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        imagenProducto: "https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=300&h=200&fit=crop",
        verificado: true,
        compraVerificada: true,
        likes: 278
      },
      {
        id: 5,
        nombre: "Lucía Ramírez",
        ubicacion: "Bucaramanga, Colombia",
        rating: 5,
        fecha: "Hace 1 día",
        comentario: "¡ESPECTACULAR! Mi vida cambió 180 grados. Todos me preguntan qué hice. El secreto es este producto. ¡Mil gracias!",
        imagen: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        imagenProducto: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=200&fit=crop",
        verificado: true,
        compraVerificada: true,
        likes: 445
      },
      {
        id: 6,
        nombre: "Roberto Silva",
        ubicacion: "Cartagena, Colombia",
        rating: 5,
        fecha: "Hace 4 días",
        comentario: "Excelente producto. No creía en estos productos pero este sí funciona. Ya llevo 1 mes y los resultados son impresionantes.",
        imagen: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        imagenProducto: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop",
        verificado: true,
        compraVerificada: true,
        likes: 356
      }
    ]
  }

  // Normalizar estructura entrante
  const datos = (() => {
    if (!testimoniosData) return testimoniosFicticios

    // Si llega como array de testimonios
    if (Array.isArray(testimoniosData)) {
      return {
        ...testimoniosFicticios,
        testimonios: testimoniosData
      }
    }

    // Si llega como objeto con diferentes claves
    if (typeof testimoniosData === 'object') {
      const base = { ...testimoniosFicticios }
      const arr = 
        Array.isArray(testimoniosData.testimonios) ? testimoniosData.testimonios :
        Array.isArray(testimoniosData.items) ? testimoniosData.items :
        []
      const estadisticas = testimoniosData.estadisticas || base.estadisticas || { totalClientes: 1000, satisfaccion: 4.8, recomiendan: 95 }
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
    const final = (datos?.estadisticas?.totalClientes ?? 1000)
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

  return (
    <section className="temu-testimonials-ultra-section" ref={sectionRef}>
      
      <div className="temu-testimonials-ultra-header">
        <div className="temu-testimonials-ultra-badge-viral">
          🔥 VIRAL EN REDES SOCIALES 🔥
        </div>
        
        <h2 className="temu-testimonials-ultra-titulo">
          {datos.titulo}
        </h2>
        
        <p className="temu-testimonials-ultra-subtitulo">
          {datos.subtitulo}
        </p>

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

