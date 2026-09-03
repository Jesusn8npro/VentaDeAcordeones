'use client'

import React, { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Eye, EyeOff, Mail, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contextos/ContextoAutenticacion'
import { clienteSupabase } from '../../configuracion/supabase'

const ADMIN_EMAILS = ['acordeon91@gmail.com', 'shalom@gmail.com']

export default function ModalAutenticacionIsolado({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const router = useRouter()
  const { iniciarSesion, registrarse, usuario } = useAuth()
  const [mountNode, setMountNode] = useState(null)

  const [vista, setVista] = useState('login')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const inputRef = useRef(null)

  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [mostrarPass, setMostrarPass] = useState(false)

  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [emailReg, setEmailReg] = useState('')
  const [passReg, setPassReg] = useState('')
  const [mostrarPassReg, setMostrarPassReg] = useState(false)

  const [emailRec, setEmailRec] = useState('')

  useEffect(() => {
    if (!abierto) return
    let root = document.getElementById('modal-auth-root')
    if (!root) {
      root = document.createElement('div')
      root.setAttribute('id', 'modal-auth-root')
      document.body.appendChild(root)
    }
    setMountNode(root)
    return () => { setMountNode(null) }
  }, [abierto])

  useEffect(() => { if (abierto && inputRef.current) setTimeout(() => inputRef.current?.focus(), 100) }, [abierto, vista])
  useEffect(() => { if (abierto && usuario) onCerrar() }, [abierto, usuario])
  useEffect(() => {
    if (!abierto) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onCerrar() }
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [abierto, onCerrar])

  const limpiar = () => { setError(''); setMensaje(''); setEmail(''); setContrasena(''); setNombre(''); setApellido(''); setEmailReg(''); setPassReg(''); setEmailRec(''); setMostrarPass(false); setMostrarPassReg(false) }

  const manejarLogin = async (e) => {
    e.preventDefault(); setError(''); setCargando(true)
    if (!email || !contrasena) { setError('Completa todos los campos'); setCargando(false); return }
    try {
      const r = await iniciarSesion(email, contrasena)
      if (r.error) { setError(r.error); setCargando(false) } else { onCerrar(); setTimeout(() => router.push(ADMIN_EMAILS.includes(r.data.user.email) ? '/admin' : '/perfil'), 300) }
    } catch { setError('Error de conexión'); setCargando(false) }
  }

  const manejarRegistro = async (e) => {
    e.preventDefault(); setError(''); setCargando(true)
    if (!nombre || !apellido || !emailReg || !passReg) { setError('Completa todos los campos'); setCargando(false); return }
    if (passReg.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); setCargando(false); return }
    try {
      const r = await registrarse(emailReg, passReg, `${nombre} ${apellido}`)
      if (r.error) { setError(r.error); setCargando(false) } else { onCerrar(); setTimeout(() => router.push('/perfil'), 300) }
    } catch { setError('Error de conexión'); setCargando(false) }
  }

  const manejarRecuperar = async (e) => {
    e.preventDefault(); setMensaje(''); setCargando(true)
    if (!emailRec) { setMensaje('Ingresa tu correo'); setCargando(false); return }
    try {
      const { error } = await clienteSupabase.auth.resetPasswordForEmail(emailRec, { redirectTo: `${window.location.origin}/restablecer-contrasena` })
      setMensaje(error ? error.message : 'Revisa tu correo para restablecer tu contraseña')
    } catch { setMensaje('Error de conexión') } finally { setCargando(false) }
  }

  const loginGoogle = async () => {
    setCargando(true)
    try {
      const { error } = await clienteSupabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })
      if (error) setError(error.message)
    } catch { setError('Error de conexión con Google') } finally { setCargando(false) }
  }

  const cerrarPorOverlay = (e) => { if (e.target === e.currentTarget) onCerrar() }
  if (!abierto || !mountNode) return null

  const sx = {
    ov: { position: 'fixed', inset: 0, background: 'var(--vda-overlay)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100003, padding: 20 },
    bx: { width: '100%', maxWidth: 460, maxHeight: '92vh', background: 'var(--vda-superficie)', borderRadius: 22, boxShadow: 'var(--vda-sombra-card)', overflowY: 'auto', overflowX: 'hidden', position: 'relative', fontFamily: 'Inter,system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif' },
    cl: { position: 'absolute', top: 16, right: 16, width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--vda-linea)', background: 'var(--vda-superficie-2)', color: 'var(--vda-tinta-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
    br: { padding: '12px 16px 10px', background: 'linear-gradient(135deg,#ff6b35 0%,#ff8c42 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderTopLeftRadius: 22, borderTopRightRadius: 22 },
    ct: { padding: '26px 24px 28px' },
    tt: { fontSize: 22, fontWeight: 800, color: 'var(--vda-tinta)', textAlign: 'center', margin: '0 0 8px' },
    ds: { color: 'var(--vda-tinta-dim)', textAlign: 'center', fontSize: 14, margin: '0 0 18px' },
    fm: { display: 'flex', flexDirection: 'column', gap: 16 },
    rw: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
    fd: { display: 'flex', flexDirection: 'column', gap: 6 },
    lb: { fontSize: 13, fontWeight: 600, color: 'var(--vda-tinta-dim)' },
    in: { position: 'relative', display: 'flex', alignItems: 'center' },
    inp: { width: '100%', padding: '12px 42px 12px 14px', border: '1.5px solid var(--vda-linea-fuerte)', borderRadius: 12, background: 'var(--vda-superficie-2)', fontSize: 15, color: 'var(--vda-tinta)' },
    bn: { width: '100%', padding: 14, border: 'none', borderRadius: 12, background: 'linear-gradient(135deg,#ff6b35 0%,#ff8c42 100%)', color: '#fff', fontSize: 15, fontWeight: 700, boxShadow: '0 8px 20px rgba(255,107,53,.28)', cursor: 'pointer' },
    sp: { display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--vda-tinta-muted)', fontSize: 13, margin: '14px 0' },
    gg: { width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: '1.5px solid var(--vda-linea-fuerte)', borderRadius: 12, padding: 12, background: 'var(--vda-superficie)', color: 'var(--vda-tinta)', cursor: 'pointer' },
    ln: { display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'center', marginTop: 10 },
    lk: { background: 'none', border: 'none', color: 'var(--vda-tinta-dim)', cursor: 'pointer', fontSize: 14, padding: 6, borderRadius: 6 },
    mgErr: { background: 'color-mix(in srgb, var(--vda-peligro) 12%, transparent)', color: 'var(--vda-peligro)', border: '1px solid color-mix(in srgb, var(--vda-peligro) 40%, transparent)', textAlign: 'center', fontSize: 14, borderRadius: 10, padding: 10 },
    mgOk: { background: 'color-mix(in srgb, var(--vda-exito) 12%, transparent)', color: 'var(--vda-exito)', border: '1px solid color-mix(in srgb, var(--vda-exito) 40%, transparent)', textAlign: 'center', fontSize: 14, borderRadius: 10, padding: 10 }
  }

  return createPortal(
    <div style={sx.ov} onClick={cerrarPorOverlay} role="dialog" aria-modal="true">
      <div style={sx.bx} onClick={(e) => e.stopPropagation()}>
        <button style={sx.cl} onClick={onCerrar} aria-label="Cerrar"><X size={18} /></button>
        <div style={sx.br}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 20, letterSpacing: '-0.5px' }}>🪗 VentaDeAcordeones.com</span>
        </div>
        {vista === 'login' && (
          <div style={sx.ct}>
            <h2 style={sx.tt}>¡Bienvenido de nuevo!</h2>
            <p style={sx.ds}>Accede a tu cuenta y disfruta de los beneficios.</p>
            <form style={sx.fm} onSubmit={manejarLogin}>
              <div style={sx.fd}>
                <label htmlFor="email" style={sx.lb}>Correo electrónico</label>
                <div style={sx.in}>
                  <input id="email" ref={inputRef} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ejemplo@correo.com" required style={sx.inp} />
                  <Mail size={18} style={{ position: 'absolute', right: 12, color: 'var(--vda-tinta-muted)' }} />
                </div>
              </div>
              <div style={sx.fd}>
                <label htmlFor="pass" style={sx.lb}>Contraseña</label>
                <div style={sx.in}>
                  <input id="pass" type={mostrarPass ? 'text' : 'password'} value={contrasena} onChange={(e) => setContrasena(e.target.value)} placeholder="Tu contraseña" required style={sx.inp} />
                  <button type="button" onClick={() => setMostrarPass(!mostrarPass)} style={{ position: 'absolute', right: 8, background: 'none', border: 'none', color: 'var(--vda-tinta-muted)', cursor: 'pointer', padding: 4, borderRadius: 6 }}>{mostrarPass ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              {error && <div style={sx.mgErr}>{error}</div>}
              <button type="submit" style={{ ...sx.bn, opacity: cargando ? .8 : 1 }} disabled={cargando}>{cargando ? 'Ingresando...' : 'Entrar'}</button>
            </form>
            <div style={sx.sp}><span>o continúa con</span></div>
            <button style={{ ...sx.gg, opacity: cargando ? .8 : 1 }} onClick={loginGoogle} disabled={cargando}>
              <svg viewBox="0 0 24 24" width="20" height="20"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              <span>{cargando ? 'Conectando...' : 'Continuar con Google'}</span>
            </button>
            <div style={sx.ln}>
              <button style={sx.lk} onClick={() => { setVista('recuperar'); limpiar() }}>¿Olvidaste tu contraseña?</button>
              <button style={sx.lk} onClick={() => { setVista('registro'); limpiar() }}>¿No tienes cuenta? <b>Regístrate</b></button>
            </div>
          </div>
        )}
        {vista === 'registro' && (
          <div style={sx.ct}>
            <h2 style={sx.tt}>Crear Cuenta Nueva</h2>
            <p style={sx.ds}>Únete y accede a beneficios exclusivos.</p>
            <form style={sx.fm} onSubmit={manejarRegistro}>
              <div style={sx.rw}>
                <div style={sx.fd}>
                  <label htmlFor="nombre" style={sx.lb}>Nombre</label>
                  <div style={sx.in}>
                    <input id="nombre" ref={inputRef} type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Juan" required style={sx.inp} />
                    <User size={18} style={{ position: 'absolute', right: 12, color: 'var(--vda-tinta-muted)' }} />
                  </div>
                </div>
                <div style={sx.fd}>
                  <label htmlFor="apellido" style={sx.lb}>Apellido</label>
                  <div style={sx.in}>
                    <input id="apellido" type="text" value={apellido} onChange={(e) => setApellido(e.target.value)} placeholder="Pérez" required style={sx.inp} />
                    <User size={18} style={{ position: 'absolute', right: 12, color: 'var(--vda-tinta-muted)' }} />
                  </div>
                </div>
              </div>
              <div style={sx.fd}>
                <label htmlFor="emailReg" style={sx.lb}>Correo electrónico</label>
                <div style={sx.in}>
                  <input id="emailReg" type="email" value={emailReg} onChange={(e) => setEmailReg(e.target.value)} placeholder="ejemplo@correo.com" required style={sx.inp} />
                  <Mail size={18} style={{ position: 'absolute', right: 12, color: 'var(--vda-tinta-muted)' }} />
                </div>
              </div>
              <div style={sx.fd}>
                <label htmlFor="passReg" style={sx.lb}>Contraseña</label>
                <div style={sx.in}>
                  <input id="passReg" type={mostrarPassReg ? 'text' : 'password'} value={passReg} onChange={(e) => setPassReg(e.target.value)} placeholder="Mínimo 6 caracteres" required style={sx.inp} />
                  <button type="button" onClick={() => setMostrarPassReg(!mostrarPassReg)} style={{ position: 'absolute', right: 8, background: 'none', border: 'none', color: 'var(--vda-tinta-muted)', cursor: 'pointer', padding: 4, borderRadius: 6 }}>{mostrarPassReg ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </div>
              {error && <div style={sx.mgErr}>{error}</div>}
              <button type="submit" style={{ ...sx.bn, opacity: cargando ? .8 : 1 }} disabled={cargando}>{cargando ? 'Registrando...' : 'Crear Cuenta'}</button>
            </form>
            <div style={sx.ln}>
              <button style={sx.lk} onClick={() => { setVista('login'); limpiar() }}>¿Ya tienes cuenta? <b>Inicia Sesión</b></button>
            </div>
          </div>
        )}
        {vista === 'recuperar' && (
          <div style={sx.ct}>
            <h2 style={sx.tt}>Recuperar Contraseña</h2>
            <p style={sx.ds}>Ingresa tu correo y te enviaremos un enlace.</p>
            <form style={sx.fm} onSubmit={manejarRecuperar}>
              <div style={sx.fd}>
                <label htmlFor="emailRec" style={sx.lb}>Correo electrónico</label>
                <div style={sx.in}>
                  <input id="emailRec" ref={inputRef} type="email" value={emailRec} onChange={(e) => setEmailRec(e.target.value)} placeholder="ejemplo@correo.com" required style={sx.inp} />
                  <Mail size={18} style={{ position: 'absolute', right: 12, color: 'var(--vda-tinta-muted)' }} />
                </div>
              </div>
              {mensaje && <div style={mensaje.includes('Revisa') ? sx.mgOk : sx.mgErr}>{mensaje}</div>}
              <button type="submit" style={{ ...sx.bn, opacity: cargando ? .8 : 1 }} disabled={cargando}>{cargando ? 'Enviando...' : 'Enviar Enlace'}</button>
            </form>
            <div style={sx.ln}>
              <button style={sx.lk} onClick={() => { setVista('login'); limpiar() }}>Volver a Iniciar Sesión</button>
            </div>
          </div>
        )}
      </div>
    </div>,
    mountNode
  )
}