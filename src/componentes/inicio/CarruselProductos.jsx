import React, { useState, useEffect, useRef } from 'react';
import { clienteSupabase } from '../../configuracion/supabase';
import TarjetaProductoLujo from '../producto/TarjetaProductoLujo';
import { Loader, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import './CarruselProductos.css';

const CarruselProductos = ({ titulo, orden, limite = 12 }) => {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const scrollContenedor = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const handleDragStart = (e) => {
    if (!scrollContenedor.current) return;
    isDragging.current = true;
    // Unificamos el evento para mouse y touch
    const pageX = e.pageX ?? e.touches[0].pageX;
    startX.current = pageX - scrollContenedor.current.offsetLeft;
    scrollLeft.current = scrollContenedor.current.scrollLeft;
    // Mejoramos la experiencia visual durante el arrastre
    scrollContenedor.current.style.cursor = 'grabbing';
    scrollContenedor.current.style.userSelect = 'none';
  };

  const handleDragEnd = () => {
    if (!scrollContenedor.current || !isDragging.current) return;
    isDragging.current = false;
    scrollContenedor.current.style.cursor = 'grab';
    scrollContenedor.current.style.removeProperty('user-select');
  };

  const handleDragMove = (e) => {
    if (!isDragging.current || !scrollContenedor.current) return;
    e.preventDefault(); // Prevenimos el scroll de la página mientras arrastramos
    const pageX = e.pageX ?? e.touches[0].pageX;
    const x = pageX - scrollContenedor.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Multiplicador para un deslizamiento más rápido
    scrollContenedor.current.scrollLeft = scrollLeft.current - walk;
  };

  useEffect(() => {
    const cargarProductos = async () => {
      try {
        setCargando(true);
        setError(null);

        let query = clienteSupabase
          .from('productos')
          .select(
            `
            *,
            categorias (
              id,
              nombre
            ),
            producto_imagenes (
              imagen_principal,
              imagen_secundaria_1,
              imagen_secundaria_2
            )
          `
          )
          .eq('activo', true)
          .gt('stock', 0);

        switch (orden) {
          case 'nuevos':
            query = query.order('creado_el', { ascending: false });
            break;
          case 'destacados':
          default:
            query = query.order('destacado', { ascending: false }).order('creado_el', { ascending: false });
            break;
        }

        query = query.limit(limite);

        const { data, error: errorQuery } = await query;

        if (errorQuery) {
          throw errorQuery;
        }

        const productosConImagenes = (data || []).map((producto) => {
          const imagenesReales = [];
          if (producto.producto_imagenes && producto.producto_imagenes.length > 0) {
            const imagenes = producto.producto_imagenes[0];
            if (imagenes.imagen_principal) imagenesReales.push(imagenes.imagen_principal);
            if (imagenes.imagen_secundaria_1) imagenesReales.push(imagenes.imagen_secundaria_1);
            if (imagenes.imagen_secundaria_2) imagenesReales.push(imagenes.imagen_secundaria_2);
          }
          if (imagenesReales.length === 0 && producto.fotos_principales && producto.fotos_principales.length > 0) {
            imagenesReales.push(...producto.fotos_principales);
          }
          return {
            ...producto,
            fotos_principales: imagenesReales.length > 0 ? imagenesReales : producto.fotos_principales,
          };
        });

        setProductos(productosConImagenes);
      } catch (error) {
        setError('Error al cargar los productos.');
        console.error(error);
      } finally {
        setCargando(false);
      }
    };

    cargarProductos();
  }, [orden, limite]);

  const scroll = (direccion) => {
    if (scrollContenedor.current) {
      const scrollAmount = scrollContenedor.current.offsetWidth * 0.8;
      scrollContenedor.current.scrollBy({
        left: direccion === 'izquierda' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (cargando) {
    return (
      <div className="carrusel-placeholder">
        <Loader className="animate-spin" />
        <p>Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="carrusel-error">
        <AlertCircle />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="carrusel-productos-container">
      <div className="carrusel-header">
        <h3 className="carrusel-titulo">{titulo}</h3>
        <div className="carrusel-navegacion">
          <button onClick={() => scroll('izquierda')} className="nav-boton" aria-label="Anterior">
            <ChevronLeft size={24} />
          </button>
          <button onClick={() => scroll('derecha')} className="nav-boton" aria-label="Siguiente">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
      <div
        className="carrusel-scroll-container"
        ref={scrollContenedor}
        onMouseDown={handleDragStart}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onMouseMove={handleDragMove}
        onTouchStart={handleDragStart}
        onTouchEnd={handleDragEnd}
        onTouchMove={handleDragMove}
        style={{ cursor: 'grab' }}
      >
        {productos.map((producto) => (
          <div className="carrusel-item" key={producto.id}>
            <TarjetaProductoLujo producto={producto} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CarruselProductos;