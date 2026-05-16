import React from 'react'
import { X, User, Phone, Mail, MapPin, ShoppingBag, TrendingUp, Calendar, MessageSquare, Tag } from 'lucide-react'

interface Lead {
  id: string | number
  chat_id?: string
  nombre?: string
  apellido?: string
  email?: string
  whatsapp?: string
  ciudad?: string
  direccion?: string
  datos_envio?: any
  tipo_consulta?: string
  metodo_pago_preferido?: string
  precio_maximo_mencionado?: number
  urgencia_compra?: string
  estado?: string
  converted?: boolean
  nivel_interes?: number
  probabilidad_compra?: number
  valor_potencial?: number
  principales_objeciones?: string
  contexto_inicial?: string
  productos_consultados?: string[]
  notas_adicionales?: string
  created_at?: string
  updated_at?: string
  source?: string
}

interface Props {
  lead: Lead
  formatearFecha: (fecha: string) => string
  formatearPrecio: (precio: number) => string
  obtenerColorEstado: (estado: string) => string
  obtenerColorInteres: (nivel: number) => string
  onVerConversaciones: (lead: Lead) => void
  onAbrirWhatsApp: (whatsapp: string) => void
  onCerrar: () => void
}

export default function ModalDetalleChat({
  lead, formatearFecha, formatearPrecio,
  obtenerColorEstado, obtenerColorInteres,
  onVerConversaciones, onAbrirWhatsApp, onCerrar
}: Props) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content modal-detalle" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Detalles del Lead</h3>
          <button onClick={onCerrar} className="btn-cerrar"><X size={18} /></button>
        </div>

        <div className="modal-body">
          <div className="detalle-grid">

            <div className="detalle-seccion">
              <h4><User size={15} /> Información Personal</h4>
              <div className="detalle-items">
                <div className="detalle-item"><strong>Nombre:</strong><span>{lead.nombre} {lead.apellido}</span></div>
                <div className="detalle-item"><strong>Email:</strong><span>{lead.email || 'No proporcionado'}</span></div>
                <div className="detalle-item"><strong>WhatsApp:</strong><span>{lead.whatsapp || 'No proporcionado'}</span></div>
                <div className="detalle-item"><strong>Ciudad:</strong><span>{lead.ciudad || 'No especificada'}</span></div>
              </div>
            </div>

            <div className="detalle-seccion">
              <h4><Tag size={15} /> Estado & Métricas</h4>
              <div className="detalle-items">
                <div className="detalle-item">
                  <strong>Estado:</strong>
                  <span className={`estado-badge ${obtenerColorEstado(lead.estado)}`}>{lead.estado || 'activo'}</span>
                </div>
                <div className="detalle-item">
                  <strong>Convertido:</strong>
                  <span className={lead.converted ? 'convertido-si' : 'convertido-no'}>{lead.converted ? 'Sí' : 'No'}</span>
                </div>
                <div className="detalle-item">
                  <strong>Nivel de interés:</strong>
                  <span className={`metrica-valor ${obtenerColorInteres(lead.nivel_interes)}`}>{lead.nivel_interes || 5}/10</span>
                </div>
                <div className="detalle-item"><strong>Probabilidad:</strong><span>{lead.probabilidad_compra || 50}%</span></div>
              </div>
            </div>

            <div className="detalle-seccion">
              <h4><ShoppingBag size={15} /> Información Comercial</h4>
              <div className="detalle-items">
                <div className="detalle-item"><strong>Tipo de consulta:</strong><span>{lead.tipo_consulta || 'General'}</span></div>
                <div className="detalle-item"><strong>Método de pago:</strong><span>{lead.metodo_pago_preferido || 'No especificado'}</span></div>
                <div className="detalle-item"><strong>Precio máximo:</strong><span>{lead.precio_maximo_mencionado ? formatearPrecio(lead.precio_maximo_mencionado) : 'No especificado'}</span></div>
                <div className="detalle-item"><strong>Urgencia:</strong><span>{lead.urgencia_compra || 'No especificada'}</span></div>
                {lead.valor_potencial > 0 && (
                  <div className="detalle-item"><strong>Valor potencial:</strong><span>{formatearPrecio(lead.valor_potencial)}</span></div>
                )}
              </div>
            </div>

            <div className="detalle-seccion">
              <h4><Calendar size={15} /> Fechas</h4>
              <div className="detalle-items">
                <div className="detalle-item"><strong>Creado:</strong><span>{formatearFecha(lead.created_at)}</span></div>
                <div className="detalle-item"><strong>Actualizado:</strong><span>{formatearFecha(lead.updated_at)}</span></div>
                <div className="detalle-item"><strong>Fuente:</strong><span className="source-badge">{lead.source || 'web'}</span></div>
              </div>
            </div>

            {lead.productos_consultados?.length > 0 && (
              <div className="detalle-seccion full-width">
                <h4><ShoppingBag size={15} /> Productos Consultados</h4>
                <div className="productos-consultados">
                  {lead.productos_consultados.map((prod, idx) => (
                    <span key={idx} className="producto-item">{prod}</span>
                  ))}
                </div>
              </div>
            )}

            {lead.contexto_inicial && (
              <div className="detalle-seccion full-width">
                <h4><MessageSquare size={15} /> Contexto Inicial</h4>
                <div className="contexto-box">"{lead.contexto_inicial}"</div>
              </div>
            )}

            {lead.principales_objeciones && (
              <div className="detalle-seccion full-width">
                <h4><TrendingUp size={15} /> Objeciones</h4>
                <div className="notas-box">{lead.principales_objeciones}</div>
              </div>
            )}

            {lead.notas_adicionales && (
              <div className="detalle-seccion full-width">
                <h4>Notas Adicionales</h4>
                <div className="notas-box">{lead.notas_adicionales}</div>
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={() => onVerConversaciones(lead)} className="btn-modal conversaciones">
            <MessageSquare size={15} /> Ver Conversaciones
          </button>
          {lead.whatsapp && (
            <button onClick={() => onAbrirWhatsApp(lead.whatsapp)} className="btn-modal whatsapp">
              <Phone size={15} /> Contactar
            </button>
          )}
          <button onClick={onCerrar} className="btn-modal cerrar">Cerrar</button>
        </div>
      </div>
    </div>
  )
}
