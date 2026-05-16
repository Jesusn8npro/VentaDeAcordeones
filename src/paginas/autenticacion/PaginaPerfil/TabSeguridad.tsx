import React from 'react'

interface MensajeEstado {
  tipo: 'ok' | 'error'
  texto: string
}

interface TabSeguridadProps {
  contrasenaActual: string
  nuevaContrasena: string
  confirmarContrasena: string
  onContrasenaActualChange: (v: string) => void
  onNuevaContrasenaChange: (v: string) => void
  onConfirmarContrasenaChange: (v: string) => void
  onActualizar: () => void
  guardando: boolean
  mensaje: MensajeEstado | null

  emailVerificado: boolean
  enviandoVerificacion: boolean
  cooldownVerificacion: number
  mensajeVerificacion: MensajeEstado | null
  onReenviarVerificacion: () => void

  enviandoRecuperacion: boolean
  mensajeRecuperacion: MensajeEstado | null
  onEnviarRecuperacion: () => void
}

export default function TabSeguridad({
  contrasenaActual,
  nuevaContrasena,
  confirmarContrasena,
  onContrasenaActualChange,
  onNuevaContrasenaChange,
  onConfirmarContrasenaChange,
  onActualizar,
  guardando,
  mensaje,
  emailVerificado,
  enviandoVerificacion,
  cooldownVerificacion,
  mensajeVerificacion,
  onReenviarVerificacion,
  enviandoRecuperacion,
  mensajeRecuperacion,
  onEnviarRecuperacion
}: TabSeguridadProps) {
  return (
    <section className="panel">
      <div className="panel-card">
        <div className="panel-card-header">
          <h3>Seguridad</h3>
          <p>Protege tu cuenta</p>
        </div>
        <div className="form-grid">
          <div className="campo">
            <label>Contraseña actual</label>
            <input
              type="password"
              placeholder="••••••••"
              value={contrasenaActual}
              onChange={(e) => onContrasenaActualChange(e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Nueva contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={nuevaContrasena}
              onChange={(e) => onNuevaContrasenaChange(e.target.value)}
            />
          </div>
          <div className="campo">
            <label>Confirmar nueva contraseña</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmarContrasena}
              onChange={(e) => onConfirmarContrasenaChange(e.target.value)}
            />
          </div>
          <div className="campo campo-col-2">
            <div className="nota-seguridad" style={{ fontSize: '0.9rem', color: '#555' }}>
              Requisito: mínimo 6 caracteres y sin espacios.
            </div>
          </div>
          <div className="campo campo-col-2">
            <button className="btn-primary" onClick={onActualizar} disabled={guardando}>
              {guardando ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </div>
          {mensaje && (
            <div className="campo campo-col-2" role="alert" aria-live="polite">
              <div className={`alerta ${mensaje.tipo === 'ok' ? 'ok' : 'error'}`}>
                {mensaje.texto}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="panel-card" style={{ marginTop: '1rem' }}>
        <div className="panel-card-header">
          <h3>Verificación de email</h3>
          <p>Confirma tu correo electrónico</p>
        </div>
        <div className="form-grid">
          <div className="campo campo-col-2">
            <label>Estado</label>
            <div className={`alerta ${emailVerificado ? 'ok' : 'error'}`}>
              {emailVerificado ? 'Email verificado' : 'Email no verificado'}
            </div>
          </div>
          <div className="campo campo-col-2">
            <button
              className="btn-primary"
              onClick={onReenviarVerificacion}
              disabled={enviandoVerificacion || cooldownVerificacion > 0}
            >
              {enviandoVerificacion
                ? 'Enviando...'
                : cooldownVerificacion > 0
                  ? `Reintenta en ${cooldownVerificacion}s`
                  : 'Enviar enlace de verificación'}
            </button>
          </div>
          {mensajeVerificacion && (
            <div className="campo campo-col-2" role="alert" aria-live="polite">
              <div className={`alerta ${mensajeVerificacion.tipo === 'ok' ? 'ok' : 'error'}`}>
                {mensajeVerificacion.texto}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="panel-card" style={{ marginTop: '1rem' }}>
        <div className="panel-card-header">
          <h3>Recuperación de contraseña</h3>
          <p>Si olvidaste tu contraseña, recibe un enlace por correo</p>
        </div>
        <div className="form-grid">
          <div className="campo campo-col-2">
            <button
              className="btn-primary"
              onClick={onEnviarRecuperacion}
              disabled={enviandoRecuperacion}
            >
              {enviandoRecuperacion ? 'Enviando...' : 'Enviar enlace de recuperación'}
            </button>
          </div>
          {mensajeRecuperacion && (
            <div className="campo campo-col-2" role="alert" aria-live="polite">
              <div className={`alerta ${mensajeRecuperacion.tipo === 'ok' ? 'ok' : 'error'}`}>
                {mensajeRecuperacion.texto}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
