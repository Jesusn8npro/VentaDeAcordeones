import React, { useEffect, useState } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'
import { validarPassword } from '../../../utilidades/validaciones'

export default function PaginaRestablecerContrasena() {
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [mensaje, setMensaje] = useState(null)
  const [cargando, setCargando] = useState(false)
  const [recuperacionActiva, setRecuperacionActiva] = useState(false)

  useEffect(() => {
    let activo = true
    const verificarSesionRecuperacion = async () => {
      try {
        const { data: { session } } = await clienteSupabase.auth.getSession()
        if (activo) setRecuperacionActiva(!!session?.user)
      } catch (_) {
        if (activo) setRecuperacionActiva(false)
      }
    }
    verificarSesionRecuperacion()
    // Escuchar eventos del flujo de recuperación
    const { data: { subscription } } = clienteSupabase.auth.onAuthStateChange((evento, sesion) => {
      if (!activo) return
      if (evento === 'PASSWORD_RECOVERY' || !!sesion?.user) {
        setRecuperacionActiva(true)
      }
    })
    return () => { activo = false }
  }, [])

  const manejarReset = async (e) => {
    e.preventDefault()
    if (!recuperacionActiva) {
      setMensaje({ tipo: 'error', texto: 'El enlace de recuperación no es válido o expiró. Solicítalo nuevamente.' })
      return
    }
    if (!nuevaContrasena || !confirmarContrasena) {
      setMensaje({ tipo: 'error', texto: 'Por favor completa ambos campos' })
      return
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setMensaje({ tipo: 'error', texto: 'La confirmación no coincide con la nueva contraseña' })
      return
    }
    if (!validarPassword(nuevaContrasena)) {
      setMensaje({ tipo: 'error', texto: 'La nueva contraseña no cumple los requisitos mínimos' })
      return
    }

    setCargando(true)
    setMensaje(null)
    try {
      const { error } = await clienteSupabase.auth.updateUser({ password: nuevaContrasena })
      if (error) throw error
      setMensaje({ tipo: 'ok', texto: 'Tu contraseña fue restablecida correctamente. Ya puedes iniciar sesión.' })
      setNuevaContrasena('')
      setConfirmarContrasena('')
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e.message || 'No se pudo restablecer la contraseña' })
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="contenido-reset" style={{ maxWidth: 520, margin: '2rem auto', padding: '1rem' }}>
      <h2>Restablecer contraseña</h2>
      <p>Ingresa tu nueva contraseña para completar el proceso.</p>
      <div className="nota-seguridad" style={{ fontSize: '0.9rem', color: '#555' }}>
        Requisito: mínimo 6 caracteres y sin espacios.
      </div>

      <form onSubmit={manejarReset} className="form-reset" style={{ marginTop: '1rem' }}>
        <div className="campo">
          <label>Nueva contraseña</label>
          <input
            type="password"
            value={nuevaContrasena}
            onChange={(e) => setNuevaContrasena(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <div className="campo">
          <label>Confirmar nueva contraseña</label>
          <input
            type="password"
            value={confirmarContrasena}
            onChange={(e) => setConfirmarContrasena(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={cargando}>
          {cargando ? 'Guardando...' : 'Restablecer contraseña'}
        </button>

        {mensaje && (
          <div className={`alerta ${mensaje.tipo === 'ok' ? 'ok' : 'error'}`} style={{ marginTop: '1rem' }}>
            {mensaje.texto}
          </div>
        )}
      </form>
    </div>
  )
}