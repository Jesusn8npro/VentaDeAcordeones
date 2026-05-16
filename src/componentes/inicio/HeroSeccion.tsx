import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { usarCategorias } from '../../hooks/usarCategorias'
import './HeroSeccion.css'

const SLIDES = [
  {
    titulo: 'Acordeones para Todo Género Musical',
    descripcion: 'Diatónicos, cromáticos y de piano — Envío gratis a toda Colombia',
    fondo: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    cta: 'Ver Acordeones',
    enlace: '/tienda'
  },
  {
    titulo: 'Servicio de Reparación Profesional',
    descripcion: 'Reparamos tu acordeón con garantía — Presupuesto sin costo',
    fondo: 'linear-gradient(135deg, #c62a47 0%, #e94560 50%, #ff6b35 100%)',
    cta: 'Solicitar Cotización',
    enlace: '/tienda/categoria/servicio-reparacion'
  },
  {
    titulo: 'Accesorios y Repuestos',
    descripcion: 'Correas, fundas, micrófonos, cables y más — Calidad garantizada',
    fondo: 'linear-gradient(135deg, #0f3460 0%, #533483 60%, #e94560 100%)',
    cta: 'Ver Accesorios',
    enlace: '/tienda/categoria/accesorios'
  }
]

export default function HeroSeccion() {
  const navigate = useNavigate()
  const [indice, setIndice] = useState(0)
  const [arrastrando, setArrastrando] = useState(false)
  const [inicioToque, setInicioToque] = useState(null)
  const scrollRef = useRef(null)
  const [posInicial, setPosInicial] = useState(0)
  const [scrollInicial, setScrollInicial] = useState(0)

  const { categorias, cargando } = usarCategorias()

  const siguiente = () => setIndice(i => (i + 1) % SLIDES.length)
  const anterior  = () => setIndice(i => i === 0 ? SLIDES.length - 1 : i - 1)

  useEffect(() => {
    const t = setInterval(siguiente, 5000)
    return () => clearInterval(t)
  }, [])

  const iniciarArrastre = (e) => {
    setArrastrando(true)
    setPosInicial(e.pageX - scrollRef.current.offsetLeft)
    setScrollInicial(scrollRef.current.scrollLeft)
  }

  const moverArrastre = (e) => {
    if (!arrastrando) return
    e.preventDefault()
    scrollRef.current.scrollLeft = scrollInicial - (e.pageX - scrollRef.current.offsetLeft - posInicial) * 2
  }

  useEffect(() => {
    const fin = () => setArrastrando(false)
    document.addEventListener('mouseup', fin)
    return () => document.removeEventListener('mouseup', fin)
  }, [])

  useEffect(() => {
    document.body.style.userSelect = arrastrando ? 'none' : ''
  }, [arrastrando])

  const onTouchStart = (e) => setInicioToque(e.touches[0].clientX)
  const onTouchEnd   = (e) => {
    if (!inicioToque) return
    const diff = inicioToque - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) diff > 0 ? siguiente() : anterior()
    setInicioToque(null)
  }

  const top4 = categorias.slice(0, 4)

  return (
    <section className="hero-seccion">
      <div className="hero-contenedor">

        {/* Slider Principal */}
        <div className="slider-principal" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className={`slide ${i === indice ? 'activo' : ''}`}
              style={{ background: slide.fondo }}
            >
              <div className="slide-contenido">
                <h2 className="slide-titulo">{slide.titulo}</h2>
                <p className="slide-descripcion">{slide.descripcion}</p>
                <button className="slide-cta" onClick={() => navigate(slide.enlace)}>
                  {slide.cta}
                </button>
              </div>
            </div>
          ))}
          <div className="navegacion-slider">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                className={`indicador ${i === indice ? 'activo' : ''}`}
                onClick={() => setIndice(i)}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Grid Top 4 Categorías */}
        <div className="grid-categorias">
          {cargando
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="tarjeta-categoria skeleton" />
              ))
            : top4.map((cat) => (
                <div
                  key={cat.id}
                  className="tarjeta-categoria"
                  onClick={() => navigate(`/tienda/categoria/${cat.slug}`)}
                >
                  {cat.imagen_url
                    ? <img src={cat.imagen_url} alt={cat.nombre} className="imagen-categoria" loading="lazy" decoding="async" />
                    : <div className="categoria-sin-imagen"><span>{cat.icono || '🪗'}</span></div>
                  }
                  <div className="overlay-categoria">
                    <h3 className="titulo-categoria">{cat.nombre}</h3>
                    <button className="boton-categoria">Explorar</button>
                  </div>
                </div>
              ))
          }
        </div>
      </div>

      {/* Scroll Horizontal de Categorías */}
      <div className="seccion-categorias-scroll">
        <div className="encabezado-categorias">
          <h2 className="titulo-categorias">Explora por Categorías</h2>
          <button className="boton-ver-mas" onClick={() => navigate('/tienda')}>Ver Más</button>
        </div>
        <div className="contenedor-scroll-categorias">
          <div
            className="scroll-categorias"
            ref={scrollRef}
            onMouseDown={iniciarArrastre}
            onMouseMove={moverArrastre}
            onMouseUp={() => setArrastrando(false)}
            style={{ cursor: arrastrando ? 'grabbing' : 'grab' }}
          >
            {cargando
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="categoria-circular skeleton">
                    <div className="contenedor-imagen-circular skeleton-imagen" />
                    <div className="nombre-categoria skeleton-texto" />
                  </div>
                ))
              : categorias.map((cat) => (
                  <div
                    key={cat.id}
                    className="categoria-circular"
                    onClick={() => !arrastrando && navigate(`/tienda/categoria/${cat.slug}`)}
                    style={{ cursor: arrastrando ? 'grabbing' : 'pointer' }}
                  >
                    <div className="contenedor-imagen-circular">
                      {cat.imagen_url
                        ? <img src={cat.imagen_url} alt={cat.nombre} className="imagen-categoria-circular" draggable={false} loading="lazy" decoding="async" onError={e => { e.target.style.display = 'none' }} />
                        : <span className="cat-icono-fallback">{cat.icono || '🪗'}</span>
                      }
                    </div>
                    <h3 className="nombre-categoria">{cat.nombre}</h3>
                  </div>
                ))
            }
          </div>
          <div className="indicador-scroll">
            <span className="texto-indicador">Desliza para ver más →</span>
          </div>
        </div>
      </div>
    </section>
  )
}
