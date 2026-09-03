'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Icono from '@/componentes/ui/Icono'
import AccordeonArte from '../AccordeonArte'

const NUMERO_WA = '573144865310'
const DURACION = 7000
const UMBRAL_SWIPE = 48

// Imágenes 100% locales (public/images/hero y public/migradas). Antes el hero consultaba Supabase
// al montar y luego cargaba hotlinks externos (hohner.de, konradmusic…) o URLs del WordPress viejo
// que devolvían 404: el visual quedaba vacío varios segundos. Ahora las 4 imágenes van montadas
// desde el inicio (la primera con priority, las demás eager/low) y hacen crossfade entre sí.
// Los recortes se generan con scripts/recortar-gemini.mjs a partir de fotos reales.
const HERO = '/images/hero'
const PROD = '/migradas/productos'

// Títulos siempre en 3 líneas de longitud parecida: así el bloque de texto no cambia de alto
// entre diapositivas y los CTAs quedan fijos en la misma posición.
const DIAPOSITIVAS = [
  {
    hashtag: 'NuestroOficio',
    titulo: ['Acordeones', 'y todo para', 'tu música'],
    sub: 'Guitarras, bajos, baterías y sonido. Los acordeones vallenatos son nuestra firma, afinados a mano en Valledupar.',
    cta1: { texto: 'Ver Acordeones', href: '/tienda' },
    cta2: { texto: 'Otros Instrumentos', tipo: 'wa' },
    tag: 'TIENDA OFICIAL · DESDE 1998',
    variante: 'pearl',
    imagen: `${HERO}/rey-vallenato-negro.webp`,
    alt: 'Acordeón Hohner Rey Vallenato negro',
  },
  {
    hashtag: 'EdiciónVallenata',
    titulo: ['Rey Vallenato', 'con 30% OFF', 'por tiempo limitado'],
    acento: 1,
    sub: 'Hohner Rey Vallenato con nácar, en stock y listos para enviar a toda Colombia y al mundo.',
    cta1: { texto: 'Ver Acordeones', href: '/tienda' },
    cta2: { texto: 'Personaliza el Tuyo', href: '/acordeones-personalizados' },
    tag: 'COLECCIÓN 2026',
    variante: '',
    imagen: `${HERO}/blanco-tricolor.webp`,
    alt: 'Acordeón Hohner blanco con fuelle dorado',
  },
  {
    hashtag: 'PersonalizadosÚnicos',
    titulo: ['Un acordeón', 'que solo', 'tú tendrás'],
    acento: 2,
    sub: 'Maderas, nácar, grabado láser y afinación a la medida. Diseñado contigo en 6 a 8 semanas.',
    cta1: { texto: 'Diseñar el Mío', href: '/acordeones-personalizados' },
    cta2: { texto: 'Galería Custom', href: '/acordeones-personalizados' },
    tag: 'EDICIÓN PRIVADA',
    variante: 'onyx',
    imagen: `${HERO}/azul-tricolor.webp`,
    alt: 'Acordeón Hohner azul personalizado',
  },
  {
    hashtag: 'ReyVallenato',
    titulo: ['El acordeón', 'que habla', 'por ti'],
    acento: 2,
    sub: 'Afinado a tu voz por nuestros maestros lutieres en Valledupar. Tradición vallenata, sonido único.',
    cta1: { texto: 'Catálogo Maestro', href: '/tienda' },
    cta2: { texto: 'Hablar con un Maestro', tipo: 'wa' },
    tag: 'TALLER VALLEDUPAR',
    variante: 'rojo',
    imagen: `${HERO}/rojo-xtreme.webp`,
    alt: 'Acordeón Hohner rojo Xtreme',
  },
]

// Burbujas flotantes: productos reales del catálogo (fotos locales, recortadas en círculo).
const BURBUJAS = [
  `${PROD}/acordeon-hohner-xtreme-color-azul/principal.jpg`,
  `${PROD}/parrillas-de-acordeon-personalizadas/principal.jpg`,
  `${PROD}/acordeon-hohner-verde-xtreme/principal.jpg`,
  `${PROD}/correas-de-acordeon/principal.jpg`,
  `${PROD}/acordeon-hohner-premium-dorado/principal.jpg`,
  `${PROD}/estuches-de-acordeon/principal.jpg`,
]

const URL_WA = `https://wa.me/${NUMERO_WA}?text=Hola%2C%20quiero%20m%C3%A1s%20informaci%C3%B3n`

export default function HeroInicio() {
  const [diapositiva, setDiapositiva] = useState(0)
  const [pausado, setPausado] = useState(false)
  const [interactuado, setInteractuado] = useState(false)
  const [rotas, setRotas] = useState<Record<number, boolean>>({})
  const bannerRef = useRef<HTMLDivElement>(null)
  const restanteRef = useRef(DURACION)
  const inicioRef = useRef(0)
  const touchXRef = useRef<number | null>(null)
  const total = DIAPOSITIVAS.length

  const irA = useCallback((i: number) => {
    setInteractuado(true)
    setDiapositiva(((i % total) + total) % total)
  }, [total])

  // Autoplay con tiempo restante: al pausar (hover) se congela el temporizador y la barra
  // de progreso CSS a la vez; al volver, continúa desde donde estaba.
  useEffect(() => { restanteRef.current = DURACION }, [diapositiva])
  useEffect(() => {
    if (pausado) return
    inicioRef.current = performance.now()
    const t = setTimeout(() => {
      setInteractuado(true)
      setDiapositiva((s) => (s + 1) % total)
    }, restanteRef.current)
    return () => {
      clearTimeout(t)
      restanteRef.current = Math.max(0, restanteRef.current - (performance.now() - inicioRef.current))
    }
  }, [diapositiva, pausado, total])

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

  const onTouchStart = (e: React.TouchEvent) => { touchXRef.current = e.touches[0]?.clientX ?? null }
  const onTouchEnd = (e: React.TouchEvent) => {
    const x0 = touchXRef.current
    touchXRef.current = null
    if (x0 === null) return
    const dx = (e.changedTouches[0]?.clientX ?? x0) - x0
    if (Math.abs(dx) < UMBRAL_SWIPE) return
    irA(diapositiva + (dx < 0 ? 1 : -1))
  }

  const burbuja = (offset: number) => BURBUJAS[(diapositiva + offset) % BURBUJAS.length]

  return (
    <div className="hero-wrap" id="top">
      <div
        className={`hero-banner${pausado ? ' is-pausado' : ''}`}
        ref={bannerRef}
        onMouseEnter={() => setPausado(true)}
        onMouseLeave={() => setPausado(false)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <span className="hero-corner-tag" aria-live="polite">{DIAPOSITIVAS[diapositiva].tag}</span>
        <div className="hero-glow" />

        <div className="hero-content">
          {/* Todas las diapositivas montadas y apiladas (grid 1/1): el alto del bloque es el de
              la más alta y el cambio es un crossfade real, sin remount. */}
          <div className="hero-slides">
            {DIAPOSITIVAS.map((s, idx) => {
              const activo = idx === diapositiva
              const urlCta2 = s.cta2.tipo === 'wa' ? URL_WA : (s.cta2.href ?? '/tienda')
              const Titulo = idx === 0 ? 'h1' : 'p'
              return (
                <div
                  key={idx}
                  className={`hero-slide${activo ? ' is-active' : ''}${activo && !interactuado ? ' is-inicial' : ''}`}
                  aria-hidden={!activo}
                >
                  <div className="hashtag">{s.hashtag}</div>
                  {/* Un solo h1 en la página (la primera diapositiva); el resto son <p> con el mismo estilo. */}
                  <Titulo className="display hero-title" style={{ '--d': '80ms' } as React.CSSProperties}>
                    {s.titulo.map((linea, i) => (
                      <span key={i} className="row">
                        {i === (s.acento ?? s.titulo.length - 1) ? <span className="accent">{linea}</span> : linea}
                      </span>
                    ))}
                  </Titulo>
                  <p className="hero-sub" style={{ '--d': '200ms' } as React.CSSProperties}>{s.sub}</p>
                  <div className="hero-ctas" style={{ '--d': '300ms' } as React.CSSProperties}>
                    <Link href={s.cta1.href} className="btn btn-primary" tabIndex={activo ? 0 : -1}>
                      {s.cta1.texto}
                      <span className="arrow"><Icono nombre="flecha" tamaño={14} /></span>
                    </Link>
                    {s.cta2.tipo === 'wa' ? (
                      <a
                        href={urlCta2}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-ghost"
                        tabIndex={activo ? 0 : -1}
                      >
                        <Icono nombre="whatsapp" tamaño={14} />
                        {s.cta2.texto}
                      </a>
                    ) : (
                      <Link href={urlCta2} className="btn btn-ghost" tabIndex={activo ? 0 : -1}>
                        <Icono nombre="cat-guitarra" tamaño={14} />
                        {s.cta2.texto}
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="hero-dots" role="tablist" aria-label="Diapositivas del hero">
            {DIAPOSITIVAS.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === diapositiva}
                className={i === diapositiva ? 'active' : ''}
                onClick={() => irA(i)}
                aria-label={`Diapositiva ${i + 1}`}
              >
                {i === diapositiva && <span className="dot-fill" />}
              </button>
            ))}
            <span className="hero-counter">
              <span className="now">{String(diapositiva + 1).padStart(2, '0')}</span>
              {' / '}
              {String(total).padStart(2, '0')}
            </span>
            <span className="hero-arrows">
              <button type="button" className="hero-arrow" onClick={() => irA(diapositiva - 1)} aria-label="Diapositiva anterior">
                <Icono nombre="flecha-izq" tamaño={14} />
              </button>
              <button type="button" className="hero-arrow" onClick={() => irA(diapositiva + 1)} aria-label="Diapositiva siguiente">
                <Icono nombre="flecha" tamaño={14} />
              </button>
            </span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-stage">
            <div className="hero-accordion-fallback">
              {DIAPOSITIVAS.map((s, idx) => (
                <div key={idx} className={`hero-img-layer${idx === diapositiva ? ' is-active' : ''}`} aria-hidden={idx !== diapositiva}>
                  {rotas[idx] ? (
                    <AccordeonArte variante={s.variante} />
                  ) : (
                    <Image
                      src={s.imagen}
                      alt={idx === diapositiva ? s.alt : ''}
                      width={900}
                      height={900}
                      priority={idx === 0}
                      loading={idx === 0 ? undefined : 'eager'}
                      fetchPriority={idx === 0 ? undefined : 'low'}
                      sizes="(max-width: 1100px) 70vw, 38vw"
                      className="hero-img"
                      onError={() => setRotas((r) => ({ ...r, [idx]: true }))}
                    />
                  )}
                </div>
              ))}
            </div>
            {[1, 2, 3].map((n) => (
              <div key={n} className={`hero-circle hero-circle-${n}`}>
                <Image
                  src={burbuja(n)}
                  alt=""
                  width={140}
                  height={140}
                  loading="lazy"
                  sizes="140px"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
