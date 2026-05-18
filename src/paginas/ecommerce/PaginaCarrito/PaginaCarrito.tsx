import React, { useState, useEffect } from 'react'
import { Link } from '@/compat/router'
import { useTituloPagina } from '../../../hooks/useTitulosPagina'
import { ShoppingCart, ArrowLeft, ArrowRight, Trash2, CheckCircle, Tag, Shield, Truck, Star, AlertCircle } from 'lucide-react'
import { useCarrito } from '../../../contextos/CarritoContext'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import { clienteSupabase } from '../../../configuracion/supabase'
import { usarCupones } from '../../../hooks/usarCupones'
import { usarEpayco } from '../../../hooks/usarEpayco'
import { generarNumeroFactura } from '../../../servicios/epayco'
import { pedidosServicio } from '../../../servicios/pedidosServicio'
import ItemCarrito from '../../../componentes/carrito/ItemCarrito'
import FormularioEnvio from '../../../componentes/checkout/FormularioEnvio'
import PasoPago from '../../../componentes/checkout/PasoPago'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'
import './PaginaCarrito.css'

const PASOS = [
  { id: 1, titulo: 'Carrito',      icono: ShoppingCart },
  { id: 2, titulo: 'Envío',        icono: Truck       },
  { id: 3, titulo: 'Pago',         icono: Shield      },
  { id: 4, titulo: 'Confirmación', icono: CheckCircle },
]

const DATOS_VACIO = { nombre: '', apellido: '', email: '', telefono: '', direccion: '', ciudad: '', departamento: '', codigoPostal: '', instrucciones: '', tipoDocumento: '', numeroDocumento: '' }

export default function PaginaCarrito() {
  useTituloPagina('Mi Carrito')
  const { usuario } = useAuth()
  const { items, cargando, totalItems, subtotal, descuentos, envio, total, actualizarCantidad, eliminarDelCarrito, limpiarCarrito } = useCarrito()
  const { codigoCupon, setCodigoCupon, cuponAplicado, descuentoCupon, cargandoCupon, errorCupon, validarCupon, aplicarCupon, limpiarCupon } = usarCupones()
  const { procesarPagoOnPage, cargando: cargandoPago, error: errorPago } = usarEpayco()

  const [paso, setPaso] = useState(1)
  const [datosEnvio, setDatosEnvio] = useState(DATOS_VACIO)

  // Pre-llenar desde datos del chat (prioridad baja)
  useEffect(() => {
    const chatId = localStorage.getItem('vda_chat_session_id')
    if (!chatId) return
    clienteSupabase
      .from('leadschat')
      .select('nombre, apellido, email, whatsapp, ciudad')
      .eq('chat_id', chatId)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        setDatosEnvio(d => ({
          ...d,
          nombre:   data.nombre   || d.nombre,
          apellido: data.apellido || d.apellido,
          email:    data.email    || d.email,
          telefono: data.whatsapp || d.telefono,
          ciudad:   data.ciudad   || d.ciudad,
        }))
      })
  }, [])

  // Datos del usuario autenticado sobreescriben chat (prioridad alta)
  useEffect(() => {
    if (!usuario) return
    setDatosEnvio(d => ({
      ...d,
      nombre:   usuario.nombre   || d.nombre,
      apellido: usuario.apellido || d.apellido,
      email:    usuario.email    || d.email,
      telefono: usuario.telefono || d.telefono,
    }))
  }, [usuario])

  const manejarCambio = (campo, valor) => setDatosEnvio(d => ({ ...d, [campo]: valor }))

  const manejarCupon = async () => {
    if (!codigoCupon.trim()) return
    const valido = await validarCupon(codigoCupon, subtotal, items)
    if (valido) aplicarCupon(codigoCupon, subtotal, items)
  }

  const procesarPago = async () => {
    const { nombre, apellido, email, telefono, tipoDocumento, numeroDocumento, direccion, ciudad, departamento } = datosEnvio
    if (!nombre || !apellido || !email || !telefono || !tipoDocumento || !numeroDocumento || !direccion || !ciudad || !departamento) {
      alert('Por favor completa todos los campos obligatorios')
      return
    }
    try {
      const totalFinal  = total - (descuentoCupon || 0)
      const numeroPedido = generarNumeroFactura('VDA')
      const pedido = await pedidosServicio.crearPedido({
        numero_pedido:    numeroPedido,
        usuario_id:       usuario?.id || null,
        nombre_cliente:   `${nombre} ${apellido}`,
        email_cliente:    email,
        telefono_cliente: telefono,
        direccion_envio:  datosEnvio,
        productos:        items.map(i => ({ id: i.id, nombre: i.nombre, cantidad: i.cantidad, precio: i.precio, subtotal: i.cantidad * i.precio })),
        subtotal,
        descuento_aplicado: descuentos + (descuentoCupon || 0),
        costo_envio:      envio,
        total:            totalFinal,
        estado:           'pendiente',
        metodo_pago:      'epayco',
        referencia_pago:  numeroPedido,
        epayco_test_request: process.env.NEXT_PUBLIC_EPAYCO_TEST_MODE === 'true'
      })
      await procesarPagoOnPage({
        cliente: datosEnvio,
        pedido: {
          id:          pedido.id,
          referencia:  numeroPedido,
          descripcion: `${items.length} producto(s) - VentaDeAcordeones.com`,
          valor:       totalFinal,
          moneda:      'COP',
          items:       items.map(i => ({ nombre: i.productos?.nombre || i.nombre, cantidad: i.cantidad, precio: i.precio_unitario || i.productos?.precio || 0 })),
          subtotal, descuentos: descuentos + (descuentoCupon || 0), envio,
          cuponAplicado: cuponAplicado?.codigo || null
        },
        urls: {
          respuesta:    `${window.location.origin}/respuesta-epayco`,
          confirmacion: `${window.location.origin}/confirmacion-epayco`
        }
      })
    } catch (err) {
      alert(`Error al procesar el pedido: ${err.message}`)
    }
  }

  if (!cargando && items.length === 0) {
    return (
      <div className="pagina-carrito">
        <div className="contenedor-carrito">
          <div className="carrito-vacio">
            <ShoppingCart size={80} className="icono-carrito-vacio" />
            <h2>Tu carrito está vacío</h2>
            <p>¡Descubre nuestra colección de acordeones!</p>
            <Link to="/tienda" className="boton-explorar">Explorar productos <ArrowRight size={18} /></Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pagina-carrito">
      <div className="contenedor-carrito">
        <div className="carrito-header">
          <div className="breadcrumb">
            <Link to="/" className="breadcrumb-link">Inicio</Link>
            <span className="breadcrumb-separador">/</span>
            <span className="breadcrumb-actual">Carrito</span>
          </div>
          <h1><ShoppingCart size={28} /> Mi Carrito ({totalItems} productos)</h1>
        </div>

        {/* Indicador de pasos */}
        <div className="steps-indicador">
          {PASOS.map((s, idx) => (
            <div key={s.id} className={`step ${paso >= s.id ? 'activo' : ''} ${paso === s.id ? 'actual' : ''}`}>
              <div className="step-icono"><s.icono size={20} /></div>
              <span className="step-titulo">{s.titulo}</span>
              {idx < PASOS.length - 1 && <div className="step-linea" />}
            </div>
          ))}
        </div>

        <div className="carrito-contenido">
          <div className="carrito-principal">
            {/* Paso 1 — Items */}
            {paso === 1 && (
              <div className="step-contenido">
                <div className="carrito-items">
                  <div className="items-header">
                    <h3>Productos en tu carrito</h3>
                    <button onClick={limpiarCarrito} className="boton-limpiar"><Trash2 size={16} /> Limpiar</button>
                  </div>
                  {items.map(item => (
                    <ItemCarrito key={item.id} item={item} onActualizarCantidad={actualizarCantidad} onEliminar={eliminarDelCarrito} mostrarDescripcion />
                  ))}
                </div>
              </div>
            )}

            {/* Paso 2 — Envío */}
            {paso === 2 && <FormularioEnvio datosEnvio={datosEnvio} manejarCambio={manejarCambio} />}

            {/* Paso 3 — Pago */}
            {paso === 3 && (
              <PasoPago
                subtotal={subtotal} descuentos={descuentos} envio={envio} total={total}
                descuentoCupon={descuentoCupon} cuponAplicado={cuponAplicado}
                cargandoPago={cargandoPago} errorPago={errorPago}
                procesarPago={procesarPago}
              />
            )}

            {/* Paso 4 — Confirmación local */}
            {paso === 4 && (
              <div className="step-contenido confirmacion">
                <CheckCircle size={80} className="icono-exito" />
                <h2>¡Pedido enviado!</h2>
                <p>Recibirás confirmación en tu email.</p>
                <div className="acciones-confirmacion">
                  <Link to="/perfil/pedidos" className="boton-ver-pedidos">Ver mis pedidos</Link>
                  <Link to="/tienda" className="boton-seguir-comprando">Seguir comprando</Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="carrito-sidebar">
            <div className="resumen-pedido">
              <h3>Resumen del pedido</h3>
              <div className="resumen-lineas">
                <div className="resumen-linea"><span>Subtotal ({totalItems})</span><span>{formatearPrecioCOP(subtotal)}</span></div>
                {descuentos > 0 && <div className="resumen-linea descuento"><span>Descuentos</span><span>-{formatearPrecioCOP(descuentos)}</span></div>}
                {cuponAplicado && descuentoCupon > 0 && (
                  <div className="resumen-linea descuento"><span>Cupón: {cuponAplicado.codigo}</span><span>-{formatearPrecioCOP(descuentoCupon)}</span></div>
                )}
                <div className="resumen-linea"><span>Envío</span><span>{envio === 0 ? 'Gratis' : formatearPrecioCOP(envio)}</span></div>
                <div className="resumen-linea total"><span>Total</span><span className="precio-total">{formatearPrecioCOP(total - (descuentoCupon || 0))}</span></div>
              </div>

              {paso <= 3 && (
                <div className="seccion-cupon">
                  <h4><Tag size={16} /> Código de descuento</h4>
                  <div className="input-cupon">
                    <input type="text" value={codigoCupon} onChange={e => setCodigoCupon(e.target.value)} placeholder="Tu código" disabled={cargandoCupon} />
                    <button onClick={manejarCupon} disabled={cargandoCupon || !codigoCupon.trim()}>{cargandoCupon ? '...' : 'Aplicar'}</button>
                  </div>
                  {errorCupon && <div className="cupon-error"><AlertCircle size={16} />{errorCupon}</div>}
                  {cuponAplicado && (
                    <div className="cupon-aplicado">
                      <CheckCircle size={16} />
                      <span>{cuponAplicado.codigo}</span>
                      <button onClick={limpiarCupon} className="boton-quitar-cupon">×</button>
                    </div>
                  )}
                </div>
              )}

              {paso < 4 && (
                <div className="botones-navegacion">
                  {paso > 1 && <button onClick={() => setPaso(p => p - 1)} className="boton-anterior"><ArrowLeft size={16} /> Anterior</button>}
                  {paso < 3 && <button onClick={() => setPaso(p => p + 1)} className="boton-siguiente">Siguiente <ArrowRight size={16} /></button>}
                </div>
              )}

              <div className="garantias">
                <div className="garantia-item"><Shield size={16} /><span>Compra 100% segura</span></div>
                <div className="garantia-item"><Truck size={16} /><span>Envío gratis +$50.000</span></div>
                <div className="garantia-item"><Star size={16} /><span>Garantía de satisfacción</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
