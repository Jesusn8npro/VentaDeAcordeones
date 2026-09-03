// Script de migración: sube imágenes a Supabase Storage + crea productos en DB
// Ejecutar con: node scripts/migrar-productos.mjs

import { createClient } from '@supabase/supabase-js'
import { leerEnv } from './lib/recortar.mjs'

// Claves desde .env (nunca hardcodeadas en el repo)
const env = leerEnv()
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = 'imagenes_tienda'

const client = createClient(SUPABASE_URL, SERVICE_KEY)

// ── Categorías ──────────────────────────────────────────────────────────────
const CATS = {
  personalizados: '87766c21-0900-47c7-a6c9-2f3886bba885', // Acordeones Hohner Personalizados
  premium:        '715b01f7-9c13-478d-983e-ecb46f1c93e5', // Acordeones Hohner Premium
  rey_vallenato:  '5493470f-8c89-49f0-8531-f64d125a8f6d', // Acordeones Rey Vallenato
  accesorios:     '9e688ecc-0d03-4130-8d1f-60d31c818255', // Accesorios de Acordeón
}

function categoriaParaProducto(nombre, slug) {
  const n = nombre.toLowerCase()
  if (n.includes('rey') || n.includes('vallenato')) return CATS.rey_vallenato
  if (n.includes('personaliz') || n.includes('xtreme') || n.includes('lujo') ||
      n.includes('tricolor') || n.includes('dorado') || n.includes('premium') ||
      n.includes('dos colores')) return CATS.personalizados
  if (n.includes('corona') || n.includes('hohner') && !n.includes('accesorio')) return CATS.premium
  return CATS.accesorios
}

function parsePrecio(precioStr) {
  if (!precioStr) return null
  const num = parseInt(precioStr.replace(/[^0-9]/g, ''), 10)
  return isNaN(num) ? null : num
}

// ── Subir imagen ────────────────────────────────────────────────────────────
async function subirImagen(localPath, storagePath) {
  const fullPath = path.join(ROOT, 'public', localPath)
  if (!fs.existsSync(fullPath)) {
    console.log(`  ⚠️  Archivo no encontrado: ${fullPath}`)
    return null
  }
  const buffer = fs.readFileSync(fullPath)
  const ext = path.extname(fullPath).slice(1).toLowerCase()
  const mime = ext === 'png' ? 'image/png' : 'image/jpeg'

  const { error } = await client.storage
    .from(BUCKET)
    .upload(storagePath, buffer, { contentType: mime, upsert: true })

  if (error) {
    console.log(`  ❌ Error subiendo ${storagePath}: ${error.message}`)
    return null
  }

  const { data } = client.storage.from(BUCKET).getPublicUrl(storagePath)
  return data.publicUrl
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const productos = JSON.parse(
    fs.readFileSync(path.join(ROOT, 'public/migradas/datos/productos.json'), 'utf8')
  )

  console.log(`\n🚀 Iniciando migración de ${productos.length} productos...\n`)

  let exitosos = 0
  let fallidos = 0

  for (const prod of productos) {
    const slug = prod.slug_sugerido
    console.log(`\n📦 ${prod.nombre} (${slug})`)

    // Verificar si ya existe
    const { data: existe } = await client
      .from('productos')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existe) {
      console.log(`  ⏭️  Ya existe — actualizando imágenes...`)
    }

    // ── Subir imágenes ──────────────────────────────────────────────────────
    const urlsSubidas = []
    for (let i = 0; i < prod.imagenes_locales.length; i++) {
      const localImg = prod.imagenes_locales[i]
      const nombreImg = i === 0 ? 'principal.jpg' : `secundaria-${i}.jpg`
      const storagePath = `productos/${slug}/${nombreImg}`
      console.log(`  📸 Subiendo ${nombreImg}...`)
      const url = await subirImagen(localImg, storagePath)
      if (url) {
        console.log(`  ✅ ${url.slice(-50)}`)
        urlsSubidas.push(url)
      }
    }

    const precio = parsePrecio(prod.precio)
    const precioOriginal = parsePrecio(prod.precio_original)
    const descuento = (precio && precioOriginal && precioOriginal > precio)
      ? Math.round((1 - precio / precioOriginal) * 100)
      : null

    const datosProducto = {
      nombre: prod.nombre,
      slug,
      descripcion: { titulo: prod.nombre, contenido: prod.descripcion || '' },
      precio: precio ?? 0,
      precio_original: precioOriginal,
      descuento,
      marca: prod.marca || 'HOHNER',
      modelo: prod.modelo || null,
      categoria_id: categoriaParaProducto(prod.nombre, slug),
      estado: 'nuevo',
      activo: true,
      destacado: precio !== null,
      stock: 10,
      stock_minimo: 1,
      landing_tipo: 'temu',
      meta_title: prod.nombre + ' — VentaDeAcordeones.com',
      meta_description: prod.descripcion ? prod.descripcion.slice(0, 155) : null,
      garantia_meses: 12,
      numero_de_ventas: 0,
      calificacion_promedio: 0,
      total_resenas: 0,
    }

    let productoId = existe?.id

    if (existe) {
      await client.from('productos')
        .update({ precio, precio_original: precioOriginal, descuento })
        .eq('id', existe.id)
    } else {
      const { data: nuevo, error: errInsert } = await client
        .from('productos')
        .insert([datosProducto])
        .select('id')
        .single()

      if (errInsert) {
        console.log(`  ❌ Error creando producto: ${errInsert.message}`)
        fallidos++
        continue
      }
      productoId = nuevo.id
      console.log(`  ✅ Producto creado: ${productoId}`)
    }

    // ── Crear/actualizar producto_imagenes ──────────────────────────────────
    if (productoId && urlsSubidas.length > 0) {
      const imgRecord = {
        producto_id: productoId,
        imagen_principal: urlsSubidas[0] || null,
        imagen_secundaria_1: urlsSubidas[1] || null,
        imagen_secundaria_2: urlsSubidas[2] || null,
        imagen_secundaria_3: urlsSubidas[3] || null,
        imagen_secundaria_4: urlsSubidas[4] || null,
        estado: 'completado',
        total_imagenes_generadas: urlsSubidas.length,
      }

      const { data: imgExiste } = await client
        .from('producto_imagenes')
        .select('id')
        .eq('producto_id', productoId)
        .single()

      if (imgExiste) {
        await client.from('producto_imagenes').update(imgRecord).eq('producto_id', productoId)
      } else {
        await client.from('producto_imagenes').insert([imgRecord])
      }
      console.log(`  🖼️  Imágenes registradas en producto_imagenes`)
    }

    exitosos++
  }

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`✅ Exitosos: ${exitosos}`)
  console.log(`❌ Fallidos: ${fallidos}`)
  console.log(`Total: ${productos.length}`)
  console.log(`\n🎉 Migración completada!`)
}

main().catch(err => {
  console.error('Error fatal:', err)
  process.exit(1)
})
