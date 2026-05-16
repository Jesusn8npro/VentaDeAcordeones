
import { createClient } from '@supabase/supabase-js'
import { manejarError } from './seguridad/index.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validación de variables de entorno críticas
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltan variables de entorno críticas de Supabase')
}

// Configuración mejorada con seguridad
export const clienteSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configuración segura de autenticación
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    
    // Usar localStorage estándar con validación
    storage: window.localStorage,
    
    // Flujo PKCE más seguro para producción
    flowType: 'pkce',
    
    // Deshabilitar debug en producción
    debug: import.meta.env.DEV && import.meta.env.VITE_DEBUG === 'true'
  },
  global: {
    headers: {
      'X-Client-Info': 'VentaDeAcordeones/1.0.0'
    }
  },
  // Configuración de reintentos y timeouts
  db: {
    schema: 'public'
  }
})

// Función auxiliar para obtener session ID de forma segura
export const obtenerSessionId = () => {
  try {
    let sessionId = sessionStorage.getItem('vda-session-id')
    if (!sessionId) {
      sessionId = crypto.randomUUID()
      sessionStorage.setItem('vda-session-id', sessionId)
    }
    return sessionId
  } catch (error) {
    // En producción no mostrar errores en consola
    if (import.meta.env.DEV) {
    }
    return crypto.randomUUID()
  }
}

// Cliente con session ID para operaciones específicas (carrito, etc.)
export const obtenerClienteConSesion = () => {
  const sessionId = obtenerSessionId()
  
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.sessionStorage, // Cambiado a sessionStorage
      flowType: 'pkce' // Más seguro que implicit
    },
    global: {
      headers: {
        'x-session-id': sessionId,
        ...getSecurityHeaders()
      }
    }
  })
}

// Log de inicialización (solo en desarrollo)
if (import.meta.env.DEV) {
}
