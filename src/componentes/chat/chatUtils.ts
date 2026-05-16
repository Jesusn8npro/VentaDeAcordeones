export const esUrlImagen = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false
  return [
    /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i,
    /\/image\//i,
    /cloudinary\.com/i,
    /imgur\.com/i,
    /unsplash\.com/i,
    /supabase\.co.*storage/i
  ].some(p => p.test(url))
}

export const extraerUrls = (texto: string) => {
  if (!texto) return []
  const urls = texto.match(/(https?:\/\/[^\s]+)/g) || []
  return urls.map(url => ({ url: url.replace(/[.,;!?)\]}]+$/, ''), esImagen: esUrlImagen(url) }))
}

export const limpiarTexto = (texto: string): string => {
  if (!texto) return texto
  return [
    /\*\*Imagen Principal\*\*:?\s*/gi,
    /\*\*Imagen Secundaria \d+\*\*:?\s*/gi,
    /\d+\.\s*\*\*Imagen Secundaria \d+\*\*:?\s*/gi,
    /¡Detalle\s*/gi,
    /Te muestro las fotos:?\s*/gi,
    /Aquí tienes las imágenes:?\s*/gi,
    /\)\s*$/g
  ].reduce((t, p) => t.replace(p, ''), texto).trim()
}

export const mapRegistroAMensaje = (registro: any) => {
  try {
    const raw = registro?.message ?? registro?.message_json
    const msg = typeof raw === 'string' ? JSON.parse(raw) : raw
    if (!msg) return null
    const esUsuario = msg.type === 'human' || msg.type === 'user' || msg.role === 'user'
    const texto = msg.content ?? msg.text ?? ''
    const ts = msg.timestamp ?? registro.created_at ?? new Date().toISOString()
    return { id: `sb_${registro.id}`, texto, esUsuario, timestamp: new Date(ts), tipo: msg.tipo || 'texto' }
  } catch { return null }
}
