/**
 * Compara la resolución de las fotos que sirve la web (Supabase Storage) con la de los
 * recortes que quedaron en `public/images/catalogo` (que no se publican: están en .gitignore).
 *
 * Resultado del 2026-09-12: 173 de 174 fotos del catálogo ya están en 1.200-1.300 px, o
 * sea perfectas. Solo la caja vallenata personalizada estaba a 576 px.
 *
 * OJO con una confusión fácil: lo que se ve en la pestaña de red del navegador (149-341 px)
 * NO es el original, es la copia que Next ya redimensionó para ese hueco. Para saber de
 * verdad el tamaño de origen hay que medir la URL de Supabase, que es lo que hace esto.
 *
 * Este script NO cambia nada: solo informa.
 */
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const DIR_LOCAL = 'public/images/catalogo'
const ANCHO_DESEADO = 700 // lo que de verdad necesita una tarjeta en un móvil 3x

function leerEnv() {
  const txt = fs.readFileSync('.env', 'utf8')
  return Object.fromEntries(
    txt
      .split(/\r?\n/)
      .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
      .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()]),
  )
}

const env = leerEnv()
const URL = env.NEXT_PUBLIC_SUPABASE_URL
const CLAVE = env.SUPABASE_SERVICE_ROLE_KEY
const cabeceras = { apikey: CLAVE, Authorization: `Bearer ${CLAVE}` }

/**
 * Mide una imagen remota. Se descarga entera a propósito: pedir solo los primeros bytes
 * con `Range` devolvía un webp truncado que sharp no sabe leer, y todas las fotos salían
 * como "0 px de ancho". Pesan pocos cientos de KB, así que compensa la exactitud.
 */
async function medirRemota(url) {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const m = await sharp(buf).metadata()
    return { ancho: m.width, alto: m.height, bytes: buf.length }
  } catch {
    return null
  }
}

async function medirLocal(archivo) {
  try {
    const m = await sharp(archivo).metadata()
    return { ancho: m.width, alto: m.height, bytes: fs.statSync(archivo).size }
  } catch {
    return null
  }
}

const main = async () => {
  if (!fs.existsSync(DIR_LOCAL)) {
    console.log(`No existe ${DIR_LOCAL}: no hay recortes locales que comparar.`)
    return
  }

  const productos = await (
    await fetch(
      `${URL}/rest/v1/productos?select=id,slug,nombre,producto_imagenes(imagen_principal,imagen_secundaria_1)&activo=eq.true`,
      { headers: cabeceras },
    )
  ).json()

  const locales = new Set(fs.readdirSync(DIR_LOCAL))
  const mejorables = []
  let sinLocal = 0
  let yaBuenas = 0

  for (const p of productos) {
    const img = p.producto_imagenes?.[0]
    if (!img?.imagen_principal) continue

    // Los recortes se guardaron como <slug>-principal.webp
    const candidatos = [`${p.slug}-principal.webp`, `${p.slug}-principal.jpg`]
    const nombre = candidatos.find((c) => locales.has(c))
    if (!nombre) {
      sinLocal++
      continue
    }

    const [remota, local] = await Promise.all([
      medirRemota(img.imagen_principal),
      medirLocal(path.join(DIR_LOCAL, nombre)),
    ])
    if (!local) continue

    const anchoRemoto = remota?.ancho ?? 0
    // Merece la pena si la local es bastante más grande y llega al ancho que necesitamos.
    if (local.ancho >= ANCHO_DESEADO && local.ancho > anchoRemoto * 1.4) {
      mejorables.push({
        slug: p.slug,
        nombre: p.nombre.slice(0, 44),
        remoto: anchoRemoto,
        local: local.ancho,
        kb: Math.round(local.bytes / 1024),
        archivo: nombre,
      })
    } else {
      yaBuenas++
    }
  }

  mejorables.sort((a, b) => b.local - a.local)

  console.log(`\nProductos activos con foto: ${productos.length}`)
  console.log(`Sin recorte local guardado:  ${sinLocal}`)
  console.log(`Ya están bien:               ${yaBuenas}`)
  console.log(`SE PUEDEN MEJORAR:           ${mejorables.length}\n`)

  if (mejorables.length) {
    console.log('  actual → local    peso   producto')
    for (const m of mejorables.slice(0, 25)) {
      console.log(`  ${String(m.remoto).padStart(4)}px → ${String(m.local).padStart(4)}px  ${String(m.kb).padStart(4)}KB  ${m.nombre}`)
    }
    if (mejorables.length > 25) console.log(`  … y ${mejorables.length - 25} más`)
    fs.writeFileSync('.tmp-imagenes-mejorables.json', JSON.stringify(mejorables, null, 1))
    console.log('\nLista completa en .tmp-imagenes-mejorables.json')
  }
}

main().catch((e) => {
  console.error('Error:', e.message)
  process.exit(1)
})
