import React, { useState, useEffect, useRef } from 'react';
import './HeroSeccion.css';
import { usarCategorias } from '../../hooks/usarCategorias';

const HeroSeccion = () => {
  const [indiceSliderActual, setIndiceSliderActual] = useState(0);
  const scrollRef = useRef(null);

  // Hook para obtener categorías reales
  const { categorias: categoriasReales, cargando: cargandoCategorias, error: errorCategorias } = usarCategorias();
  // Estados para el arrastre del mouse
  const [estaArrastrando, setEstaArrastrando] = useState(false);
  const [posicionInicial, setPosicionInicial] = useState(0);
  const [scrollInicial, setScrollInicial] = useState(0);

  // Imágenes del slider principal
  const imagenesSlider = [
    {
      src: '/images/Home/Imagen Principal HOME.jpg',
      alt: 'Imagen Principal Home',
      titulo: 'Ofertas Especiales',
      descripcion: 'Encuentra los mejores productos al mejor precio'
    },
    {
      src: '/images/Home/Venta de camionetas.jpg',
      alt: 'Venta de Camionetas',
      titulo: 'Venta de Camionetas',
      descripcion: 'Camionetas en excelente estado'
    },
    {
      src: '/images/Home/Banner de oferta 1.jpg',
      alt: 'Banner de Ofertas',
      titulo: 'Banner de Ofertas',
      descripcion: 'No te pierdas nuestras promociones'
    }
  ];

  // Categorías para el grid de la derecha
  const categorias = [
    {
      src: '/images/Home/Categorias/Autos usados.jpg',
      alt: 'Autos Usados',
      titulo: 'Autos Usados',
      enlace: '/categoria/autos-usados'
    },
    {
      src: '/images/Home/Categorias/Motos usadas.jpg',
      alt: 'Motos Usadas',
      titulo: 'Motos Usadas',
      enlace: '/categoria/motos-usadas'
    },
    {
      src: '/images/Home/Categorias/Ropa nueva.jpg',
      alt: 'Ropa Nueva',
      titulo: 'Ropa Nueva',
      enlace: '/categoria/ropa-nueva'
    },
    {
      src: '/images/Home/Categorias/Perfumeria arabe.jpg',
      alt: 'Perfumería Árabe',
      titulo: 'Perfumería Árabe',
      enlace: '/categoria/perfumeria-arabe'
    }
  ];

  // Función para avanzar al siguiente slide
  const siguienteSlide = () => {
    setIndiceSliderActual((prevIndice) => 
      prevIndice === imagenesSlider.length - 1 ? 0 : prevIndice + 1
    );
  };

  // Función para ir al slide anterior
  const slideAnterior = () => {
    setIndiceSliderActual((prevIndice) => 
      prevIndice === 0 ? imagenesSlider.length - 1 : prevIndice - 1
    );
  };

  // Función para ir a un slide específico
  const irASlide = (indice) => {
    setIndiceSliderActual(indice);
  };

  // Auto-play del slider
  useEffect(() => {
    const intervalo = setInterval(siguienteSlide, 5000); // Cambia cada 5 segundos
    return () => clearInterval(intervalo);
  }, []);

  // Funciones para el arrastre del mouse en el scroll de categorías
  const iniciarArrastre = (e) => {
    setEstaArrastrando(true);
    setPosicionInicial(e.pageX - scrollRef.current.offsetLeft);
    setScrollInicial(scrollRef.current.scrollLeft);
    scrollRef.current.style.cursor = 'grabbing';
  };

  const finalizarArrastre = () => {
    setEstaArrastrando(false);
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
    }
  };

  const manejarArrastre = (e) => {
    if (!estaArrastrando) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const caminar = (x - posicionInicial) * 2; // Multiplicador para velocidad
    scrollRef.current.scrollLeft = scrollInicial - caminar;
  };

  // Agregar event listeners para el mouse
  useEffect(() => {
    const handleMouseUp = () => finalizarArrastre();
    const handleMouseLeave = () => finalizarArrastre();

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  // Prevenir selección de texto durante el arrastre
  useEffect(() => {
    if (estaArrastrando) {
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
  }, [estaArrastrando]);

  // Manejo de eventos táctiles para móvil
  const [inicioToque, setInicioToque] = useState(null);

  const manejarInicioToque = (e) => {
    setInicioToque(e.touches[0].clientX);
  };

  const manejarFinToque = (e) => {
    if (!inicioToque) return;
    
    const finToque = e.changedTouches[0].clientX;
    const diferencia = inicioToque - finToque;
    
    if (Math.abs(diferencia) > 50) { // Mínimo 50px de deslizamiento
      if (diferencia > 0) {
        siguienteSlide();
      } else {
        slideAnterior();
      }
    }
    
    setInicioToque(null);
  };

  return (
    <section className="hero-seccion">
      <div className="hero-contenedor">
        {/* Slider Principal */}
        <div className="slider-principal">
          <div 
            className="slider-contenido"
            onTouchStart={manejarInicioToque}
            onTouchEnd={manejarFinToque}
          >
            {imagenesSlider.map((imagen, indice) => (
              <div
                key={indice}
                className={`slide ${indice === indiceSliderActual ? 'activo' : ''}`}
              >
                <img 
                  src={imagen.src} 
                  alt={imagen.alt}
                  className="imagen-slide"
                  loading={indice === indiceSliderActual ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchpriority={indice === indiceSliderActual ? 'high' : 'low'}
                  width={1920}
                  height={640}
                />
              </div>
            ))}
          </div>

          {/* Navegación del slider - solo indicadores */}
          <div className="navegacion-slider">
            {imagenesSlider.map((_, index) => (
              <button
                key={index}
                className={`indicador ${index === indiceSliderActual ? 'activo' : ''}`}
                onClick={() => irASlide(index)}
                aria-label={`Ir al slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Grid de Categorías */}
        <div className="grid-categorias">
          {categorias.map((categoria, indice) => (
            <div key={indice} className="tarjeta-categoria">
              <img 
                src={categoria.src} 
                alt={categoria.alt}
                className="imagen-categoria"
                loading="lazy"
                decoding="async"
                fetchpriority="low"
                width={320}
                height={320}
              />
              <div className="overlay-categoria">
                <h3 className="titulo-categoria">{categoria.titulo}</h3>
                <button className="boton-categoria">Explorar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Banner Me Llevo Esto - Ancho Completo */}
      <div className="banner-me-llevo-esto">
        <img 
          src="/images/Home/Banner Me llevo esto.jpg" 
          alt="Banner Me Llevo Esto - Todo a un solo clic"
          className="banner-imagen"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          width={1920}
          height={360}
        />
      </div>

      {/* Sección de Categorías con Scroll Horizontal */}
      <div className="seccion-categorias-scroll">
        <div className="encabezado-categorias">
          <h2 className="titulo-categorias">Explora por Categorías</h2>
          <button className="boton-ver-mas" onClick={() => window.location.href = '/tienda'}>
            Ver Más
          </button>
        </div>
        
        <div className="contenedor-scroll-categorias">
          <div 
            className="scroll-categorias"
            ref={scrollRef}
            onMouseDown={iniciarArrastre}
            onMouseMove={manejarArrastre}
            onMouseUp={finalizarArrastre}
            onMouseLeave={finalizarArrastre}
            style={{ cursor: estaArrastrando ? 'grabbing' : 'grab' }}
          >
            {cargandoCategorias ? (
              // Mostrar skeleton loading mientras cargan las categorías
              Array.from({ length: 6 }).map((_, indice) => (
                <div key={`skeleton-${indice}`} className="categoria-circular skeleton">
                  <div className="contenedor-imagen-circular skeleton-imagen"></div>
                  <div className="nombre-categoria skeleton-texto"></div>
                </div>
              ))
            ) : errorCategorias ? (
              <div className="error-categorias">
                <p>Error al cargar categorías</p>
              </div>
            ) : (
              categoriasReales.map((categoria) => (
                <div 
                  key={categoria.id} 
                  className="categoria-circular"
                  onClick={() => !estaArrastrando && (window.location.href = `/tienda/categoria/${categoria.slug}`)}
                  style={{ cursor: estaArrastrando ? 'grabbing' : 'pointer' }}
                >
                  <div className="contenedor-imagen-circular">
                    <img 
                      src={categoria.imagen_url || '/images/Home/Categorias/Categorias fondo blanco/default.jpg'} 
                      alt={categoria.nombre}
                      className="imagen-categoria-circular"
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                      width={120}
                      height={120}
                      onError={(e) => {
                        e.target.src = '/images/Home/Categorias/Categorias fondo blanco/default.jpg';
                      }}
                    />
                  </div>
                  <h3 className="nombre-categoria">{categoria.nombre}</h3>
                </div>
              ))
            )}
          </div>
          
          {/* Indicador de scroll */}
          <div className="indicador-scroll">
            <span className="texto-indicador">Desliza para ver más →</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSeccion;
