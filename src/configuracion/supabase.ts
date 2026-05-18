
import { createClient } from '@supabase/supabase-js'
import { manejarError, getSecurityHeaders } from './seguridad/utilidades'

// Fallback = valores PÚBLICOS reales (no un placeholder inerte). La anon key es
// pública por diseño (protegida por RLS; viaja al navegador igual). Esto hace
// que la tienda funcione aunque el host (EasyPanel/Nixpacks) no inyecte las
// NEXT_PUBLIC_* en el build. Si SÍ hay env, esa tiene precedencia.
const SUPABASE_URL_PUBLICO = 'https://dxcpzivxzxvhabdimemb.supabase.co'
const SUPABASE_ANON_PUBLICO =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Y3B6aXZ4enh2aGFiZGltZW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDgyMDcsImV4cCI6MjA4MjQyNDIwN30.tevoIAGE363woAt_DnK7R9hhZ-yrn-d8UTFzJfrP0Hc'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || SUPABASE_URL_PUBLICO
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || SUPABASE_ANON_PUBLICO

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('[supabase] NEXT_PUBLIC_SUPABASE_* no inyectadas en build — usando valores públicos por defecto')
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
