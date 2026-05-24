'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'
import AccordeonArte from '../AccordeonArte'
import { clienteSupabase } from '@/configuracion/supabase'
import { optimizarUrlSupabase } from '@/componentes/ImagenOptimizada'

const NUMERO_WA = '573208492093'

const BASE = 'https://ventadeacordeones.com/storage'

const DIAPOSITIVAS = [
  {
    hashtag: 'NuestroOficio',
    titulo: ['Acordeones,', 'Guitarras, Bajos,', 'Baterías y Sonido.'],
    sub: 'Todo lo que un músico necesita, pero los acordeones vallenatos son nuestra firma — afinados a mano en Valledupar.',
    cta1: { texto: 'Ver Acordeones', href: '/tienda' },
    cta2: { texto: 'Otros Instrumentos', tipo: 'wa' },
    tag: 'TIENDA OFICIAL · DESDE 1998',
    variante: 'pearl',
    imagen: `${BASE}/2024/01/Acordeon-Rey-Vallenato.jpg`,
  },
  {
    hashtag: 'EdiciónVallenata',
    titulo: ['Tiempo Limitado:', '30% OFF', 'Selección Especial'],
    acento: 1,
    sub: 'Acordeones Hohner Rey Vallenato con nácar, en stock y listos para enviar a toda Colombia y al mundo.',
    cta1: { texto: 'Ver Acordeones', href: '/tienda' },
    cta2: { texto: 'Personaliza el Tuyo', href: '/acordeones-personalizados' },
    tag: 'COLECCIÓN 2026',
    variante: '',
    imagen: `${BASE}/2023/08/Acordeon-Blanco-HOHNER-ORIGINAL-600x600.jpg`,
  },
  {
    hashtag: 'PersonalizadosÚnicos',
    titulo: ['Un Acordeón', 'que solo', 'tú tendrás'],
    acento: 2,
    sub: 'Maderas, nácar, grabado láser y afinación a la medida. Diseñado contigo en 6 a 8 semanas.',
    cta1: { texto: 'Diseñar el Mío', href: '/acordeones-personalizados' },
    cta2: { texto: 'Galería Custom', href: '/acordeones-personalizados' },
    tag: 'EDICIÓN PRIVADA',
    variante: 'onyx',
    imagen: `${BASE}/2023/08/Acordeon-de-botones-de-dos-colores-600x600.jpg`,
  },
  {
    hashtag: 'ReyVallenato',
    titulo: ['El Acordeón', 'que Habla', 'por Ti'],
    acento: 2,
    sub: 'Afinado a tu voz por nuestros maestros lutieres en Valledupar. Tradición vallenata, sonido único.',
    cta1: { texto: 'Catálogo Maestro', href: '/tienda' },
    cta2: { texto: 'Hablar con un Maestro', tipo: 'wa' },
    tag: 'TALLER VALLEDUPAR',
    variante: 'rojo',
    imagen: `${BASE}/2023/08/Acordeon-vallenato-hohner-de-lujo-600x600.jpg`,
  },
]

export default function HeroInicio() {
  const [diapositiva, setDiapositiva] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [imgs, setImgs] = useState<string[]>([])
  const bannerRef = useRef<HTMLDivElement>(null)
  const total = DIAPOSITIVAS.length

  useEffect(() => {
    clienteSupabase
      .from('productos')
      .select('producto_imagenes(imagen_principal)')
      .eq('activo', true)
      .gt('stock', 0)
      .limit(4)
      .then(({ data }) => {
        if (!data) return
        const urls = (data as any[])
          .flatMap((p) => Array.isArray(p.producto_imagenes) ? p.producto_imagenes : [])
          .map((img: any) => optimizarUrlSupabase(img?.imagen_principal || ''))
          .filter(Boolean)
        setImgs(urls)
      })
  }, [])

  useEffect(() => {
    if (pausado) return
    const t = setInterval(() => setDiapositiva((s) => (s + 1) % total), 7000)
    return () => clearInterval(t)
  }, [total, pausado])

  useEffect(() => {
    const el = bannerRef.current
    if (!el) return
    const on = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--cx', `${e.clientX - r.left}px`)
      el.style.setProperty('--cy', `${e.clientY - r.top}px`)
    }
    el.addEventListener('mousemove', on)
    return () => el.removeEventListener('mousemove', on)
  }, [])

  const s = DIAPOSITIVAS[diapositiva]

  const urlCta2 = s.cta2.tipo === 'wa'
    ? `https://wa.me/${NUMERO_WA}?text=Hola%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n`
    : (s.cta2.href ?? '/tienda')

  // Static fallback images per slide (shown when Supabase has no product images yet)
  const FALLBACK_IMGS = DIAPOSITIVAS.map((d) => d.imagen)

  const n = imgs.length
  const getImg = (offset: number) => {
    if (n > 0) return imgs[(diapositiva + offset) % n]
    // Use the static per-slide image for offset 0; cycle fallbacks for circles
    return FALLBACK_IMGS[(diapositiva + offset) % FALLBACK_IMGS.length] || null
  }

  return (
    <div className="hero-wrap" id="top">
      <div
        className="hero-banner"
        ref={bannerRef}
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
      >
        <span className="hero-corner-tag">{s.tag}</span>
        <div className="hero-glow" />

        <div className="hero-content" key={diapositiva}>
          <div className="hashtag fade-in-up">{s.hashtag}</div>
          <h1 className="display hero-title">
            {s.titulo.map((linea, i) => (
              <span
                key={i}
                className="row fade-in-up"
                style={{ '--d': `${i * 80}ms` } as React.CSSProperties}
              >
                {i === (s.acento ?? s.titulo.length - 1)
                  ? <span className="accent">{linea}</span>
                  : linea}
              </span>
            ))}
          </h1>
          <p
            className="hero-sub fade-in-up"
            style={{ '--d': '280ms' } as React.CSSProperties}
          >
            {s.sub}
          </p>
          <div
            className="hero-ctas fade-in-up"
            style={{ '--d': '360ms' } as React.CSSProperties}
          >
            <Link href={s.cta1.href} className="btn btn-primary">
              {s.cta1.texto}
              <span className="arrow"><Icono nombre="flecha" tamaño={14} /></span>
            </Link>
            {s.cta2.tipo === 'wa' ? (
              <a
                href={urlCta2}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                <Icono nombre="whatsapp" tamaño={14} />
                {s.cta2.texto}
              </a>
            ) : (
              <Link href={urlCta2} className="btn btn-ghost">
                <Icono nombre="cat-guitarra" tamaño={14} />
                {s.cta2.texto}
              </Link>
            )}
          </div>
          <div
            className="hero-dots fade-in-up"
            style={{ '--d': '440ms' } as React.CSSProperties}
          >
            {DIAPOSITIVAS.map((_, i) => (
              <button
                key={i}
                className={i === diapositiva ? 'active' : ''}
                onClick={() => setDiapositiva(i)}
                aria-label={`Diapositiva ${i + 1}`}
              >
                {i === diapositiva && <div className="dot-fill" />}
              </button>
            ))}
            <span className="hero-counter">
              <span className="now">{String(diapositiva + 1).padStart(2, '0')}</span>
              {' / '}
              {String(total).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-stage">
            <div className="hero-accordion-fallback">
              {(getImg(0) || FALLBACK_IMGS[diapositiva]) ? (
                <img
                  src={getImg(0) || FALLBACK_IMGS[diapositiva]!}
                  alt="Acordeón destacado"
                  onError={(e) => {
                    const fb = FALLBACK_IMGS[diapositiva]
                    if (fb && e.currentTarget.src !== fb) e.currentTarget.src = fb
                    else e.currentTarget.style.display = 'none'
                  }}
                  style={{
                    maxWidth: '82%',
                    maxHeight: '88%',
                    objectFit: 'contain',
                    display: 'block',
                    filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.85))',
                    transition: 'opacity 0.5s ease',
                  }}
                />
              ) : (
                <AccordeonArte variante={s.variante} />
              )}
            </div>
            <div className="hero-circle hero-circle-1">
              {getImg(1) && (
                <img
                  src={getImg(1)!}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="hero-circle hero-circle-2">
              {getImg(2) && (
                <img
                  src={getImg(2)!}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
            <div className="hero-circle hero-circle-3">
              {getImg(3) && (
                <img
                  src={getImg(3)!}
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
