import React from 'react'
import { X } from 'lucide-react'

interface Mensaje {
  id: string | number
  mensaje: string
  tipo_mensaje: string
  timestamp: string
}

interface Lead {
  nombre?: string
  apellido?: string
}

interface Props {
  lead: Lead
  conversaciones: Mensaje[]
  onCerrar: () => void
}

const REGEX_LINK = /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)/g

function renderTexto(texto: string) {
  const limpio = texto
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')

  const partes: { tipo: 'texto' | 'link'; valor: string; url?: string }[] = []
  let cursor = 0
  let m: RegExpExecArray | null
  REGEX_LINK.lastIndex = 0

  while ((m = REGEX_LINK.exec(limpio)) !== null) {
    if (m.index > cursor) partes.push({ tipo: 'texto', valor: limpio.slice(cursor, m.index) })
    partes.push({ tipo: 'link', valor: m[1], url: m[2] })
    cursor = m.index + m[0].length
  }
  if (cursor < limpio.length) partes.push({ tipo: 'texto', valor: limpio.slice(cursor) })

  if (partes.length === 0) return <span>{limpio}</span>

  return (
    <>
      {partes.map((p, i) =>
        p.tipo === 'link'
          ? <a key={i} href={p.url} target={p.url?.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer" className="conv-link">{p.valor}</a>
          : <span key={i}>{p.valor}</span>
      )}
    </>
  )
}

function formatHora(iso: string) {
  try { return new Date(iso).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) }
  catch { return '' }
}

export default function ModalConversaciones({ lead, conversaciones, onCerrar }: Props) {
  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content modal-conversaciones" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Conversación — {lead.nombre || 'Sin nombre'} {lead.apellido || ''}</h3>
          <button onClick={onCerrar} className="btn-cerrar"><X size={18} /></button>
        </div>

        <div className="conv-body">
          {conversaciones.length === 0 ? (
            <div className="no-conversaciones">
              <p>No se encontraron mensajes para este lead.</p>
            </div>
          ) : (
            <div className="conv-mensajes">
              {conversaciones.map(msg => {
                const esBot = msg.tipo_mensaje === 'bot'
                return (
                  <div key={msg.id} className={`conv-fila ${esBot ? 'fila-agente' : 'fila-cliente'}`}>
                    <div className="conv-remitente">{esBot ? 'Agente' : 'Cliente'}</div>
                    <div className="conv-globo">
                      <div className="conv-texto">{renderTexto(msg.mensaje)}</div>
                      <div className="conv-hora">{formatHora(msg.timestamp)}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onCerrar} className="btn-modal cerrar">Cerrar</button>
        </div>
      </div>
    </div>
  )
}
