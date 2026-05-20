import React from 'react'

interface Props {
  configAgente: {
    nombre: string
    tono: string
    prompt_adicional: string
    activo: boolean
  }
  setConfigAgente: (fn: (prev: any) => any) => void
  guardandoConfig: boolean
  guardarConfigAgente: () => void
}

const TONOS = [
  { id: 'calido_motivador',    label: 'Cálido y motivador', emoji: '🤝' },
  { id: 'profesional_formal',  label: 'Profesional y formal', emoji: '💼' },
  { id: 'jovial_energico',     label: 'Jovial y enérgico', emoji: '🎵' },
  { id: 'experto_tecnico',     label: 'Experto técnico', emoji: '🎼' },
]

export default function TabConfigAgente({ configAgente, setConfigAgente, guardandoConfig, guardarConfigAgente }: Props) {
  return (
    <div className="config-agente-panel">
      <div className="config-agente-header">
        <h2>Configuración del Agente IA</h2>
        <p>Personaliza cómo se comporta Melodía con tus clientes</p>
      </div>
      <div className="config-agente-form">
        <div className="form-grupo">
          <label>Nombre del agente</label>
          <input
            type="text"
            value={configAgente.nombre}
            onChange={e => setConfigAgente(p => ({ ...p, nombre: e.target.value }))}
            className="form-input"
            placeholder="Ej: Melodía"
          />
        </div>
        <div className="form-grupo">
          <label>Tono de comunicación</label>
          <div className="tono-opciones">
            {TONOS.map(t => (
              <button
                key={t.id}
                className={`tono-btn ${configAgente.tono === t.id ? 'seleccionado' : ''}`}
                onClick={() => setConfigAgente(p => ({ ...p, tono: t.id }))}
              >
                <span>{t.emoji}</span> {t.label}
              </button>
            ))}
          </div>
        </div>
        <div className="form-grupo">
          <label>Instrucciones del agente</label>
          <p className="form-ayuda">Define cómo debe comportarse, qué preguntar, qué enfatizar, cómo manejar objeciones.</p>
          <textarea
            value={configAgente.prompt_adicional}
            onChange={e => setConfigAgente(p => ({ ...p, prompt_adicional: e.target.value }))}
            className="form-textarea"
            rows={14}
            placeholder="Escribe las instrucciones personalizadas del agente..."
          />
        </div>
        <div className="form-grupo form-grupo-inline">
          <label>Agente activo</label>
          <input
            type="checkbox"
            checked={configAgente.activo}
            onChange={e => setConfigAgente(p => ({ ...p, activo: e.target.checked }))}
          />
        </div>
        <button className="btn-guardar-config" onClick={guardarConfigAgente} disabled={guardandoConfig}>
          {guardandoConfig ? 'Guardando...' : 'Guardar configuración'}
        </button>
      </div>
    </div>
  )
}
