import React, { useState, useEffect, useRef } from 'react'
import './SeccionesFinalesTemu.css'

/**
 * FAQTemu - Sección FAQ estilo dropshipping
 *
 * Características:
 * - Acordeón simple y funcional
 * - Preguntas que eliminan objeciones
 * - Respuestas convincentes
 * - Diseño limpio sin sobrecargar
 */

export const FAQTemu = ({
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

/**
 * GarantiasTemu - Sección de garantías y confianza
 *
 * Características:
 * - Grid de garantías simple
 * - Iconos y textos convincentes
 * - Diseño limpio sin sobrecargar
 * - Genera confianza total
 */

export const GarantiasTemu = ({
  garantiasData = null,
  mostrarAnimaciones = true
}) => {

  const sectionRef = useRef(null)

  // Datos por defecto
  const datosDefecto = {
    titulo: "Compra con Total Confianza",
    subtitulo: "Tu satisfacción y seguridad son nuestra prioridad #1",
    garantias: [
      {
        id: 1,
        icono: "🛡️",
        titulo: "Garantía 2 Años",
        descripcion: "Si no funciona como prometemos, te devolvemos el 100% de tu dinero"
      },
      {
        id: 2,
        icono: "🚚",
        titulo: "Envío Gratis",
        descripcion: "Envío express gratuito en 24-48 horas a toda Colombia"
      },
      {
        id: 3,
        icono: "💳",
        titulo: "Pago Seguro",
        descripcion: "Paga contraentrega o con tarjeta. Transacciones 100% protegidas"
      }
    ]
  }

  // Normalizar estructura: aceptar array directo o objeto con garantias/items
  const datos = (() => {
    if (!garantiasData) return datosDefecto
    if (Array.isArray(garantiasData)) {
      return { ...datosDefecto, garantias: garantiasData }
    }
    if (typeof garantiasData === 'object') {
      const arr = Array.isArray(garantiasData.garantias)
        ? garantiasData.garantias
        : Array.isArray(garantiasData.items)
          ? garantiasData.items
          : []
      return {
        titulo: garantiasData.titulo || datosDefecto.titulo,
        subtitulo: garantiasData.subtitulo || datosDefecto.subtitulo,
        garantias: arr.length ? arr : datosDefecto.garantias
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
            entry.target.classList.add('garantias-temu-item-visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const items = sectionRef.current?.querySelectorAll('.garantias-temu-item')
    items?.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [mostrarAnimaciones])

  return (
    <section className="garantias-temu-seccion" ref={sectionRef}>

      {/* HEADER */}
      <div className="garantias-temu-header">
        <h2 className="garantias-temu-titulo">
          {datos.titulo}
        </h2>
        <p className="garantias-temu-subtitulo">
          {datos.subtitulo}
        </p>

        {/* IMAGEN ANIMADA DE CONFIANZA */}
        <div className="garantias-temu-imagen-animada">
          <img
            src="/images/Animacion imagen.webp"
            alt="Compra con total confianza"
            className="garantias-temu-animacion"
          />
        </div>
      </div>

      {/* GRID DE GARANTÍAS */}
      <div className="garantias-temu-grid">
        {(Array.isArray(datos.garantias) ? datos.garantias : []).map((garantia, index) => (
          <div
            key={garantia.id || index}
            className="garantias-temu-item"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="garantias-temu-icono">
              {garantia.icono}
            </div>
            <h3 className="garantias-temu-item-titulo">
              {garantia.titulo}
            </h3>
            <p className="garantias-temu-item-descripcion">
              {garantia.descripcion}
            </p>
          </div>
        ))}
      </div>

    </section>
  )
}

export const CTAFinalTemu = ({
  ctaData = null,
  mostrarTimer = true,
  mostrarStock = true,
  producto = null
}) => {

  const [tiempoRestante, setTiempoRestante] = useState({
    horas: 23,
    minutos: 59,
    segundos: 59
  })

  const [stockRestante, setStockRestante] = useState(7)

  const datosDefecto = {
    titulo: "¡ÚLTIMA OPORTUNIDAD!",
    subtitulo: "No dejes pasar esta oferta única. Miles ya han transformado su vida.",
    descuento: "70% OFF",
    precioAnterior: "$199.900",
    precioActual: "$59.900",
    botonTexto: "¡QUIERO MI TRANSFORMACIÓN AHORA!",
    garantia: "🛡️ Garantía de satisfacción del 100% o te devolvemos tu dinero",
    urgencia: "⚡ Oferta válida solo por hoy",
    envio: "🚚 Envío GRATIS en 24-48 horas"
  }

  const datos = ctaData || datosDefecto

  useEffect(() => {
    if (!mostrarTimer) return

    const interval = setInterval(() => {
      setTiempoRestante(prev => {
        let { horas, minutos, segundos } = prev

        if (segundos > 0) {
          segundos--
        } else if (minutos > 0) {
          minutos--
          segundos = 59
        } else if (horas > 0) {
          horas--
          minutos = 59
          segundos = 59
        }

        return { horas, minutos, segundos }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [mostrarTimer])

  useEffect(() => {
    if (!mostrarStock) return

    const interval = setInterval(() => {
      setStockRestante(prev => {
        const nuevoStock = prev - Math.floor(Math.random() * 2)
        return nuevoStock > 2 ? nuevoStock : Math.floor(Math.random() * 5) + 3
      })
    }, 30000)

    return () => clearInterval(interval)
  }, [mostrarStock])

  const formatearNumero = (num) => {
    return num.toString().padStart(2, '0')
  }

  return (
    <section className="cta-final-temu-seccion">

      <div className="cta-final-temu-contenedor">

        <div className="cta-final-temu-header">
          <div className="cta-final-temu-badge-urgencia">
            {datos.urgencia}
          </div>

          <h2 className="cta-final-temu-titulo">
            {datos.titulo}
          </h2>

          <p className="cta-final-temu-subtitulo">
            {datos.subtitulo}
          </p>
        </div>

        {mostrarTimer && (
          <div className="cta-final-temu-timer">
            <div className="cta-final-temu-timer-titulo">
              ⏰ Esta oferta termina en:
            </div>
            <div className="cta-final-temu-timer-numeros">
              <div className="cta-final-temu-timer-item">
                <span className="cta-final-temu-timer-numero">
                  {formatearNumero(tiempoRestante.horas)}
                </span>
                <span className="cta-final-temu-timer-label">Horas</span>
              </div>
              <div className="cta-final-temu-timer-separador">:</div>
              <div className="cta-final-temu-timer-item">
                <span className="cta-final-temu-timer-numero">
                  {formatearNumero(tiempoRestante.minutos)}
                </span>
                <span className="cta-final-temu-timer-label">Min</span>
              </div>
              <div className="cta-final-temu-timer-separador">:</div>
              <div className="cta-final-temu-timer-item">
                <span className="cta-final-temu-timer-numero">
                  {formatearNumero(tiempoRestante.segundos)}
                </span>
                <span className="cta-final-temu-timer-label">Seg</span>
              </div>
            </div>
          </div>
        )}

        <div className="cta-final-temu-precios">
          <div className="cta-final-temu-descuento">
            {datos.descuento}
          </div>
          <div className="cta-final-temu-precio-anterior">
            {datos.precioAnterior}
          </div>
          <div className="cta-final-temu-precio-actual">
            {datos.precioActual}
          </div>
        </div>

        {producto?.imagenes?.imagen_cta_final && (
          <div className="cta-final-temu-imagen-container">
            <img
              src={producto.imagenes.imagen_cta_final}
              alt="Llamada a la acción final"
              className="cta-final-temu-imagen"
              loading="lazy"
            />
          </div>
        )}

        {mostrarStock && (
          <div className="cta-final-temu-stock">
            <div className="cta-final-temu-stock-texto">
              🔥 ¡Solo quedan <strong>{stockRestante} unidades</strong> disponibles!
            </div>
            <div className="cta-final-temu-stock-barra">
              <div
                className="cta-final-temu-stock-progreso"
                style={{ width: `${(stockRestante / 10) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="cta-final-temu-boton-container">
          {producto?.estado === 'vendido' ? (
            <button
              className="cta-final-temu-boton cta-final-temu-boton-vendido"
              onClick={() => {
                if (producto?.categorias?.slug) {
                  window.location.href = `/categoria/${producto.categorias.slug}`
                }
              }}
            >
              🔍 Ver productos similares disponibles
            </button>
          ) : (
            <button className="cta-final-temu-boton">
              {datos.botonTexto}
            </button>
          )}
        </div>

        <div className="cta-final-temu-garantias">
          <div className="cta-final-temu-garantia-item">
            {datos.garantia}
          </div>
          <div className="cta-final-temu-garantia-item">
            {datos.envio}
          </div>
        </div>

      </div>

    </section>
  )
}
