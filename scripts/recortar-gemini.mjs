// CLI: node scripts/recortar-gemini.mjs "<foto entrada>" "<salida.webp>" [ancho=1400] [descripcion]
// Recorta un producto de una foto real (JPG/PNG/HEIC) y lo deja como WebP transparente y optimizado.
// Lógica en scripts/lib/recortar.mjs. Env opcional: GEMINI_IMG_MODEL, GEMINI_IMG_SIZE, GEMINI_INTENTOS.
import { recortar } from './lib/recortar.mjs'

const [entrada, salida, ancho, descripcion] = process.argv.slice(2)
if (!entrada || !salida) { console.error('Uso: node scripts/recortar-gemini.mjs entrada salida [ancho] [descripcion]'); process.exit(1) }
const r = await recortar({ entrada, salida, ancho: Number(ancho) || 1400, descripcion: descripcion || 'el acordeón', intentos: Number(process.env.GEMINI_INTENTOS || 3) })
if (!r.limpio) console.warn(`⚠ Marco no quedó limpio (${(r.suciedad * 100).toFixed(1)}%): revisa ${salida} a ojo.`)
console.log(`Listo → ${r.salida}  ${r.ancho}x${r.alto}  ${r.kb} KB`)
