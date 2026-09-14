// Quita de la base el relleno de plantilla que traen los productos.
//
//   node scripts/limpiar-relleno-productos.mjs --revisar   → cuenta y enseña, no escribe
//   node scripts/limpiar-relleno-productos.mjs             → limpia
//
// Los campos jsonb que alimentan la ficha larga (banner_animado, testimonios,
// caracteristicas_jsonb…) venían rellenos con el mismo texto de demo en TODOS los productos:
// "+15.847 CLIENTES YA TRANSFORMARON SU VIDA", "70% OFF solo por hoy", "te devolvemos el 100%
// de tu dinero", y características genéricas de dropshipping ("Material premium", "Eficiencia
// energética") que no significan nada en un acordeón. Repetido en 246 fichas, además, hace que
// el catálogo parezca un copia y pega.
//
// Criterio: se borra lo que es demo; lo que un humano haya escrito de verdad se respeta.
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'

const REVISAR = process.argv.includes('--revisar')
const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split(/\r?\n/)
  .filter((l) => l.includes('=') && !l.startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Huellas del texto de demo. Si el campo las contiene, es relleno.
const HUELLAS = [
  '15.847', '15847', 'TRANSFORMARON SU VIDA', '70% OFF', 'REGALO SORPRESA', '24/7',
  'devolvemos el 100', '50.000 clientes', 'Material premium', 'Eficiencia energética',
  'Diseño inteligente', 'miles de personas eligen', 'QUIERO APROVECHAR ESTA OFERTA',
  'Oferta por tiempo limitado', 'unsplash.com', 'GARANTÍA TOTAL',
]
const esRelleno = (v) => {
  if (!v) return false
  const t = JSON.stringify(v)
  return HUELLAS.some((h) => t.includes(h))
}

const CAMPOS = ['banner_animado', 'testimonios', 'caracteristicas_jsonb', 'puntos_dolor', 'cta_final', 'garantias', 'faq', 'ventajas_jsonb', 'beneficios_jsonb']

const { data, error } = await sb.from('productos').select(['id', 'nombre', ...CAMPOS].join(','))
if (error) { console.error(error.message); process.exit(1) }

const cuenta = Object.fromEntries(CAMPOS.map((c) => [c, 0]))
const aLimpiar = []
for (const p of data) {
  const patch = {}
  for (const c of CAMPOS) if (esRelleno(p[c])) { patch[c] = null; cuenta[c]++ }
  if (Object.keys(patch).length) aLimpiar.push({ id: p.id, nombre: p.nombre, patch })
}

console.log(`productos: ${data.length}   con relleno: ${aLimpiar.length}\n`)
console.log('CAMPO'.padEnd(26) + 'A LIMPIAR')
for (const c of CAMPOS) console.log(`  ${c.padEnd(24)} ${cuenta[c]}`)

if (REVISAR) { console.log('\n(--revisar: no se escribió nada)'); process.exit(0) }

let ok = 0
for (const x of aLimpiar) {
  const { error: e } = await sb.from('productos').update(x.patch).eq('id', x.id)
  if (e) console.log(`  ERROR ${x.nombre.slice(0, 40)}: ${e.message}`)
  else ok++
}
console.log(`\nlimpiados: ${ok} de ${aLimpiar.length}`)
