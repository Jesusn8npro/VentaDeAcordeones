import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../contextos/ContextoAutenticacion'
import { clienteSupabase } from '../../../configuracion/supabase'
import { 
  User, MapPin, CreditCard, Lock, Bell, ListOrdered, Home, ShieldCheck, Settings, Heart, ChevronLeft, ChevronRight
} from 'lucide-react'
import './PaginaPerfil.css'
import { validarPassword } from '../../../utilidades/validaciones'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'

export default function PaginaPerfil() {
  const { usuario } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const alias = useMemo(() => {
    if (!usuario) return 'Invitado'
    
    // Función para extraer el nombre real del usuario
    const obtenerNombreReal = () => {
      // Si usuario.nombre es un string válido y no contiene JSON
      if (typeof usuario.nombre === 'string' && usuario.nombre.trim() && !usuario.nombre.includes('{')) {
        return usuario.nombre.trim();
      }
      
      // Si usuario.nombre contiene JSON, intentar extraer el nombre
      if (typeof usuario.nombre === 'string' && usuario.nombre.includes('{')) {
        try {
          const parsed = JSON.parse(usuario.nombre);
          if (parsed.nombre) return parsed.nombre;
          if (parsed.apellido) return parsed.apellido;
        } catch (e) {
          // Si no se puede parsear, continuar con otras opciones
        }
      }
      
      // Fallback a email o user_metadata
      return usuario.email?.split('@')[0] || 
             usuario.user_metadata?.nombre || 
             'Usuario';
    };
    
    const nombre = obtenerNombreReal();
    if (nombre && nombre !== 'Usuario') return nombre.split(' ')[0];
    return nombre;
  }, [usuario])

  const [tab, setTab] = useState('resumen')

  // Mapear rutas a tabs para soporte de deep link
  const rutaATab = {
    '': 'resumen',
    'resumen': 'resumen',
    'pedidos': 'pedidos',
    'direcciones': 'direcciones',
    'metodos-pago': 'pago',
    'datos': 'datos',
    'seguridad': 'seguridad',
    'notificaciones': 'notificaciones'
  }

  const tabARuta = {
    'resumen': '',
    'pedidos': 'pedidos',
    'direcciones': 'direcciones',
    'pago': 'metodos-pago',
    'datos': 'datos',
    'seguridad': 'seguridad',
    'notificaciones': 'notificaciones'
  }

  useEffect(() => {
    const segmento = location.pathname.split('/')[2] || ''
    const nuevoTab = rutaATab[segmento] || 'resumen'
    setTab(nuevoTab)
  }, [location.pathname])

  // Estado del formulario principal (mapeado a columnas reales de `public.usuarios`)
  const [formUsuario, setFormUsuario] = useState({
    nombre: '',
    email: '',
    telefono: '',
    direccion_linea_1: '',
    direccion_linea_2: '',
    barrio: '',
    ciudad: '',
    departamento: '',
    codigo_postal: '',
    pais: ''
  })

  // ID real de la fila en `public.usuarios` (puede diferir de auth.uid())
  const [usuarioIdDB, setUsuarioIdDB] = useState(null)
  const [conflictoPerfil, setConflictoPerfil] = useState(null)

  // Estado de seguridad (cambio de contraseña)
  const [contrasenaActual, setContrasenaActual] = useState('')
  const [nuevaContrasena, setNuevaContrasena] = useState('')
  const [confirmarContrasena, setConfirmarContrasena] = useState('')
  const [guardandoSeguridad, setGuardandoSeguridad] = useState(false)
  const [mensajeSeguridad, setMensajeSeguridad] = useState(null)

  // Verificación de email
  const [emailVerificado, setEmailVerificado] = useState(false)
  const [enviandoVerificacion, setEnviandoVerificacion] = useState(false)
  const [mensajeVerificacion, setMensajeVerificacion] = useState(null)
  const [cooldownVerificacion, setCooldownVerificacion] = useState(0)

  // Recuperación de contraseña
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false)
  const [mensajeRecuperacion, setMensajeRecuperacion] = useState(null)

  // Pedidos del usuario
  const [pedidosUsuario, setPedidosUsuario] = useState([])
  const [cargandoPedidosUsuario, setCargandoPedidosUsuario] = useState(true)
  const [errorPedidos, setErrorPedidos] = useState(null)

  // Modal de WhatsApp tras compra COD
  const [waModalOpen, setWaModalOpen] = useState(false)
  const [waCountdown, setWaCountdown] = useState(2)

  const formatearFechaPedido = (fecha) => {
    if (!fecha) return '-'
    try {
      return new Date(fecha).toLocaleDateString('es-CO', {
        day: '2-digit', month: '2-digit', year: 'numeric'
      })
    } catch (_) {
      return '-'
    }
  }

  // Construye el enlace de WhatsApp usando el último pedido
  const construirUrlWhatsapp = () => {
    const telefonoEmpresa = '3214892176'
    const numeroWA = telefonoEmpresa.startsWith('57') ? telefonoEmpresa : `57${telefonoEmpresa}`
    const ultimo = pedidosUsuario?.[0] || null
    const nombreProducto = ultimo?.productos?.[0]?.nombre
    const totalPedido = ultimo?.total || 0
    const texto = `Hola 👋, acabo de registrar mi compra${nombreProducto ? ` de ${nombreProducto}` : ''} por ${formatearPrecioCOP(totalPedido)}. Quisiera confirmar el pedido o resolver dudas.`
    return `https://wa.me/${numeroWA}?text=${encodeURIComponent(texto)}`
  }

  useEffect(() => {
    const cargarPedidos = async () => {
      const idParaPedidos = usuarioIdDB || usuario?.id
      if (!idParaPedidos) return
      setCargandoPedidosUsuario(true)
      setErrorPedidos(null)
      try {
        const { data, error } = await clienteSupabase
          .from('pedidos')
          .select('id, numero_pedido, creado_el, estado, total, direccion_envio, productos')
          .eq('usuario_id', idParaPedidos)
          .order('creado_el', { ascending: false })
          .limit(50)

        if (error) throw error
        setPedidosUsuario(data || [])
      } catch (e) {
        setErrorPedidos(e.message || 'Error cargando pedidos')
      } finally {
        setCargandoPedidosUsuario(false)
      }
    }
    cargarPedidos()
  }, [usuarioIdDB, usuario?.id])

  // Si venimos de flujo COD, mostrar modal tras 5s
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('after') === 'cod' && usuario?.id) {
      const t = setTimeout(() => setWaModalOpen(true), 5000)
      return () => clearTimeout(t)
    }
  }, [location.search, usuario?.id])

  // Cuando el modal está abierto, iniciar cuenta regresiva y redirigir
  useEffect(() => {
    if (!waModalOpen) return
    setWaCountdown(2)
    const waUrl = construirUrlWhatsapp()
    const tick = setInterval(() => setWaCountdown((c) => (c > 0 ? c - 1 : 0)), 1000)
    const red = setTimeout(() => { window.location.href = waUrl }, 2000)
    return () => { clearInterval(tick); clearTimeout(red) }
  }, [waModalOpen])

  useEffect(() => {
    let activo = true
    const cargarEstadoEmail = async () => {
      try {
        const { data, error } = await clienteSupabase.auth.getUser()
        if (error) return
        const confirmado = !!data?.user?.email_confirmed_at
        if (activo) setEmailVerificado(confirmado)
      } catch (_) {}
    }
    cargarEstadoEmail()
    return () => { activo = false }
  }, [])

  useEffect(() => {
    if (cooldownVerificacion <= 0) return
    const t = setInterval(() => setCooldownVerificacion((v) => (v > 0 ? v - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [cooldownVerificacion])

  const reenviarVerificacionEmail = async () => {
    if (!usuario?.email) return
    if (cooldownVerificacion > 0) return

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
    } catch (e) {
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
    } catch (e) {
      setMensajeRecuperacion({ tipo: 'error', texto: e.message || 'No se pudo enviar el enlace de recuperación' })
    } finally {
      setEnviandoRecuperacion(false)
    }
  }

  // Estado para sección "direcciones" (visual, rellena desde formUsuario)
  const [direccionEnvio, setDireccionEnvio] = useState({
    receptor: '',
    direccion: '',
    ciudad: '',
    departamento: '',
    codigoPostal: '',
    indicaciones: ''
  })

  const [cargandoPerfil, setCargandoPerfil] = useState(false)
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [mensajeGuardado, setMensajeGuardado] = useState(null)
  const [guardandoDireccion, setGuardandoDireccion] = useState(false)
  const [mensajeDirecciones, setMensajeDirecciones] = useState(null)

  const [preferencias, setPreferencias] = useState({
    marketingEmail: true,
    promocionesSMS: false,
    notificacionesPush: true
  })

  const menuItems = [
    { id: 'resumen', label: 'Mi cuenta', icon: Home, path: '/perfil' },
    { id: 'pedidos', label: 'Mis pedidos', icon: ListOrdered, path: '/perfil/pedidos' },
    { id: 'favoritos', label: 'Lista de deseos', icon: Heart, path: '/favoritos', externo: true },
    { id: 'direcciones', label: 'Libreta de direcciones', icon: MapPin, path: '/perfil/direcciones' },
    { id: 'datos', label: 'Información de cuenta', icon: User, path: '/perfil/datos' },
    { id: 'pago', label: 'Métodos de pago', icon: CreditCard, path: '/perfil/metodos-pago' },
    { id: 'seguridad', label: 'Seguridad', icon: Lock, path: '/perfil/seguridad' },
    { id: 'notificaciones', label: 'Suscripciones y newsletters', icon: Bell, path: '/perfil/notificaciones' }
  ]

  // Índice activo para navegación por gestos
  const activeIndex = useMemo(() => {
    return menuItems.findIndex(mi => mi.id === tab)
  }, [tab])

  const navegarPorIndice = (idx) => {
    const item = menuItems[idx]
    if (!item) return
    if (item.externo) {
      navigate(item.path)
    } else {
      const ruta = tabARuta[item.id]
      navigate(`/perfil/${ruta}`)
    }
  }

  const irAnterior = () => {
    if (activeIndex > 0) navegarPorIndice(activeIndex - 1)
  }
  const irSiguiente = () => {
    if (activeIndex < menuItems.length - 1) navegarPorIndice(activeIndex + 1)
  }

  // Gestos táctiles para móvil (swipe izquierda/derecha)
  const touchStartXRef = useRef(null)
  const touchStartTimeRef = useRef(0)
  const THRESHOLD = 50 // píxeles

  const onMobileNavTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return
    touchStartXRef.current = e.touches[0].clientX
    touchStartTimeRef.current = Date.now()
  }

  const onMobileNavTouchEnd = (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return
    const dx = e.changedTouches[0].clientX - (touchStartXRef.current ?? 0)
    if (Math.abs(dx) > THRESHOLD) {
      if (dx < 0) irSiguiente()
      else irAnterior()
    }
  }

  // Carrusel móvil: flechas y visibilidad
  const mobileNavListRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollArrows = () => {
    const el = mobileNavListRef.current
    if (!el) return
    const maxScroll = el.scrollWidth - el.clientWidth
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < maxScroll - 4)
  }

  useEffect(() => {
    const el = mobileNavListRef.current
    if (!el) return
    updateScrollArrows()
    const onScroll = () => updateScrollArrows()
    el.addEventListener('scroll', onScroll, { passive: true })
    const onResize = () => updateScrollArrows()
    window.addEventListener('resize', onResize)
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
    }
  }, [mobileNavListRef])

  // Al cambiar de pestaña, centra la pastilla activa en el carrusel
  const scrollActiveIntoCenter = () => {
    const container = mobileNavListRef.current
    if (!container) return
    const el = container.querySelector(`button[data-id="${tab}"]`)
    if (!el) return
    const target = el.offsetLeft - (container.clientWidth / 2 - el.clientWidth / 2)
    container.scrollTo({ left: target, behavior: 'smooth' })
  }

  useEffect(() => {
    scrollActiveIntoCenter()
    updateScrollArrows()
  }, [tab])

  const scrollStep = (dir = 1) => {
    const el = mobileNavListRef.current
    if (!el) return
    const step = Math.max(220, Math.floor(el.clientWidth * 0.8))
    el.scrollBy({ left: step * dir, behavior: 'smooth' })
  }

  const scrollLeft = () => scrollStep(-1)
  const scrollRight = () => scrollStep(1)

  // Cargar datos completos del usuario desde Supabase
  useEffect(() => {
    const cargarUsuario = async () => {
      if (!usuario?.id) return
      setCargandoPerfil(true)
      setMensajeGuardado(null)
      try {
        // Intento principal: buscar por ID
        let { data, error } = await clienteSupabase
          .from('usuarios')
          .select('*')
          .eq('id', usuario.id)
          .single()

        // Fallback: si falla, buscar por email
        if (error || !data) {
          const resEmail = await clienteSupabase
            .from('usuarios')
            .select('*')
            .eq('email', usuario.email)
            .single()
          data = resEmail.data
          error = resEmail.error
          if (data?.id && data.id !== usuario.id) {
            setConflictoPerfil('Detectamos un desajuste entre tu ID de autenticación y tu perfil. Mostramos tus datos usando tu email.')
          }
        }

        if (error && !data) throw error

        // Función para extraer el nombre real de los datos
        const extraerNombreReal = (nombreData) => {
          if (!nombreData) return '';
          
          // Si es un string válido y no contiene JSON
          if (typeof nombreData === 'string' && nombreData.trim() && !nombreData.includes('{')) {
            return nombreData.trim();
          }
          
          // Si contiene JSON, intentar extraer el nombre
          if (typeof nombreData === 'string' && nombreData.includes('{')) {
            try {
              const parsed = JSON.parse(nombreData);
              if (parsed.nombre) return parsed.nombre;
              if (parsed.apellido) return parsed.apellido;
            } catch (e) {
              // Si no se puede parsear, devolver string vacío
            }
          }
          
          return '';
        };

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

        // Guardar el ID real de la fila para usarlo en otras consultas
        if (data?.id) {
          setUsuarioIdDB(data.id)
        } else {
          setUsuarioIdDB(usuario.id)
        }

        // Sincronizar sección "direcciones" con los mismos datos
        setDireccionEnvio({
          receptor: data?.nombre || '',
          direccion: data?.direccion_linea_1 || '',
          ciudad: data?.ciudad || '',
          departamento: data?.departamento || '',
          codigoPostal: data?.codigo_postal || '',
          indicaciones: data?.direccion_linea_2 || ''
        })
      } catch (e) {
        setMensajeGuardado({ tipo: 'error', texto: e.message || 'Error cargando perfil' })
        setUsuarioIdDB(usuario.id)
      } finally {
        setCargandoPerfil(false)
      }
    }
    cargarUsuario()
  }, [usuario?.id])

  // Guardar cambios en Supabase (tabla `usuarios`)
  const guardarCambiosPerfil = async () => {
    if (!usuario?.id) return
    setGuardandoPerfil(true)
    setMensajeGuardado(null)
    try {
      const payload = {
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
      }

      const { error } = await clienteSupabase
        .from('usuarios')
        .update(payload)
        .eq('id', usuario.id)

      if (error) throw error

      setMensajeGuardado({ tipo: 'ok', texto: 'Cambios guardados correctamente' })
    } catch (e) {
      setMensajeGuardado({ tipo: 'error', texto: e.message || 'No se pudieron guardar los cambios' })
    } finally {
      setGuardandoPerfil(false)
    }
  }

  // Actualizar contraseña con verificación mejorada
  const actualizarContrasena = async () => {
    if (!usuario?.email) return

    // Validaciones mejoradas
    if (!contrasenaActual || !nuevaContrasena || !confirmarContrasena) {
      setMensajeSeguridad({ tipo: 'error', texto: 'Por favor completa todos los campos' })
      return
    }
    
    // Verificar que la nueva contraseña no sea igual a la actual
    if (contrasenaActual === nuevaContrasena) {
      setMensajeSeguridad({ tipo: 'error', texto: 'La nueva contraseña debe ser diferente a la actual' })
      return
    }
    
    if (nuevaContrasena !== confirmarContrasena) {
      setMensajeSeguridad({ tipo: 'error', texto: 'La confirmación no coincide con la nueva contraseña' })
      return
    }
    
    // Validar longitud mínima
    if (nuevaContrasena.length < 8) {
      setMensajeSeguridad({ tipo: 'error', texto: 'La contraseña debe tener al menos 8 caracteres' })
      return
    }
    
    // Validar complejidad
    if (!validarPassword(nuevaContrasena)) {
      setMensajeSeguridad({ tipo: 'error', texto: 'La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales (@$!%*?&)' })
      return
    }

    setGuardandoSeguridad(true)
    setMensajeSeguridad(null)
    
    try {
      // Verificar contraseña actual
      const { error: loginError } = await clienteSupabase.auth.signInWithPassword({
        email: usuario.email,
        password: contrasenaActual
      })
      if (loginError) {
        setMensajeSeguridad({ tipo: 'error', texto: 'La contraseña actual es incorrecta' })
        setGuardandoSeguridad(false)
        return
      }

      // Actualizar contraseña
      const { error } = await clienteSupabase.auth.updateUser({ password: nuevaContrasena })
      if (error) {
        throw error
      }

      setMensajeSeguridad({ tipo: 'ok', texto: 'Contraseña actualizada correctamente' })
      
      // Limpiar campos del formulario
      setContrasenaActual('')
      setNuevaContrasena('')
      setConfirmarContrasena('')
      
    } catch (e) {
      // Manejar errores específicos sin exponer información sensible
      let mensajeError = 'No se pudo actualizar la contraseña'
      if (e.message?.includes('weak_password')) {
        mensajeError = 'La contraseña es muy débil, por favor usa una más segura'
      } else if (e.message?.includes('same_password')) {
        mensajeError = 'La nueva contraseña debe ser diferente a la actual'
      }
      setMensajeSeguridad({ tipo: 'error', texto: mensajeError })
    } finally {
      setGuardandoSeguridad(false)
    }
  }

  // Guardar solamente datos de dirección de envío
  const guardarDireccionEnvio = async () => {
    if (!usuario?.id) return
    setGuardandoDireccion(true)
    setMensajeDirecciones(null)
    try {
      const payload = {
        direccion_linea_1: direccionEnvio.direccion,
        direccion_linea_2: direccionEnvio.indicaciones,
        ciudad: direccionEnvio.ciudad,
        departamento: direccionEnvio.departamento,
        codigo_postal: direccionEnvio.codigoPostal,
        actualizado_el: new Date().toISOString()
      }

      const { error } = await clienteSupabase
        .from('usuarios')
        .update(payload)
        .eq('id', usuario.id)

      if (error) throw error

      setMensajeDirecciones({ tipo: 'ok', texto: 'Dirección de envío guardada' })
    } catch (e) {
      setMensajeDirecciones({ tipo: 'error', texto: e.message || 'No se pudo guardar la dirección' })
    } finally {
      setGuardandoDireccion(false)
    }
  }

  return (
    <div className="perfil-page">
      {/* Encabezado de lujo */}
      <div className="perfil-hero">
        <div className="perfil-hero-content">
          <div className="perfil-hero-textos">
            <h1 className="perfil-titulo">Mi cuenta</h1>
            <p className="perfil-subtitulo">Bienvenido, {alias}</p>
          </div>
          <div className="perfil-hero-badges">
            <div className="perfil-badge">
              <ShieldCheck size={16} />
              <span>Cuenta verificada</span>
            </div>
            <div className="perfil-badge">
              <Settings size={16} />
              <span>Configura tu experiencia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil horizontal deslizable */}
      <div
        className="perfil-mobile-nav"
        onTouchStart={onMobileNavTouchStart}
        onTouchEnd={onMobileNavTouchEnd}
      >
        <div className={`mobile-nav-edge left ${canScrollLeft ? 'visible' : ''}`} />
        <button
          className={`mobile-nav-arrow left ${canScrollLeft ? 'visible' : ''}`}
          aria-label="Anterior"
          onClick={scrollLeft}
        >
          <ChevronLeft size={18} />
        </button>
        <div
          className="perfil-mobile-nav-list"
          role="tablist"
          aria-label="Opciones de cuenta"
          ref={mobileNavListRef}
          onScroll={updateScrollArrows}
        >
          {menuItems.map(({ id, label }) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              className={`perfil-mobile-nav-item ${tab === id ? 'activo' : ''}`}
              data-id={id}
              onClick={() => {
                const item = menuItems.find(mi => mi.id === id)
                if (!item) return
                if (item.externo) navigate(item.path)
                else navigate(`/perfil/${tabARuta[item.id]}`)
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div className={`mobile-nav-edge right ${canScrollRight ? 'visible' : ''}`} />
        <button
          className={`mobile-nav-arrow right ${canScrollRight ? 'visible' : ''}`}
          aria-label="Siguiente"
          onClick={scrollRight}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Layout con sidebar izquierdo */}
      <div className="perfil-layout">
        <aside className="perfil-sidebar">
          <nav className="perfil-menu">
            {menuItems.map(({ id, label, icon: Icon, path, externo }) => {
              const activo = tab === id
              return (
                <button
                  key={id}
                  className={`perfil-menu-item ${activo ? 'activo' : ''}`}
                  onClick={() => {
                    if (externo) {
                      navigate(path)
                    } else {
                      const ruta = tabARuta[id]
                      navigate(`/perfil/${ruta}`)
                    }
                  }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Contenido por sección */}
        <div
          className="perfil-contenido"
          onTouchStart={onMobileNavTouchStart}
          onTouchEnd={onMobileNavTouchEnd}
        >
          {tab === 'resumen' && (
            <section className="panel lujo-grid">
            <div className="panel-card panel-bienvenida">
              <div className="panel-card-header">
                <h3>Resumen general</h3>
                <p>Accesos rápidos a tus principales acciones</p>
              </div>
              <div className="panel-card-body grid-acciones">
                <div className="accion-item">
                  <ListOrdered size={22} />
                  <div>
                    <h4>Pedidos</h4>
                    <p>Consulta el estado y detalle</p>
                  </div>
                </div>
                <div className="accion-item">
                  <MapPin size={22} />
                  <div>
                    <h4>Direcciones</h4>
                    <p>Envio y facturación</p>
                  </div>
                </div>
                <div className="accion-item">
                  <CreditCard size={22} />
                  <div>
                    <h4>Pagos</h4>
                    <p>Gestiona tus métodos</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="panel-card panel-resumen-pedidos">
              <div className="panel-card-header">
                <h3>Últimos pedidos</h3>
              </div>
              <div className="tabla-pedidos">
                <div className="tabla-header">
                  <span>#</span>
                  <span>Fecha</span>
                  <span>Estado</span>
                  <span>Total</span>
                </div>
                {cargandoPedidosUsuario ? (
                  <div className="tabla-row"><span>Cargando...</span></div>
                ) : errorPedidos ? (
                  <div className="tabla-row"><span>Error: {errorPedidos}</span></div>
                ) : pedidosUsuario.length === 0 ? (
                  <div className="tabla-row"><span>Sin pedidos aún</span></div>
                ) : (
                  pedidosUsuario.slice(0,3).map(p => (
                    <div className="tabla-row" key={p.id}>
                      <span>{p.numero_pedido || p.id}</span>
                      <span>{formatearFechaPedido(p.creado_el)}</span>
                      <span className={`estado estado-${(p.estado || 'pendiente').toLowerCase()}`}>{p.estado || 'Pendiente'}</span>
                      <span>{formatearPrecioCOP(p.total || 0)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {tab === 'pedidos' && (
          <section className="panel">
            <div className="panel-card">
              <div className="panel-card-header">
                <h3>Mis pedidos</h3>
                <p>Historial y seguimiento</p>
              </div>
              <div className="tabla-pedidos grande">
                <div className="tabla-header">
                  <span>#</span>
                  <span>Fecha</span>
                  <span>Estado</span>
                  <span>Envio</span>
                  <span>Total</span>
                </div>
                {cargandoPedidosUsuario ? (
                  <div className="tabla-row"><span>Cargando pedidos...</span></div>
                ) : errorPedidos ? (
                  <div className="tabla-row"><span>Error: {errorPedidos}</span></div>
                ) : pedidosUsuario.length === 0 ? (
                  <div className="tabla-row"><span>No tienes pedidos registrados</span></div>
                ) : (
                  pedidosUsuario.map(p => (
                    <div className="tabla-row" key={p.id}>
                      <span>{p.numero_pedido || p.id}</span>
                      <span>{formatearFechaPedido(p.creado_el)}</span>
                      <span className={`estado estado-${(p.estado || 'pendiente').toLowerCase()}`}>{p.estado || 'Pendiente'}</span>
                      <span>{p?.direccion_envio?.ciudad || '—'}</span>
                      <span>{formatearPrecioCOP(p.total || 0)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        )}

        {tab === 'direcciones' && (
          <section className="panel">
            <div className="panel-card">
              <div className="panel-card-header">
                <h3>Dirección de envío</h3>
                <p>Gestiona tus lugares de entrega</p>
              </div>
              <div className="form-grid">
                <div className="campo">
                  <label>Nombre del receptor</label>
                  <input 
                    type="text" 
                    value={direccionEnvio.receptor}
                    onChange={(e) => setDireccionEnvio(v => ({...v, receptor: e.target.value}))}
                    placeholder="Nombre y apellido"
                  />
                </div>
                <div className="campo">
                  <label>Dirección</label>
                  <input 
                    type="text" 
                    value={direccionEnvio.direccion}
                    onChange={(e) => setDireccionEnvio(v => ({...v, direccion: e.target.value}))}
                    placeholder="Calle, número, apto"
                  />
                </div>
                <div className="campo">
                  <label>Ciudad</label>
                  <input 
                    type="text" 
                    value={direccionEnvio.ciudad}
                    onChange={(e) => setDireccionEnvio(v => ({...v, ciudad: e.target.value}))}
                  />
                </div>
                <div className="campo">
                  <label>Departamento</label>
                  <input 
                    type="text" 
                    value={direccionEnvio.departamento}
                    onChange={(e) => setDireccionEnvio(v => ({...v, departamento: e.target.value}))}
                  />
                </div>
                <div className="campo">
                  <label>Código Postal</label>
                  <input 
                    type="text" 
                    value={direccionEnvio.codigoPostal}
                    onChange={(e) => setDireccionEnvio(v => ({...v, codigoPostal: e.target.value}))}
                  />
                </div>
                <div className="campo campo-col-2">
                  <label>Indicaciones</label>
                  <textarea 
                    rows={3}
                    value={direccionEnvio.indicaciones}
                    onChange={(e) => setDireccionEnvio(v => ({...v, indicaciones: e.target.value}))}
                    placeholder="Referencias de entrega"
                  />
                </div>
                <div className="campo campo-col-2">
                  <button className="btn-primary" onClick={guardarDireccionEnvio} disabled={guardandoDireccion || cargandoPerfil}>
                    {guardandoDireccion ? 'Guardando...' : 'Guardar dirección'}
                  </button>
                </div>

                {mensajeDirecciones && (
                  <div className="campo campo-col-2" role="alert" aria-live="polite">
                    <div className={`alerta ${mensajeDirecciones.tipo === 'ok' ? 'ok' : 'error'}`}>
                      {mensajeDirecciones.texto}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {tab === 'pago' && (
          <section className="panel lujo-grid">
            <div className="panel-card">
              <div className="panel-card-header">
                <h3>Métodos de pago</h3>
                <p>Guarda y administra tarjetas y PSE</p>
              </div>
              <div className="metodos-grid">
                {[
                  { tipo: 'Visa', terminacion: '1823', nombre: alias },
                  { tipo: 'Mastercard', terminacion: '7741', nombre: alias }
                ].map((m, i) => (
                  <div key={i} className="metodo-card">
                    <div className="metodo-info">
                      <CreditCard size={20} />
                      <div>
                        <h4>{m.tipo} •••• {m.terminacion}</h4>
                        <p>Titular: {m.nombre}</p>
                      </div>
                    </div>
                    <div className="metodo-actions">
                      <button className="btn-ghost">Editar</button>
                      <button className="btn-ghost peligro">Eliminar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="panel-card">
              <div className="panel-card-header">
                <h3>Agregar nuevo método</h3>
              </div>
              <div className="form-grid">
                <div className="campo">
                  <label>Número de tarjeta</label>
                  <input type="text" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="campo">
                  <label>Nombre del titular</label>
                  <input type="text" placeholder="Como aparece en la tarjeta" />
                </div>
                <div className="campo">
                  <label>Vencimiento</label>
                  <input type="text" placeholder="MM/AA" />
                </div>
                <div className="campo">
                  <label>CVV</label>
                  <input type="text" placeholder="123" />
                </div>
                <div className="campo campo-col-2">
                  <button className="btn-primary">Guardar método</button>
                </div>
              </div>
            </div>
          </section>
        )}

        {tab === 'datos' && (
          <section className="panel">
            <div className="panel-card">
              <div className="panel-card-header">
                <h3>Datos personales</h3>
                <p>Actualiza tu información de perfil</p>
              </div>
              <div className="form-grid">
                <div className="campo">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={formUsuario.nombre}
                    onChange={(e) => setFormUsuario(v => ({ ...v, nombre: e.target.value }))}
                  />
                </div>
                <div className="campo">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formUsuario.email}
                    readOnly
                  />
                </div>
                <div className="campo">
                  <label>Teléfono</label>
                  <input
                    type="text"
                    value={formUsuario.telefono}
                    onChange={(e) => setFormUsuario(v => ({ ...v, telefono: e.target.value }))}
                  />
                </div>

                <div className="campo">
                  <label>Dirección (línea 1)</label>
                  <input
                    type="text"
                    placeholder="Calle, número, apto"
                    value={formUsuario.direccion_linea_1}
                    onChange={(e) => setFormUsuario(v => ({ ...v, direccion_linea_1: e.target.value }))}
                  />
                </div>
                <div className="campo">
                  <label>Dirección (línea 2)</label>
                  <input
                    type="text"
                    placeholder="Barrio, referencias, interior"
                    value={formUsuario.direccion_linea_2}
                    onChange={(e) => setFormUsuario(v => ({ ...v, direccion_linea_2: e.target.value }))}
                  />
                </div>
                <div className="campo">
                  <label>Barrio</label>
                  <input
                    type="text"
                    value={formUsuario.barrio}
                    onChange={(e) => setFormUsuario(v => ({ ...v, barrio: e.target.value }))}
                  />
                </div>
                <div className="campo">
                  <label>Ciudad</label>
                  <input
                    type="text"
                    value={formUsuario.ciudad}
                    onChange={(e) => setFormUsuario(v => ({ ...v, ciudad: e.target.value }))}
                  />
                </div>
                <div className="campo">
                  <label>Departamento</label>
                  <input
                    type="text"
                    value={formUsuario.departamento}
                    onChange={(e) => setFormUsuario(v => ({ ...v, departamento: e.target.value }))}
                  />
                </div>
                <div className="campo">
                  <label>Código Postal</label>
                  <input
                    type="text"
                    value={formUsuario.codigo_postal}
                    onChange={(e) => setFormUsuario(v => ({ ...v, codigo_postal: e.target.value }))}
                  />
                </div>
                <div className="campo">
                  <label>País</label>
                  <input
                    type="text"
                    value={formUsuario.pais}
                    onChange={(e) => setFormUsuario(v => ({ ...v, pais: e.target.value }))}
                  />
                </div>

                <div className="campo campo-col-2">
                  <button className="btn-primary" onClick={guardarCambiosPerfil} disabled={guardandoPerfil || cargandoPerfil}>
                    {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>

                {mensajeGuardado && (
                  <div className="campo campo-col-2" role="alert" aria-live="polite">
                    <div className={`alerta ${mensajeGuardado.tipo === 'ok' ? 'ok' : 'error'}`}>
                      {mensajeGuardado.texto}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {tab === 'seguridad' && (
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
                    onChange={(e) => setContrasenaActual(e.target.value)}
                  />
                </div>
                <div className="campo">
                  <label>Nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={nuevaContrasena}
                    onChange={(e) => setNuevaContrasena(e.target.value)}
                  />
                </div>
                <div className="campo">
                  <label>Confirmar nueva contraseña</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmarContrasena}
                    onChange={(e) => setConfirmarContrasena(e.target.value)}
                  />
                </div>
                <div className="campo campo-col-2">
                  <div className="nota-seguridad" style={{ fontSize: '0.9rem', color: '#555' }}>
                    Requisito: mínimo 6 caracteres y sin espacios.
                  </div>
                </div>
                <div className="campo campo-col-2">
                  <button className="btn-primary" onClick={actualizarContrasena} disabled={guardandoSeguridad}>
                    {guardandoSeguridad ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </div>

                {mensajeSeguridad && (
                  <div className="campo campo-col-2" role="alert" aria-live="polite">
                    <div className={`alerta ${mensajeSeguridad.tipo === 'ok' ? 'ok' : 'error'}`}>
                      {mensajeSeguridad.texto}
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
                    onClick={reenviarVerificacionEmail}
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
                    onClick={enviarRecuperacionContrasena}
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
        )}

        {tab === 'notificaciones' && (
          <section className="panel">
            <div className="panel-card">
              <div className="panel-card-header">
                <h3>Notificaciones</h3>
                <p>Preferencias de comunicación</p>
              </div>
              <div className="preferencias-grid">
                <div className="preferencia-item">
                  <Bell size={18} />
                  <div className="preferencia-info">
                    <h4>Marketing por email</h4>
                    <p>Recibe promociones y novedades</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={preferencias.marketingEmail}
                      onChange={(e) => setPreferencias(v => ({...v, marketingEmail: e.target.checked}))}
                    />
                    <span className="slider" />
                  </label>
                </div>
                <div className="preferencia-item">
                  <Bell size={18} />
                  <div className="preferencia-info">
                    <h4>Promociones por SMS</h4>
                    <p>Mensajes directos al móvil</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={preferencias.promocionesSMS}
                      onChange={(e) => setPreferencias(v => ({...v, promocionesSMS: e.target.checked}))}
                    />
                    <span className="slider" />
                  </label>
                </div>
                <div className="preferencia-item">
                  <Bell size={18} />
                  <div className="preferencia-info">
                    <h4>Notificaciones Push</h4>
                    <p>Actualizaciones en tiempo real</p>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={preferencias.notificacionesPush}
                      onChange={(e) => setPreferencias(v => ({...v, notificacionesPush: e.target.checked}))}
                    />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            </div>
          </section>
        )}

        {waModalOpen && (
          <div className="wa-modal-overlay" role="dialog" aria-label="Redirección a WhatsApp">
            <div className="wa-modal">
              <h4>Te acompañamos por WhatsApp</h4>
              <p>En breve abriremos nuestro chat para finalizar tu compra o aclarar dudas.</p>
              <div className="wa-acciones">
                <button className="btn-primary" onClick={() => { window.location.href = construirUrlWhatsapp() }}>
                  Abrir WhatsApp ahora
                </button>
                <button className="btn-secundario" onClick={() => setWaModalOpen(false)}>
                  Cancelar
                </button>
              </div>
              <small>Se abrirá automáticamente en {waCountdown}s</small>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  )
}

