import React, { createContext, useContext, useEffect, useState } from 'react'
import { clienteSupabase, debugSesionSupabase } from '../configuracion/supabase'

const ContextoAutenticacion = createContext({})

export const useAuth = () => {
  const context = useContext(ContextoAutenticacion)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un ProveedorAutenticacion')
  }
  return context
}

export const ProveedorAutenticacion = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)
  const [sesionIniciada, setSesionIniciada] = useState(false)
  const [inicializado, setInicializado] = useState(false)

  useEffect(() => {
    let montado = true

    // Función para inicializar la autenticación (SIMPLIFICADA)
    const inicializarAuth = async () => {
      try {
        if (!montado) return
        
        console.log('🚀 Inicializando autenticación (método simplificado)...')
        
        // Debug completo de la sesión
        await debugSesionSupabase()
        
        // Timeout de seguridad más corto - onAuthStateChange debería manejar todo
        setTimeout(() => {
          if (montado && !inicializado) {
            console.log('⏰ Timeout de inicialización - marcando como inicializado sin usuario')
            setCargando(false)
            setInicializado(true)
            // No hay usuario después del timeout
            setUsuario(null)
            setSesionIniciada(false)
          }
        }, 2000) // 2 segundos de timeout
        
      } catch (error) {
        console.error('💥 Error inicializando auth:', error)
        if (montado) {
          setCargando(false)
          setInicializado(true)
        }
      }
    }

    // Escuchar cambios de autenticación PRIMERO
    const { data: { subscription } } = clienteSupabase.auth.onAuthStateChange(
      async (evento, sesion) => {
        if (!montado) return

        console.log('🔄 Auth state change:', evento, !!sesion?.user, sesion?.user?.email)

        try {
          switch (evento) {
            case 'INITIAL_SESSION':
              console.log('🎯 INITIAL_SESSION detectado')
              if (sesion?.user) {
                console.log('👤 Usuario en INITIAL_SESSION, procesando...')
                await manejarInicioSesion(sesion.user)
              } else {
                console.log('🚫 No hay usuario en INITIAL_SESSION')
                if (montado) {
                  setCargando(false)
                  setInicializado(true)
                }
              }
              break
            
            case 'SIGNED_IN':
              console.log('✅ SIGNED_IN detectado - Usuario logueándose')
              if (sesion?.user) {
                await manejarInicioSesion(sesion.user)
              }
              break
            
            case 'SIGNED_OUT':
              console.log('🚪 SIGNED_OUT detectado')
              manejarCierreSesion()
              break
            
            case 'TOKEN_REFRESHED':
              console.log('🔄 TOKEN_REFRESHED detectado')
              if (sesion?.user) {
                // Solo actualizar datos, no reinicializar
                console.log('🔄 Actualizando datos por token refresh...')
                await actualizarDatosUsuario(sesion.user)
              }
              break
          }
        } catch (error) {
          console.error('💥 Error en auth state change:', error)
          if (montado) {
            setCargando(false)
            setInicializado(true)
          }
        }
      }
    )

    // Llamar inicializarAuth para debug - pero sin interferir con onAuthStateChange
    inicializarAuth()

    return () => {
      montado = false
      subscription?.unsubscribe()
    }
  }, [])

  const obtenerSesionActual = async () => {
    try {
      const { data: { session }, error } = await clienteSupabase.auth.getSession()
      
      if (error) {
        setCargando(false)
        return
      }

      if (session?.user) {
        await manejarInicioSesion(session.user)
      } else {
        setCargando(false)
      }
    } catch (error) {
      setCargando(false)
    }
  }

  const manejarInicioSesion = async (usuarioAuth) => {
    try {
      console.log('🔐 Manejando inicio de sesión para:', usuarioAuth.email)
      
      // PRIMERO: Crear usuario básico desde auth si no existe
      const usuarioBasico = {
        id: usuarioAuth.id,
        email: usuarioAuth.email,
        nombre: usuarioAuth.user_metadata?.nombre || 
                usuarioAuth.user_metadata?.full_name || 
                usuarioAuth.email.split('@')[0],
        rol: usuarioAuth.email === 'shalom@gmail.com' ? 'admin' : 'cliente',
        telefono: usuarioAuth.user_metadata?.telefono || null,
        creado_el: new Date().toISOString(),
        actualizado_el: new Date().toISOString()
      }

      // Intentar obtener o crear usuario
      let usuarioData = null

      // 1. Buscar por ID
      const { data: usuarioPorId, error: errorId } = await clienteSupabase
        .from('usuarios')
        .select('*')
        .eq('id', usuarioAuth.id)
        .single()

      if (!errorId && usuarioPorId) {
        usuarioData = usuarioPorId
        console.log('✅ Usuario encontrado por ID')
      } else {
        console.log('⚠️ Usuario no encontrado por ID, buscando por email...')
        
        // 2. Buscar por email
        const { data: usuarioPorEmail, error: errorEmail } = await clienteSupabase
          .from('usuarios')
          .select('*')
          .eq('email', usuarioAuth.email)
          .single()

        if (!errorEmail && usuarioPorEmail) {
          console.log('✅ Usuario encontrado por email, actualizando ID...')
          // Actualizar ID
          const { data: usuarioActualizado, error: errorActualizar } = await clienteSupabase
            .from('usuarios')
            .update({ id: usuarioAuth.id })
            .eq('email', usuarioAuth.email)
            .select()
            .single()

          usuarioData = errorActualizar ? usuarioPorEmail : usuarioActualizado
        } else {
          console.log('🆕 Creando nuevo usuario...')
          // 3. Crear nuevo usuario
          const { data: usuarioCreado, error: errorCreacion } = await clienteSupabase
            .from('usuarios')
            .insert([usuarioBasico])
            .select()
            .single()

          if (errorCreacion) {
            console.error('❌ Error creando usuario:', errorCreacion)
            // Si falla la creación, usar datos básicos del auth
            usuarioData = usuarioBasico
          } else {
            usuarioData = usuarioCreado
          }
        }
      }

      console.log('✅ Usuario final obtenido:', usuarioData?.email)

      // Actualizar estado SIEMPRE
      setUsuario({
        ...usuarioData,
        email: usuarioAuth.email // Asegurar email actualizado desde auth
      })
      setSesionIniciada(true)
      
    } catch (error) {
      console.error('❌ Error en manejarInicioSesion:', error)
      
      // FALLBACK: Si todo falla, usar datos básicos del auth
      console.log('🔄 Usando fallback con datos de auth...')
      setUsuario({
        id: usuarioAuth.id,
        email: usuarioAuth.email,
        nombre: usuarioAuth.user_metadata?.nombre || 
                usuarioAuth.user_metadata?.full_name || 
                usuarioAuth.email.split('@')[0],
        rol: usuarioAuth.email === 'shalom@gmail.com' ? 'admin' : 'cliente',
        telefono: usuarioAuth.user_metadata?.telefono || null
      })
      setSesionIniciada(true)
    } finally {
      setCargando(false)
      setInicializado(true)
    }
  }

  const actualizarDatosUsuario = async (usuarioAuth) => {
    try {
      console.log('🔄 Actualizando datos de usuario...')
      
      // Si ya tenemos usuario, solo actualizar email si es necesario
      if (usuario && usuario.email === usuarioAuth.email) {
        console.log('✅ Datos de usuario ya están actualizados')
        return
      }

      const { data: usuarioData, error } = await clienteSupabase
        .from('usuarios')
        .select('*')
        .eq('id', usuarioAuth.id)
        .single()

      if (!error && usuarioData) {
        console.log('✅ Datos de usuario actualizados desde BD')
        setUsuario({
          ...usuarioData,
          email: usuarioAuth.email
        })
      } else {
        console.log('⚠️ Error actualizando desde BD, manteniendo datos actuales')
        // Si falla, mantener usuario actual pero actualizar email
        if (usuario) {
          setUsuario({
            ...usuario,
            email: usuarioAuth.email
          })
        }
      }
    } catch (error) {
      console.log('⚠️ Error en actualización, manteniendo datos actuales')
      // Error silencioso - mantener datos actuales
    }
  }

  const manejarCierreSesion = () => {
    setUsuario(null)
    setSesionIniciada(false)
    setCargando(false)
    setInicializado(true)
  }

  const iniciarSesion = async (email, password) => {
    try {
      setCargando(true)
      const { data, error } = await clienteSupabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const registrarse = async (email, password, datosAdicionales = {}) => {
    try {
      setCargando(true)
      const { data, error } = await clienteSupabase.auth.signUp({
        email,
        password,
        options: {
          data: datosAdicionales
        }
      })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const cerrarSesion = async () => {
    try {
      const { error } = await clienteSupabase.auth.signOut()
      if (error) throw error
      
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const esAdmin = () => {
    return usuario?.rol === 'admin'
  }

  const esCliente = () => {
    return usuario?.rol === 'cliente'
  }

  const value = {
    usuario,
    cargando,
    sesionIniciada,
    inicializado,
    iniciarSesion,
    registrarse,
    cerrarSesion,
    esAdmin,
    esCliente
  }

  return (
    <ContextoAutenticacion.Provider value={value}>
      {children}
    </ContextoAutenticacion.Provider>
  )
}

export default ContextoAutenticacion
