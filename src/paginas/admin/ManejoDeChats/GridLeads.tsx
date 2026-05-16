import React from 'react'

interface Lead {
  id: string | number
  chat_id?: string
  nombre?: string
  apellido?: string
  email?: string
  whatsapp?: string
  ubicacion_usuario?: string
  contexto_inicial?: string
  intereses_cliente?: string
  productos_consultados?: any
  estado?: string
  converted?: boolean
  nivel_interes?: number
  probabilidad_compra?: number
  valor_potencial?: number
  created_at?: string
}

interface GridLeadsProps {
  leadsEnPagina: Lead[]
  totalPaginas: number
  paginaActual: number
  totalResultados: number
  obtenerColorEstado: (estado: string) => string
  obtenerColorInteres: (nivel: number) => string
  formatearFecha: (fecha: string) => string
  formatearPrecio: (precio: number) => string
  onVerDetalle: (lead: Lead) => void
  onVerConversaciones: (lead: Lead) => void
  onAbrirWhatsApp: (whatsapp: string) => void
  onCambiarPagina: (pagina: number) => void
}

export default function GridLeads({
  leadsEnPagina,
  totalPaginas,
  paginaActual,
  totalResultados,
  obtenerColorEstado,
  obtenerColorInteres,
  formatearFecha,
  formatearPrecio,
  onVerDetalle,
  onVerConversaciones,
  onAbrirWhatsApp,
  onCambiarPagina
}: GridLeadsProps) {
  if (leadsEnPagina.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <h3>No hay leads que mostrar</h3>
        <p>No se encontraron resultados con los filtros aplicados</p>
      </div>
    )
  }

  return (
    <>
      <div className="leads-grid">
        {leadsEnPagina.map(lead => (
          <div key={lead.id} className="lead-card">
            <div className="lead-header">
              <div className="lead-info">
                <h3 className="lead-nombre">{lead.nombre} {lead.apellido}</h3>
                <span className="lead-id">ID: {lead.chat_id}</span>
              </div>
              <div className="lead-badges">
                <span className={`estado-badge ${obtenerColorEstado(lead.estado)}`}>{lead.estado || 'activo'}</span>
                {lead.converted && <span className="convertido-badge">✅</span>}
              </div>
            </div>

            <div className="lead-content">
              <div className="contacto-info">
                {lead.email && (
                  <div className="contacto-item"><span className="contacto-icon">📧</span><span className="contacto-texto">{lead.email}</span></div>
                )}
                {lead.whatsapp && (
                  <div className="contacto-item"><span className="contacto-icon">📱</span><span className="contacto-texto">{lead.whatsapp}</span></div>
                )}
                {lead.ubicacion_usuario && (
                  <div className="contacto-item"><span className="contacto-icon">📍</span><span className="contacto-texto">{lead.ubicacion_usuario}</span></div>
                )}
              </div>

              {lead.contexto_inicial && (
                <div className="contexto-inicial"><p>"{lead.contexto_inicial}"</p></div>
              )}

              {lead.intereses_cliente && (
                <div className="intereses-cliente">
                  <span className="intereses-label">🎯 Intereses:</span>
                  <div className="intereses-tags">
                    {lead.intereses_cliente.split(',').map((interes, index) => (
                      <span key={index} className="interes-tag">{interes.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              {lead.productos_consultados && lead.productos_consultados.length > 0 && (
                <div className="productos-consultados">
                  <span className="productos-label">🛍️ Productos consultados:</span>
                  <div className="productos-tags">
                    {(Array.isArray(lead.productos_consultados)
                      ? lead.productos_consultados
                      : lead.productos_consultados.split(',')
                    ).map((producto, index) => (
                      <span key={index} className="producto-tag">
                        {typeof producto === 'string' ? producto.trim() : producto}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="metricas-lead">
                <div className="metrica">
                  <span className="metrica-label">Interés:</span>
                  <span className={`metrica-valor ${obtenerColorInteres(lead.nivel_interes)}`}>{lead.nivel_interes || 5}/10</span>
                </div>
                <div className="metrica">
                  <span className="metrica-label">Probabilidad:</span>
                  <span className="metrica-valor">{lead.probabilidad_compra || 50}%</span>
                </div>
                {lead.valor_potencial && (
                  <div className="metrica">
                    <span className="metrica-label">Valor:</span>
                    <span className="metrica-valor">{formatearPrecio(lead.valor_potencial)}</span>
                  </div>
                )}
              </div>

              <div className="fecha-lead">
                <span className="fecha-icon">⏰</span>
                <span className="fecha-texto">{formatearFecha(lead.created_at)}</span>
              </div>
            </div>

            <div className="lead-actions">
              <button onClick={() => onVerDetalle(lead)} className="btn-action ver-detalle" title="Ver detalle completo">👁️ Ver</button>
              <button onClick={() => onVerConversaciones(lead)} className="btn-action ver-chat" title="Ver conversaciones">💬 Chat</button>
              {lead.whatsapp && (
                <button onClick={() => onAbrirWhatsApp(lead.whatsapp)} className="btn-action whatsapp" title="Contactar por WhatsApp">📱 WA</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {totalPaginas > 1 && (
        <div className="paginacion">
          <button onClick={() => onCambiarPagina(Math.max(1, paginaActual - 1))} disabled={paginaActual === 1} className="btn-pagina">
            ⬅️ Anterior
          </button>
          <div className="info-pagina">
            <span>Página {paginaActual} de {totalPaginas}</span>
            <span className="total-resultados">({totalResultados} resultados)</span>
          </div>
          <button onClick={() => onCambiarPagina(Math.min(totalPaginas, paginaActual + 1))} disabled={paginaActual === totalPaginas} className="btn-pagina">
            Siguiente ➡️
          </button>
        </div>
      )}
    </>
  )
}
