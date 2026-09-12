import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente Supabase con SERVICE ROLE — solo route handlers (nunca se importa desde
 * componentes cliente: la clave no lleva prefijo NEXT_PUBLIC_ y no existe en el bundle).
 *
 * Se usa para lo que el navegador NO debe poder hacer por sí mismo: crear pedidos con
 * precios recalculados desde la BD, marcar un pedido como pagado tras validar la firma
 * de ePayco y descontar stock. Antes todo eso lo hacía el cliente con la anon key, así
 * que cualquiera podía inventarse el total o marcar su pedido como pagado.
 */
let cache: SupabaseClient | null = null

export function obtenerSupabaseAdmin(): SupabaseClient | null {
  if (cache) return cache
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const clave = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !clave) return null
  cache = createClient(url, clave, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  })
  return cache
}
