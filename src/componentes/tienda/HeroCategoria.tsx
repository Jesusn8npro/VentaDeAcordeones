import React from 'react';
import { Flame, TrendingUp, Package, Zap, Truck, Shield, CreditCard, RefreshCw } from 'lucide-react';
import './HeroCategoria.css';

/**
 * HeroCategoria - Banner compacto para páginas de categoría
 * Con info en fondo blanco y tarjetas de beneficios
 */
const HeroCategoria = ({ categoria }) => {
  if (!categoria) return null;

  const {
    nombre,
    descripcion,
    imagen_banner,
    color_primario = '#ff4757',
    color_secundario = '#ff6b35',
    total_productos = 0,
    descuento_promedio = 0,
    productos_en_oferta = 0
  } = categoria;

  return (
    <div 
      className="hero-categoria-compacto"
      style={{
        backgroundImage: imagen_banner ? `url(${imagen_banner})` : 'none',
        '--color-primario': color_primario,
        '--color-secundario': color_secundario
      }}
    >
      {/* Overlay con gradiente */}
      <div className="hero-overlay"></div>

      {/* Contenido principal con fondo blanco */}
      <div className="hero-contenido-compacto">
        {/* Sección superior con gradiente */}
        <div className="hero-top">
          {/* Badges superiores */}
          <div className="hero-badges">
            {productos_en_oferta > 0 && (
              <div className="hero-badge badge-oferta">
                <Flame size={14} />
                <span>{productos_en_oferta} Ofertas Activas</span>
              </div>
            )}
            {descuento_promedio > 0 && (
              <div className="hero-badge badge-descuento">
                <TrendingUp size={14} />
                <span>Hasta {descuento_promedio}% OFF</span>
              </div>
            )}
          </div>

          {/* Título principal */}
          <h1 className="hero-titulo-compacto">{nombre}</h1>

          {/* Descripción */}
          {descripcion && (
            <p className="hero-descripcion-compacta">{descripcion}</p>
          )}

          {/* Stats rápidas */}
          <div className="hero-stats-compactas">
            <div className="hero-stat-item">
              <Package size={18} />
              <span>{total_productos}+ PRODUCTOS</span>
            </div>
            <div className="hero-stat-item">
              <Zap size={18} />
              <span>24h ENVÍO EXPRESS</span>
            </div>
            <div className="hero-stat-item">
              <TrendingUp size={18} />
              <span>TOP VENTAS</span>
            </div>
          </div>
        </div>

        {/* Tarjetas de beneficios con fondo blanco */}
        <div className="hero-beneficios">
          <div className="beneficio-card">
            <div className="beneficio-icono">
              <Truck size={24} />
            </div>
            <div className="beneficio-texto">
              <h3>Envío Gratis</h3>
              <p>En compras mayores a $50.000</p>
            </div>
          </div>

          <div className="beneficio-card">
            <div className="beneficio-icono">
              <Shield size={24} />
            </div>
            <div className="beneficio-texto">
              <h3>Garantía de Calidad</h3>
              <p>Productos 100% originales</p>
            </div>
          </div>

          <div className="beneficio-card">
            <div className="beneficio-icono">
              <CreditCard size={24} />
            </div>
            <div className="beneficio-texto">
              <h3>Pago Seguro</h3>
              <p>Múltiples métodos de pago</p>
            </div>
          </div>

          <div className="beneficio-card">
            <div className="beneficio-icono">
              <RefreshCw size={24} />
            </div>
            <div className="beneficio-texto">
              <h3>Devolución Fácil</h3>
              <p>30 días para devoluciones</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroCategoria;
