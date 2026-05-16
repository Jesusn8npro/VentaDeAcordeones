import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Star, 
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react'
import { useCarrito } from '../../contextos/CarritoContext'
import { usarProductos } from '../../hooks/usarProductos'
import BotonCarritoAnimado from '../ui/BotonCarritoAnimado'
import './ProductosRelacionados.css'

const ProductosRelacionados = ({ categoriaId, onCerrarModal }) => {
  const { agregarAlCarrito, alternarModal, mostrarNotificacion, items } = useCarrito()
  const { productos, cargando } = usarProductos({
    // Si quieres limitar por categoría, descomenta la línea siguiente
    // categoria: categoriaId,
    ordenar: { campo: 'creado_el', ascendente: false },
    limite: 24
  })
  const [indiceActual, setIndiceActual] = React.useState(0)

  // Formatear precio
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio)
  }

  // Construir conjunto de IDs del carrito para excluir
  const idsEnCarrito = useMemo(() => {
    const ids = new Set()
    items.forEach((item) => {
      if (item.producto_id) ids.add(item.producto_id)
      if (item.productos?.id) ids.add(item.productos.id)
    })
    return ids
  }, [items])

  // Obtener imagen principal del producto usando objeto 'imagenes' convertido
  const obtenerImagenPrincipal = (producto) => {
    if (!producto) return obtenerImagenPlaceholder()

    const principal = producto?.imagenes?.imagen_principal
    const secundaria = producto?.imagenes?.imagen_secundaria_1
    const directa = producto?.imagen_url

    // Soporte para relación producto_imagenes (array u objeto)
    let desdeProductoImagenes = null
    if (Array.isArray(producto?.producto_imagenes) && producto.producto_imagenes.length > 0) {
      const primera = producto.producto_imagenes[0]
      desdeProductoImagenes = primera?.imagen_principal || primera?.imagen_secundaria_1
    } else if (producto?.producto_imagenes) {
      desdeProductoImagenes = producto.producto_imagenes?.imagen_principal || producto.producto_imagenes?.imagen_secundaria_1
    }

    const array = Array.isArray(producto?.fotos_principales) && producto.fotos_principales[0]
      ? producto.fotos_principales[0]
      : null

    return principal || secundaria || directa || desdeProductoImagenes || array || '/placeholder-producto.jpg'
  }

  // Filtrar productos para mostrar solo los que no están en el carrito
  const productosFiltrados = useMemo(() => {
    return (productos || []).filter((p) => !idsEnCarrito.has(p.id))
  }, [productos, idsEnCarrito])

  // Manejar agregar al carrito
  const manejarAgregarCarrito = async (producto, cantidad, variante) => {
    try {
      // Usar el producto completo tal como viene de la base de datos
      const resultado = await agregarAlCarrito(producto, cantidad || 1, variante)
      
      if (resultado.success) {
        // Abrir modal del carrito para confirmar
        alternarModal()
        return resultado
      } else {
        // Mostrar error al usuario
        mostrarNotificacion('error', 'Error al agregar', resultado.message || 'Error al agregar al carrito')
        throw new Error(resultado.message || 'Error al agregar al carrito')
      }
    } catch (error) {
      mostrarNotificacion('error', 'Error al agregar', 'Error al agregar al carrito. Por favor, inténtalo de nuevo.')
      throw error
    }
  }

  // Navegación del carrusel
  const irAnterior = () => {
    setIndiceActual(prev => 
      prev === 0 ? Math.max(0, productos.length - 2) : prev - 1
    )
  }

  const irSiguiente = () => {
    setIndiceActual(prev => 
      prev >= productos.length - 2 ? 0 : prev + 1
    )
  }

  if (cargando) {
    return (
      <div className="productos-relacionados">
        <div className="productos-relacionados-header">
          <Sparkles className="icono-sparkles" />
          <h3>Productos que te pueden interesar</h3>
        </div>
        
        <div className="productos-relacionados-cargando">
          <div className="skeleton-producto"></div>
          <div className="skeleton-producto"></div>
        </div>
      </div>
    )
  }

  if (!productosFiltrados.length) {
    return null
  }

  return (
    <div className="productos-relacionados">
      <div className="productos-relacionados-header">
        <Sparkles className="icono-sparkles" />
        <h3>Productos que te pueden interesar</h3>
        <span className="productos-count">
          {productosFiltrados.length} productos
        </span>
      </div>

      <div className="productos-carrusel-container">
        {productosFiltrados.length > 2 && (
          <button 
            className="carrusel-boton anterior"
            onClick={irAnterior}
            disabled={indiceActual === 0}
          >
            <ChevronLeft size={16} />
          </button>
        )}

        <div className="productos-carrusel">
          <div 
            className="productos-lista"
            style={{ 
              transform: `translateX(-${indiceActual * 50}%)`,
              transition: 'transform 0.3s ease'
            }}
          >
            {productosFiltrados.map((producto) => {
              const tieneDescuento = producto.precio_original && 
                producto.precio_original > producto.precio
              const porcentajeDescuento = tieneDescuento ? 
                Math.round(((producto.precio_original - producto.precio) / producto.precio_original) * 100) : 0

              return (
                <div key={producto.id} className="producto-relacionado">
                  <div className="producto-imagen-container">
                    <Link to={`/producto/${producto.id}`} onClick={onCerrarModal}>
                      <img
                        src={obtenerImagenPrincipal(producto)}
                        alt={producto.nombre}
                        className="producto-imagen"
                        loading="lazy"
                      />
                    </Link>
                    
                    {tieneDescuento && (
                      <div className="producto-descuento">
                        -{porcentajeDescuento}%
                      </div>
                    )}

                    {producto.stock < 5 && (
                      <div className="producto-stock-bajo">
                        ¡Solo {producto.stock}!
                      </div>
                    )}

                    <BotonCarritoAnimado
                      producto={producto}
                      cantidad={1}
                      className="boton-agregar-rapido"
                      onAgregar={manejarAgregarCarrito}
                    >
                      <Plus size={14} />
                    </BotonCarritoAnimado>
                  </div>

                  <div className="producto-info">
                    <Link 
                      to={`/producto/${producto.id}`}
                      className="producto-nombre"
                      onClick={onCerrarModal}
                    >
                      {producto.nombre}
                    </Link>

                    {producto.rating && (
                      <div className="producto-rating">
                        <div className="estrellas">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={10} 
                              className={i < Math.floor(producto.rating) ? 'estrella-llena' : 'estrella-vacia'}
                            />
                          ))}
                        </div>
                        <span className="rating-numero">
                          {producto.rating} ({producto.total_resenas})
                        </span>
                      </div>
                    )}

                    <div className="producto-precios">
                      {tieneDescuento && (
                        <span className="precio-original">
                          {formatearPrecio(producto.precio_original)}
                        </span>
                      )}
                      <span className="precio-actual">
                        {formatearPrecio(producto.precio)}
                      </span>
                    </div>

                    <div className="producto-beneficios">
                      {producto.envio_gratis && (
                        <span className="beneficio envio-gratis">
                          <ShoppingCart size={10} />
                          Envío gratis
                        </span>
                      )}
                    </div>

                    <BotonCarritoAnimado
                      producto={producto}
                      cantidad={1}
                      className="boton-agregar-completo"
                      onAgregar={manejarAgregarCarrito}
                    >
                      <Plus size={14} />
                      Agregar
                    </BotonCarritoAnimado>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {productos.length > 2 && (
          <button 
            className="carrusel-boton siguiente"
            onClick={irSiguiente}
            disabled={indiceActual >= productos.length - 2}
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>

      <div className="productos-relacionados-footer">
        <Link 
          to="/tienda" 
          className="ver-mas-productos"
          onClick={onCerrarModal}
        >
          Ver más productos
        </Link>
      </div>
    </div>
  )
}

export default ProductosRelacionados