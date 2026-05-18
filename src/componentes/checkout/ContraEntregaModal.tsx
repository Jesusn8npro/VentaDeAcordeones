import React, { useEffect, useMemo, useState } from 'react'
import { X, Truck, BadgeDollarSign } from 'lucide-react'
import ConfirmacionPedido from './ConfirmacionPedido'
import FormularioDireccionCOD from './FormularioDireccionCOD'
import SeleccionOfertas from './SeleccionOfertas'
import { formatearPrecioCOP } from '../../utilidades/formatoPrecio'
import { validarNombre, validarTelefono, validarDireccion, validarEmail } from '../../utilidades/validaciones'
import { useAuth } from '../../contextos/ContextoAutenticacion'
import { clienteSupabase } from '../../configuracion/supabase'
import { useNavigate } from '@/compat/router'
import Portal from '../ui/Portal'
import './ContraEntregaModal.css'

const ContraEntregaModal = ({
  abierto,
  onCerrar,
  producto,
  onConfirmar,
}) => {
  const precioUnitario = producto?.precio || 0
  const WHATSAPP_NUMERO_RAW = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO ?? '3208492093'
  const WHATSAPP_NUMERO = WHATSAPP_NUMERO_RAW.startsWith('57') ? WHATSAPP_NUMERO_RAW : `57${WHATSAPP_NUMERO_RAW}`

  const OFERTAS = useMemo(() => {
    const ofertas = [{ id: 1, titulo: 'Compra 1 unidad', subtitulo: 'Precio de Oferta', cantidad: 1, descuento: 0 }]

    let promocionesReales = null
    if (producto?.promociones) {
      if (Array.isArray(producto.promociones.promociones)) {
        promocionesReales = producto.promociones.promociones
      } else if (Array.isArray(producto.promociones)) {
        promocionesReales = producto.promociones
      }
    }

    promocionesReales?.forEach((promo, index) => {
      if (promo.activa && promo.cantidadMinima > 1 && promo.descuentoPorcentaje) {
        ofertas.push({
          id: index + 2,
          titulo: `Compra ${promo.cantidadMinima} unidades con un ${promo.descuentoPorcentaje}% de descuento adicional`,
          subtitulo: promo.descripcion || `Ahorras ${promo.descuentoPorcentaje}% Más`,
          cantidad: promo.cantidadMinima,
          descuento: promo.descuentoPorcentaje
        })
      }
    })

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


  const generarPasswordAleatoria = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let password = ''
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  const asegurarString = (valor) => {
    if (!valor) return ''
    if (typeof valor === 'object') {
      if (valor.value !== undefined) return String(valor.value)
      if (valor.target?.value !== undefined) return String(valor.target.value)
      if (Array.isArray(valor) && valor.length > 0) return String(valor[0])
      return ''
    }
    return String(valor)
  }

  const sincronizarDatosUsuario = async (datosFormulario, usuarioId) => {
    if (!usuarioId) return
    try {
      const { nombre, apellido, telefono, direccion, ciudad, departamento } = datosFormulario
      await clienteSupabase
        .from('usuarios')
        .update({
          nombre: `${nombre || ''} ${apellido || ''}`.trim(),
          telefono: telefono || '',
          direccion_linea_1: direccion || '',
          ciudad: ciudad || '',
          departamento: departamento || '',
          actualizado_el: new Date().toISOString()
        })
        .eq('id', usuarioId)
    } catch {
      // error silencioso
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
      const nombreString = asegurarString(form.nombre)
      const apellidoString = asegurarString(form.apellido)

      const payload = {
        usuario_id: usuarioId,
        numero_pedido: `COD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        nombre_cliente: `${nombreString} ${apellidoString}`.trim(),
        email_cliente: form.email,
        telefono_cliente: asegurarString(form.telefono),
        direccion_envio: { direccion: form.direccion, apto: form.apto, barrio: form.barrio, ciudad: form.ciudad, departamento: form.departamento },
        productos: [{
          id: producto.id,
          nombre: producto.nombre,
          cantidad: ofertaSeleccionada?.cantidad || 1,
          precio_unitario: precioUnitario,
          descuento_porcentaje: ofertaSeleccionada?.descuento || 0,
          precio_con_descuento: precioConDescuento,
          oferta: { id: ofertaSeleccionada?.id, titulo: ofertaSeleccionada?.titulo, cantidad: ofertaSeleccionada?.cantidad, descuento: ofertaSeleccionada?.descuento },
          upsell_agregado: agregarUpsell,
          upsell_precio: agregarUpsell ? PRECIO_UPSELL : 0
        }],
        subtotal,
        descuento_aplicado: (precioUnitario * (ofertaSeleccionada?.cantidad || 1)) - subtotal,
        costo_envio: 0,
        total,
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
        `👤 Datos de contacto:\n${form.nombre} ${form.apellido}\n📱 ${form.telefono}`

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

            <SeleccionOfertas
              ofertas={OFERTAS}
              ofertaSeleccionada={ofertaSeleccionada}
              onSeleccionar={setOfertaSeleccionada}
              precioUnitario={precioUnitario}
            />

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

            <FormularioDireccionCOD
              form={form}
              errores={errores}
              manejarCambioForm={manejarCambioForm}
              onSubmit={manejarConfirmar}
              total={calcularTotal()}
            />
          </>
        ) : (
          <ConfirmacionPedido
            compraConfirmada={compraConfirmada}
            producto={producto}
            ofertaSeleccionada={ofertaSeleccionada}
            calcularTotal={calcularTotal}
            form={form}
            contador={contador}
            whatsappNumero={WHATSAPP_NUMERO}
            onCerrar={onCerrar}
            asegurarString={asegurarString}
          />
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
