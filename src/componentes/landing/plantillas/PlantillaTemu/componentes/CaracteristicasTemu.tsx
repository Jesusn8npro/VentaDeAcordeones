import React, { useEffect, useRef } from 'react'
import './CaracteristicasTemu.css'

/**
 * CaracteristicasTemu - Sección de características del producto
 * 
 * Características:
 * - Diseño simple y efectivo
 * - Imagen grande del producto
 * - Lista de beneficios clave
 * - CTA intermedio
 * - Estilo dropshipping limpio
 */

const CaracteristicasTemu = ({ 
  caracteristicasData = null,
  mostrarAnimaciones = true,
  producto = null
}) => {
  
  // Función para hacer scroll al producto (Hero section)
  const scrollToProduct = () => {
    // Buscar el elemento del hero o la sección principal del producto
    const heroSection = document.querySelector('.hero-temu-seccion') || 
                       document.querySelector('.hero-section') ||
                       document.querySelector('[data-section="hero"]') ||
                       document.querySelector('.plantilla-temu-content > *:first-child')
    
    if (heroSection) {
      heroSection.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      })
    } else {
      // Fallback: scroll al inicio de la página
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth' 
      })
    }
  }
  
  const sectionRef = useRef(null)
  
  // Datos por defecto - Layout en 3 columnas
  const datosDefecto = {
    titulo: "¿Por qué miles de personas eligen nuestro producto?",
    subtitulo: "Descubre las características que lo hacen único y especial",
    imagen: "https://i.pinimg.com/736x/be/38/b2/be38b2ed0a01a5e311cfc96b692a4cf5.jpg",
    
    // Columna izquierda - Detalles técnicos
    detalles: [
      {
        id: 1,
        icono: "⚡",
        titulo: "Tecnología Avanzada",
        descripcion: "Última generación en innovación y diseño"
      },
      {
        id: 2,
        icono: "🔧",
        titulo: "Fácil de Usar",
        descripcion: "Sin complicaciones, listo para usar"
      },
      {
        id: 3,
        icono: "💎",
        titulo: "Materiales Premium",
        descripcion: "Calidad superior garantizada"
      }
    ],
    
    // Columna derecha - Beneficios y garantías
    beneficios: [
      {
        id: 1,
        icono: "🛡️",
        titulo: "Garantía 2 Años",
        descripcion: "100% satisfacción garantizada"
      },
      {
        id: 2,
        icono: "🚚",
        titulo: "Envío Gratis",
        descripcion: "Entrega en 24-48 horas"
      },
      {
        id: 3,
        icono: "💰",
        titulo: "Mejor Precio",
        descripcion: "Ahorra hasta 70% vs tiendas"
      }
    ],
    
    cta: {
      texto: "¡QUIERO APROVECHAR ESTA OFERTA!",
      subtexto: "🔥 Oferta por tiempo limitado"
    }
  }

  // Usar datos del producto si están disponibles, sino datos por defecto
  const datos = {
    titulo: producto?.ventajas?.titulo || caracteristicasData?.titulo || datosDefecto.titulo,
    subtitulo: producto?.ventajas?.subtitulo || caracteristicasData?.subtitulo || datosDefecto.subtitulo,
    imagen: producto?.imagenes?.imagen_caracteristicas || caracteristicasData?.imagen || datosDefecto.imagen,
    
    // Columna izquierda - Ventajas
    detalles: producto?.ventajas?.items?.slice(0, 3) || caracteristicasData?.detalles || datosDefecto.detalles,
    
    // Columna derecha - Beneficios
    beneficios: producto?.beneficios?.items?.slice(0, 3) || caracteristicasData?.beneficios || datosDefecto.beneficios,
    
    cta: producto?.ventajas?.cta || producto?.beneficios?.cta || caracteristicasData?.cta || datosDefecto.cta
  }
  
  // Usar imagen de características desde productos_imagenes si está disponible
  const imagenCaracteristicas = producto?.imagenes?.imagen_caracteristicas || datos.imagen

  // Animaciones al hacer scroll
  useEffect(() => {
    if (!mostrarAnimaciones) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('caracteristicas-temu-item-visible')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      }
    )

    const items = sectionRef.current?.querySelectorAll('.caracteristicas-temu-item')
    items?.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [mostrarAnimaciones])

  return (
    <section className="caracteristicas-temu-seccion" ref={sectionRef}>
      
      {/* HEADER */}
      <div className="caracteristicas-temu-header">
        <h2 className="caracteristicas-temu-titulo">
          {datos.titulo}
        </h2>
        <p className="caracteristicas-temu-subtitulo">
          {datos.subtitulo}
        </p>
      </div>

      <div className="caracteristicas-temu-contenedor">
        
        {/* COLUMNA IZQUIERDA - CARACTERÍSTICAS */}
        <div className="caracteristicas-temu-columna caracteristicas-temu-detalles">
          {datos.detalles.map((detalle, index) => (
            <div 
              key={detalle.id}
              className="caracteristicas-temu-item caracteristicas-temu-feature"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="caracteristicas-temu-icono">
                {detalle.icono}
              </div>
              <div className="caracteristicas-temu-contenido">
                <h4 className="caracteristicas-temu-feature-titulo">
                  {detalle.titulo}
                </h4>
                <p className="caracteristicas-temu-feature-descripcion">
                  {detalle.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* COLUMNA CENTRO - PRODUCTO */}
        <div className="caracteristicas-temu-columna caracteristicas-temu-producto">
          <div 
            className="caracteristicas-temu-imagen-container caracteristicas-temu-item"
            onClick={scrollToProduct}
            style={{ cursor: 'pointer' }}
            title="Haz clic para ver el producto completo"
          >
            <img 
              src={imagenCaracteristicas} 
              alt="Producto principal"
              className="caracteristicas-temu-imagen"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div className="caracteristicas-temu-imagen-overlay">
              <div className="caracteristicas-temu-badge-calidad">
                ⭐ CALIDAD PREMIUM
              </div>
              <div className="caracteristicas-temu-click-hint">
                👆 Clic para ver producto
              </div>
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA - BENEFICIOS */}
        <div className="caracteristicas-temu-columna caracteristicas-temu-beneficios">
          {datos.beneficios.map((beneficio, index) => (
            <div 
              key={beneficio.id}
              className="caracteristicas-temu-item caracteristicas-temu-feature"
              style={{ animationDelay: `${(index + 3) * 0.1}s` }}
            >
              <div className="caracteristicas-temu-icono">
                {beneficio.icono}
              </div>
              <div className="caracteristicas-temu-contenido">
                <h4 className="caracteristicas-temu-feature-titulo">
                  {beneficio.titulo}
                </h4>
                <p className="caracteristicas-temu-feature-descripcion">
                  {beneficio.descripcion}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* CTA INTERMEDIO */}
      <div className="caracteristicas-temu-cta">
        <button className="caracteristicas-temu-cta-boton">
          {datos.cta.texto}
        </button>
        <p className="caracteristicas-temu-cta-subtexto">
          {datos.cta.subtexto}
        </p>
      </div>

    </section>
  )
}

export default CaracteristicasTemu
