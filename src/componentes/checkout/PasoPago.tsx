import React from 'react'
import { Shield, CreditCard, Star, Clock, AlertCircle } from 'lucide-react'
import { formatearPrecioCOP } from '../../utilidades/formatoPrecio'

export default function PasoPago({
  subtotal, descuentos, envio, total,
  descuentoCupon, cuponAplicado,
  cargandoPago, errorPago,
  procesarPago
}) {
  const totalFinal = total - (descuentoCupon || 0)

  return (
    <div className="step-contenido">
      <div className="epayco-info">
        <div className="info-seguridad">
          <Shield size={32} />
          <div>
            <h4>Pago 100% Seguro</h4>
            <p>Tu información está protegida con certificación PCI DSS Nivel 1</p>
          </div>
        </div>

        <div className="metodos-disponibles">
          <h4>Métodos disponibles:</h4>
          <div className="metodos-grid">
            <div className="metodo-item"><CreditCard size={20} /><span>Tarjetas Crédito/Débito</span></div>
            <div className="metodo-item"><Shield size={20} /><span>PSE</span></div>
            <div className="metodo-item"><Star size={20} /><span>Efecty</span></div>
            <div className="metodo-item"><Clock size={20} /><span>Baloto</span></div>
          </div>
        </div>

        <div className="resumen-pago">
          <h4>Resumen de compra:</h4>
          <div className="resumen-detalles">
            <div className="detalle-linea"><span>Productos</span><span>{formatearPrecioCOP(subtotal)}</span></div>
            {descuentos > 0 && <div className="detalle-linea descuento"><span>Descuentos</span><span>-{formatearPrecioCOP(descuentos)}</span></div>}
            {cuponAplicado && descuentoCupon > 0 && (
              <div className="detalle-linea descuento">
                <span>Cupón ({cuponAplicado.codigo})</span>
                <span>-{formatearPrecioCOP(descuentoCupon)}</span>
              </div>
            )}
            <div className="detalle-linea"><span>Envío</span><span>{envio === 0 ? 'Gratis' : formatearPrecioCOP(envio)}</span></div>
            <div className="detalle-linea total"><span>Total a pagar</span><span>{formatearPrecioCOP(totalFinal)}</span></div>
          </div>
        </div>

        {errorPago && (
          <div className="error-pago">
            <AlertCircle size={20} />
            <span>{errorPago}</span>
          </div>
        )}

        <div className="boton-pagar-container">
          <button onClick={procesarPago} className="boton-pagar-epayco" disabled={cargandoPago}>
            {cargandoPago
              ? <><div className="spinner" />Procesando...</>
              : <><Shield size={20} />Pagar {formatearPrecioCOP(totalFinal)}</>
            }
          </button>
        </div>

        <div className="garantias-pago">
          <div className="garantia"><Shield size={16} /><span>PCI DSS</span></div>
          <div className="garantia"><Star size={16} /><span>Garantía de satisfacción</span></div>
          <div className="garantia"><CreditCard size={16} /><span>Soporte 24/7</span></div>
        </div>
      </div>
    </div>
  )
}
