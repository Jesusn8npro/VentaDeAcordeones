import React from 'react'

interface Estadisticas {
  total?: number
  convertidos?: number
  pendientes?: number
  tasaConversion?: number
  nuevosEsteMes?: number
  valorTotal?: number
}

interface EstadisticasChatsProps {
  estadisticas: Estadisticas
  formatearPrecio: (precio: number) => string
}

export default function EstadisticasChats({ estadisticas, formatearPrecio }: EstadisticasChatsProps) {
  return (
    <div className="estadisticas-grid">
      <div className="stat-card total">
        <div className="stat-icon">👥</div>
        <div className="stat-content"><h3>{estadisticas.total || 0}</h3><p>Total Leads</p></div>
      </div>
      <div className="stat-card convertidos">
        <div className="stat-icon">✅</div>
        <div className="stat-content"><h3>{estadisticas.convertidos || 0}</h3><p>Convertidos</p></div>
      </div>
      <div className="stat-card pendientes">
        <div className="stat-icon">⏳</div>
        <div className="stat-content"><h3>{estadisticas.pendientes || 0}</h3><p>Pendientes</p></div>
      </div>
      <div className="stat-card conversion">
        <div className="stat-icon">📈</div>
        <div className="stat-content"><h3>{estadisticas.tasaConversion || 0}%</h3><p>Tasa Conversión</p></div>
      </div>
      <div className="stat-card nuevos">
        <div className="stat-icon">🆕</div>
        <div className="stat-content"><h3>{estadisticas.nuevosEsteMes || 0}</h3><p>Nuevos este mes</p></div>
      </div>
      <div className="stat-card valor">
        <div className="stat-icon">💰</div>
        <div className="stat-content"><h3>{formatearPrecio(estadisticas.valorTotal)}</h3><p>Valor Potencial</p></div>
      </div>
    </div>
  )
}
