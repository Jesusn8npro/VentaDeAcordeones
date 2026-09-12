'use client'

import { useEffect, useState } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'

/**
 * Número de reseñas esperando moderación, para el aviso del menú del admin.
 *
 * POR QUÉ: una reseña nueva no se publica sola (nace `aprobada = false`). Si el
 * menú no lo dice, el dueño no entra a /admin/resenas y las opiniones reales de
 * sus clientes se quedan invisibles para siempre.
 *
 * El conteo se cachea a nivel de módulo porque la barra lateral se vuelve a montar
 * en CADA pantalla del admin: sin esto, cada navegación dispararía otra consulta
 * para pintar el mismo número.
 */
let cache: { valor: number; momento: number } | null = null
const VIGENCIA_MS = 60_000

export function usarResenasPendientes(): number {
  const [pendientes, setPendientes] = useState(3) // TEMPORAL-VERIFICACION

  useEffect(() => {
    let vivo = true

    async function consultar() {
      if (cache && Date.now() - cache.momento < VIGENCIA_MS) {
        if (vivo) setPendientes(cache.valor)
        return
      }
      try {
        const { data } = await clienteSupabase.auth.getSession()
        const token = data?.session?.access_token
        if (!token) return

        const respuesta = await fetch('/api/admin/resenas?estado=pendientes&solo_conteo=1', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        })
        // 401/403 (no es admin) o 503 (tabla/clave ausente): el aviso es decorativo,
        // se queda en cero y el menú se pinta igual.
        if (!respuesta.ok) return

        const datos = await respuesta.json()
        const valor = Number(datos?.conteos?.pendientes) || 0
        cache = { valor, momento: Date.now() }
        if (vivo) setPendientes(valor)
      } catch {
        /* sin red: el menú funciona igual, solo sin número */
      }
    }

    consultar()
    return () => {
      vivo = false
    }
  }, [])

  return pendientes
}
