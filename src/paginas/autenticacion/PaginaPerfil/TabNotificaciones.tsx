import React from 'react'
import { Bell } from 'lucide-react'

interface Preferencias {
  marketingEmail: boolean
  promocionesSMS: boolean
  notificacionesPush: boolean
}

interface TabNotificacionesProps {
  preferencias: Preferencias
  onChange: (campo: keyof Preferencias, valor: boolean) => void
}

export default function TabNotificaciones({ preferencias, onChange }: TabNotificacionesProps) {
  const items = [
    { campo: 'marketingEmail' as const, titulo: 'Marketing por email', desc: 'Recibe promociones y novedades' },
    { campo: 'promocionesSMS' as const, titulo: 'Promociones por SMS', desc: 'Mensajes directos al móvil' },
    { campo: 'notificacionesPush' as const, titulo: 'Notificaciones Push', desc: 'Actualizaciones en tiempo real' }
  ]

  return (
    <section className="panel">
      <div className="panel-card">
        <div className="panel-card-header">
          <h3>Notificaciones</h3>
          <p>Preferencias de comunicación</p>
        </div>
        <div className="preferencias-grid">
          {items.map(({ campo, titulo, desc }) => (
            <div className="preferencia-item" key={campo}>
              <Bell size={18} />
              <div className="preferencia-info">
                <h4>{titulo}</h4>
                <p>{desc}</p>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={preferencias[campo]}
                  onChange={(e) => onChange(campo, e.target.checked)}
                />
                <span className="slider" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
