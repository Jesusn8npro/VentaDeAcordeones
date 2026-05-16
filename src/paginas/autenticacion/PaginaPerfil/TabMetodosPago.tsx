import React from 'react'
import { CreditCard } from 'lucide-react'

interface TabMetodosPagoProps {
  alias: string
}

export default function TabMetodosPago({ alias }: TabMetodosPagoProps) {
  const metodos = [
    { tipo: 'Visa', terminacion: '1823' },
    { tipo: 'Mastercard', terminacion: '7741' }
  ]

  return (
    <section className="panel lujo-grid">
      <div className="panel-card">
        <div className="panel-card-header">
          <h3>Métodos de pago</h3>
          <p>Guarda y administra tarjetas y PSE</p>
        </div>
        <div className="metodos-grid">
          {metodos.map((m, i) => (
            <div key={i} className="metodo-card">
              <div className="metodo-info">
                <CreditCard size={20} />
                <div>
                  <h4>{m.tipo} •••• {m.terminacion}</h4>
                  <p>Titular: {alias}</p>
                </div>
              </div>
              <div className="metodo-actions">
                <button className="btn-ghost">Editar</button>
                <button className="btn-ghost peligro">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel-card">
        <div className="panel-card-header">
          <h3>Agregar nuevo método</h3>
        </div>
        <div className="form-grid">
          <div className="campo">
            <label>Número de tarjeta</label>
            <input type="text" placeholder="1234 5678 9012 3456" />
          </div>
          <div className="campo">
            <label>Nombre del titular</label>
            <input type="text" placeholder="Como aparece en la tarjeta" />
          </div>
          <div className="campo">
            <label>Vencimiento</label>
            <input type="text" placeholder="MM/AA" />
          </div>
          <div className="campo">
            <label>CVV</label>
            <input type="text" placeholder="123" />
          </div>
          <div className="campo campo-col-2">
            <button className="btn-primary">Guardar método</button>
          </div>
        </div>
      </div>
    </section>
  )
}
