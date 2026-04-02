import React, { useState, useEffect, useRef } from 'react'
import './FAQTemu.css'

/**
 * FAQTemu - Sección FAQ estilo dropshipping
 * 
 * Características:
 * - Acordeón simple y funcional
 * - Preguntas que eliminan objeciones
 * - Respuestas convincentes
 * - Diseño limpio sin sobrecargar
 */

const FAQTemu = ({ 
  faqData = null,
  mostrarAnimaciones = true 
}) => {
  
  const [preguntaAbierta, setPreguntaAbierta] = useState(null)
  const sectionRef = useRef(null)
  
  // Datos por defecto - Preguntas que eliminan objeciones
  const datosDefecto = {
    titulo: "Preguntas Frecuentes",
    subtitulo: "Resolvemos todas tus dudas para que compres con total confianza",
    preguntas: [
      {
        id: 1,
        pregunta: "¿Realmente funciona como prometen?",
        respuesta: "¡Absolutamente! Más de 15.000 clientes satisfechos lo confirman. Ofrecemos garantía total de 2 años. Si no funciona como prometemos, te devolvemos el 100% de tu dinero sin preguntas."
      },
      {
        id: 2,
        pregunta: "¿Cuánto tiempo tarda en llegar?",
        respuesta: "Enviamos desde Colombia en 24-48 horas GRATIS. No esperarás semanas como con otros proveedores. Envío express incluido sin costo adicional."
      },
      {
        id: 3,
        pregunta: "¿Es seguro comprar aquí?",
        respuesta: "100% seguro. Puedes pagar contraentrega (pagas cuando recibes). También aceptamos tarjetas con protección total. Somos una empresa registrada con miles de clientes satisfechos."
      },
      {
        id: 4,
        pregunta: "¿Qué pasa si no me gusta?",
        respuesta: "Tienes 30 días para probarlo. Si no estás completamente satisfecho, te devolvemos todo tu dinero. Sin complicaciones, sin preguntas. Tu satisfacción es nuestra prioridad."
      },
      {
        id: 5,
        pregunta: "¿Por qué es tan barato comparado con tiendas?",
        respuesta: "Vendemos directo de fábrica, sin intermediarios. Las tiendas físicas tienen costos enormes (alquiler, empleados, etc.) que tú pagas. Nosotros te damos el precio real."
      },
      {
        id: 6,
        pregunta: "¿Tienen soporte si necesito ayuda?",
        respuesta: "¡Por supuesto! Soporte 24/7 en español por WhatsApp, email y teléfono. Nuestro equipo está aquí para ayudarte antes, durante y después de tu compra."
      }
    ]
  }

  // Normalizar estructura: aceptar array directo o objeto con preguntas/items
  const datos = (() => {
    if (!faqData) return datosDefecto
    if (Array.isArray(faqData)) {
      return { ...datosDefecto, preguntas: faqData }
    }
    if (typeof faqData === 'object') {
      const arr = Array.isArray(faqData.preguntas)
        ? faqData.preguntas
        : Array.isArray(faqData.items)
          ? faqData.items
          : []
      return {
        titulo: faqData.titulo || datosDefecto.titulo,
        subtitulo: faqData.subtitulo || datosDefecto.subtitulo,
        preguntas: arr.length ? arr : datosDefecto.preguntas
      }
    }
    return datosDefecto
  })()

  // Animaciones al hacer scroll
  useEffect(() => {
    if (!mostrarAnimaciones) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('faq-temu-item-visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const items = sectionRef.current?.querySelectorAll('.faq-temu-item')
    items?.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [mostrarAnimaciones])

  const togglePregunta = (id) => {
    setPreguntaAbierta(preguntaAbierta === id ? null : id)
  }

  return (
    <section className="faq-temu-seccion" ref={sectionRef}>
      
      {/* HEADER */}
      <div className="faq-temu-header">
        <h2 className="faq-temu-titulo">
          {datos.titulo}
        </h2>
        <p className="faq-temu-subtitulo">
          {datos.subtitulo}
        </p>
      </div>

      {/* LISTA DE PREGUNTAS */}
      <div className="faq-temu-contenedor">
        {(Array.isArray(datos.preguntas) ? datos.preguntas : []).map((item, index) => (
          <div 
            key={item.id || index}
            className="faq-temu-item"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <button 
              className={`faq-temu-pregunta ${preguntaAbierta === (item.id || index) ? 'faq-temu-abierta' : ''}`}
              onClick={() => togglePregunta(item.id || index)}
            >
              <span className="faq-temu-pregunta-texto">
                {item.pregunta}
              </span>
              <span className="faq-temu-icono">
                {preguntaAbierta === (item.id || index) ? '−' : '+'}
              </span>
            </button>
            
            <div className={`faq-temu-respuesta ${preguntaAbierta === (item.id || index) ? 'faq-temu-respuesta-abierta' : ''}`}>
              <div className="faq-temu-respuesta-contenido">
                <p>{item.respuesta}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  )
}

export default FAQTemu

