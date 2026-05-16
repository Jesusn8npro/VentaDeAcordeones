import React from 'react'
import { CheckCircle, XCircle, Info } from 'lucide-react'

interface Log {
  id: string
  tipo: 'exito' | 'error' | 'info'
  mensaje: string
  timestamp: string
  count: number
}

interface LogsActividadProps {
  logs: Log[]
}

const LogsActividad = ({ logs }: LogsActividadProps) => (
  <div className="fm-card">
    <div className="fm-card-header">
      <div className="fm-card-title">📋 Registro de Actividad</div>
      <p className="fm-card-description">Últimas acciones realizadas en el servicio de feed</p>
    </div>
    <div className="fm-card-content">
      <div className="fm-logs">
        {logs.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '16px', fontSize: 13, color: 'var(--color-texto-secundario)' }}>
            No hay actividad reciente
          </p>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`fm-log ${
                log.tipo === 'exito' ? 'fm-log-exito' :
                log.tipo === 'error' ? 'fm-log-error' :
                'fm-log-info'
              }`}
            >
              {log.tipo === 'exito'
                ? <CheckCircle size={16} style={{ flexShrink: 0 }} />
                : log.tipo === 'error'
                ? <XCircle size={16} style={{ flexShrink: 0 }} />
                : <Info size={16} style={{ flexShrink: 0 }} />
              }
              <div className="fm-log-texto">{log.mensaje}</div>
              <div className="fm-log-time">{log.timestamp}</div>
              {log.count > 1 && (
                <span style={{
                  marginLeft: 8,
                  fontSize: 11,
                  fontWeight: 700,
                  background: 'rgba(0,0,0,0.12)',
                  borderRadius: 999,
                  padding: '1px 7px',
                }}>
                  x{log.count}
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)

export default LogsActividad
