// Fusiona productos que son el MISMO acordeón publicado dos veces.
//
//   node scripts/fusionar-productos-duplicados.mjs --revisar   → enseña qué haría
//   node scripts/fusionar-productos-duplicados.mjs             → fusiona
//
// Al clasificar las fotos sueltas de la carpeta "xx" se tomó cada una como un acordeón
// distinto, y varias eran tomas del mismo. Resultado: dos fichas con la misma foto, a veces con
// precios distintos, que es lo peor que puede ver un cliente.
//
// Se conserva la ficha que MEJOR describe lo que se ve y se borra la otra; las fotos de la
// descartada que no estén ya en la superviviente pasan a ser secundarias suyas.
import { createClient } from '@supabase/supabase-js'
import fs from 'node:fs'

const REVISAR = process.argv.includes('--revisar')
const env = Object.fromEntries(fs.readFileSync('.env', 'utf8').split(/\r?\n/)
  .filter((l) => l.includes('=') && !l.startsWith('#'))
  .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const sb = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })

// Decidido mirando las fotos una a una. El que se queda es el que describe lo que se ve:
// el blanco lleva botones Y parrilla dorados, no sólo el fuelle; el rojo es "estilo fuego";
// y el armonizado lleva de verdad un fuelle multicolor.
const FUSIONES = [
  { queda: 'Acordeón Hohner Corona III Blanco con Botones y Parrilla Dorados',
    sobra: 'Acordeón Hohner Corona III Blanco con Fuelle Dorado' },
  { queda: 'Acordeón Hohner Corona III Rojo Estilo Fuego',
    sobra: 'Acordeón Hohner Corona III Marrón con Fuelle Dorado' },
  { queda: 'Acordeón Hohner Corona III Blanco con Fuelle Multicolor',
    sobra: 'Acordeón Hohner Corona III Blanco Armonizado' },
]

const SECUNDARIAS = ['imagen_secundaria_1', 'imagen_secundaria_2', 'imagen_secundaria_3', 'imagen_secundaria_4']

let hechas = 0
for (const f of FUSIONES) {
  const { data: A } = await sb.from('productos').select('id,nombre,slug,precio,producto_imagenes(*)').eq('nombre', f.queda).maybeSingle()
  const { data: B } = await sb.from('productos').select('id,nombre,slug,precio,producto_imagenes(*)').eq('nombre', f.sobra).maybeSingle()
  if (!A || !B) { console.log(`  falta alguno:\n    ${f.queda}\n    ${f.sobra}`); continue }

  const imgA = A.producto_imagenes?.[0] || {}
  const imgB = B.producto_imagenes?.[0] || {}
  const yaTiene = new Set([imgA.imagen_principal, ...SECUNDARIAS.map((s) => imgA[s])].filter(Boolean))
  const aAñadir = [imgB.imagen_principal, ...SECUNDARIAS.map((s) => imgB[s])].filter((u) => u && !yaTiene.has(u))

  console.log(`\n  SE QUEDA : ${A.nombre.slice(0, 56)}  ($${A.precio.toLocaleString('es-CO')})`)
  console.log(`  SE BORRA : ${B.nombre.slice(0, 56)}  ($${B.precio.toLocaleString('es-CO')})`)
  console.log(`  fotos que se le suman: ${aAñadir.length}`)
  if (REVISAR) continue

  // Las fotos de la descartada que aporten algo pasan a huecos libres de la superviviente.
  if (aAñadir.length && imgA.id) {
    const patch = {}
    let i = 0
    for (const s of SECUNDARIAS) { if (!imgA[s] && i < aAñadir.length) patch[s] = aAñadir[i++] }
    if (Object.keys(patch).length) await sb.from('producto_imagenes').update(patch).eq('id', imgA.id)
  }
  await sb.from('producto_imagenes').delete().eq('producto_id', B.id)
  const { error } = await sb.from('productos').delete().eq('id', B.id)
  if (error) console.log(`    ERROR al borrar: ${error.message}`)
  else { hechas++; console.log('    fusionado') }
}
console.log(REVISAR ? '\n(--revisar: no se tocó nada)' : `\nfusiones hechas: ${hechas}`)
