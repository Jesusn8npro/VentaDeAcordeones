import React, { useEffect, useMemo, useState } from 'react'
import { X, Truck, Shield, Star, CreditCard, CheckCircle, Lock, ChevronRight, BadgeDollarSign, Info } from 'lucide-react'
import { formatearPrecioCOP } from '../../utilidades/formatoPrecio'
import { validarNombre, validarTelefono, validarDireccion, validarEmail } from '../../utilidades/validaciones'
import { useAuth } from '../../contextos/ContextoAutenticacion'
import { clienteSupabase } from '../../configuracion/supabase'
import { useNavigate } from 'react-router-dom'
import Portal from '../ui/Portal'
import './ContraEntregaModal.css'

const ContraEntregaModal = ({
  abierto,
  onCerrar,
  producto,
  onConfirmar,
}) => {
  const precioUnitario = producto?.precio || 0
  const WHATSAPP_NUMERO_RAW = import.meta.env?.VITE_WHATSAPP_NUMERO ?? '3214892176'
  const WHATSAPP_NUMERO = WHATSAPP_NUMERO_RAW.startsWith('57') ? WHATSAPP_NUMERO_RAW : `57${WHATSAPP_NUMERO_RAW}`

  const generarOfertas = () => {
    const ofertas = []
    
    // Siempre agregar la oferta base de 1 unidad
    ofertas.push({
      id: 1,
      titulo: 'Compra 1 unidad',
      subtitulo: 'Precio de Oferta',
      cantidad: 1,
      descuento: 0
    })

    // ✅ CORRECCIÓN: Acceder correctamente a las promociones según la estructura real de Supabase
    // Las promociones están en producto.promociones.promociones (no directamente en producto.promociones)
    let promocionesReales = null
    
    if (producto?.promociones) {
      // Si promociones es un objeto con la estructura {titulo, subtitulo, promociones: [...]}
      if (producto.promociones.promociones && Array.isArray(producto.promociones.promociones)) {
        promocionesReales = producto.promociones.promociones
      }
      // Si promociones es directamente un array (estructura alternativa)
      else if (Array.isArray(producto.promociones)) {
        promocionesReales = producto.promociones
      }
    }

    if (promocionesReales && promocionesReales.length > 0) {
      // Mapear SOLO las promociones reales de Supabase al formato del modal
      promocionesReales.forEach((promo, index) => {
        // Validar que la promoción esté activa y tenga cantidad mínima válida
        if (promo.activa && promo.cantidadMinima && promo.cantidadMinima > 1 && promo.descuentoPorcentaje) {
          ofertas.push({
            id: index + 2,
            titulo: `Compra ${promo.cantidadMinima} unidades con un ${promo.descuentoPorcentaje}% de descuento adicional`,
            subtitulo: promo.descripcion || `Ahorras ${promo.descuentoPorcentaje}% Más`,
            cantidad: promo.cantidadMinima,
            descuento: promo.descuentoPorcentaje
          })
        }
      })
    }

    return ofertas
  }

  const OFERTAS = useMemo(() => {
    const ofertas = generarOfertas()
    return ofertas
  }, [producto?.promociones, producto?.id])
  const [ofertaSeleccionada, setOfertaSeleccionada] = useState(null)
  const [agregarUpsell, setAgregarUpsell] = useState(false)
  const PRECIO_UPSELL = 32000

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    apto: '',
    barrio: '',
    departamento: '',
    ciudad: '',
  })
  const [errores, setErrores] = useState({})
  const { registrarse, sesionInicializada, usuario } = useAuth()
  const [compraConfirmada, setCompraConfirmada] = useState(null)
  const [contador, setContador] = useState(8)
  const [redireccionEnCurso, setRedireccionEnCurso] = useState(false)
  const [cerrandoAuto, setCerrandoAuto] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    if (OFERTAS.length > 0) {
      if (!ofertaSeleccionada || !OFERTAS.find(o => o.id === ofertaSeleccionada?.id)) {
        setOfertaSeleccionada(OFERTAS[0])
      }
    }
  }, [OFERTAS, ofertaSeleccionada])

  const DEPARTAMENTOS_CO = useMemo(() => [
    'Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá',
    'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare',
    'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo',
    'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima',
    'Valle del Cauca', 'Vaupés', 'Vichada'
  ], [])

  const generarPasswordAleatoria = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  // Función auxiliar para asegurar que un valor sea string
  const asegurarString = (valor) => {
    if (!valor) return ''
    
    // Si es un objeto, intentar extraer el valor string
    if (typeof valor === 'object') {
      // Si tiene una propiedad 'value', usarla
      if (valor.value !== undefined) return String(valor.value)
      // Si tiene una propiedad 'target' (evento), usar target.value
      if (valor.target && valor.target.value !== undefined) return String(valor.target.value)
      // Si es un array, tomar el primer elemento
      if (Array.isArray(valor) && valor.length > 0) return String(valor[0])
      // Si no se puede extraer un valor válido del objeto, retornar string vacío
      // NUNCA convertir el objeto completo a string para evitar JSON
      return ''
    }
    
    return String(valor)
  }

  // Función para sincronizar datos del pedido con la tabla usuarios
  const sincronizarDatosUsuario = async (datosFormulario, usuarioId) => {
    try {
      if (!usuarioId) {
        return
      }

      // Extraer valores directamente del formulario
      const nombre = datosFormulario.nombre || ''
      const apellido = datosFormulario.apellido || ''
      const telefono = datosFormulario.telefono || ''
      const direccion = datosFormulario.direccion || ''
      const ciudad = datosFormulario.ciudad || ''
      const departamento = datosFormulario.departamento || ''

      // Construir nombre completo
      const nombreCompleto = `${nombre} ${apellido}`.trim()

      // Preparar datos para actualizar en la tabla usuarios
      const datosActualizacion = {
        nombre: nombreCompleto,
        telefono: telefono,
        direccion_linea_1: direccion,
        ciudad: ciudad,
        departamento: departamento,
        actualizado_el: new Date().toISOString()
      }

      // Actualizar la tabla usuarios
      const { error } = await clienteSupabase
        .from('usuarios')
        .update(datosActualizacion)
        .eq('id', usuarioId)

      if (error) {
        // Error al sincronizar datos del usuario
      }
    } catch (error) {
      // Error en sincronizarDatosUsuario
    }
  }

  const manejarConfirmar = async (e) => {
    e.preventDefault()
    
    const nuevosErrores = {}
    if (!validarNombre(form.nombre)) nuevosErrores.nombre = 'Nombre inválido'
    if (!validarNombre(form.apellido)) nuevosErrores.apellido = 'Apellido inválido'
    if (!validarEmail(form.email)) nuevosErrores.email = 'Email inválido'
    if (!validarTelefono(form.telefono)) nuevosErrores.telefono = 'Teléfono inválido'
    if (!validarDireccion(form.direccion)) nuevosErrores.direccion = 'Dirección inválida'
    if (!form.departamento) nuevosErrores.departamento = 'Selecciona un departamento'
    if (!form.ciudad) nuevosErrores.ciudad = 'Ciudad requerida'

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores)
      return
    }

    try {
      let usuarioId = usuario?.id

      if (!sesionInicializada || !usuario) {
        const passwordTemporal = generarPasswordAleatoria()
        const resultadoRegistro = await registrarse(form.email, passwordTemporal, {
          nombre: form.nombre,
          apellido: form.apellido,
          telefono: form.telefono
        })

        if (resultadoRegistro.error) {
          setErrores({ general: 'Error al crear cuenta: ' + resultadoRegistro.error.message })
          return
        }
        usuarioId = resultadoRegistro.data.user.id
      }

      const precioConDescuento = precioUnitario * (1 - (ofertaSeleccionada?.descuento || 0) / 100)
      const subtotal = precioConDescuento * (ofertaSeleccionada?.cantidad || 1)
      const upsellTotal = agregarUpsell ? PRECIO_UPSELL : 0
      const total = subtotal + upsellTotal

      // Asegurar que nombre, apellido y teléfono sean strings antes de guardar
      const nombreString = asegurarString(form.nombre)
      const apellidoString = asegurarString(form.apellido)
      const telefonoString = asegurarString(form.telefono)
      
      const payload = {
        usuario_id: usuarioId,
        numero_pedido: `COD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nombre_cliente: `${nombreString} ${apellidoString}`.trim(),
        email_cliente: form.email,
        telefono_cliente: telefonoString,
        direccion_envio: {
          direccion: form.direccion,
          apto: form.apto,
          barrio: form.barrio,
          ciudad: form.ciudad,
          departamento: form.departamento
        },
        productos: [{
          id: producto.id,
          nombre: producto.nombre,
          cantidad: ofertaSeleccionada?.cantidad || 1,
          precio_unitario: precioUnitario,
          descuento_porcentaje: ofertaSeleccionada?.descuento || 0,
          precio_con_descuento: precioConDescuento,
          oferta: {
            id: ofertaSeleccionada?.id,
            titulo: ofertaSeleccionada?.titulo,
            cantidad: ofertaSeleccionada?.cantidad,
            descuento: ofertaSeleccionada?.descuento
          },
          upsell_agregado: agregarUpsell,
          upsell_precio: agregarUpsell ? PRECIO_UPSELL : 0
        }],
        subtotal: subtotal,
        descuento_aplicado: (precioUnitario * (ofertaSeleccionada?.cantidad || 1)) - subtotal,
        costo_envio: 0,
        total: total,
        estado: 'pendiente',
        metodo_pago: 'contra_entrega'
      }

      const { data, error } = await clienteSupabase
        .from('pedidos')
        .insert([payload])
        .select()

      if (error) {
        // Error al guardar pedido
        setErrores({ general: 'Error al procesar el pedido' })
        return
      }

      // Sincronizar datos del pedido con la tabla usuarios
      await sincronizarDatosUsuario(form, usuarioId)

      setCompraConfirmada(data[0])
      if (onConfirmar) onConfirmar(data[0])

    } catch (error) {
      // Error en manejarConfirmar
      setErrores({ general: 'Error al procesar el pedido' })
    }
  }

  const manejarCambioForm = (campo, valor) => {
    // Asegurar que el valor sea siempre un string
    const valorString = asegurarString(valor)
    setForm(prev => ({ ...prev, [campo]: valorString }))
    if (errores[campo]) {
      setErrores(prev => ({ ...prev, [campo]: '' }))
    }
  }

  const calcularSubtotal = () => {
    if (!ofertaSeleccionada) return 0
    const precioConDescuento = precioUnitario * (1 - (ofertaSeleccionada.descuento || 0) / 100)
    return precioConDescuento * ofertaSeleccionada.cantidad
  }

  const calcularTotal = () => {
    const subtotal = calcularSubtotal()
    const upsellTotal = agregarUpsell ? PRECIO_UPSELL : 0
    return subtotal + upsellTotal
  }

  useEffect(() => {
    let intervalo
    if (compraConfirmada && contador > 0) {
      intervalo = setInterval(() => {
        setContador(prev => prev - 1)
      }, 1000)
    } else if (compraConfirmada && contador === 0 && !redireccionEnCurso) {
      setRedireccionEnCurso(true)
      const mensaje = `¡Hola! Acabo de realizar un pedido:\n\n` +
        `🛍️ Producto: ${producto?.nombre}\n` +
        `📦 Cantidad: ${ofertaSeleccionada?.cantidad}\n` +
        `💰 Total: ${formatearPrecioCOP(calcularTotal())}\n` +
        `📋 Pedido: ${compraConfirmada.numero_pedido}\n\n` +
        `📍 Dirección de entrega:\n${form.direccion}, ${form.ciudad}, ${form.departamento}\n\n` +
        `👤 Datos de contacto:\n${nombreString} ${apellidoString}\n📱 ${form.telefono}`

      const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`
      window.open(url, '_blank')
      
      setTimeout(() => {
        setCerrandoAuto(true)
        setTimeout(() => {
          onCerrar()
        }, 500)
      }, 1000)
    }

    return () => {
      if (intervalo) clearInterval(intervalo)
    }
  }, [compraConfirmada, contador, redireccionEnCurso, producto, ofertaSeleccionada, form, WHATSAPP_NUMERO, onCerrar])

  useEffect(() => {
    if (abierto) {
      const prevOverflow = document.body.style.overflow
      const prevTouch = document.body.style.touchAction
      document.body.style.overflow = 'hidden'
      document.body.style.touchAction = 'pan-y'
      return () => {
        document.body.style.overflow = prevOverflow
        document.body.style.touchAction = prevTouch
      }
    }
  }, [abierto])

  if (!abierto) return null

  return (
    <Portal>
      <div className={`cod-modal-overlay ${cerrandoAuto ? 'cod-cerrando' : ''}`} onClick={onCerrar}>
      <div className="cod-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cod-cerrar" onClick={onCerrar}>
          <X size={24} />
        </button>

        {!compraConfirmada ? (
          <>
            <div className="cod-header">
              <div className="cod-icono-pago">
                <BadgeDollarSign size={32} />
              </div>
              <h2 className="cod-titulo">Pago Contra Entrega</h2>
              <p className="cod-subtitulo">Paga al recibir tu pedido</p>
            </div>

            <div className="cod-banner">
              <div className="cod-banner-contenido">
                <Truck className="cod-banner-icono" size={20} />
                <span>Envío GRATIS a toda Colombia</span>
              </div>
            </div>

            <div className="cod-ofertas">
              <h3 className="cod-ofertas-titulo">Selecciona tu oferta:</h3>
              <div className="cod-ofertas-lista">
                {console.log('🎨 DEBUG - Renderizando ofertas en JSX:', OFERTAS)}
                {OFERTAS && OFERTAS.length > 0 ? OFERTAS.map((o) => {
                  console.log('🎨 DEBUG - Renderizando oferta individual:', o)
                  return (
                    <label
                      key={o.id}
                      className={`cod-oferta ${ofertaSeleccionada?.id === o.id ? 'cod-oferta-seleccionada' : ''}`}
                      data-descuento={o.descuento}
                    >
                      <input
                        type="radio"
                        name="oferta"
                        value={o.id}
                        checked={ofertaSeleccionada?.id === o.id}
                        onChange={() => setOfertaSeleccionada(o)}
                      />
                      <div className="cod-oferta-contenido">
                        <div className="cod-oferta-info">
                          <h4 className="cod-oferta-titulo">{o.titulo}</h4>
                          <p className="cod-oferta-subtitulo">{o.subtitulo}</p>
                        </div>
                        <div className="cod-oferta-precio">
                          {formatearPrecioCOP(precioUnitario * (1 - (o.descuento || 0) / 100) * o.cantidad)}
                        </div>
                      </div>
                      {o.descuento > 0 && (
                        <div className="cod-oferta-descuento">
                          -{o.descuento}%
                        </div>
                      )}
                    </label>
                  )
                }) : (
                  <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                    🔄 Cargando ofertas...
                  </div>
                )}
              </div>
            </div>

            <div className="cod-resumen">
              <div className="cod-resumen-linea">
                <span>Subtotal</span>
                <span>{formatearPrecioCOP(calcularSubtotal())}</span>
              </div>
              <div className="cod-resumen-linea">
                <span>Envío</span>
                <span className="cod-gratis">Gratis</span>
              </div>
              <div className="cod-resumen-linea cod-total">
                <span>Total</span>
                <span>{formatearPrecioCOP(calcularTotal())}</span>
              </div>
            </div>

            <form onSubmit={manejarConfirmar} className="cod-formulario">
              <h3 className="cod-form-titulo">Datos de envío</h3>
              
              <div className="cod-form-grupo-doble">
                <div className="cod-form-grupo">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={form.nombre}
                    onChange={(e) => manejarCambioForm('nombre', e.target.value)}
                    className={errores.nombre ? 'cod-error' : ''}
                  />
                  {errores.nombre && <span className="cod-error-texto">{errores.nombre}</span>}
                </div>
                <div className="cod-form-grupo">
                  <input
                    type="text"
                    placeholder="Apellido"
                    value={form.apellido}
                    onChange={(e) => manejarCambioForm('apellido', e.target.value)}
                    className={errores.apellido ? 'cod-error' : ''}
                  />
                  {errores.apellido && <span className="cod-error-texto">{errores.apellido}</span>}
                </div>
              </div>

              <div className="cod-form-grupo">
                <input
                  type="email"
                  placeholder="Correo electrónico"
                  value={form.email}
                  onChange={(e) => manejarCambioForm('email', e.target.value)}
                  className={errores.email ? 'cod-error' : ''}
                />
                {errores.email && <span className="cod-error-texto">{errores.email}</span>}
              </div>

              <div className="cod-form-grupo">
                <input
                  type="tel"
                  placeholder="Teléfono (ej: 3001234567)"
                  value={form.telefono}
                  onChange={(e) => manejarCambioForm('telefono', e.target.value)}
                  className={errores.telefono ? 'cod-error' : ''}
                />
                {errores.telefono && <span className="cod-error-texto">{errores.telefono}</span>}
              </div>

              <div className="cod-form-grupo">
                <input
                  type="text"
                  placeholder="Dirección completa"
                  value={form.direccion}
                  onChange={(e) => manejarCambioForm('direccion', e.target.value)}
                  className={errores.direccion ? 'cod-error' : ''}
                />
                {errores.direccion && <span className="cod-error-texto">{errores.direccion}</span>}
              </div>

              <div className="cod-form-grupo-doble">
                <div className="cod-form-grupo">
                  <input
                    type="text"
                    placeholder="Apto/Casa (opcional)"
                    value={form.apto}
                    onChange={(e) => manejarCambioForm('apto', e.target.value)}
                  />
                </div>
                <div className="cod-form-grupo">
                  <input
                    type="text"
                    placeholder="Barrio"
                    value={form.barrio}
                    onChange={(e) => manejarCambioForm('barrio', e.target.value)}
                  />
                </div>
              </div>

              <div className="cod-form-grupo-doble">
                <div className="cod-form-grupo">
                  <select
                    value={form.departamento}
                    onChange={(e) => manejarCambioForm('departamento', e.target.value)}
                    className={errores.departamento ? 'cod-error' : ''}
                  >
                    <option value="">Selecciona departamento</option>
                    {DEPARTAMENTOS_CO.map(dep => (
                      <option key={dep} value={dep}>{dep}</option>
                    ))}
                  </select>
                  {errores.departamento && <span className="cod-error-texto">{errores.departamento}</span>}
                </div>
                <div className="cod-form-grupo">
                  <input
                    type="text"
                    placeholder="Ciudad"
                    value={form.ciudad}
                    onChange={(e) => manejarCambioForm('ciudad', e.target.value)}
                    className={errores.ciudad ? 'cod-error' : ''}
                  />
                  {errores.ciudad && <span className="cod-error-texto">{errores.ciudad}</span>}
                </div>
              </div>

              {errores.general && (
                <div className="cod-error-general">{errores.general}</div>
              )}

              <button type="submit" className="cod-cta-principal">
                <Lock size={20} />
                Confirmar Pedido - {formatearPrecioCOP(calcularTotal())}
                <ChevronRight size={20} />
              </button>
            </form>
          </>
        ) : (
          <div className="cod-confirmacion">
            <div className="cod-confirmacion-icono">
              <CheckCircle size={64} />
            </div>
            <h2 className="cod-confirmacion-titulo">¡Pedido Confirmado!</h2>
            <p className="cod-confirmacion-numero">
              Número de pedido: <strong>{compraConfirmada.numero_pedido}</strong>
            </p>
            <div className="cod-confirmacion-detalles">
              <p><strong>Total:</strong> {formatearPrecioCOP(compraConfirmada.total)}</p>
              <p><strong>Método:</strong> Pago contra entrega</p>
              <p><strong>Entrega:</strong> 1-3 días hábiles</p>
            </div>
            <div className="cod-confirmacion-acciones">
              <button
                type="button"
                className="cod-cta-principal"
                onClick={() => {
                  const mensaje = `¡Hola! Acabo de realizar un pedido:\n\n` +
                    `🛍️ Producto: ${producto?.nombre}\n` +
                    `📦 Cantidad: ${ofertaSeleccionada?.cantidad}\n` +
                    `💰 Total: ${formatearPrecioCOP(calcularTotal())}\n` +
                    `📋 Pedido: ${compraConfirmada.numero_pedido}\n\n` +
                    `📍 Dirección de entrega:\n${form.direccion}, ${form.ciudad}, ${form.departamento}\n\n` +
                    `👤 Datos de contacto:\n${asegurarString(form.nombre)} ${asegurarString(form.apellido)}\n📱 ${form.telefono}`

                  const url = `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensaje)}`
                  window.open(url, '_blank')
                }}
              >
                Consultar por WhatsApp {contador > 0 ? `(se abrirá en ${contador}s)` : ''}
              </button>
              <button type="button" className="cod-cta-secundario" onClick={onCerrar}>Cerrar</button>
            </div>
          </div>
        )}
        
        {!compraConfirmada && (
          <div className="cod-sellos">
            <img
              className="cod-sellos-img"
              src="/images/Garantia%20de%20compra.webp"
              alt="Envío rápido, pago seguro y satisfacción garantizada"
              loading="lazy"
            />
          </div>
        )}
        
        {!compraConfirmada && (
          <div className="cod-plataforma">
            <button type="button" className="cod-cta-plataforma">
              AHORRA 5% PAGANDO AQUÍ, CON TARJETA DE CRÉDITO O PSE
              <span className="cod-hand">👈</span>
            </button>
            <p className="cod-plataforma-desc">
              Pago en línea: pagas ahora. Contra Entrega: pagas al recibir.
            </p>
            <div className="cod-logos-pago-wrap">
              <img
                className="cod-logos-pago"
                src="/images/Imagen%20para%20los%20pagos.jpg"
                alt="Medios de pago: PSE, Wompi, PayU, Visa, Mastercard, Diners, MercadoPago, Addi"
                loading="lazy"
              />
            </div>
          </div>
        )}
      </div>
    </div>
    </Portal>
  )
}

export default ContraEntregaModal
