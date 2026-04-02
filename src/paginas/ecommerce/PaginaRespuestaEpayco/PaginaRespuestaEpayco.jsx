import React, { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowLeft, 
  Package, 
  CreditCard,
  Calendar,
  User,
  Mail,
  Phone,
  MapPin,
  Home,
  ShoppingBag,
  Download,
  Share2,
  DollarSign,
  Hash,
  Building
} from 'lucide-react'
import { useCarrito } from '../../../contextos/CarritoContext'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'
import servicioEpayco from '../../../servicios/epayco/servicioEpayco'
import './PaginaRespuestaEpayco.css'

const PaginaRespuestaEpayco = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { limpiarCarrito } = useCarrito()
  const [datosTransaccion, setDatosTransaccion] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const procesarRespuestaEpayco = async () => {
      try {
        // Diagnóstico opcional del lado cliente (omitido)

        // Obtener TODOS los parámetros de ePayco según documentación oficial
        const x_cust_id_cliente = searchParams.get('x_cust_id_cliente')
        const x_ref_payco = searchParams.get('x_ref_payco')
        const x_id_invoice = searchParams.get('x_id_invoice')
        const x_description = searchParams.get('x_description')
        const x_amount = searchParams.get('x_amount')
        const x_amount_country = searchParams.get('x_amount_country')
        const x_amount_ok = searchParams.get('x_amount_ok')
        const x_tax = searchParams.get('x_tax')
        const x_tax_ico = searchParams.get('x_tax_ico')
        const x_amount_base = searchParams.get('x_amount_base')
        const x_currency_code = searchParams.get('x_currency_code')
        const x_bank_name = searchParams.get('x_bank_name')
        const x_cardnumber = searchParams.get('x_cardnumber')
        const x_quotas = searchParams.get('x_quotas')
        const x_receipt = searchParams.get('x_receipt')
        const x_response = searchParams.get('x_response')
        const x_response_reason_text = searchParams.get('x_response_reason_text')
        const x_approval_code = searchParams.get('x_approval_code')
        const x_transaction_id = searchParams.get('x_transaction_id')
        const x_fecha_transaccion = searchParams.get('x_fecha_transaccion')
        const x_transaction_date = searchParams.get('x_transaction_date')
        const x_cod_response = searchParams.get('x_cod_response')
        const x_cod_transaction_state = searchParams.get('x_cod_transaction_state')
        const x_transaction_state = searchParams.get('x_transaction_state')
        const x_errorcode = searchParams.get('x_errorcode')
        const x_franchise = searchParams.get('x_franchise')
        const x_business = searchParams.get('x_business')
        const x_customer_doctype = searchParams.get('x_customer_doctype')
        const x_customer_document = searchParams.get('x_customer_document')
        const x_customer_name = searchParams.get('x_customer_name')
        const x_customer_lastname = searchParams.get('x_customer_lastname')
        const x_customer_email = searchParams.get('x_customer_email')
        const x_customer_phone = searchParams.get('x_customer_phone')
        const x_customer_movil = searchParams.get('x_customer_movil')
        const x_customer_ind_pais = searchParams.get('x_customer_ind_pais')
        const x_customer_country = searchParams.get('x_customer_country')
        const x_customer_city = searchParams.get('x_customer_city')
        const x_customer_address = searchParams.get('x_customer_address')
        const x_customer_ip = searchParams.get('x_customer_ip')
        const x_signature = searchParams.get('x_signature')
        const x_test_request = searchParams.get('x_test_request')
        const x_extra1 = searchParams.get('x_extra1')
        const x_extra2 = searchParams.get('x_extra2')
        const x_extra3 = searchParams.get('x_extra3')
        const x_extra4 = searchParams.get('x_extra4')
        const x_extra5 = searchParams.get('x_extra5')
        const x_extra6 = searchParams.get('x_extra6')
        const x_extra7 = searchParams.get('x_extra7')
        const x_extra8 = searchParams.get('x_extra8')
        const x_extra9 = searchParams.get('x_extra9')
        const x_extra10 = searchParams.get('x_extra10')

        // También capturar parámetros alternativos por compatibilidad
        const ref_payco = x_ref_payco || searchParams.get('ref_payco')
        const estado = x_response || searchParams.get('estado')
        const respuesta = x_response_reason_text || searchParams.get('respuesta')

        if (!ref_payco) {
          setCargando(false)
          return
        }

        // Crear objeto con todos los datos de la transacción
        const datosTransaccion = {
          // Datos principales
          ref_payco: x_ref_payco || ref_payco || '',
          x_ref_payco: x_ref_payco || '',
          x_cust_id_cliente: x_cust_id_cliente || '',
          x_id_invoice: x_id_invoice || '',
          x_description: x_description || '',
          
          // Montos y moneda
          x_amount: x_amount || '',
          x_amount_country: x_amount_country || '',
          x_amount_ok: x_amount_ok || '',
          x_tax: x_tax || '',
          x_tax_ico: x_tax_ico || '',
          x_amount_base: x_amount_base || '',
          x_currency_code: x_currency_code || '',
          
          // Información del banco y tarjeta
          x_bank_name: x_bank_name || '',
          x_cardnumber: x_cardnumber || '',
          x_quotas: x_quotas || '',
          x_receipt: x_receipt || '',
          x_franchise: x_franchise || '',
          
          // Respuesta de la transacción
          x_response: x_response || '',
          x_response_reason_text: x_response_reason_text || '',
          x_approval_code: x_approval_code || '',
          x_transaction_id: x_transaction_id || '',
          x_fecha_transaccion: x_fecha_transaccion || '',
          x_transaction_date: x_transaction_date || '',
          x_cod_response: x_cod_response || '',
          x_cod_transaction_state: x_cod_transaction_state || '',
          x_transaction_state: x_transaction_state || '',
          x_errorcode: x_errorcode || '',
          
          // Información del cliente
          x_customer_doctype: x_customer_doctype || '',
          x_customer_document: x_customer_document || '',
          x_customer_name: x_customer_name || '',
          x_customer_lastname: x_customer_lastname || '',
          x_customer_email: x_customer_email || '',
          x_customer_phone: x_customer_phone || '',
          x_customer_movil: x_customer_movil || '',
          x_customer_ind_pais: x_customer_ind_pais || '',
          x_customer_country: x_customer_country || '',
          x_customer_city: x_customer_city || '',
          x_customer_address: x_customer_address || '',
          x_customer_ip: x_customer_ip || '',
          
          // Datos adicionales
          x_business: x_business || '',
          x_signature: x_signature || '',
          x_test_request: x_test_request || '',
          
          // Campos extra
          x_extra1: x_extra1 || '',
          x_extra2: x_extra2 || '',
          x_extra3: x_extra3 || '',
          x_extra4: x_extra4 || '',
          x_extra5: x_extra5 || '',
          x_extra6: x_extra6 || '',
          x_extra7: x_extra7 || '',
          x_extra8: x_extra8 || '',
          x_extra9: x_extra9 || '',
          x_extra10: x_extra10 || '',
          
          // Estados procesados
          estado: x_response === '1' ? 'Aceptada' : x_response === '2' ? 'Rechazada' : x_response === '3' ? 'Pendiente' : x_response === '4' ? 'Fallida' : null,
          respuesta: x_response || '',
          timestamp: new Date().toISOString()
        }

        // Registrar la transacción en nuestra base de datos con TODOS los datos
        await servicioEpayco.registrarTransaccion({
          referenciaPago: ref_payco,
          estado: estado,
          tipo: 'response',
          respuestaCompleta: datosTransaccion
        })

        // Obtener datos reales del pedido desde la base de datos
        const pedidoReal = null

        // Generar descripción del producto basada en los datos del pedido
          let descripcionProducto = 'Producto no encontrado'
          if (pedidoReal?.productos && pedidoReal.productos.length > 0) {
            if (pedidoReal.productos.length === 1) {
              const producto = pedidoReal.productos[0]
              descripcionProducto = `${producto.nombre} (x${producto.cantidad}) - MeLlevoEsto.com`
            } else if (pedidoReal.productos.length <= 3) {
              descripcionProducto = `${pedidoReal.productos.map(item => `${item.nombre} (x${item.cantidad})`).join(', ')} - MeLlevoEsto.com`
            } else {
              descripcionProducto = `${pedidoReal.productos.slice(0, 2).map(item => `${item.nombre} (x${item.cantidad})`).join(', ')} y ${pedidoReal.productos.length - 2} productos más - MeLlevoEsto.com`
            }
          }

        // Configurar datos para mostrar
        const datosCompletos = {
          ref_payco,
          x_ref_payco,
          estado,
          x_response,
          respuesta,
          x_response_reason_text,
          valor: x_amount ? parseFloat(x_amount) : 0,
          x_amount,
          fecha: x_fecha_transaccion,
          banco: x_bank_name,
          recibo: x_receipt,
          franquicia: x_franchise,
          cod_respuesta: x_cod_response,
          descripcion: descripcionProducto,
          transaction_id: x_transaction_id,
          approval_code: x_approval_code,
          signature: x_signature,
          currency_code: x_currency_code,
          test_request: x_test_request,
          // Datos reales del pedido obtenidos de la base de datos
          cliente: pedidoReal ? {
            nombre: pedidoReal.nombre_cliente,
            email: pedidoReal.email_cliente,
            telefono: pedidoReal.telefono_cliente || 'No especificado'
          } : {
            nombre: 'Cliente no encontrado',
            email: 'No disponible',
            telefono: 'No disponible'
          },
          direccion: pedidoReal?.direccion_envio ? {
            direccion: pedidoReal.direccion_envio.direccion || 'No especificada',
            ciudad: pedidoReal.direccion_envio.ciudad || 'No especificada',
            departamento: pedidoReal.direccion_envio.departamento || 'No especificado',
            codigoPostal: pedidoReal.direccion_envio.codigoPostal || 'No especificado'
          } : {
            direccion: 'No disponible',
            ciudad: 'No disponible',
            departamento: 'No disponible',
            codigoPostal: 'No disponible'
          },
          productos: pedidoReal?.productos || [
            {
              id: 'unknown',
              nombre: 'Producto no encontrado',
              cantidad: 1,
              precio: x_amount ? parseFloat(x_amount) : 0,
              imagen: '/images/producto-placeholder.jpg'
            }
          ],
          // Información adicional del pedido
          numeroPedido: pedidoReal?.numero_pedido || 'No disponible',
          subtotal: pedidoReal?.subtotal || 0,
          descuentos: pedidoReal?.descuento_aplicado || 0,
          costoEnvio: pedidoReal?.costo_envio || 0,
          total: pedidoReal?.total || (x_amount ? parseFloat(x_amount) : 0)
        }

        setDatosTransaccion(datosCompletos)

        // Si el pago fue exitoso, limpiar el carrito
        if (estado === 'Aceptada' || x_cod_response === '1') {
          limpiarCarrito()
        }

      } catch (error) {
        // Error al procesar respuesta de ePayco
      } finally {
        setCargando(false)
      }
    }

    procesarRespuestaEpayco()
  }, [searchParams, limpiarCarrito])

  const obtenerEstadoTransaccion = () => {
    if (!datosTransaccion) return 'pendiente'
    
    const { estado, cod_respuesta } = datosTransaccion
    
    if (estado === 'Aceptada' || cod_respuesta === '1') {
      return 'exitoso'
    } else if (estado === 'Rechazada' || cod_respuesta === '2') {
      return 'rechazado'
    } else {
      return 'pendiente'
    }
  }

  const obtenerMensajeEstado = () => {
    const estadoTransaccion = obtenerEstadoTransaccion()
    
    switch (estadoTransaccion) {
      case 'exitoso':
        return {
          titulo: '¡Pago Exitoso!',
          mensaje: 'Tu transacción ha sido procesada correctamente',
          icono: CheckCircle
        }
      case 'rechazado':
        return {
          titulo: 'Pago Rechazado',
          mensaje: 'Tu transacción no pudo ser procesada',
          icono: AlertCircle
        }
      default:
        return {
          titulo: 'Pago Pendiente',
          mensaje: 'Tu transacción está siendo procesada',
          icono: Clock
        }
    }
  }

  if (cargando) {
    return (
      <div className="pagina-respuesta-epayco">
        <div className="contenedor-respuesta">
          <div className="cargando">
            <div className="spinner"></div>
            <p>Procesando respuesta de pago...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!datosTransaccion) {
    return (
      <div className="pagina-respuesta-epayco">
        <div className="contenedor-respuesta">
          <div className="cabecera-respuesta rechazado">
            <div className="icono-estado">
              <AlertCircle size={40} />
            </div>
            <h1 className="titulo-estado">Error</h1>
            <p className="mensaje-estado">No se encontraron datos de la transacción</p>
          </div>
          <div className="acciones-respuesta">
            <Link to="/" className="boton-accion boton-primario">
              <Home size={20} />
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const estadoTransaccion = obtenerEstadoTransaccion()
  const mensajeEstado = obtenerMensajeEstado()
  const IconoEstado = mensajeEstado.icono

  return (
    <div className="pagina-respuesta-epayco">
      <div className="contenedor-respuesta">
        {/* Cabecera con estado */}
        <div className={`cabecera-respuesta ${estadoTransaccion}`}>
          <div className="icono-estado">
            <IconoEstado size={40} />
          </div>
          <h1 className="titulo-estado">{mensajeEstado.titulo}</h1>
          <p className="mensaje-estado">{mensajeEstado.mensaje}</p>
        </div>

        <div className="contenido-respuesta">
          {/* Información de la transacción */}
          <div className="info-transaccion">
            <h3 className="titulo-seccion">
              <CreditCard size={24} />
              Detalles de la Transacción
            </h3>
            <div className="grid-info">
              <div className="campo-info">
                <Hash className="icono-campo" />
                <div className="info-campo">
                  <p className="etiqueta-campo">Referencia de Pago</p>
                  <p className="valor-campo">{datosTransaccion.ref_payco}</p>
                </div>
              </div>
              
              <div className="campo-info">
                <DollarSign className="icono-campo" />
                <div className="info-campo">
                  <p className="etiqueta-campo">Valor Total</p>
                  <p className="valor-campo monto">{formatearPrecioCOP(datosTransaccion.valor)}</p>
                </div>
              </div>
              
              <div className="campo-info">
                <Calendar className="icono-campo" />
                <div className="info-campo">
                  <p className="etiqueta-campo">Fecha de Transacción</p>
                  <p className="valor-campo">{datosTransaccion.fecha || 'No disponible'}</p>
                </div>
              </div>
              
              <div className="campo-info">
                <Building className="icono-campo" />
                <div className="info-campo">
                  <p className="etiqueta-campo">Banco</p>
                  <p className="valor-campo">{datosTransaccion.banco || 'No disponible'}</p>
                </div>
              </div>
              
              {datosTransaccion.franquicia && (
                <div className="campo-info">
                  <CreditCard className="icono-campo" />
                  <div className="info-campo">
                    <p className="etiqueta-campo">Franquicia</p>
                    <p className="valor-campo">{datosTransaccion.franquicia}</p>
                  </div>
                </div>
              )}
              
              {datosTransaccion.recibo && (
                <div className="campo-info">
                  <Package className="icono-campo" />
                  <div className="info-campo">
                    <p className="etiqueta-campo">Recibo</p>
                    <p className="valor-campo">{datosTransaccion.recibo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumen del pedido */}
          <div className="resumen-pedido">
            <h3 className="titulo-seccion">
              <ShoppingBag size={24} />
              Resumen del Pedido
            </h3>
            <ul className="lista-productos">
              {datosTransaccion.productos.map((producto) => (
                <li key={producto.id} className="item-producto">
                  <img 
                    src={producto.imagen} 
                    alt={producto.nombre}
                    className="imagen-producto"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                  <div className="info-producto">
                    <h4 className="nombre-producto">{producto.nombre}</h4>
                    <p className="cantidad-producto">Cantidad: {producto.cantidad}</p>
                  </div>
                  <div className="precio-producto">
                    {formatearPrecioCOP(producto.precio)}
                  </div>
                </li>
              ))}
            </ul>
            <div className="total-pedido">
              <span className="etiqueta-total">Total:</span>
              <span className="valor-total">{formatearPrecioCOP(datosTransaccion.valor)}</span>
            </div>
          </div>

          {/* Información adicional según el estado */}
          {estadoTransaccion === 'exitoso' && (
            <div className="info-adicional">
              <h4>¡Felicitaciones por tu compra!</h4>
              <p>
                Recibirás un correo electrónico con los detalles de tu pedido y la información de seguimiento. 
                Si tienes alguna pregunta, no dudes en contactarnos.
              </p>
            </div>
          )}

          {estadoTransaccion === 'rechazado' && (
            <div className="info-adicional">
              <h4>¿Qué puedes hacer ahora?</h4>
              <p>
                Tu pago no pudo ser procesado. Esto puede deberse a fondos insuficientes, datos incorrectos 
                o restricciones del banco. Puedes intentar nuevamente con otra tarjeta o método de pago.
              </p>
            </div>
          )}

          {estadoTransaccion === 'pendiente' && (
            <div className="info-adicional">
              <h4>Tu pago está siendo verificado</h4>
              <p>
                Estamos procesando tu transacción. Recibirás una confirmación por correo electrónico 
                una vez que se complete el proceso. Esto puede tomar unos minutos.
              </p>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="acciones-respuesta">
          {estadoTransaccion === 'exitoso' && (
            <>
              <Link to="/mis-pedidos" className="boton-accion boton-exito">
                <Package size={20} />
                Ver Mis Pedidos
              </Link>
              <Link to="/tienda" className="boton-accion boton-secundario">
                <ShoppingBag size={20} />
                Seguir Comprando
              </Link>
            </>
          )}
          
          {estadoTransaccion === 'rechazado' && (
            <>
              <Link to="/carrito" className="boton-accion boton-primario">
                <ArrowLeft size={20} />
                Intentar Nuevamente
              </Link>
              <Link to="/tienda" className="boton-accion boton-secundario">
                <ShoppingBag size={20} />
                Seguir Comprando
              </Link>
            </>
          )}
          
          {estadoTransaccion === 'pendiente' && (
            <>
              <button 
                onClick={() => window.location.reload()} 
                className="boton-accion boton-primario"
              >
                <Clock size={20} />
                Actualizar Estado
              </button>
              <Link to="/" className="boton-accion boton-secundario">
                <Home size={20} />
                Volver al Inicio
              </Link>
            </>
          )}
          
          <Link to="/" className="boton-accion boton-secundario">
            <Home size={20} />
            Inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PaginaRespuestaEpayco