// NOTA: este script corre desde C:/PROGRAMACION/herramientas-rembg (tiene su propio node_modules con
// @imgly/background-removal-node + sharp 0.35, que no se puede instalar en este proyecto sin romper sharp 0.34).
// Copia de referencia. Uso: cd C:/PROGRAMACION/herramientas-rembg && node recortar-catalogo.mjs [--subir]
// Recorta el fondo de TODAS las imágenes de producto con un modelo de segmentación local
// (@imgly/background-removal-node, sin IA generativa: la foto no se altera, sólo se quita el fondo).
// Fuente preferida: la foto ORIGINAL (public/migradas, foto de W:\ o la URL original re-hospedada).
//   node recortar-catalogo.mjs            → fase 1: genera <proyecto>/public/images/catalogo/<slug>-N.webp + manifiesto
//   node recortar-catalogo.mjs --subir    → fase 2: sube a Storage (productos/<slug>/principal-r3.webp…) y actualiza producto_imagenes
//   --solo=slug1,slug2  --forzar (regenera aunque exista)
import { removeBackground } from '@imgly/background-removal-node'
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import { createClient } from '@supabase/supabase-js'

const P = 'C:/PROGRAMACION/VentaDeAcordeones.Com WEB/'
const W = 'W:/1. Venta de acordeones/1. Todos los videos y material/'
const OUT = P + 'public/images/catalogo'
const MANIFIESTO = P + '.tmp-analisis/catalogo-recortes.json'
const args = process.argv.slice(2)
const SUBIR = args.includes('--subir')
const FORZAR = args.includes('--forzar')
const solo = (args.find((a) => a.startsWith('--solo='))?.split('=')[1] || '').split(',').filter(Boolean)

const env = Object.fromEntries(fs.readFileSync(P + '.env', 'utf8').split(/\r?\n/).filter((l) => l.includes('=') && !l.startsWith('#')).map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] }))
const supa = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const UA = { 'user-agent': 'Mozilla/5.0 (VentaDeAcordeones recortes)' }

fs.mkdirSync(OUT, { recursive: true })
const manifiesto = fs.existsSync(MANIFIESTO) ? JSON.parse(fs.readFileSync(MANIFIESTO, 'utf8')) : {}
const guardar = () => fs.writeFileSync(MANIFIESTO, JSON.stringify(manifiesto, null, 2))
const leerJson = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {})
const logGemini = leerJson(P + '.tmp-analisis/productos-recortes.json')
const logPers = leerJson(P + '.tmp-analisis/publicar-personalizados.json')
const logCajas = leerJson(P + '.tmp-analisis/publicar-cajas.json')

// ── Fuentes originales por slug: [{ fuente: ruta|url, nombre: 'principal'|'secundaria-1'… }]
function fuentesDe(p) {
  const img = p.producto_imagenes?.[0] || {}
  const out = []
  const localMig = (n) => P + `public/migradas/productos/${p.slug}/${n}.jpg`
  // 1) personalizados publicados desde fotos de clientes (W:)
  const lp = logPers[p.slug]
  if (lp?.fuentes?.length) { lp.fuentes.forEach((f, i) => out.push({ fuente: W + f.replace(/\\/g, '/'), nombre: i === 0 ? 'principal' : `secundaria-${i}` })); return out }
  if (lp?.origen) { out.push({ fuente: lp.origen, nombre: 'principal' }); if (img.imagen_secundaria_1) out.push({ fuente: img.imagen_secundaria_1, nombre: 'secundaria-1' }); return out }
  // 2) cajas Sandro / estuche: origen en logCajas.recortes
  const rc = Object.entries(logCajas.recortes || {}).filter(([k]) => k.includes(`/${p.slug}-`)).sort()
  if (rc.length) { rc.forEach(([, v], i) => out.push({ fuente: v.origen, nombre: i === 0 ? 'principal' : `secundaria-${i}` })); if (p.slug === 'estuche-para-caja-vallenata' && img.imagen_principal) out.unshift({ fuente: img.imagen_principal, nombre: 'principal', yaRecortado: true }); return dedupe(out) }
  // 3) recortes Gemini con original conocido
  const lg = logGemini[p.slug]
  if (lg?.origen || lg?.anterior) {
    const o = lg.origen && !lg.origen.startsWith('http') ? (path.isAbsolute(lg.origen) ? lg.origen : P + lg.origen.replace(/\\/g, '/')) : (lg.origen || lg.anterior)
    out.push({ fuente: o, nombre: 'principal' })
  } else if (img.imagen_principal) out.push({ fuente: img.imagen_principal, nombre: 'principal' })
  // secundarias: local migradas si existe, si no la URL actual
  for (const [k, n] of [['imagen_secundaria_1', 'secundaria-1'], ['imagen_secundaria_2', 'secundaria-2'], ['imagen_secundaria_3', 'secundaria-3']]) {
    if (!img[k]) continue
    out.push({ fuente: fs.existsSync(localMig(n)) ? localMig(n) : img[k], nombre: n })
  }
  return dedupe(out)
}
const dedupe = (arr) => { const v = new Set(); return arr.filter((x) => (v.has(x.nombre) ? false : (v.add(x.nombre), true))) }

async function leerFuente(f) {
  if (/^https?:/.test(f)) { const r = await fetch(f, { headers: UA }); if (!r.ok) throw new Error(`HTTP ${r.status} ${f.slice(0, 80)}`); return Buffer.from(await r.arrayBuffer()) }
  if (/\.hei[cf]$/i.test(f)) { const { execFileSync } = await import('node:child_process'); return execFileSync('python', ['-c', 'import sys; from PIL import Image, ImageOps; import pillow_heif; pillow_heif.register_heif_opener(); im = ImageOps.exif_transpose(Image.open(sys.argv[1])).convert("RGB"); im.thumbnail((2400, 2400)); im.save(sys.stdout.buffer, format="JPEG", quality=92)', f], { maxBuffer: 64 * 1024 * 1024 }) }
  return fs.readFileSync(f)
}

// Alpha: quita fantasmas semitransparentes (texto de collages) y conserva sólo los componentes grandes.
async function limpiarAlpha(png) {
  const { data, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: Wd, height: H } = info
  const a = new Uint8Array(Wd * H)
  for (let i = 0; i < Wd * H; i++) { let al = data[i * 4 + 3]; if (al < 96) al = 0; else if (al < 200) al = Math.round(((al - 96) / 104) * 255); a[i] = al }
  // componentes conexos sobre alpha>0 (4-vecinos), conservar los que superen el 1.5% del mayor
  const etiqueta = new Int32Array(Wd * H).fill(-1); const tam = []; const pila = []
  for (let s = 0; s < Wd * H; s++) {
    if (a[s] === 0 || etiqueta[s] !== -1) continue
    const id = tam.length; let n = 0; pila.push(s); etiqueta[s] = id
    while (pila.length) { const c = pila.pop(); n++; const x = c % Wd, y = (c / Wd) | 0
      for (const d of [c - 1, c + 1, c - Wd, c + Wd]) { if (d < 0 || d >= Wd * H) continue; if ((d === c - 1 && x === 0) || (d === c + 1 && x === Wd - 1)) continue; if (a[d] !== 0 && etiqueta[d] === -1) { etiqueta[d] = id; pila.push(d) } } }
    tam.push(n)
  }
  const mayor = Math.max(...tam, 1)
  for (let i = 0; i < Wd * H; i++) { const id = etiqueta[i]; data[i * 4 + 3] = id >= 0 && tam[id] >= mayor * 0.015 ? a[i] : 0 }
  return sharp(data, { raw: { width: Wd, height: H, channels: 4 } }).png().toBuffer()
}

async function recortar(buf, yaRecortado = false) {
  const base = await sharp(buf).rotate().resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).png().toBuffer()
  let png = base
  if (!yaRecortado) {
    const out = await removeBackground(new Blob([base], { type: 'image/png' }), { model: 'medium', output: { format: 'image/png', quality: 1 } })
    png = await limpiarAlpha(Buffer.from(await out.arrayBuffer()))
  }
  // recorte al contenido + margen 4% para que el "contain" de las tarjetas respire igual en todas
  const trimmed = await sharp(png).trim({ threshold: 8 }).toBuffer()
  const m = await sharp(trimmed).metadata()
  const lado = Math.max(m.width, m.height); const pad = Math.round(lado * 0.04)
  return sharp(trimmed).extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82, alphaQuality: 88, effort: 5 }).toBuffer()
}

const { data: productos, error } = await supa.from('productos').select('id, slug, nombre, activo, producto_imagenes(id, imagen_principal, imagen_secundaria_1, imagen_secundaria_2, imagen_secundaria_3)').eq('activo', true).order('nombre')
if (error) throw error

let ok = 0, fallos = 0
for (const p of productos) {
  if (solo.length && !solo.includes(p.slug)) continue
  const img = p.producto_imagenes?.[0]
  if (!img?.imagen_principal) continue
  const fuentes = fuentesDe(p)
  if (!fuentes.length) continue
  manifiesto[p.slug] = manifiesto[p.slug] || { nombre: p.nombre, imagenes: {} }
  const m = manifiesto[p.slug]
  if (!SUBIR) {
    for (const f of fuentes) {
      const salida = `${OUT}/${p.slug}-${f.nombre}.webp`
      if (fs.existsSync(salida) && m.imagenes[f.nombre] && !FORZAR) continue
      const t0 = Date.now()
      try {
        const buf = await leerFuente(f.fuente)
        const webp = await recortar(buf, f.yaRecortado)
        fs.writeFileSync(salida, webp)
        const meta = await sharp(webp).metadata()
        m.imagenes[f.nombre] = { local: salida.replace(P, ''), fuente: f.fuente, ancho: meta.width, alto: meta.height, kb: Math.round(webp.length / 1024) }
        console.log(`✓ ${p.slug} ${f.nombre} ${meta.width}x${meta.height} ${Math.round(webp.length / 1024)}KB (${((Date.now() - t0) / 1000).toFixed(1)}s)`)
        ok++
      } catch (e) { fallos++; m.imagenes[f.nombre] = { error: e.message, fuente: f.fuente }; console.log(`✗ ${p.slug} ${f.nombre}: ${e.message.slice(0, 120)}`) }
      guardar()
    }
  } else {
    // Fase 2: subir sólo lo aprobado (existe local y sin error) y actualizar producto_imagenes
    const actual = {}
    for (const [nombre, v] of Object.entries(m.imagenes)) {
      if (v.error || !v.local) continue
      if (m.excluir?.includes(nombre)) continue
      const buf = fs.readFileSync(P + v.local)
      const ruta = `productos/${p.slug}/${nombre}-r3.webp`
      const { error: e1 } = await supa.storage.from('imagenes_tienda').upload(ruta, buf, { contentType: 'image/webp', upsert: true })
      if (e1) { console.log(`✗ subir ${p.slug}/${nombre}: ${e1.message}`); fallos++; continue }
      actual[nombre === 'principal' ? 'imagen_principal' : `imagen_${nombre.replace('-', '_')}`] = supa.storage.from('imagenes_tienda').getPublicUrl(ruta).data.publicUrl
    }
    if (!Object.keys(actual).length) continue
    // Si no hay secundaria válida, se limpia para que el hover no muestre la foto vieja con fondo
    if (!actual.imagen_secundaria_1 && img.imagen_secundaria_1 && !/-r3\.webp/.test(img.imagen_secundaria_1)) actual.imagen_secundaria_1 = null
    const { error: e2 } = await supa.from('producto_imagenes').update(actual).eq('id', img.id)
    if (e2) { console.log(`✗ DB ${p.slug}: ${e2.message}`); fallos++; continue }
    m.subido = actual; guardar(); ok++
    console.log(`↑ ${p.slug}: ${Object.keys(actual).join(', ')}`)
  }
}
console.log(`\nFIN ${SUBIR ? 'subida' : 'recortes'}: ${ok} ok, ${fallos} fallos. Manifiesto: ${MANIFIESTO}`)
