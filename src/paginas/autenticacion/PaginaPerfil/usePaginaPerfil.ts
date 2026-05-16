import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import { clienteSupabase } from '../../../configuracion/supabase'
import { validarPassword } from '../../../utilidades/validaciones'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'

type MensajeEstado = { tipo: 'ok' | 'error'; texto: string } | null

const extraerNombreReal = (nombreData: unknown): string => {
  if (!nombreData) return ''
  if (typeof nombreData === 'string' && nombreData.trim() && !nombreData.includes('{')) {
    return nombreData.trim()
  }
  if (typeof nombreData === 'string' && nombreData.includes('{')) {
    try {
      const parsed = JSON.parse(nombreData)
      if (parsed.nombre) return parsed.nombre
      if (parsed.apellido) return parsed.apellido
    } catch (_) {}
  }
  return ''
}

export { extraerNombreReal }

export function usePaginaPerfil() {
  const { usuario } = useAuth()
  const location = useLocation()

  // Perfil
  const [formUsuario, setFormUsuario] = useState({
    nombre: '', email: '', telefono: '',
    direccion_linea_1: '', direccion_linea_2: '', barrio: '',
    ciudad: '', departamento: '', codigo_postal: '', pais: ''
  })
  const [usuarioIdDB, setUsuarioIdDB] = useState<string | null>(null)
  const [cargandoPerfil, setCargandoPerfil] = useState(false)
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [mensajeGuardado, setMensajeGuardado] = useState<MensajeEstado>(null)

  // Dirección
  const [direccionEnvio, setDireccionEnvio] = useState({
    receptor: '', direccion: '', ciudad: '', departamento: '', codigoPostal: '', indicaciones: ''
  })
  const [guardandoDireccion, setGuardandoDireccion] = useState(false)
  const [mensajeDirecciones, setMensajeDirecciones] = useState<MensajeEstado>(null)

  // Seguridad
  const [contrasenaActual, setContrasenaActual] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [guardandoSeguridad, setGuardandoSeguridad] = useState(false)
  const [mensajeSeguridad, setMensajeSeguridad] = useState<MensajeEstado>(null)

  // Verificación email
  const [emailVerificado, setEmailVerificado] = useState(false)
  const [enviandoVerificacion, setEnviandoVerificacion] = useState(false)
  const [mensajeVerificacion, setMensajeVerificacion] = useState<MensajeEstado>(null)
  const [cooldownVerificacion, setCooldownVerificacion] = useState(0)

  // Recuperación contraseña
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false)
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState<MensajeEstado>(null)

  // Pedidos
  const [pedidosUsuario, setPedidosUsuario] = useState<any[]>([])
  const [cargandoPedidosUsuario, setCargandoPedidosUsuario] = useState(true)
  const [errorPedidos, setErrorPedidos] = useState<string | null>(null)

  // Modal WhatsApp
  const [waModalOpen, setWaModalOpen] = useState(false)
  const [waCountdown, setWaCountdown] = useState(2)

  // Notificaciones
  const [preferencias, setPreferencias] = useState({
    marketingEmail: true, promocionesSMS: false, notificacionesPush: true
  })

  const formatearFechaPedido = (fecha: string) => {
    if (!fecha) return '-'
    try {
      return new Date(fecha).toLocaleDateString('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      })
    } catch (_) { return '-' }
  }

  const construirUrlWhatsapp = () => {
    const numeroWA = '573208492093'
    const ultimo: any = pedidosUsuario?.[0] || null
    const nombreProducto = ultimo?.productos?.[0]?.nombre
    const totalPedido = ultimo?.total || 0
    const texto = `Hola 👋, acabo de registrar mi compra${nombreProducto ? ` de ${nombreProducto}` : ''} por ${formatearPrecioCOP(totalPedido)}. Quisiera confirmar el pedido o resolver dudas.`
    return `https://wa.me/${numeroWA}?text=${encodeURIComponent(texto)}`
  }

  // Cargar pedidos
  useEffect(() => {
    const cargarPedidos = async () => {
      const id = usuarioIdDB || usuario?.id
      if (!id) return
      setCargandoPedidosUsuario(true)
      setErrorPedidos(null)
      try {
        const { data, error } = await clienteSupabase
          .from('pedidos')
          .select('id, numero_pedido, creado_el, estado, total, direccion_envio, productos')
          .eq('usuario_id', id)
          .order('creado_el', { ascending: false })
          .limit(50)
        if (error) throw error
        setPedidosUsuario(data || [])
      } catch (e: any) {
        setErrorPedidos(e.message || 'Error cargando pedidos')
      } finally {
        setCargandoPedidosUsuario(false)
      }
    }
    cargarPedidos()
  }, [usuarioIdDB, usuario?.id])

  // Modal COD
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('after') === 'cod' && usuario?.id) {
      const t = setTimeout(() => setWaModalOpen(true), 5000)
      return () => clearTimeout(t)
    }
  }, [location.search, usuario?.id])

  useEffect(() => {
    if (!waModalOpen) return
    setWaCountdown(2)
    const waUrl = construirUrlWhatsapp()
    const tick = setInterval(() => setWaCountdown((c) => (c > 0 ? c - 1 : 0)), 1000)
    const red = setTimeout(() => { window.location.href = waUrl }, 2000)
    return () => { clearInterval(tick); clearTimeout(red) }
  }, [waModalOpen])

  // Estado verificación email
  useEffect(() => {
    let activo = true
    clienteSupabase.auth.getUser().then(({ data, error }) => {
      if (!error && activo) setEmailVerificado(!!data?.user?.email_confirmed_at)
    })
    return () => { activo = false }
  }, [])

  // Cooldown
  useEffect(() => {
    if (cooldownVerificacion <= 0) return
    const t = setInterval(() => setCooldownVerificacion((v) => (v > 0 ? v - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [cooldownVerificacion])

  // Cargar perfil
  useEffect(() => {
    const cargarUsuario = async () => {
      if (!usuario?.id) return
      setCargandoPerfil(true)
      setMensajeGuardado(null)
      try {
        let { data, error } = await clienteSupabase
          .from('usuarios').select('*').eq('id', usuario.id).single()

        if (error || !data) {
          const res = await clienteSupabase
            .from('usuarios').select('*').eq('email', usuario.email).single()
          data = res.data
          error = res.error
        }

        if (error && !data) throw error

        setFormUsuario({
          nombre: extraerNombreReal(data?.nombre),
          email: data?.email || usuario.email || '',
          telefono: data?.telefono || data?.telefono_envio || '',
          direccion_linea_1: data?.direccion_linea_1 || '',
          direccion_linea_2: data?.direccion_linea_2 || '',
          barrio: data?.barrio || '',
          ciudad: data?.ciudad || '',
          departamento: data?.departamento || '',
          codigo_postal: data?.codigo_postal || '',
          pais: data?.pais || ''
        })
        setUsuarioIdDB(data?.id || usuario.id)
        setDireccionEnvio({
          receptor: data?.nombre || '',
          direccion: data?.direccion_linea_1 || '',
          ciudad: data?.ciudad || '',
          departamento: data?.departamento || '',
          codigoPostal: data?.codigo_postal || '',
          indicaciones: data?.direccion_linea_2 || ''
        })
      } catch (e: any) {
        setMensajeGuardado({ tipo: 'error', texto: e.message || 'Error cargando perfil' })
        setUsuarioIdDB(usuario.id)
      } finally {
        setCargandoPerfil(false)
      }
    }
    cargarUsuario()
  }, [usuario?.id])

  const guardarCambiosPerfil = async () => {
    if (!usuario?.id) return
    setGuardandoPerfil(true)
    setMensajeGuardado(null)
    try {
      const { error } = await clienteSupabase.from('usuarios').update({
        nombre: formUsuario.nombre,
        telefono: formUsuario.telefono,
        direccion_linea_1: formUsuario.direccion_linea_1,
        direccion_linea_2: formUsuario.direccion_linea_2,
        barrio: formUsuario.barrio,
        ciudad: formUsuario.ciudad,
        departamento: formUsuario.departamento,
        codigo_postal: formUsuario.codigo_postal,
        pais: formUsuario.pais,
        actualizado_el: new Date().toISOString()
      }).eq('id', usuario.id)
      if (error) throw error
      setMensajeGuardado({ tipo: 'ok', texto: 'Cambios guardados correctamente' })
    } catch (e: any) {
      setMensajeGuardado({ tipo: 'error', texto: e.message || 'No se pudieron guardar los cambios' })
    } finally {
      setGuardandoPerfil(false)
    }
  }

  const guardarDireccionEnvio = async () => {
    if (!usuario?.id) return
    setGuardandoDireccion(true)
    setMensajeDirecciones(null)
    try {
      const { error } = await clienteSupabase.from('usuarios').update({
        direccion_linea_1: direccionEnvio.direccion,
        direccion_linea_2: direccionEnvio.indicaciones,
        ciudad: direccionEnvio.ciudad,
        departamento: direccionEnvio.departamento,
        codigo_postal: direccionEnvio.codigoPostal,
        actualizado_el: new Date().toISOString()
      }).eq('id', usuario.id)
      if (error) throw error
      setMensajeDirecciones({ tipo: 'ok', texto: 'Dirección de envío guardada' })
    } catch (e: any) {
      setMensajeDirecciones({ tipo: 'error', texto: e.message || 'No se pudo guardar la dirección' })
    } finally {
      setGuardandoDireccion(false)
    }
  }

  const actualizarContrasena = async () => {
    if (!usuario?.email) return
    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
      setMensajeSeguridad({ tipo: 'error', texto: 'Por favor completa todos los campos' }); return
    }
    if (contrasenaActual === nuevaContrasena) {
      setMensajeSeguridad({ tipo: 'error', texto: 'La nueva contraseña debe ser diferente a la actual' }); return
    }
    if (nuevaContrasena !== confirmarContrasena) {
      setMensajeSeguridad({ tipo: 'error', texto: 'La confirmación no coincide con la nueva contraseña' }); return
    }
    if (nuevaContrasena.length < 8) {
      setMensajeSeguridad({ tipo: 'error', texto: 'La contraseña debe tener al menos 8 caracteres' }); return
    }
    if (!validarPassword(nuevaContrasena)) {
      setMensajeSeguridad({ tipo: 'error', texto: 'La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales (@$!%*?&)' }); return
    }

    setGuardandoSeguridad(true)
    setMensajeSeguridad(null)
    try {
      const { error: loginError } = await clienteSupabase.auth.signInWithPassword({
        email: usuario.email, password: contrasenaActual
      })
      if (loginError) {
        setMensajeSeguridad({ tipo: 'error', texto: 'La contraseña actual es incorrecta' }); return
      }
      const { error } = await clienteSupabase.auth.updateUser({ password: nuevaContrasena })
      if (error) throw error
      setMensajeSeguridad({ tipo: 'ok', texto: 'Contraseña actualizada correctamente' })
      setContrasenaActual(''); setNuevaContrasena(''); setConfirmarContrasena('')
    } catch (e: any) {
      let texto = 'No se pudo actualizar la contraseña'
      if (e.message?.includes('weak_password')) texto = 'La contraseña es muy débil'
      else if (e.message?.includes('same_password')) texto = 'La nueva contraseña debe ser diferente a la actual'
      setMensajeSeguridad({ tipo: 'error', texto })
    } finally {
      setGuardandoSeguridad(false)
    }
  }

  const reenviarVerificacionEmail = async () => {
    if (!usuario?.email || cooldownVerificacion > 0) return
    setEnviandoVerificacion(true)
    setMensajeVerificacion(null)
    try {
      const { error } = await clienteSupabase.auth.resend({
        type: 'signup',
        email: usuario.email,
        options: { emailRedirectTo: `${window.location.origin}/perfil/seguridad` }
      })
      if (error) throw error
      setMensajeVerificacion({ tipo: 'ok', texto: 'Enlace de verificación enviado a tu correo' })
      setCooldownVerificacion(60)
    } catch (e: any) {
      setMensajeVerificacion({ tipo: 'error', texto: e.message || 'No se pudo enviar el enlace de verificación' })
    } finally {
      setEnviandoVerificacion(false)
    }
  }

  const enviarRecuperacionContrasena = async () => {
    if (!usuario?.email) return
    setEnviandoRecuperacion(true)
    setMensajeRecuperacion(null)
    try {
      const { error } = await clienteSupabase.auth.resetPasswordForEmail(usuario.email, {
        redirectTo: `${window.location.origin}/restablecer-contrasena`
      })
      if (error) throw error
      setMensajeRecuperacion({ tipo: 'ok', texto: 'Te enviamos un enlace para restablecer tu contraseña' })
    } catch (e: any) {
      setMensajeRecuperacion({ tipo: 'error', texto: e.message || 'No se pudo enviar el enlace de recuperación' })
    } finally {
      setEnviandoRecuperacion(false)
    }
  }

  return {
    // Perfil
    formUsuario, setFormUsuario,
    cargandoPerfil, guardandoPerfil, mensajeGuardado,
    guardarCambiosPerfil,
    // Dirección
    direccionEnvio, setDireccionEnvio,
    guardandoDireccion, mensajeDirecciones,
    guardarDireccionEnvio,
    // Seguridad
    contrasenaActual, setContrasenaActual,
    nuevaContrasena, setNuevaContrasena,
    confirmarContrasena, setConfirmarContrasena,
    guardandoSeguridad, mensajeSeguridad,
    actualizarContrasena,
    emailVerificado, enviandoVerificacion,
    cooldownVerificacion, mensajeVerificacion,
    reenviarVerificacionEmail,
    enviandoRecuperacion, mensajeRecuperacion,
    enviarRecuperacionContrasena,
    // Pedidos
    pedidosUsuario, cargandoPedidosUsuario, errorPedidos,
    formatearFechaPedido,
    // WhatsApp
    waModalOpen, setWaModalOpen,
    waCountdown, construirUrlWhatsapp,
    // Notificaciones
    preferencias, setPreferencias
  }
}
