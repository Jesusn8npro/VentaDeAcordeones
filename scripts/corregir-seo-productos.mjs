/**
 * Dos arreglos de SEO sobre el catálogo, medidos contra producción el 2026-09-12:
 *
 * 1. 16 productos de audio traían "www.miche.com.co" — el dominio de un proveedor —
 *    dentro de su descripción. Google lo estaba mostrando en el snippet de esas fichas:
 *    la tienda pagaba por posicionar y el texto mandaba a otro sitio.
 *
 * 2. 5 acordeones tenían el meta_title con la marca ya pegada y TRUNCADA
 *    ("… | VentaDeAco…"), y encima la plantilla le añade la suya, así que en Google
 *    salía el nombre de la tienda dos veces y la segunda a medias.
 *
 * Idempotente: se puede correr las veces que haga falta.
 */

import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  fs.readFileSync('.env', 'utf8').split(/\r?\n/)
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
)

const db = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const DOMINIO_AJENO = /(?:https?:\/\/)?(?:www\.)?miche\.com\.co\/?/gi

/** Quita el dominio ajeno de cualquier texto, venga suelto o dentro de un JSON. */
function limpiar(valor) {
  if (valor == null) return { valor, cambiado: false }
  if (typeof valor === 'string') {
    const nuevo = valor.replace(DOMINIO_AJENO, '').replace(/\s{2,}/g, ' ').replace(/\s+([.,;])/g, '$1').trim()
    return { valor: nuevo, cambiado: nuevo !== valor }
  }
  if (Array.isArray(valor)) {
    let cambiado = false
    const nuevo = valor.map((v) => { const r = limpiar(v); cambiado = cambiado || r.cambiado; return r.valor })
    return { valor: nuevo, cambiado }
  }
  if (typeof valor === 'object') {
    let cambiado = false
    const nuevo = {}
    for (const [k, v] of Object.entries(valor)) {
      const r = limpiar(v)
      cambiado = cambiado || r.cambiado
      nuevo[k] = r.valor
    }
    return { valor: nuevo, cambiado }
  }
  return { valor, cambiado: false }
}

async function main() {
  const { data: productos, error } = await db
    .from('productos')
    .select('id, slug, nombre, descripcion, meta_title, meta_description')
    .eq('activo', true)

  if (error) { console.error(error.message); process.exit(1) }

  // ── 1. Fuera el dominio del proveedor ────────────────────────────────────────
  let limpiados = 0
  for (const p of productos) {
    const d = limpiar(p.descripcion)
    const md = limpiar(p.meta_description)
    if (!d.cambiado && !md.cambiado) continue

    const cambios = {}
    if (d.cambiado) cambios.descripcion = d.valor
    if (md.cambiado) cambios.meta_description = md.valor

    const { error: e } = await db.from('productos').update(cambios).eq('id', p.id)
    console.log(e ? `✗ ${p.slug}: ${e.message}` : `🧹 ${p.slug}`)
    if (!e) limpiados++
  }
  console.log(`\nDominio ajeno retirado de ${limpiados} productos.`)

  // ── 2. Títulos con la marca pegada y truncada ────────────────────────────────
  // La plantilla ya añade "| VentaDeAcordeones.com": lo que se guarda aquí debe ser
  // SOLO el nombre del producto.
  // El separador no siempre es "|": hay títulos con guion corto y con raya larga.
  const SUFIJO = /\s*[|\-–—]\s*VentaDeAcorde?o?n?e?s?(?:\.com)?\.{0,3}\s*$/i
  let titulos = 0
  for (const p of productos) {
    const t = String(p.meta_title || '')
    if (!t || !SUFIJO.test(t)) continue
    const limpio = t.replace(SUFIJO, '').trim()
    if (!limpio || limpio === t) continue

    const { error: e } = await db.from('productos').update({ meta_title: limpio }).eq('id', p.id)
    console.log(e ? `✗ ${p.slug}: ${e.message}` : `✂️  ${p.slug}  →  ${limpio}`)
    if (!e) titulos++
  }
  console.log(`\nTítulos corregidos: ${titulos}.`)
}

main()
