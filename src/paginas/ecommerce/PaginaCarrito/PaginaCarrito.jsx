import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  ShoppingCart, 
  ArrowLeft, 
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  Heart,
  Shield,
  Truck,
  CreditCard,
  Gift,
  Tag,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  Star,
  Clock
} from 'lucide-react'
import { useCarrito } from '../../../contextos/CarritoContext'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import { usarCupones } from '../../../hooks/usarCupones'
import { usarEpayco } from '../../../hooks/usarEpayco'
import { generarNumeroFactura } from '../../../servicios/epayco'
import { pedidosServicio } from '../../../servicios/pedidosServicio'
import ItemCarrito from '../../../componentes/carrito/ItemCarrito'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'
import './PaginaCarrito.css'

const PaginaCarrito = () => {
  const navigate = useNavigate()
  const { usuario } = useAuth()
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

  // Hook de cupones
  const {
    codigoCupon,
    setCodigoCupon,
    cuponValido,
    cuponAplicado,
    descuentoCupon,
    cargandoCupon,
    errorCupon,
    validarCupon,
    aplicarCupon,
    limpiarCupon,
    calcularDescuento
  } = usarCupones()

  // Hook de ePayco
  const {
    procesarPagoOnPage,
    cargando: cargandoPago,
    error: errorPago,
    servicioListo,
    limpiarError
  } = usarEpayco()

  const [stepActual, setStepActual] = useState(1)
  const [datosEnvio, setDatosEnvio] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    codigoPostal: '',
    instrucciones: '',
    // Campos adicionales para ePayco
    tipoDocumento: '',
    numeroDocumento: ''
  })
  const [metodoPago, setMetodoPago] = useState('')

  // Datos de prueba predefinidos
  const datosPrueba = {
    nombre: 'Juan Carlos',
    apellido: 'Rodríguez Pérez',
    email: 'juan.rodriguez@ejemplo.com',
    telefono: '3001234567',
    direccion: 'Carrera 15 # 93-47 Apto 501',
    ciudad: 'Bogotá',
    departamento: 'Cundinamarca',
    codigoPostal: '110221',
    instrucciones: 'Portería principal, edificio Torre Norte',
    tipoDocumento: 'CC',
    numeroDocumento: '1234567890'
  }

  // Steps del checkout
  const steps = [
    { id: 1, titulo: 'Carrito', icono: ShoppingCart },
    { id: 2, titulo: 'Envío', icono: Truck },
    { id: 3, titulo: 'Pago', icono: CreditCard },
    { id: 4, titulo: 'Confirmación', icono: CheckCircle }
  ]

  // Cargar datos del usuario si está logueado
  useEffect(() => {
    if (usuario) {
      setDatosEnvio(prev => ({
        ...prev,
        nombre: usuario.user_metadata?.nombre || '',
        apellido: usuario.user_metadata?.apellido || '',
        email: usuario.email || '',
        telefono: usuario.user_metadata?.telefono || ''
      }))
    }
  }, [usuario])

  // Manejar cambios en formulario de envío
  const manejarCambioEnvio = (campo, valor) => {
    setDatosEnvio(prev => ({
      ...prev,
      [campo]: valor
    }))
  }

  // Cargar datos de prueba
  const cargarDatosPrueba = () => {
    setDatosEnvio(datosPrueba)
    alert('✅ Datos de prueba cargados correctamente')
  }

  // Manejar aplicación de cupón
  const manejarAplicarCupon = async () => {
    if (!codigoCupon.trim()) return
    
    try {
      // Primero validar el cupón
      const esValido = await validarCupon(codigoCupon, subtotal, items)
      
      if (esValido) {
        // Si es válido, aplicarlo
        await aplicarCupon(codigoCupon, subtotal, items)
      }
    } catch (error) {
      console.error('Error al aplicar cupón:', error)
    }
  }

  // Procesar pago con ePayco
  const procesarPagoEpayco = async () => {
    try {
      // Validar que todos los datos estén completos
      if (!datosEnvio.nombre || !datosEnvio.apellido || !datosEnvio.email || 
          !datosEnvio.telefono || !datosEnvio.tipoDocumento || !datosEnvio.numeroDocumento ||
          !datosEnvio.direccion || !datosEnvio.ciudad || !datosEnvio.departamento) {
        alert('Por favor completa todos los campos obligatorios')
        return
      }

      // Calcular total final con descuentos
      const totalFinal = total - (descuentoCupon || 0)
      const numeroPedido = generarNumeroFactura('PEDIDO')

      console.log('🛒 Iniciando proceso de creación de pedido y pago...')

      // 1. CREAR EL PEDIDO EN SUPABASE PRIMERO
      const datosPedido = {
        numero_pedido: numeroPedido,
        usuario_id: usuario?.id || null,
        nombre_cliente: `${datosEnvio.nombre} ${datosEnvio.apellido}`,
        email_cliente: datosEnvio.email,
        telefono_cliente: datosEnvio.telefono,
        direccion_envio: {
          nombre: datosEnvio.nombre,
          apellido: datosEnvio.apellido,
          direccion: datosEnvio.direccion,
          ciudad: datosEnvio.ciudad,
          departamento: datosEnvio.departamento,
          codigoPostal: datosEnvio.codigoPostal || '',
          tipoDocumento: datosEnvio.tipoDocumento,
          numeroDocumento: datosEnvio.numeroDocumento,
          instrucciones: datosEnvio.instrucciones || ''
        },
        productos: items.map(item => ({
          id: item.id,
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: item.precio,
          subtotal: item.cantidad * item.precio
        })),
        subtotal: subtotal,
        descuento_aplicado: descuentos + (descuentoCupon || 0),
        costo_envio: envio,
        total: totalFinal,
        estado: 'pendiente',
        metodo_pago: 'epayco',
        referencia_pago: numeroPedido,
        epayco_ref_payco: numeroPedido, // Usar el número de pedido como referencia inicial
        notas_cliente: datosEnvio.instrucciones || null,
        epayco_test_request: true // Cambiar a false en producción
      }

      console.log('📝 Creando pedido en Supabase...', datosPedido)
      
      // Crear el pedido en Supabase
      const pedidoCreado = await pedidosServicio.crearPedido(datosPedido)
      
      console.log('✅ Pedido creado exitosamente:', pedidoCreado)

      // 2. PREPARAR DATOS PARA EPAYCO CON EL ID DEL PEDIDO CREADO
      const datosEpayco = {
        // Información del cliente
        cliente: {
          nombre: datosEnvio.nombre,
          apellido: datosEnvio.apellido,
          email: datosEnvio.email,
          telefono: datosEnvio.telefono,
          tipoDocumento: datosEnvio.tipoDocumento,
          numeroDocumento: datosEnvio.numeroDocumento,
          direccion: datosEnvio.direccion,
          ciudad: datosEnvio.ciudad,
          departamento: datosEnvio.departamento,
          codigoPostal: datosEnvio.codigoPostal || ''
        },
        // Información del pedido (ahora con el ID real del pedido creado)
        pedido: {
          id: pedidoCreado.id, // ID del pedido creado en Supabase
          referencia: numeroPedido,
          descripcion: items.length === 1 
            ? `${items[0].productos?.nombre || 'Producto'} (x${items[0].cantidad}) - MeLlevoEsto.com`
            : items.length <= 3 
              ? `${items.map(item => `${item.productos?.nombre || 'Producto'} (x${item.cantidad})`).join(', ')} - MeLlevoEsto.com`
              : `${items.slice(0, 2).map(item => `${item.productos?.nombre || 'Producto'} (x${item.cantidad})`).join(', ')} y ${items.length - 2} productos más - MeLlevoEsto.com`,
          valor: totalFinal,
          moneda: 'COP',
          items: items.map(item => ({
            nombre: item.productos?.nombre || 'Producto',
            cantidad: item.cantidad,
            precio: item.precio_unitario || item.productos?.precio || 0
          })),
          // Información adicional
          subtotal: subtotal,
          descuentos: descuentos + (descuentoCupon || 0),
          envio: envio,
          cuponAplicado: cuponAplicado?.codigo || null
        },
        // URLs de respuesta
        urls: {
          respuesta: `${window.location.origin}/respuesta-epayco`,
          confirmacion: `${window.location.origin}/confirmacion-epayco`
        }
      }

      console.log('💳 Iniciando pago con ePayco:', datosEpayco)

      // 3. PROCESAR PAGO CON EPAYCO
      await procesarPagoOnPage(datosEpayco)

    } catch (error) {
      console.error('❌ Error al procesar el pedido y pago:', error)
      alert(`Error al procesar el pedido: ${error.message}. Por favor intenta nuevamente.`)
    }
  }

  // Si el carrito está vacío
  if (!cargando && items.length === 0) {
    return (
      <div className="pagina-carrito">
        <div className="contenedor-carrito">
          <div className="carrito-vacio">
            <ShoppingCart size={80} className="icono-carrito-vacio" />
            <h2>Tu carrito está vacío</h2>
            <p>¡Descubre nuestros increíbles productos y encuentra lo que necesitas!</p>
            <Link to="/tienda" className="boton-explorar">
              Explorar productos
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pagina-carrito">
      <div className="contenedor-carrito">
        {/* Header con breadcrumb */}
        <div className="carrito-header">
          <div className="breadcrumb">
            <Link to="/" className="breadcrumb-link">Inicio</Link>
            <span className="breadcrumb-separador">/</span>
            <span className="breadcrumb-actual">Carrito</span>
          </div>
          <h1>
            <ShoppingCart size={28} />
            Mi Carrito ({totalItems} productos)
          </h1>
        </div>

        {/* Indicador de steps */}
        <div className="steps-indicador">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`step ${stepActual >= step.id ? 'activo' : ''} ${stepActual === step.id ? 'actual' : ''}`}
            >
              <div className="step-icono">
                <step.icono size={20} />
              </div>
              <span className="step-titulo">{step.titulo}</span>
              {index < steps.length - 1 && <div className="step-linea" />}
            </div>
          ))}
        </div>

        <div className="carrito-contenido">
          {/* Columna principal */}
          <div className="carrito-principal">
            {/* Step 1: Carrito */}
            {stepActual === 1 && (
              <div className="step-contenido">
                <div className="carrito-items">
                  <div className="items-header">
                    <h3>Productos en tu carrito</h3>
                    <button 
                      onClick={limpiarCarrito}
                      className="boton-limpiar"
                    >
                      <Trash2 size={16} />
                      Limpiar carrito
                    </button>
                  </div>

                  {items.map((item) => (
                    <ItemCarrito 
                      key={item.id}
                      item={item}
                      onActualizarCantidad={actualizarCantidad}
                      onEliminar={eliminarDelCarrito}
                      mostrarDescripcion={true}
                    />
                  ))}
                </div>

                {/* Sección de productos relacionados eliminada por solicitud */}
              </div>
            )}

            {/* Step 2: Información de envío */}
            {stepActual === 2 && (
              <div className="step-contenido">
                <h3>
                  <Truck size={24} />
                  Información de envío
                </h3>

                {/* Botón para cargar datos de prueba */}
                <div className="datos-prueba-container" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px dashed #007bff' }}>
                  <p style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#6c757d' }}>
                    🧪 <strong>Modo de pruebas:</strong> Carga datos predefinidos para testear más rápido
                  </p>
                  <button
                    type="button"
                    onClick={cargarDatosPrueba}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#007bff',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🚀 Cargar datos de prueba
                  </button>
                </div>
                
                <form className="formulario-envio">
                  <div className="fila-formulario">
                    <div className="campo-formulario">
                      <label>Nombre *</label>
                      <input
                        type="text"
                        value={datosEnvio.nombre}
                        onChange={(e) => manejarCambioEnvio('nombre', e.target.value)}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    <div className="campo-formulario">
                      <label>Apellido *</label>
                      <input
                        type="text"
                        value={datosEnvio.apellido}
                        onChange={(e) => manejarCambioEnvio('apellido', e.target.value)}
                        placeholder="Tu apellido"
                        required
                      />
                    </div>
                  </div>

                  <div className="fila-formulario">
                    <div className="campo-formulario">
                      <label>Email *</label>
                      <input
                        type="email"
                        value={datosEnvio.email}
                        onChange={(e) => manejarCambioEnvio('email', e.target.value)}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                    <div className="campo-formulario">
                      <label>Teléfono *</label>
                      <input
                        type="tel"
                        value={datosEnvio.telefono}
                        onChange={(e) => manejarCambioEnvio('telefono', e.target.value)}
                        placeholder="300 123 4567"
                        required
                      />
                    </div>
                  </div>

                  {/* Campos adicionales para ePayco */}
                  <div className="fila-formulario">
                    <div className="campo-formulario">
                      <label>Tipo de Documento *</label>
                      <select
                        value={datosEnvio.tipoDocumento}
                        onChange={(e) => manejarCambioEnvio('tipoDocumento', e.target.value)}
                        required
                      >
                        <option value="">Seleccionar tipo</option>
                        <option value="CC">Cédula de Ciudadanía</option>
                        <option value="CE">Cédula de Extranjería</option>
                        <option value="TI">Tarjeta de Identidad</option>
                        <option value="PP">Pasaporte</option>
                        <option value="NIT">NIT</option>
                        <option value="SSN">SSN</option>
                        <option value="LIC">Licencia de Conducción</option>
                      </select>
                    </div>
                    <div className="campo-formulario">
                      <label>Número de Documento *</label>
                      <input
                        type="text"
                        value={datosEnvio.numeroDocumento}
                        onChange={(e) => manejarCambioEnvio('numeroDocumento', e.target.value)}
                        placeholder="Ej: 12345678"
                        required
                      />
                    </div>
                  </div>

                  <div className="campo-formulario">
                    <label>Dirección completa *</label>
                    <input
                      type="text"
                      value={datosEnvio.direccion}
                      onChange={(e) => manejarCambioEnvio('direccion', e.target.value)}
                      placeholder="Calle 123 #45-67, Apartamento 8B"
                      required
                    />
                  </div>

                  <div className="fila-formulario">
                    <div className="campo-formulario">
                      <label>Ciudad *</label>
                      <input
                        type="text"
                        value={datosEnvio.ciudad}
                        onChange={(e) => manejarCambioEnvio('ciudad', e.target.value)}
                        placeholder="Bogotá"
                        required
                      />
                    </div>
                    <div className="campo-formulario">
                      <label>Departamento *</label>
                      <select
                        value={datosEnvio.departamento}
                        onChange={(e) => manejarCambioEnvio('departamento', e.target.value)}
                        required
                      >
                        <option value="">Seleccionar</option>
                        <option value="cundinamarca">Cundinamarca</option>
                        <option value="antioquia">Antioquia</option>
                        <option value="valle">Valle del Cauca</option>
                        <option value="atlantico">Atlántico</option>
                        <option value="santander">Santander</option>
                      </select>
                    </div>
                    <div className="campo-formulario">
                      <label>Código Postal</label>
                      <input
                        type="text"
                        value={datosEnvio.codigoPostal}
                        onChange={(e) => manejarCambioEnvio('codigoPostal', e.target.value)}
                        placeholder="110111"
                      />
                    </div>
                  </div>

                  <div className="campo-formulario">
                    <label>Instrucciones especiales</label>
                    <textarea
                      value={datosEnvio.instrucciones}
                      onChange={(e) => manejarCambioEnvio('instrucciones', e.target.value)}
                      placeholder="Ej: Tocar el timbre, casa de color azul..."
                      rows={3}
                    />
                  </div>
                </form>
              </div>
            )}

            {/* Step 3: Pago con ePayco */}
            {stepActual === 3 && (
              <div className="step-contenido">
                <h3>
                  <Shield size={24} />
                  Pago Seguro con ePayco
                </h3>

                <div className="epayco-info">
                  <div className="info-seguridad">
                    <div className="icono-seguridad">
                      <Shield size={32} />
                    </div>
                    <div className="texto-seguridad">
                      <h4>Pago 100% Seguro</h4>
                      <p>Tu información está protegida con certificación PCI DSS Nivel 1</p>
                    </div>
                  </div>

                  <div className="metodos-disponibles">
                    <h4>Métodos de pago disponibles:</h4>
                    <div className="metodos-grid">
                      <div className="metodo-item">
                        <CreditCard size={20} />
                        <span>Tarjetas de Crédito/Débito</span>
                      </div>
                      <div className="metodo-item">
                        <Shield size={20} />
                        <span>PSE</span>
                      </div>
                      <div className="metodo-item">
                        <Star size={20} />
                        <span>Efecty</span>
                      </div>
                      <div className="metodo-item">
                        <Clock size={20} />
                        <span>Baloto</span>
                      </div>
                    </div>
                  </div>

                  <div className="resumen-pago">
                    <h4>Resumen de tu compra:</h4>
                    <div className="resumen-detalles">
                      <div className="detalle-linea">
                        <span>Productos ({totalItems})</span>
                        <span>{formatearPrecioCOP(subtotal)}</span>
                      </div>
                      {descuentos > 0 && (
                        <div className="detalle-linea descuento">
                          <span>Descuentos</span>
                          <span>-{formatearPrecioCOP(descuentos)}</span>
                        </div>
                      )}
                      {cuponAplicado && descuentoCupon > 0 && (
                        <div className="detalle-linea descuento">
                          <span>Cupón ({cuponAplicado.codigo})</span>
                          <span>-{formatearPrecioCOP(descuentoCupon)}</span>
                        </div>
                      )}
                      <div className="detalle-linea">
                        <span>Envío</span>
                        <span>{envio === 0 ? 'Gratis' : formatearPrecioCOP(envio)}</span>
                      </div>
                      <div className="detalle-linea total">
                        <span>Total a pagar</span>
                        <span>{formatearPrecioCOP(total - (descuentoCupon || 0))}</span>
                      </div>
                    </div>
                  </div>

                  {errorPago && (
                    <div className="error-pago">
                      <AlertCircle size={20} />
                      <span>{errorPago}</span>
                    </div>
                  )}

                  <div className="boton-pagar-container">
                    <button 
                      onClick={procesarPagoEpayco}
                      className="boton-pagar-epayco"
                      disabled={cargandoPago}
                    >
                      {cargandoPago ? (
                        <>
                          <div className="spinner"></div>
                          Procesando pago...
                        </>
                      ) : (
                        <>
                          <Shield size={20} />
                          Pagar {formatearPrecioCOP(total - (descuentoCupon || 0))}
                        </>
                      )}
                    </button>
                  </div>

                  <div className="garantias-pago">
                    <div className="garantia">
                      <Shield size={16} />
                      <span>Certificación PCI DSS</span>
                    </div>
                    <div className="garantia">
                      <Star size={16} />
                      <span>Garantía de satisfacción</span>
                    </div>
                    <div className="garantia">
                      <CheckCircle size={16} />
                      <span>Soporte 24/7</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Confirmación */}
            {stepActual === 4 && (
              <div className="step-contenido confirmacion">
                <div className="confirmacion-exito">
                  <CheckCircle size={80} className="icono-exito" />
                  <h2>¡Pedido confirmado!</h2>
                  <p>Tu pedido #12345 ha sido procesado exitosamente</p>
                  
                  <div className="detalles-pedido">
                    <h4>Detalles del pedido:</h4>
                    <p><strong>Email:</strong> {datosEnvio.email}</p>
                    <p><strong>Dirección:</strong> {datosEnvio.direccion}, {datosEnvio.ciudad}</p>
                    <p><strong>Subtotal:</strong> {formatearPrecioCOP(subtotal)}</p>
                    {descuentos > 0 && (
                      <p><strong>Descuentos:</strong> -{formatearPrecioCOP(descuentos)}</p>
                    )}
                    {cuponAplicado && descuentoCupon > 0 && (
                      <p><strong>Cupón ({cuponAplicado.codigo}):</strong> -{formatearPrecioCOP(descuentoCupon)}</p>
                    )}
                    <p><strong>Envío:</strong> {envio === 0 ? 'Gratis' : formatearPrecioCOP(envio)}</p>
                    <p><strong>Total:</strong> {formatearPrecioCOP(total - (descuentoCupon || 0))}</p>
                  </div>

                  <div className="acciones-confirmacion">
                    <Link to="/perfil/pedidos" className="boton-ver-pedidos">
                      Ver mis pedidos
                    </Link>
                    <Link to="/tienda" className="boton-seguir-comprando">
                      Seguir comprando
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar con resumen */}
          <div className="carrito-sidebar">
            <div className="resumen-pedido">
              <h3>Resumen del pedido</h3>
              
              <div className="resumen-lineas">
                <div className="resumen-linea">
                  <span>Subtotal ({totalItems} productos)</span>
                  <span>{formatearPrecioCOP(subtotal)}</span>
                </div>
                
                {/* Descuentos del carrito */}
                {descuentos > 0 && (
                  <div className="resumen-linea descuento">
                    <span>Descuentos</span>
                    <span>-{formatearPrecioCOP(descuentos)}</span>
                  </div>
                )}
                
                {/* Descuento del cupón */}
                {cuponAplicado && descuentoCupon > 0 && (
                  <div className="resumen-linea descuento">
                    <span>Cupón: {cuponAplicado.codigo}</span>
                    <span>-{formatearPrecioCOP(descuentoCupon)}</span>
                  </div>
                )}
                
                <div className="resumen-linea">
                  <span>Envío</span>
                  <span>{envio === 0 ? 'Gratis' : formatearPrecioCOP(envio)}</span>
                </div>
                
                <div className="resumen-linea total">
                  <span>Total</span>
                  <span className="precio-total">
                    {formatearPrecioCOP(total - (descuentoCupon || 0))}
                  </span>
                </div>
              </div>

              {/* Cupón de descuento */}
              {stepActual <= 3 && (
                <div className="seccion-cupon">
                  <h4>
                    <Tag size={16} />
                    Código de descuento
                  </h4>
                  <div className="input-cupon">
                    <input
                      type="text"
                      value={codigoCupon}
                      onChange={(e) => setCodigoCupon(e.target.value)}
                      placeholder="Ingresa tu código"
                      disabled={cargandoCupon}
                    />
                    <button 
                      onClick={manejarAplicarCupon}
                      disabled={cargandoCupon || !codigoCupon.trim()}
                    >
                      {cargandoCupon ? 'Validando...' : 'Aplicar'}
                    </button>
                  </div>
                  
                  {/* Mensaje de error */}
                  {errorCupon && (
                    <div className="cupon-error">
                      <AlertCircle size={16} />
                      {errorCupon}
                    </div>
                  )}
                  
                  {/* Cupón aplicado exitosamente */}
                  {cuponAplicado && (
                    <div className="cupon-aplicado">
                      <CheckCircle size={16} />
                      <span>
                        {cuponAplicado.codigo} - {cuponAplicado.nombre}
                        {cuponAplicado.tipo_descuento === 'porcentaje' 
                          ? ` (${cuponAplicado.valor_descuento}% de descuento)`
                          : ` (-${formatearPrecioCOP(cuponAplicado.valor_descuento)})`
                        }
                      </span>
                      <button 
                        onClick={limpiarCupon}
                        className="boton-quitar-cupon"
                        title="Quitar cupón"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Botones de navegación */}
              {stepActual < 4 && (
                <div className="botones-navegacion">
                  {stepActual > 1 && (
                    <button 
                      onClick={() => setStepActual(stepActual - 1)}
                      className="boton-anterior"
                    >
                      <ArrowLeft size={16} />
                      Anterior
                    </button>
                  )}
                  
                  {stepActual < 3 && (
                    <button 
                      onClick={() => setStepActual(stepActual + 1)}
                      className="boton-siguiente"
                    >
                      Siguiente
                      <ArrowRight size={16} />
                    </button>
                  )}
                  

                </div>
              )}

              {/* Garantías */}
              <div className="garantias">
                <div className="garantia-item">
                  <Shield size={16} />
                  <span>Compra 100% segura</span>
                </div>
                <div className="garantia-item">
                  <Truck size={16} />
                  <span>Envío gratis desde $50.000</span>
                </div>
                <div className="garantia-item">
                  <Star size={16} />
                  <span>Garantía de satisfacción</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaginaCarrito

