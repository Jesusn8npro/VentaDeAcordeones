import React from 'react'
import { CheckCircle } from 'lucide-react'
import { formatearPrecioCOP } from '../../utilidades/formatoPrecio'

interface ConfirmacionPedidoProps {
  compraConfirmada: {
    numero_pedido: string
    total: number
  }
  producto: { nombre: string } | null
  ofertaSeleccionada: { cantidad: number } | null
  calcularTotal: () => number
  form: {
    nombre: string
    apellido: string
    telefono: string
    direccion: string
    ciudad: string
    departamento: string
  }
  contador: number
  whatsappNumero: string
  onCerrar: () => void
  asegurarString: (v: unknown) => string
}

const ConfirmacionPedido = ({
  compraConfirmada,
  producto,
  ofertaSeleccionada,
  calcularTotal,
  form,
  contador,
  whatsappNumero,
  onCerrar,
  asegurarString,
}: ConfirmacionPedidoProps) => {
  const abrirWhatsApp = () => {
    const mensaje =
      `¡Hola! Acabo de realizar un pedido:\n\n` +
      `🛍️ Producto: ${producto?.nombre}\n` +
      `📦 Cantidad: ${ofertaSeleccionada?.cantidad}\n` +
      `💰 Total: ${formatearPrecioCOP(calcularTotal())}\n` +
      `📋 Pedido: ${compraConfirmada.numero_pedido}\n\n` +
      `📍 Dirección de entrega:\n${form.direccion}, ${form.ciudad}, ${form.departamento}\n\n` +
      `👤 Datos de contacto:\n${asegurarString(form.nombre)} ${asegurarString(form.apellido)}\n📱 ${form.telefono}`
    window.open(`https://wa.me/${whatsappNumero}?text=${encodeURIComponent(mensaje)}`, '_blank')
  }

  return (
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
        <button type="button" className="cod-cta-principal" onClick={abrirWhatsApp}>
          Consultar por WhatsApp {contador > 0 ? `(se abrirá en ${contador}s)` : ''}
        </button>
        <button type="button" className="cod-cta-secundario" onClick={onCerrar}>Cerrar</button>
      </div>
    </div>
  )
}

export default ConfirmacionPedido
