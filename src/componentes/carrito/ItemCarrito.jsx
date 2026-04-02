import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Minus, 
  Trash2, 
  Heart,
  Star,
  ShoppingCart,
  AlertCircle
} from 'lucide-react'
import './ItemCarrito.css'

const ItemCarrito = ({ 
  item, 
  onActualizarCantidad, 
  onEliminar, 
  onMoverAFavoritos,
  compacto = false,
  mostrarDescripcion = false 
}) => {
  const [cargandoActualizacion, setCargandoActualizacion] = useState(false)
  const [cantidadTemporal, setCantidadTemporal] = useState(item.cantidad)

  // Formatear precio
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio)
  }

  // Manejar cambio de cantidad
  const manejarCambioCantidad = async (nuevaCantidad) => {
    if (nuevaCantidad < 1 || nuevaCantidad > 99) return
    
    setCargandoActualizacion(true)
    setCantidadTemporal(nuevaCantidad)
    
    try {
      await onActualizarCantidad(item.id, nuevaCantidad)
    } catch (error) {
      // Error silencioso para producción
      setCantidadTemporal(item.cantidad) // Revertir en caso de error
    } finally {
      setCargandoActualizacion(false)
    }
  }

  // Manejar eliminación
  const manejarEliminacion = async () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto del carrito?')) {
      try {
        await onEliminar(item.id)
      } catch (error) {
        // Error silencioso para producción
      }
    }
  }

  // Manejar mover a favoritos
  const manejarMoverAFavoritos = async () => {
    if (onMoverAFavoritos) {
      try {
        await onMoverAFavoritos(item.productos)
        await onEliminar(item.id)
      } catch (error) {
        // Error silencioso para producción
      }
    }
  }

  // Calcular precio total del item
  const precioTotal = item.precio_unitario * cantidadTemporal

  // Verificar si hay descuento
  const tieneDescuento = item.productos?.precio_original && 
    item.productos.precio_original > item.precio_unitario

  const porcentajeDescuento = tieneDescuento ? 
    Math.round(((item.productos.precio_original - item.precio_unitario) / item.productos.precio_original) * 100) : 0

  // Resolver imagen principal del producto usando objeto imagenes (convertido) y fallback
  const obtenerImagenPrincipal = (producto) => {
    if (!producto) return obtenerImagenPlaceholder()

    // Preferir el objeto 'imagenes' procesado por usarProducto (URLs convertidas)
    const desdeImagenes = producto?.imagenes?.imagen_principal || producto?.imagenes?.imagen_secundaria_1

    // Soporte para estructura devuelta por Supabase: producto_imagenes puede ser objeto o array
    let desdeProductoImagenes = null
    if (Array.isArray(producto?.producto_imagenes) && producto.producto_imagenes.length > 0) {
      const primera = producto.producto_imagenes[0]
      desdeProductoImagenes = primera?.imagen_principal || primera?.imagen_secundaria_1
    } else if (producto?.producto_imagenes) {
      desdeProductoImagenes = producto.producto_imagenes?.imagen_principal || producto.producto_imagenes?.imagen_secundaria_1
    }

    // Fallback adicional: cuando Supabase devuelve producto_imagenes al mismo nivel del item
    if (!desdeProductoImagenes) {
      if (Array.isArray(item?.producto_imagenes) && item.producto_imagenes.length > 0) {
        const primera = item.producto_imagenes[0]
        desdeProductoImagenes = primera?.imagen_principal || primera?.imagen_secundaria_1
      } else if (item?.producto_imagenes) {
        desdeProductoImagenes = item.producto_imagenes?.imagen_principal || item.producto_imagenes?.imagen_secundaria_1
      }
    }

    // Fallback a fotos_principales
    const desdeArray = Array.isArray(producto?.fotos_principales) && producto.fotos_principales[0]
      ? producto.fotos_principales[0]
      : null

    // Otros posibles campos directos
    const otros = producto?.imagen_principal || producto?.imagen_url || producto?.imagen

    const candidato = desdeImagenes || desdeProductoImagenes || desdeArray || otros
    return candidato || '/placeholder-producto.jpg'
  }

  const imagenPrincipal = obtenerImagenPrincipal(item.productos)

  return (
    <div className={`item-carrito ${compacto ? 'compacto' : ''}`}>
      {/* Imagen del producto */}
      <div className="item-imagen-container">
        <Link to={`/producto/${item.productos?.id}`}>
          <img 
            src={imagenPrincipal}
            alt={item.productos?.nombre}
            className="item-imagen"
          />
        </Link>
        
        {tieneDescuento && (
          <div className="item-descuento-badge">
            -{porcentajeDescuento}%
          </div>
        )}

        {item.productos?.stock < 5 && item.productos?.stock > 0 && (
          <div className="item-stock-bajo">
            <AlertCircle size={12} />
            ¡Últimas {item.productos.stock}!
          </div>
        )}
      </div>

      {/* Información del producto */}
      <div className="item-info">
        <div className="item-header">
          <Link 
            to={`/producto/${item.productos?.id}`}
            className="item-nombre"
          >
            {item.productos?.nombre}
          </Link>

          {!compacto && (
            <div className="item-acciones-rapidas">
              {onMoverAFavoritos && (
                <button
                  className="boton-favorito"
                  onClick={manejarMoverAFavoritos}
                  title="Mover a favoritos"
                >
                  <Heart size={16} />
                </button>
              )}
              
              <button
                className="boton-eliminar"
                onClick={manejarEliminacion}
                title="Eliminar del carrito"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Descripción (solo si no es compacto) */}
        {!compacto && mostrarDescripcion && item.productos?.descripcion && (
          <p className="item-descripcion">
            {item.productos.descripcion.length > 100 
              ? `${item.productos.descripcion.substring(0, 100)}...`
              : item.productos.descripcion
            }
          </p>
        )}



        {/* Rating del producto */}
        {!compacto && item.productos?.rating && (
          <div className="item-rating">
            <div className="estrellas">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={12} 
                  className={i < Math.floor(item.productos.rating) ? 'estrella-llena' : 'estrella-vacia'}
                />
              ))}
            </div>
            <span className="rating-numero">
              {item.productos.rating} ({item.productos.total_resenas || 0})
            </span>
          </div>
        )}

        {/* Precios y controles */}
        <div className="item-footer">
          <div className="item-precios">
            {tieneDescuento && (
              <span className="precio-original">
                {formatearPrecio(item.productos.precio_original)}
              </span>
            )}
            <span className="precio-unitario">
              {formatearPrecio(item.precio_unitario)}
            </span>
          </div>

          {/* Controles de cantidad */}
          <div className="item-cantidad-controles">
            <button
              className="boton-cantidad"
              onClick={() => manejarCambioCantidad(cantidadTemporal - 1)}
              disabled={cantidadTemporal <= 1 || cargandoActualizacion}
              title="Disminuir cantidad"
            >
              <Minus size={14} />
            </button>

            <span className="cantidad-display">
              {cargandoActualizacion ? '...' : cantidadTemporal}
            </span>

            <button
              className="boton-cantidad"
              onClick={() => manejarCambioCantidad(cantidadTemporal + 1)}
              disabled={
                cantidadTemporal >= 10 || 
                cargandoActualizacion || 
                (item.productos?.stock && cantidadTemporal >= item.productos.stock)
              }
              title={
                cantidadTemporal >= 10 
                  ? "Máximo 10 unidades por producto"
                  : item.productos?.stock && cantidadTemporal >= item.productos.stock
                ? `Solo quedan ${item.productos.stock} disponibles`
                    : "Aumentar cantidad"
              }
            >
              <Plus size={14} />
            </button>
          </div>

          {/* Mensajes de validación */}
          {cantidadTemporal >= 10 && (
            <div className="mensaje-limite">
              Máximo 10 unidades por producto
            </div>
          )}
          
          {item.productos?.stock && cantidadTemporal >= item.productos.stock && (
              <div className="stock-warning">
                Solo quedan {item.productos.stock} disponibles
            </div>
          )}
        </div>

        {/* Información adicional para vista no compacta */}
        {!compacto && (
          <div className="item-info-adicional">
            {item.productos?.envio_gratis && (
              <div className="info-envio">
                <ShoppingCart size={12} />
                <span>Envío gratis</span>
              </div>
            )}

            {item.productos?.stock && item.productos.stock < 10 && (
              <div className="info-stock">
                <AlertCircle size={12} />
                <span>Solo quedan {item.productos.stock} disponibles</span>
              </div>
            )}

            {item.productos?.tiempo_entrega && (
              <div className="info-entrega">
                <span>Entrega: {item.productos.tiempo_entrega}</span>
              </div>
            )}
          </div>
        )}

        {/* Acciones móviles para vista compacta */}
        {compacto && (
          <div className="item-acciones-movil">
            {onMoverAFavoritos && (
              <button
                className="boton-accion-movil"
                onClick={manejarMoverAFavoritos}
              >
                <Heart size={14} />
              </button>
            )}
            
            <button
              className="boton-accion-movil eliminar"
              onClick={manejarEliminacion}
            >
              <Trash2 size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ItemCarrito



























