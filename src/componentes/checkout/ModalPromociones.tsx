import React, { useState, useMemo } from 'react'
import { X, ShoppingCart, Zap, Package } from 'lucide-react'
import './ModalPromociones.css'

const ModalPromociones = ({ 
  isOpen, 
  onClose, 
  producto, 
  onSeleccionarOferta 
}) => {
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null)

  // Formatear precio en pesos colombianos
  const formatearPrecioCOP = (precio) => {
    if (!precio) return '$ 0'
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio)
  }

  // Generar ofertas basadas en el producto y sus promociones
  const ofertas = useMemo(() => {
    const listaOfertas = []
    
    if (!producto?.precio) {
      return listaOfertas
    }

    // Oferta base (precio real)
    const ofertaBase = {
      id: 'base',
      cantidad: 1,
      precioUnitario: producto.precio,
      precioTotal: producto.precio,
      descuento: 0,
      etiqueta: 'Precio de Oferta',
      tipo: 'base'
    }
    listaOfertas.push(ofertaBase)

    // Agregar promociones desde Supabase
    if (producto?.promociones && Array.isArray(producto.promociones)) {
      producto.promociones.forEach((promocion, index) => {
        // Verificar que la promoción esté activa (muy flexible para diferentes tipos de datos)
        const estaActiva = promocion.activa === true || 
                          promocion.activa === 1 || 
                          promocion.activa === '1' || 
                          promocion.activa === 'true' ||
                          promocion.activa === 'TRUE' ||
                          promocion.activa === 'Si' ||
                          promocion.activa === 'si' ||
                          promocion.activa === 'YES' ||
                          promocion.activa === 'yes'
        
        if (!estaActiva) {
          return
        }

        // Buscar campos de cantidad con diferentes nombres posibles
        const cantidad = promocion.cantidadMinima || 
                        promocion.cantidad || 
                        promocion.cantidad_minima ||
                        promocion.qty ||
                        promocion.min_qty ||
                        2
        
        // Buscar campos de descuento con diferentes nombres posibles
        const descuentoPorcentaje = promocion.descuentoPorcentaje || 
                                   promocion.descuento || 
                                   promocion.descuento_porcentaje ||
                                   promocion.discount ||
                                   promocion.percentage ||
                                   0
        
        const precioConDescuento = producto.precio * (1 - descuentoPorcentaje / 100)
        const precioTotal = precioConDescuento * cantidad
        const ahorroTotal = (producto.precio * cantidad) - precioTotal
        const ahorroUnitario = producto.precio - precioConDescuento

        const nuevaOferta = {
          id: `promocion-${promocion.id || index}`,
          cantidad: cantidad,
          precioUnitario: precioConDescuento,
          precioTotal: precioTotal,
          descuento: descuentoPorcentaje,
          etiqueta: `Compra ${cantidad} unidades con un ${descuentoPorcentaje}% de descuento adicional`,
          descripcion: promocion.descripcion || `Ahorra ${formatearPrecioCOP(ahorroUnitario)} por unidad`,
          ahorroTotal: ahorroTotal,
          tipo: 'promocion'
        }

        listaOfertas.push(nuevaOferta)
      })
    }
    
    return listaOfertas
  }, [producto])

  // Manejar selección de oferta
  const manejarSeleccionOferta = (oferta) => {
    setOfertaSeleccionada(oferta)
  }

  // Manejar confirmación de compra
  const manejarConfirmarCompra = () => {
    if (ofertaSeleccionada && onSeleccionarOferta) {
      onSeleccionarOferta(ofertaSeleccionada)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-promociones-overlay">
      <div className="modal-promociones-contenido">
        {/* Header del modal */}
        <div className="modal-promociones-header">
          <div className="modal-promociones-icono">
            <Zap size={24} />
          </div>
          <h2 className="modal-promociones-titulo">Pago Plataforma</h2>
          <button 
            onClick={onClose}
            className="modal-promociones-cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mensaje de envío */}
        <div className="modal-promociones-envio">
          <Package size={16} />
          Envío GRATIS a toda Colombia
        </div>

        {/* Título de selección */}
        <h3 className="modal-promociones-subtitulo">
          Selecciona tu oferta:
        </h3>

        {/* Lista de ofertas */}
        <div className="modal-promociones-ofertas">
          {ofertas.map((oferta) => (
            <div 
              key={oferta.id}
              className={`modal-promociones-oferta ${
                ofertaSeleccionada?.id === oferta.id ? 'seleccionada' : ''
              }`}
              onClick={() => manejarSeleccionOferta(oferta)}
            >
              <div className="modal-promociones-oferta-radio">
                <input 
                  type="radio" 
                  name="oferta"
                  checked={ofertaSeleccionada?.id === oferta.id}
                  onChange={() => manejarSeleccionOferta(oferta)}
                />
              </div>

              <div className="modal-promociones-oferta-contenido">
                {/* Etiqueta de descuento */}
                {oferta.tipo === 'promocion' && (
                  <div className="modal-promociones-descuento-badge">
                    -{oferta.descuento}%
                  </div>
                )}

                {/* Información de la oferta */}
                <div className="modal-promociones-oferta-info">
                  <h4 className="modal-promociones-oferta-titulo">
                    {oferta.etiqueta}
                  </h4>
                  
                  {oferta.descripcion && (
                    <p className="modal-promociones-oferta-descripcion">
                      {oferta.descripcion}
                    </p>
                  )}
                </div>

                {/* Precio */}
                <div className="modal-promociones-precio">
                  {formatearPrecioCOP(oferta.precioTotal)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen de compra */}
        {ofertaSeleccionada && (
          <div className="modal-promociones-resumen">
            <div className="modal-promociones-resumen-linea">
              <span>Subtotal</span>
              <span>{formatearPrecioCOP(ofertaSeleccionada.precioTotal)}</span>
            </div>
            <div className="modal-promociones-resumen-linea">
              <span>Envío</span>
              <span className="gratis">Gratis</span>
            </div>
            <div className="modal-promociones-resumen-linea total">
              <span>Total</span>
              <span>{formatearPrecioCOP(ofertaSeleccionada.precioTotal)}</span>
            </div>
          </div>
        )}

        {/* Botón de confirmación */}
        <button 
          className={`modal-promociones-confirmar ${
            !ofertaSeleccionada ? 'deshabilitado' : ''
          }`}
          onClick={manejarConfirmarCompra}
          disabled={!ofertaSeleccionada}
        >
          <ShoppingCart size={18} />
          Continuar con el pago
        </button>

        {/* Información adicional */}
        <div className="modal-promociones-info-adicional">
          <p>✅ Pago seguro con múltiples métodos</p>
          <p>🚚 Envío gratis a toda Colombia</p>
          <p>🔄 Garantía de satisfacción</p>
        </div>
      </div>
    </div>
  )
}

export default ModalPromociones