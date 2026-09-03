'use client'

import { useState } from 'react'
import Image from 'next/image'
import Icono from '@/componentes/ui/Icono'
import { datos } from '@/datos/reels'
import './ReelsInstagram.css'

// Reels reales de @ventadeacordeones1. Los datos y miniaturas los genera scripts/actualizar-reels.mjs
// (Apify). Patrón "fachada": se muestra la miniatura local y el iframe de Instagram sólo se carga al
// hacer clic → cero JS de terceros en la carga inicial. CSP: frame-src https://www.instagram.com.

interface Reel { codigo: string; url: string; miniatura: string | null; titulo: string; vistas: number | null }

const fmt = (n: number | null) => (n == null ? '' : n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K` : String(n))

export default function ReelsInstagram({ limite = 6, titulo = 'Míralos en acción', filtro }: { limite?: number; titulo?: string; filtro?: string[] }) {
  const [activo, setActivo] = useState<string | null>(null)
  let reels = (datos.reels as Reel[]).filter((r) => r.miniatura)
  if (filtro?.length) {
    const con = reels.filter((r) => filtro.some((f) => r.titulo.toLowerCase().includes(f)))
    if (con.length >= 3) reels = con
  }
  reels = reels.slice(0, limite)
  if (!reels.length) return null

  return (
    <section className="reels" aria-labelledby="reels-titulo">
      <div className="reels-cabecera">
        <div>
          <div className="eyebrow">— Instagram · @{datos.perfil}</div>
          <h2 id="reels-titulo" className="display reels-titulo">{titulo}</h2>
        </div>
        <a className="reels-seguir" href={`https://www.instagram.com/${datos.perfil}/`} target="_blank" rel="noopener noreferrer">
          <Icono nombre="ig" tamaño={16} /> Seguir
        </a>
      </div>
      <div className="reels-pista">
        {reels.map((r) => (
          <article key={r.codigo} className={`reel${activo === r.codigo ? ' activo' : ''}`}>
            {activo === r.codigo ? (
              <iframe
                src={`https://www.instagram.com/reel/${r.codigo}/embed/`}
                title={r.titulo || 'Reel de Instagram'}
                allow="autoplay; encrypted-media"
                loading="lazy"
                scrolling="no"
              />
            ) : (
              <button
                type="button"
                className="reel-boton"
                onClick={(e) => {
                  // Escala del iframe de Instagram: el video dentro del embed mide 229px de ancho (ver CSS).
                  const card = e.currentTarget.parentElement as HTMLElement | null
                  card?.style.setProperty('--esc', String(card.getBoundingClientRect().width / 229))
                  setActivo(r.codigo)
                }}
                aria-label={`Reproducir: ${r.titulo || 'reel'}`}
              >
                <Image src={r.miniatura!} alt={r.titulo || 'Reel de VentaDeAcordeones'} width={540} height={960} sizes="(max-width: 640px) 70vw, 240px" />
                <span className="reel-play" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z" /></svg>
                </span>
                {r.vistas ? <span className="reel-vistas"><Icono nombre="ojo" tamaño={12} /> {fmt(r.vistas)}</span> : null}
                {r.titulo ? <span className="reel-texto">{r.titulo}</span> : null}
              </button>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
