import React from "react";
import { Star, ShoppingCart, Heart, Truck, Shield, Clock, Award } from 'lucide-react';
import { useFavoritos } from "../../../contextos/FavoritosContext";
import ContraEntregaModal from "../../checkout/ContraEntregaModal";
import "./StickyProductoEscritorio.css";

const StickyProductoEscritorio = ({ 
  producto, 
  mostrar, 
  visible,
  modalContraEntregaAbierto,
  setModalContraEntregaAbierto,
  manejarAgregarCarrito,
  productoAnadido,
  scrollHaciaGaleria
}) => {
  // Hook de favoritos
  const { favoritos, alternarFavorito, esFavorito } = useFavoritos();

  // Calcular descuento
  const calcularDescuento = () => {
    if (producto?.precio_original && producto?.precio && producto.precio_original > producto.precio) {
      return Math.round(((producto.precio_original - producto.precio) / producto.precio_original) * 100);
    }
    return 0;
  };

  const navegarACategoria = () => {
    const slug = producto?.categorias?.slug || producto?.categorias?.nombre || producto?.categoria || ''
    if (!slug) return
    const categoriaURL = `/tienda/categoria/${encodeURIComponent(slug)}`
    window.location.href = categoriaURL
  };

  // Generar estrellas de calificación
  const generarEstrellas = (calificacion = 4.8) => {
    const estrellas = [];
    const estrellasCompletas = Math.floor(calificacion);
    
    for (let i = 0; i < 5; i++) {
      estrellas.push(
        <Star 
          key={i} 
          size={14} 
          fill={i < estrellasCompletas ? "#fbbf24" : "none"} 
          color={i < estrellasCompletas ? "#fbbf24" : "#d1d5db"} 
        />
      );
    }
    return estrellas;
  };
  
  // No mostrar si no hay producto o mostrar está en false
  if (!mostrar || !producto) return null;

  const descuento = calcularDescuento();

  return (
    <div className={`sticky-producto-escritorio ${visible ? 'visible' : ''}`}>
      <div className="sticky-escritorio-contenedor">
        
        {/* SECCIÓN IZQUIERDA - IMAGEN Y INFO BÁSICA */}
        <div className="sticky-escritorio-seccion-izquierda">
          
          {/* Imagen del producto */}
          <div className="sticky-escritorio-imagen-contenedor" onClick={scrollHaciaGaleria}>
            {producto.imagenes?.imagen_principal ? (
              <img 
                src={producto.imagenes.imagen_principal} 
                alt={producto.nombre || 'Producto'}
                className="sticky-escritorio-imagen"
                loading="lazy"
              />
            ) : (
              <div className="sticky-escritorio-imagen-placeholder">
                📦
              </div>
            )}
            
            {/* Badge de descuento */}
            {descuento > 0 && (
              <div className="sticky-escritorio-badge-descuento">
                -{descuento}%
              </div>
            )}
          </div>

          {/* Información básica */}
          <div className="sticky-escritorio-info-basica">
            <h3 className="sticky-escritorio-titulo">
              {producto.nombre || 'Producto sin nombre'}
            </h3>
            
            {/* Calificación y reseñas */}
            <div className="sticky-escritorio-calificacion">
              <div className="sticky-escritorio-estrellas">
                {generarEstrellas()}
              </div>
              <span className="sticky-escritorio-resenas">
                (4.8) • 2,847 reseñas
              </span>
            </div>

            {/* Beneficios rápidos */}
            <div className="sticky-escritorio-beneficios">
              <div className="sticky-escritorio-beneficio">
                <Truck size={16} color="#10b981" />
                <span>Envío Gratis</span>
              </div>
              <div className="sticky-escritorio-beneficio">
                <Shield size={16} color="#3b82f6" />
                <span>Garantía</span>
              </div>
              <div className="sticky-escritorio-beneficio">
                <Clock size={16} color="#f59e0b" />
                <span>Entrega Rápida</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN CENTRAL - PRECIOS */}
        <div className="sticky-escritorio-seccion-precios">
          <div className="sticky-escritorio-precio-actual">
            ${producto.precio?.toLocaleString() || '0'}
          </div>
          
          {producto.precio_original && producto.precio_original > producto.precio && (
            <div className="sticky-escritorio-precio-info">
              <span className="sticky-escritorio-precio-original">
                ${producto.precio_original.toLocaleString()}
              </span>
              <span className="sticky-escritorio-ahorro">
                Ahorras ${(producto.precio_original - producto.precio).toLocaleString()}
              </span>
            </div>
          )}


        </div>

        {/* SECCIÓN DERECHA - ACCIONES */}
        <div className="sticky-escritorio-seccion-acciones">
          
          {/* Botón de favoritos */}
          <button 
            className={`sticky-escritorio-boton-favoritos ${esFavorito(producto?.id) ? 'activo' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              if (producto) {
                alternarFavorito(producto);
              }
            }}
            title="Agregar a favoritos"
          >
            <Heart 
              size={20} 
              fill={esFavorito(producto?.id) ? '#ef4444' : 'none'} 
              color={esFavorito(producto?.id) ? '#ef4444' : '#6b7280'} 
            />
          </button>

          {/* Botones principales */}
          <div className="sticky-escritorio-botones-principales">
            {producto?.estado === 'vendido' ? (
              <>
                <button className="sticky-escritorio-boton-contra-entrega" disabled>
                  <Truck size={18} />
                  <span>Vendido</span>
                </button>
                <button className="sticky-escritorio-boton-carrito" onClick={navegarACategoria}>
                  <ShoppingCart size={18} />
                  <span>Ver similares</span>
                </button>
              </>
            ) : (
              <>
                <button 
                  className="sticky-escritorio-boton-contra-entrega"
                  onClick={() => setModalContraEntregaAbierto(true)}
                >
                  <Truck size={18} />
                  <span>Contra Entrega</span>
                </button>
                
                <button 
                  className={`sticky-escritorio-boton-carrito ${productoAnadido ? 'producto-anadido' : ''}`}
                  onClick={manejarAgregarCarrito}
                  disabled={productoAnadido}
                >
                  <ShoppingCart size={18} />
                  <span>{productoAnadido ? 'Producto Añadido' : 'Añadir al Carrito'}</span>
                </button>
              </>
            )}
          </div>

          {/* Información adicional */}
          <div className="sticky-escritorio-info-adicional">
            <div className="sticky-escritorio-stock">
              <div className="sticky-escritorio-stock-indicator"></div>
              <span>Solo quedan 3 unidades</span>
            </div>
            <div className="sticky-escritorio-urgencia">
              🔥 12 personas están viendo este producto
            </div>
          </div>
        </div>

      </div>
      
      {/* Modal de Contra Entrega */}
      <ContraEntregaModal
        abierto={modalContraEntregaAbierto}
        onCerrar={() => setModalContraEntregaAbierto(false)}
        producto={producto}
        onConfirmar={(payload) => {
          setModalContraEntregaAbierto(false);
        }}
      />
    </div>
  );
};

export default StickyProductoEscritorio;