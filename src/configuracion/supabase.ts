
import { createClient } from '@supabase/supabase-js'
import { manejarError, getSecurityHeaders } from './seguridad/utilidades'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// Diagnóstico (no romper el build/SSR si faltan envs: fallback inerte)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY — usando cliente inerte (placeholder)')
}

const esDev = process.env.NODE_ENV !== 'production'

// Configuración mejorada con seguridad
export const clienteSupabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configuración segura de autenticación
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,

    // Usar localStorage estándar con validación (guard SSR)
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,

    // Flujo PKCE más seguro para producción
    flowType: 'pkce',

    // Deshabilitar debug en producción
    debug: esDev && process.env.NEXT_PUBLIC_DEBUG === 'true'
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
    if (esDev) {
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
      storage: typeof window !== 'undefined' ? window.sessionStorage : undefined, // Cambiado a sessionStorage
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
if (esDev) {
}
