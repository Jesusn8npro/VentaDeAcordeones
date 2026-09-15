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
  // El de Juan Carlos salió fotografiado dos veces: una copia acabó suelta en la carpeta "xx".
  // Se queda la ficha que menciona la parrilla grabada, que es lo que lo distingue.
  { queda: 'Acordeón Hohner Corona III Rojo con Fuelle Naranja y Parrilla Grabada',
    sobra: 'Acordeón Hohner Corona III Rojo con Fuelle Naranja' },
]

// Nombres que no describían lo que se ve en la foto. Salieron de clasificar a ojo las fotos
// sueltas de "xx"; un nombre que miente confunde más que uno genérico.
const RENOMBRAR = [
  { de: 'Acordeón Hohner Corona III Negro con Fuelle Tricolor',
    a:  'Acordeón Hohner Corona III Rojo Vinotinto con Fuelle Tricolor' },   // no es negro, es rojo
  { de: 'Acordeón Hohner Corona III Azul con Fuelle Blanco',
    a:  'Acordeón Hohner Corona III Azul Nácar con Fuelle Dorado' },         // el fuelle es dorado
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
let renombrados = 0
for (const r of RENOMBRAR) {
  const { data } = await sb.from('productos').select('id').eq('nombre', r.de).maybeSingle()
  if (!data) { console.log(`  ya renombrado (o no existe): ${r.de.slice(0, 52)}`); continue }
  console.log(`  RENOMBRAR: ${r.de.replace('Acordeón Hohner Corona III ', '')}`)
  console.log(`         -> ${r.a.replace('Acordeón Hohner Corona III ', '')}`)
  if (REVISAR) continue
  const { error } = await sb.from('productos').update({ nombre: r.a }).eq('id', data.id)
  if (error) console.log(`    ERROR: ${error.message}`)
  else renombrados++
}

console.log(REVISAR
  ? '(--revisar: no se tocó nada)'
  : `fusiones: ${hechas}   renombrados: ${renombrados}`)
