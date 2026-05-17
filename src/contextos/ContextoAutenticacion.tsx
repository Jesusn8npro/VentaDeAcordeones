import React, { createContext, useContext, useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { clienteSupabase } from '../configuracion/supabase'

const ContextoAutenticacion = createContext({})

export const ProveedorAutenticacion = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [sesionInicializada, setSesionInicializada] = useState(false)

  // CACHE: Referencias para evitar re-inicializaciones innecesarias
  const authInitialized = useRef(false)
  const lastAuthState = useRef(null)

  // Función optimizada para obtener datos del usuario desde la base de datos
  const obtenerDatosUsuario = useCallback(async (userId) => {
    try {
      // 1. Intentar obtener usuario existente
      const { data, error } = await clienteSupabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        return data
      }

      const { data: { user }, error: authError } = await clienteSupabase.auth.getUser()

      if (authError || !user) return null

      // 3. Crear usuario básico en la tabla usuarios
      const usuarioBasico = {
        id: user.id,
        email: user.email,
        nombre: user.user_metadata?.nombre ||
          user.user_metadata?.full_name ||
          user.email.split('@')[0],
        rol: 'cliente',
        telefono: user.user_metadata?.telefono || null,
        creado_el: new Date().toISOString(),
        actualizado_el: new Date().toISOString()
      }

      // 4. Insertar en la tabla usuarios
      const { data: usuarioCreado, error: errorCreacion } = await clienteSupabase
        .from('usuarios')
        .insert([usuarioBasico])
        .select()
        .single()

      if (errorCreacion) return usuarioBasico

      return usuarioCreado

    } catch {
      return null
    }
  }, [])

  // Función optimizada para manejar cambios de autenticación
  const manejarCambioAuth = useCallback(async (event, session) => {
    // CACHE: Evitar procesamiento duplicado del mismo estado
    const currentAuthState = session?.user?.id || 'no-session'
    if (lastAuthState.current === currentAuthState && authInitialized.current) return
    lastAuthState.current = currentAuthState

    if (session?.user) {
      try {
        // Verificar si el token es válido antes de proceder
        const { data: { user }, error } = await clienteSupabase.auth.getUser()

        if (error) {
          if (error.message.includes('Invalid Refresh Token') || error.message.includes('refresh_token_not_found')) {
            await clienteSupabase.auth.signOut()
            setUsuario(null)
            setCargando(false)
            setSesionInicializada(true)
            return
          }
        }

        // Usuario básico temporal mientras se carga el rol real desde la DB
        const usuarioBasico = {
          id: session.user.id,
          email: session.user.email,
          nombre:
            session.user.user_metadata?.nombre ||
            session.user.user_metadata?.full_name ||
            (session.user.email ? session.user.email.split('@')[0] : 'Usuario'),
          rol: 'cliente'
        }

        // NAVEGACIÓN FLUIDA: Actualizar estado inmediatamente
        setUsuario(usuarioBasico)
        setCargando(false)
        setSesionInicializada(true)
        authInitialized.current = true

        // Cargar datos completos en segundo plano sin bloquear la UI
        try {
          const datosUsuario = await obtenerDatosUsuario(session.user.id)
          if (datosUsuario) {
            setUsuario(prevUsuario => ({
              ...datosUsuario,
              email: session.user.email,
              nombre: datosUsuario.nombre || prevUsuario.nombre,
              rol: datosUsuario.rol || prevUsuario.rol
            }))
            // Vincular sesión de chat con el usuario autenticado (fire-and-forget)
            try {
              const chatId = localStorage.getItem('vda_chat_session_id')
              if (chatId) {
                clienteSupabase.from('leadschat')
                  .update({ usuario_id: session.user.id, updated_at: new Date().toISOString() })
                  .eq('chat_id', chatId)
                  .is('usuario_id', null)
                  .then(() => {})
              }
            } catch { /* ignore */ }
          }
        } catch { /* mantener usuario básico */ }
      } catch {
        setUsuario(null)
        setCargando(false)
        setSesionInicializada(true)
        authInitialized.current = true
      }
    } else {
      // No hay sesión
      setUsuario(null)
      setCargando(false)
      setSesionInicializada(true)
      authInitialized.current = true
    }
  }, [obtenerDatosUsuario])

  // Inicializar autenticación una sola vez
  useEffect(() => {
    // CACHE: Evitar re-inicialización si ya está inicializado
    if (authInitialized.current) return
    let unsubscribe

    const init = async () => {
      try {
        // Obtener sesión inicial
        const { data: { session } } = await clienteSupabase.auth.getSession()
        await manejarCambioAuth('INITIAL_SESSION', session)

        // Suscribirse a cambios de autenticación
        const { data: { subscription } } = clienteSupabase.auth.onAuthStateChange(manejarCambioAuth)
        unsubscribe = () => subscription.unsubscribe()
      } catch {
        setCargando(false)
        setSesionInicializada(true)
        authInitialized.current = true
      }
    }

    init()

    // Cleanup
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [manejarCambioAuth])

  // Función de login optimizada
  const iniciarSesion = useCallback(async (email, password) => {
    try {
      setCargando(true)
      const { data, error } = await clienteSupabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) { setCargando(false); return { error: error.message } }
      return { data }
    } catch {
      setCargando(false)
      return { error: 'Error inesperado al iniciar sesión' }
    }
  }, [])

  // Función de registro optimizada
  const registrarse = useCallback(async (email, password, nombre) => {
    try {
      setCargando(true)
      const { data, error } = await clienteSupabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre: nombre
          }
        }
      })

      if (error) { setCargando(false); return { error: error.message } }
      return { data }
    } catch {
      setCargando(false)
      return { error: 'Error inesperado al registrarse' }
    }
  }, [])

  // Función de cierre de sesión optimizada
  const cerrarSesion = useCallback(async () => {
    try {
      setCargando(true)
      const { error } = await clienteSupabase.auth.signOut()
      if (error) { setCargando(false); return { error: error.message } }
      authInitialized.current = false
      lastAuthState.current = null
      return { success: true }
    } catch {
      setCargando(false)
      return { error: 'Error inesperado al cerrar sesión' }
    }
  }, [])

  // Funciones de utilidad optimizadas
  const esAdmin = useCallback(() => usuario?.rol === 'admin', [usuario?.rol])
  const esCliente = useCallback(() => usuario?.rol === 'cliente', [usuario?.rol])
  const estaAutenticado = useCallback(() => !!usuario && sesionInicializada, [usuario, sesionInicializada])

  // Función para obtener la ruta de redirección después del login
  const obtenerRutaRedireccion = useCallback((usuarioOpcional) => {
    const userToCheck = usuarioOpcional || usuario
    if (!userToCheck) return '/'

    // Si es admin, redirigir al dashboard de admin
    if (userToCheck.rol === 'admin') {
      return '/admin'
    }

    // Si es cliente, redirigir al perfil o página principal
    return '/perfil'
  }, [usuario])

  // Memoizar el valor del contexto para evitar re-renders innecesarios
  const valorContexto = useMemo(() => ({
    usuario,
    cargando,
    sesionInicializada,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    esAdmin,
    esCliente,
    estaAutenticado,
    obtenerRutaRedireccion
  }), [
    usuario,
    cargando,
    sesionInicializada,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    esAdmin,
    esCliente,
    estaAutenticado,
    obtenerRutaRedireccion
  ])

  return (
    <ContextoAutenticacion.Provider value={valorContexto}>
      {children}
    </ContextoAutenticacion.Provider>
  )
}

export const useAuth = () => {
  const contexto = useContext(ContextoAutenticacion)
  if (contexto === undefined) {
    throw new Error('useAuth debe ser usado dentro de un ProveedorAutenticacion')
  }
  return contexto
}

export default ContextoAutenticacion