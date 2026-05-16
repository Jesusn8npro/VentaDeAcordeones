import React from 'react'

interface Props {
  texto: string
  onImageClick: (url: string) => void
  onImageLoad: () => void
}

type Segmento =
  | { tipo: 'texto';  valor: string }
  | { tipo: 'link';   label: string; url: string }
  | { tipo: 'imagen'; url: string }

const ES_IMAGEN = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i
const REGEX_LINK = /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^)]+)\)/g

function parsear(texto: string): Segmento[] {
  const segs: Segmento[] = []
  let cursor = 0
  let m: RegExpExecArray | null
  REGEX_LINK.lastIndex = 0
  while ((m = REGEX_LINK.exec(texto)) !== null) {
    if (m.index > cursor) segs.push({ tipo: 'texto', valor: texto.slice(cursor, m.index) })
    const url = m[2]
    ES_IMAGEN.test(url)
      ? segs.push({ tipo: 'imagen', url })
      : segs.push({ tipo: 'link', label: m[1], url })
    cursor = m.index + m[0].length
  }
  if (cursor < texto.length) segs.push({ tipo: 'texto', valor: texto.slice(cursor) })
  return segs
}

function limpiarTexto(t: string): string {
  return t
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/\s*->\s*/g, ' ')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function iconoBtn(url: string): string {
  if (url.includes('wa.me') || url.includes('whatsapp')) return '💬'
  if (url.includes('/checkout'))                         return '🛒'
  if (url.includes('/producto/'))                        return '🪗'
  if (url.includes('/blog'))                             return '📖'
  if (url.includes('/tienda'))                           return '🎵'
  if (url.includes('/contacto'))                         return '📞'
  if (url.includes('/nosotros'))                         return '🏪'
  return '✨'
}

export default function MensajeChat({ texto, onImageClick, onImageLoad }: Props) {
  if (!texto) return null

  const segmentos = parsear(texto)

  if (segmentos.every(s => s.tipo === 'texto')) {
    return <span className="academia-msg-text">{limpiarTexto(texto)}</span>
  }

  return (
    <span className="academia-msg-inner">
      {segmentos.map((seg, i) => {
        if (seg.tipo === 'texto') {
          const limpio = limpiarTexto(seg.valor)
          return limpio ? <span key={i} className="academia-msg-text">{limpio}</span> : null
        }

        if (seg.tipo === 'imagen') {
          return (
            <div key={i} className="academia-chat-img-container">
              <img
                src={seg.url}
                alt=""
                className="academia-chat-img"
                onClick={() => onImageClick(seg.url)}
                onError={(e: any) => { e.target.style.display = 'none' }}
                onLoad={onImageLoad}
              />
            </div>
          )
        }

        const esExterno = seg.url.startsWith('http')
        return (
          <a
            key={i}
            href={seg.url}
            target={esExterno ? '_blank' : '_self'}
            rel={esExterno ? 'noopener noreferrer' : undefined}
            className="academia-link-btn"
          >
            <span className="academia-btn-icono">{iconoBtn(seg.url)}</span>
            <span className="academia-btn-label">{seg.label}</span>
            <span className="academia-btn-arrow">→</span>
          </a>
        )
      })}
    </span>
  )
}
