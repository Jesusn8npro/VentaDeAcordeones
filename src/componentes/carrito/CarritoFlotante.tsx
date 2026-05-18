import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link } from '@/compat/router'
import { 
  X, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight,
  Gift,
  Truck,
  Shield,
  Star
} from 'lucide-react'
import { useCarrito } from '../../contextos/CarritoContext'
import { formatearPrecioCOP } from '../../utilidades/formatoPrecio'
import ItemCarrito from './ItemCarrito'
import './CarritoFlotante.css'

const ModalCarrito = ({ abierto, onCerrar }) => {
  const {
    items,
    cargando,
    totalItems,
    subtotal,
    descuentos,
    envio,
    total,
    actualizarCantidad,
    eliminarDelCarrito,
    limpiarCarrito
  } = useCarrito()

  const [animacionSalida, setAnimacionSalida] = useState(false)

  // Manejar cierre con animación
  const manejarCierre = useCallback(() => {
    setAnimacionSalida(true)
    setTimeout(() => {
      setAnimacionSalida(false)
      onCerrar()
    }, 300)
  }, [onCerrar])

  // Cerrar con ESC
  useEffect(() => {
    const manejarTecla = (e) => {
      if (e.key === 'Escape' && abierto) {
        manejarCierre()
      }
    }

    document.addEventListener('keydown', manejarTecla)
    return () => document.removeEventListener('keydown', manejarTecla)
  }, [abierto])

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [abierto])

  const subtotalFormateado = useMemo(() => formatearPrecioCOP(subtotal), [subtotal])
  const totalFormateado = useMemo(() => formatearPrecioCOP(total), [total])
  const descuentosFormateado = useMemo(() => formatearPrecioCOP(descuentos), [descuentos])
  const faltaEnvioFormateado = useMemo(() => formatearPrecioCOP(50000 - subtotal), [subtotal])

  if (!abierto) return null

  return (
    <div className={`modal-carrito-overlay ${animacionSalida ? 'saliendo' : ''}`}>
      <div 
        className="modal-carrito-backdrop"
        onClick={manejarCierre}
      />
      
      <div className={`modal-carrito ${animacionSalida ? 'saliendo' : ''}`}>
        {/* Header del modal */}
        <div className="modal-carrito-header">
          <div className="modal-carrito-titulo">
            <ShoppingCart size={24} />
            <h2>Mi Carrito</h2>
            {totalItems > 0 && (
              <span className="modal-carrito-contador">{totalItems}</span>
            )}
          </div>
          
          <button 
            className="modal-carrito-cerrar"
            onClick={manejarCierre}
            aria-label="Cerrar carrito"
          >
            <X size={24} />
          </button>
        </div>

        {/* Contenido del modal */}
        <div className="modal-carrito-contenido">
          {cargando ? (
            <div className="modal-carrito-cargando">
              <div className="spinner"></div>
              <p>Cargando carrito...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="modal-carrito-vacio">
              <div className="carrito-vacio-icono">
                <ShoppingCart size={64} />
              </div>
              <h3>Tu carrito está vacío</h3>
              <p>Explora nuestra colección de acordeones y accesorios. ¡Tu instrumento ideal te espera!</p>

              <div className="carrito-vacio-beneficios">
                <div className="beneficio-item">
                  <Truck className="beneficio-icono" />
                  <span>Envíos a toda Colombia</span>
                </div>
                <div className="beneficio-item">
                  <Shield className="beneficio-icono" />
                  <span>Garantía de 6 meses en nuevos</span>
                </div>
                <div className="beneficio-item">
                  <Star className="beneficio-icono" />
                  <span>Asesoría gratis por WhatsApp</span>
                </div>
              </div>

              <Link 
                to="/tienda" 
                className="boton-explorar"
                onClick={manejarCierre}
              >
                Explorar productos
                <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            <>
              {/* Lista de productos */}
              <div className="modal-carrito-items">
                {items.map((item) => (
                  <ItemCarrito 
                    key={item.id} 
                    item={item}
                    onActualizarCantidad={actualizarCantidad}
                    onEliminar={eliminarDelCarrito}
                    compacto={true}
                  />
                ))}
              </div>

              {/* Productos relacionados - no se muestran en el modal */}

              {/* Resumen de precios */}
              <div className="modal-carrito-resumen">
                <div className="resumen-linea">
                  <span>Subtotal ({totalItems} productos)</span>
                  <span className="precio">{subtotalFormateado}</span>
                </div>

                {descuentos > 0 && (
                  <div className="resumen-linea descuento">
                    <span>Descuentos</span>
                    <span className="precio">-{descuentosFormateado}</span>
                  </div>
                )}

                <div className="resumen-linea">
                  <span>Envío</span>
                  <span className="precio">
                    {envio === 0 ? (
                      <span className="envio-gratis">¡GRATIS!</span>
                    ) : (
                      formatearPrecioCOP(envio)
                    )}
                  </span>
                </div>

                {subtotal < 50000 && (
                  <div className="mensaje-envio-gratis">
                    <Truck size={16} />
                    <span>
                      Agrega {faltaEnvioFormateado} más para envío gratis
                    </span>
                  </div>
                )}

                <div className="resumen-total">
                  <span>Total</span>
                  <span className="precio-total">{totalFormateado}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer del modal */}
        {items.length > 0 && (
          <div className="modal-carrito-footer">
            <div className="footer-acciones">
              <button
                className="boton-limpiar"
                onClick={limpiarCarrito}
                title="Limpiar carrito"
              >
                <Trash2 size={16} />
                Limpiar
              </button>
            </div>

            <div className="footer-botones-principales">
              <Link
                to="/checkout"
                className="boton-checkout"
                onClick={manejarCierre}
              >
                Ir al checkout
                <ArrowRight size={18} />
              </Link>
              <button
                className="boton-ver-carrito"
                onClick={manejarCierre}
              >
                Seguir comprando
              </button>
            </div>

            {/* Indicadores de confianza */}
            <div className="footer-confianza">
              <div className="confianza-item">
                <Shield size={14} />
                <span>Compra segura</span>
              </div>
              <div className="confianza-item">
                <Star size={14} />
                <span>4.8/5 en reseñas</span>
              </div>
              <div className="confianza-item">
                <Truck size={14} />
                <span>Envío rápido</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModalCarrito



























