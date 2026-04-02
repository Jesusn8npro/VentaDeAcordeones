import React, { useEffect, useRef } from 'react'
import './GarantiasTemu.css'

/**
 * GarantiasTemu - Sección de garantías y confianza
 * 
 * Características:
 * - Grid de garantías simple
 * - Iconos y textos convincentes
 * - Diseño limpio sin sobrecargar
 * - Genera confianza total
 */

const GarantiasTemu = ({ 
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

export default GarantiasTemu
