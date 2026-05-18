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
// Fallback = valores PÚBLICOS reales (anon protegida por RLS) → el SEO server
// funciona aunque el host no inyecte NEXT_PUBLIC_* en build/runtime.
const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  'https://dxcpzivxzxvhabdimemb.supabase.co'
const anon =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR4Y3B6aXZ4enh2aGFiZGltZW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY4NDgyMDcsImV4cCI6MjA4MjQyNDIwN30.tevoIAGE363woAt_DnK7R9hhZ-yrn-d8UTFzJfrP0Hc'

export const supabaseServidor = createClient(url, anon, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
})
