import { createClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase SOLO servidor — exclusivo para generateMetadata / SSR de SEO
 * (lecturas públicas: productos, categorías). NO toca window/localStorage, sin
 * auth ni persistencia de sesión: seguro en server components.
 *
 * No reemplaza al cliente de la app (src/configuracion/supabase.ts), que sigue
 * siendo client-side. Esto es ADITIVO para poder hacer fetch server-side de
 * título/descr/canonical/OG reales por producto sin romper SSR.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key'

export const supabaseServidor = createClient(url, anon, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
