// Recorte de producto con Gemini + chroma-key (sharp). Reutilizable desde CLI y desde los batch.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import sharp from 'sharp'

export function leerEnv() {
  const ruta = new URL('../../.env', import.meta.url)
  return Object.fromEntries(
    fs.readFileSync(ruta, 'utf8').split(/\r?\n/)
      .filter((l) => l && !l.startsWith('#') && l.includes('='))
      .map((l) => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, '')] })
  )
}

const RAW_DIR = '.tmp-analisis/gemini-raw'

/** HEIC → JPEG (buffer). libvips de sharp no trae HEVC y ffmpeg sólo saca un tile de la rejilla HEIF,
 *  así que se usa Python + pillow-heif (instalado en la máquina). Respeta la orientación EXIF. */
export function heicAJpeg(ruta) {
  const py = [
    'import sys; from PIL import Image, ImageOps; import pillow_heif; pillow_heif.register_heif_opener()',
    'im = ImageOps.exif_transpose(Image.open(sys.argv[1])).convert("RGB"); im.thumbnail((2400, 2400))',
    'im.save(sys.stdout.buffer, format="JPEG", quality=92)',
  ].join('; ')
  return execFileSync('python', ['-c', py, ruta], { maxBuffer: 64 * 1024 * 1024 })
}

function prompt(descripcion, reintento) {
  return (
    `Aísla únicamente ${descripcion} de esta foto. ELIMINA por completo todo lo demás: textos, títulos, etiquetas, botones de "comprar", pedestales, bases, mesas, piso, sombras, reflejos, marcas de agua, personas y fondo. ` +
    `Recorta con precisión el producto completo (incluye correas o fuelle si son parte del producto) y colócalo centrado FLOTANDO sobre un fondo COMPLETAMENTE plano de color magenta puro #FF00FF. ` +
    `Cada píxel que no sea el producto debe ser exactamente #FF00FF: cero sombras, cero degradados, cero halos, cero superficie debajo. ` +
    `Mantén el producto EXACTAMENTE igual (colores, materiales, nácar, herrajes, proporciones), sólo mejora nitidez e iluminación tipo estudio. ` +
    `Imagen cuadrada, el producto ocupa ~85% del encuadre.` +
    (reintento ? ` IMPORTANTE: en el intento anterior dejaste sombra, superficie o pedestal debajo del producto; esta vez el fondo magenta debe ser 100% uniforme hasta los bordes.` : '')
  )
}

async function pedirGemini({ key, modelo, tamano, texto, jpeg, mime = 'image/jpeg' }) {
  const cuerpo = {
    contents: [{ parts: [{ text: texto }, { inline_data: { mime_type: mime, data: jpeg.toString('base64') } }] }],
    generationConfig: { responseModalities: ['IMAGE'], imageConfig: { aspectRatio: '1:1', ...(tamano ? { imageSize: tamano } : {}) } },
  }
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${key}`, {
    method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const json = await res.json()
  const parte = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData || p.inline_data)
  if (!parte) throw new Error('Sin imagen en la respuesta: ' + JSON.stringify(json).slice(0, 400))
  return Buffer.from((parte.inlineData || parte.inline_data).data, 'base64')
}

// Chroma-key magenta → alpha con despill. Devuelve raw RGBA + % de suciedad del marco exterior.
async function chromaKey(png) {
  const { data: px, info } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i], g = px[i + 1], b = px[i + 2]
    const d = Math.sqrt((255 - r) ** 2 + g ** 2 + (255 - b) ** 2)
    if (d < 90) { px[i + 3] = 0; continue }
    if (d < 170) px[i + 3] = Math.round(255 * ((d - 90) / 80))
    if (d < 260 && r > g + 40 && b > g + 40) { const m = Math.round(((r + b) / 2) * 0.35 + g * 0.65); px[i] = m; px[i + 2] = m }
  }
  const m = Math.round(Math.min(W, H) * 0.04)
  let total = 0, sucios = 0
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    if (x >= m && x < W - m && y >= m && y < H - m) continue
    total++
    if (px[(y * W + x) * 4 + 3] > 40) sucios++
  }
  return { px, W, H, suciedad: sucios / total }
}

/**
 * @param {object} o
 * @param {string|Buffer} o.entrada  ruta o buffer de la foto original
 * @param {string} o.salida          ruta .webp de salida (fondo transparente)
 * @param {number} [o.ancho=1400]
 * @param {string} [o.descripcion='el acordeón']
 * @param {string} [o.modelo]        gemini-3-pro-image (2K) | gemini-3.1-flash-image
 * @param {number} [o.intentos=3]
 * @param {(msg:string)=>void} [o.log]
 */
export async function recortar({ entrada, salida, ancho = 1400, descripcion = 'el acordeón', modelo, intentos = 3, log = console.log }) {
  const env = leerEnv()
  const key = env.GEMINI_API_KEY
  if (!key) throw new Error('Falta GEMINI_API_KEY en .env')
  modelo = modelo || process.env.GEMINI_IMG_MODEL || 'gemini-3-pro-image'
  const tamano = process.env.GEMINI_IMG_SIZE || (modelo.includes('pro') ? '2K' : undefined)

  // sharp no decodifica HEIC/HEVC (fotos de iPhone): se pasa por ffmpeg a JPG primero (ver heicAJpeg).
  const fuente = (typeof entrada === 'string' && /\.hei[cf]$/i.test(entrada)) ? heicAJpeg(entrada) : entrada
  const jpeg = await sharp(fuente, { failOn: 'none' }).rotate().resize(1600, 1600, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 90 }).toBuffer()
  const mime = 'image/jpeg'
  fs.mkdirSync(path.dirname(salida), { recursive: true })
  fs.mkdirSync(RAW_DIR, { recursive: true })

  let mejor = null
  for (let intento = 1; intento <= intentos; intento++) {
    const t0 = Date.now()
    const png = await pedirGemini({ key, modelo, tamano, texto: prompt(descripcion, intento > 1), jpeg, mime })
    fs.writeFileSync(path.join(RAW_DIR, path.basename(salida).replace(/\.\w+$/, `.${intento}.gemini.png`)), png)
    const r = await chromaKey(png)
    log(`  intento ${intento}: ${((Date.now() - t0) / 1000).toFixed(1)}s · marco sucio ${(r.suciedad * 100).toFixed(1)}%`)
    if (!mejor || r.suciedad < mejor.suciedad) mejor = r
    if (r.suciedad < 0.005) break
  }
  const buf = await sharp(mejor.px, { raw: { width: mejor.W, height: mejor.H, channels: 4 } })
    .trim({ threshold: 10 })
    .resize(ancho, ancho, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90, effort: 5 })
    .toBuffer()
  fs.writeFileSync(salida, buf)
  const meta = await sharp(buf).metadata()
  return { salida, ancho: meta.width, alto: meta.height, kb: Math.round(buf.length / 1024), suciedad: mejor.suciedad, limpio: mejor.suciedad < 0.005 }
}
