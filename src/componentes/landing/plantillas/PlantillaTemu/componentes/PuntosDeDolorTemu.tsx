import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import './PuntosDeDolorTemu.css'

const PuntosDeDolorTemu = ({ 
  puntosDeDolorData = null,
  mostrarAnimaciones = true,
  producto = null
}) => {
  
  const timelineRef = useRef(null)
  const [imagenModal, setImagenModal] = useState(null)

  const abrirModalImagen = (url) => setImagenModal(url)
  const cerrarModalImagen = () => setImagenModal(null)

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') cerrarModalImagen()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
  
  const datosDefecto = {
    titulo: "¿Te sientes identificado con estos problemas diarios?",
    subtitulo: "Miles de personas sufren estos inconvenientes cada día. ¡Tú no tienes que ser una de ellas!",
    timeline: [
      {
        id: 1,
        nombre: "Productos de mala calidad",
        descripcion: "Compras algo que se rompe a los pocos días o no funciona como esperabas.",
        solucion: "Garantizamos calidad premium con 2 años de garantía total.",
        icono: "💔",
        imagen: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcGJlMGY0azJsdjd2ZzRsd2lzcmpreGg5OTVlczR6c2N0MHVodzZlZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/qajuJgAgTN8DVSxwhS/giphy.gif",
        posicion: "izquierda"
      },
      {
        id: 2,
        nombre: "Envíos eternos y costosos",
        descripcion: "Esperas semanas por tu pedido y pagas fortunas en envío.",
        solucion: "Envío gratis en 24-48 horas a toda Colombia.",
        icono: "🐌",
        imagen: "https://i.pinimg.com/1200x/09/ef/c1/09efc19e9056eaa3c422365e5de7961d.jpg",
        posicion: "derecha"
      },
      {
        id: 3,
        nombre: "Precios inflados injustamente",
        descripcion: "Pagas el doble o triple por productos similares en otras tiendas.",
        solucion: "Precios directos de fábrica, hasta 70% más barato.",
        icono: "💸",
        imagen: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeDltYnJkbXhmZXp6Mmc1a20yNG9hZGU0bXpxaHo0b3Y4emdsY3B4ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/U25p4lb9fb2cTIbcwJ/giphy.gif",
        posicion: "izquierda"
      },
      {
        id: 4,
        nombre: "Sin garantías ni soporte",
        descripcion: "Cuando algo falla, no hay nadie que te ayude o responda.",
        solucion: "Soporte 24/7 y garantía de satisfacción del 100%.",
        icono: "🚫",
        imagen: "https://i.pinimg.com/736x/60/30/d4/6030d483068f0a8e2cd4d62dca4aeca8.jpg",
        posicion: "derecha"
      },
    ]
  }

  // Normalizar estructura entrante para evitar errores cuando falten campos
  const datosNormalizados = (() => {
    // Si no viene nada, usar defaults
    if (!puntosDeDolorData) return datosDefecto

    // Si viene un array directo, convertir a estructura esperada con timeline
    if (Array.isArray(puntosDeDolorData)) {
      return {
        ...datosDefecto,
        timeline: puntosDeDolorData.map((punto, index) => ({
          id: punto.id || Date.now() + index,
          icono: punto.icono || '💔',
          nombre: punto.nombre || punto.titulo || '',
          posicion: punto.posicion || (index % 2 === 0 ? 'izquierda' : 'derecha'),
          descripcion: punto.descripcion || '',
          solucion: punto.solucion || '',
          textoBoton: punto.textoBoton || 'NUESTRA SOLUCIÓN'
        }))
      }
    }

    // Si viene un objeto, asegurar que tenga timeline array
    if (typeof puntosDeDolorData === 'object') {
      const timeline = Array.isArray(puntosDeDolorData.timeline) 
        ? puntosDeDolorData.timeline 
        : []
      return {
        titulo: puntosDeDolorData.titulo || datosDefecto.titulo,
        subtitulo: puntosDeDolorData.subtitulo || datosDefecto.subtitulo,
        timeline: timeline.length > 0 ? timeline : datosDefecto.timeline
      }
    }

    // Fallback
    return datosDefecto
  })()

  const datos = datosNormalizados

  const timelineConImagenes = (Array.isArray(datos.timeline) ? datos.timeline : []).slice(0, 4).map((punto, index) => {
    let campoImagen
    if (index < 2) {
      campoImagen = `imagen_punto_dolor_${index + 1}`
    } else {
      campoImagen = `imagen_solucion_${index - 1}`
    }
    
    const imagenDesdeDB = producto?.imagenes?.[campoImagen]
    
    return {
      ...punto,
      imagen: imagenDesdeDB || punto.imagen
    }
  })

  useEffect(() => {
    if (!mostrarAnimaciones) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('puntos-dolor-temu-item-visible')
          }
        })
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const items = timelineRef.current?.querySelectorAll('.puntos-dolor-temu-item')
    items?.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [mostrarAnimaciones])

  return (
    <section className="puntos-dolor-temu-seccion">
      <div className="puntos-dolor-temu-contenedor">
        
        <div className="puntos-dolor-temu-header">
          <h2 className="puntos-dolor-temu-titulo">
            {datos.titulo}
          </h2>
          <p className="puntos-dolor-temu-subtitulo">
            {datos.subtitulo}
          </p>
        </div>

        <div className="puntos-dolor-temu-timeline" ref={timelineRef}>
          
          <div className="puntos-dolor-temu-linea-central"></div>

          {(timelineConImagenes || []).map((punto, index) => (
            <div 
              key={punto.id}
              className={`puntos-dolor-temu-item puntos-dolor-temu-${punto.posicion}`}
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              
              <div className="puntos-dolor-temu-punto">
                <span className="puntos-dolor-temu-icono">
                  {punto.icono}
                </span>
              </div>

              <div className="puntos-dolor-temu-contenido">
                
                {punto.imagen && (
                  <div 
                    className="puntos-dolor-temu-imagen-container"
                    onClick={() => abrirModalImagen(punto.imagen)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') abrirModalImagen(punto.imagen) }}
                    aria-label={`Ver ${punto.nombre} en grande`}
                  >
                    <Image
                      src={punto.imagen}
                      alt={punto.nombre}
                      fill
                      style={{ objectFit: 'cover' }}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  </div>
                )}
                
                <div className="puntos-dolor-temu-problema">
                  <h3 className="puntos-dolor-temu-nombre">
                    {punto.nombre}
                  </h3>
                  <p className="puntos-dolor-temu-descripcion">
                    {punto.descripcion}
                  </p>
                </div>

                <div className="puntos-dolor-temu-flecha">
                  <span className="puntos-dolor-temu-flecha-icono">
                    ➜
                  </span>
                  <span className="puntos-dolor-temu-flecha-texto">
                    {punto.textoBoton || 'NUESTRA SOLUCIÓN'}
                  </span>
                </div>

                <div className="puntos-dolor-temu-solucion">
                  <p className="puntos-dolor-temu-solucion-texto">
                    ✅ {punto.solucion}
                  </p>
                </div>

              </div>
            </div>
          ))}
        </div>

        {imagenModal && (
          <div 
            className="puntos-dolor-modal-overlay" 
            onClick={cerrarModalImagen}
            role="dialog" 
            aria-modal="true"
          >
            <div 
              className="puntos-dolor-modal-contenido"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="puntos-dolor-modal-cerrar" 
                onClick={cerrarModalImagen}
                aria-label="Cerrar"
              >
                ✕
              </button>
              <div className="puntos-dolor-modal-imagen-container">
                <img 
                  src={imagenModal} 
                  alt="Imagen en grande"
                  className="puntos-dolor-modal-imagen"
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          </div>
        )}

        <div className="puntos-dolor-temu-cta">
          <h3 className="puntos-dolor-temu-cta-titulo">
            ¡No sufras más estos problemas!
          </h3>
          <p className="puntos-dolor-temu-cta-texto">
            Únete a los miles de clientes que ya encontraron la solución perfecta
          </p>
          <button className="puntos-dolor-temu-cta-boton">
            🛒 ¡Quiero solucionarlo ahora!
          </button>
        </div>

      </div>
    </section>
  )
}

export default PuntosDeDolorTemu
