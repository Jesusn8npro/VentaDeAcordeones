'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Icono from '@/componentes/ui/Icono'
import ReelsInstagram from '@/componentes/social/ReelsInstagram'
import { NUMERO_WA } from '@/datos/clusters'
import './PaginaTestimonios.css'

// Página /testimonios. Fotos REALES de clientes con su acordeón (W:\…\0.3 TESTIMONIOS y carpetas numeradas de
// entregas → public/images/testimonios, webp 600px). Filtros client-side por chips; el mosaico es masonry con
// columnas CSS (sin librerías). Los 3 testimonios con texto largo son los mismos del inicio (TestimoniosClientes).
//
// TODO (Jesús): las tarjetas marcadas con `generico: true` llevan una frase corta GENÉRICA y aparecen como
// "Cliente verificado · Entrega en <ciudad>". Reemplaza `frase`, `nombre` y `modelo` por los textos reales de
// WhatsApp de cada cliente (y ajusta la ciudad si la carpeta no la indicaba).

const wa = (t: string) => `https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(t)}`
const BASE = '/images/testimonios'

// ENLACES DE RESEÑAS. TODO (Jesús): reemplaza GOOGLE_MAPS por el enlace real de tu ficha
// (https://g.page/r/<ID>/review o el "Compartir → Escribir reseña" de Google Maps).
const GOOGLE_MAPS = 'https://www.google.com/maps'
const FACEBOOK = 'https://www.facebook.com/ventadeacordeones/reviews'
const INSTAGRAM = 'https://www.instagram.com/ventadeacordeones1/'

type Tag = 'colombia' | 'internacional' | 'personalizados' | 'rey-vallenato' | 'video'

interface Testimonio {
  foto: string
  ancho: number
  alto: number
  nombre: string
  lugar: string
  modelo: string
  frase: string
  tags: Tag[]
  generico?: boolean
  destacado?: boolean
}

const TESTIMONIOS: Testimonio[] = [
  // ── Con texto real (mismos 3 del inicio) ──
  { foto: `${BASE}/cliente-1.webp`, ancho: 600, alto: 600, nombre: 'Camilo R.', lugar: 'Medellín, Colombia', modelo: 'Rey Vallenato personalizado', destacado: true, tags: ['colombia', 'personalizados', 'rey-vallenato'],
    frase: 'Pedí un Rey Vallenato personalizado para el cumpleaños de mi papá. Le grabaron su nombre y un escudo del Cesar. El sonido es de otra dimensión. La atención, impecable de principio a fin.' },
  { foto: `${BASE}/cliente-10.webp`, ancho: 600, alto: 1038, nombre: 'Daniel', lugar: 'Santiago, Chile', modelo: 'Verde Xtreme · envío internacional', generico: true, tags: ['internacional', 'personalizados', 'video'],
    frase: 'Cruzó la cordillera y llegó afinado, tal como en el video.' },
  { foto: `${BASE}/cliente-4.webp`, ancho: 600, alto: 600, nombre: 'Yulissa M.', lugar: 'Miami, USA', modelo: 'Corona II verde', tags: ['internacional'],
    frase: 'Compré desde Miami y llegó en menos de dos semanas, perfectamente empacado y afinado. El acordeón suena exactamente como en el video. Volveré a comprar.' },
  { foto: `${BASE}/cliente-12.webp`, ancho: 600, alto: 400, nombre: 'Alfredo S.', lugar: 'Barranquilla, Colombia', modelo: 'Blanco total · Corona III', generico: true, tags: ['colombia', 'personalizados'],
    frase: 'Blanco de pies a cabeza, como lo pedí.' },
  { foto: `${BASE}/cliente-3.webp`, ancho: 600, alto: 600, nombre: 'Luis Eduardo M.', lugar: 'Valledupar, Colombia', modelo: 'Corona III blanco y oro', tags: ['colombia', 'video'],
    frase: 'Son los únicos que entienden de verdad un acordeón vallenato. Me ayudaron a elegir, ajustaron afinación a mi voz y me regalaron una correa de cuero. Cinco estrellas no alcanzan.' },
  // ── Genéricos (frases cortas, reemplazar por textos reales) ──
  { foto: `${BASE}/cliente-14.webp`, ancho: 600, alto: 800, nombre: 'Iván', lugar: 'Bogotá, Colombia', modelo: 'Azul tricolor personalizado', generico: true, tags: ['colombia', 'personalizados', 'video'],
    frase: 'Se siente el trabajo de taller en cada detalle.' },
  { foto: `${BASE}/cliente-6.webp`, ancho: 600, alto: 600, nombre: 'Cliente verificado', lugar: 'Ciudad de Panamá, Panamá', modelo: 'Rey Vallenato · bandera de Panamá', generico: true, tags: ['internacional', 'personalizados', 'rey-vallenato'],
    frase: 'Con los colores de mi bandera. Único.' },
  { foto: `${BASE}/cliente-2.webp`, ancho: 600, alto: 600, nombre: 'Cliente verificado', lugar: 'Bogotá, Colombia', modelo: 'Corona III rojo · fuelle dorado', generico: true, tags: ['colombia', 'personalizados'],
    frase: 'Atención de 10 por WhatsApp, de principio a fin.' },
  { foto: `${BASE}/cliente-15.webp`, ancho: 600, alto: 800, nombre: 'Jesús', lugar: 'Dallas, USA', modelo: 'Corona III blanco · envío internacional', generico: true, tags: ['internacional', 'video'],
    frase: 'Ya van varios. Siempre llegan perfectos.' },
  { foto: `${BASE}/cliente-7.webp`, ancho: 600, alto: 600, nombre: 'Clientes en Colombia', lugar: 'Bogotá · Valledupar', modelo: 'Entregas Corona II y III', generico: true, tags: ['colombia'],
    frase: 'Cada foto es una entrega real.' },
  { foto: `${BASE}/cliente-5.webp`, ancho: 600, alto: 600, nombre: 'Cliente verificado', lugar: 'Colombia', modelo: 'Rojo Xtreme', generico: true, tags: ['colombia', 'rey-vallenato'],
    frase: 'Recomendadísimo. Sonido Hohner de verdad.' },
  { foto: `${BASE}/cliente-13.webp`, ancho: 600, alto: 338, nombre: 'Cliente verificado', lugar: 'Quito, Ecuador', modelo: 'Premium armonizado', generico: true, tags: ['internacional'],
    frase: 'Armonizado y calibrado. Llegó listo para tocar.' },
  { foto: `${BASE}/cliente-11.webp`, ancho: 600, alto: 600, nombre: 'Cliente verificado', lugar: 'Colombia', modelo: 'Blanco tricolor · corona grabada', generico: true, tags: ['colombia', 'personalizados', 'rey-vallenato'],
    frase: 'El tricolor en el fuelle quedó espectacular.' },
  { foto: `${BASE}/cliente-16.webp`, ancho: 600, alto: 800, nombre: 'Cliente verificado', lugar: 'Toronto, Canadá', modelo: 'Blanco · fuelle personalizado', generico: true, tags: ['internacional', 'personalizados'],
    frase: 'Empaque impecable, ni un rayón tras el viaje.' },
  { foto: `${BASE}/cliente-8.webp`, ancho: 600, alto: 600, nombre: 'Clientes en el exterior', lugar: 'USA · Chile · Panamá', modelo: 'Envíos internacionales', generico: true, tags: ['internacional'],
    frase: 'A donde estés, llega tu acordeón.' },
  { foto: `${BASE}/cliente-17.webp`, ancho: 600, alto: 450, nombre: 'Cliente verificado', lugar: 'Monterrey, México', modelo: 'Blanco tricolor · tono GCF', generico: true, tags: ['internacional', 'personalizados'],
    frase: 'En tono GCF, exacto para el norteño.' },
  { foto: `${BASE}/cliente-19.webp`, ancho: 600, alto: 800, nombre: 'Cliente verificado', lugar: 'Chile', modelo: 'Rojo Xtreme', generico: true, tags: ['internacional', 'video'],
    frase: 'Lo probé apenas abrí la caja. Perfecto.' },
  { foto: `${BASE}/cliente-18.webp`, ancho: 600, alto: 800, nombre: 'Cliente verificado', lugar: 'Madrid, España', modelo: 'Blanco Premium armonizado', generico: true, tags: ['internacional'],
    frase: 'Hasta Europa con seguro y seguimiento.' },
  { foto: `${BASE}/cliente-9.webp`, ancho: 600, alto: 600, nombre: 'Clientes felices', lugar: 'Colombia y el mundo', modelo: 'Corona II · Corona III · Rey Vallenato', generico: true, tags: ['colombia', 'internacional'],
    frase: 'Más de 1.200 reseñas lo respaldan.' },
]

const FILTROS: { id: 'todos' | Tag; etiqueta: string }[] = [
  { id: 'todos', etiqueta: 'Todos' },
  { id: 'colombia', etiqueta: 'Colombia' },
  { id: 'internacional', etiqueta: 'Internacional' },
  { id: 'personalizados', etiqueta: 'Personalizados' },
  { id: 'rey-vallenato', etiqueta: 'Rey Vallenato' },
  { id: 'video', etiqueta: 'Video' },
]

function useReveal(deps: unknown[] = []) {
  useEffect(() => {
    const nodos = document.querySelectorAll<HTMLElement>('.tm-reveal:not(.visible)')
    if (!('IntersectionObserver' in window)) { nodos.forEach((n) => n.classList.add('visible')); return }
    const io = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target) } })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })
    nodos.forEach((n) => io.observe(n))
    // Red de seguridad (mismo criterio que el inicio): nada queda oculto permanentemente.
    const seguridad = window.setTimeout(() => nodos.forEach((n) => n.classList.add('visible')), 6000)
    return () => { io.disconnect(); clearTimeout(seguridad) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

export default function PaginaTestimonios() {
  const [filtro, setFiltro] = useState<'todos' | Tag>('todos')
  const visibles = useMemo(() => (filtro === 'todos' ? TESTIMONIOS : TESTIMONIOS.filter((t) => t.tags.includes(filtro))), [filtro])
  const conteo = useMemo(() => Object.fromEntries(FILTROS.map((f) => [f.id, f.id === 'todos' ? TESTIMONIOS.length : TESTIMONIOS.filter((t) => t.tags.includes(f.id as Tag)).length])), [])
  useReveal()

  return (
    <main className="tm">
      {/* Hero */}
      <header className="tm-hero">
        <div className="tm-hero-inner">
          <div>
            <div className="tm-eyebrow">— Testimonios reales</div>
            <h1 className="tm-display tm-h1">Acordeones entregados,<br /><span className="tm-oro">clientes felices</span></h1>
            <p className="tm-lead">
              Fotos y videos de personas que ya tienen su Hohner en las manos. <strong>4.9 / 5</strong> en más de
              <strong> 1.200 reseñas</strong> en Google, Facebook y Mercado Libre, con envíos a <strong>42 países</strong>.
            </p>
            <div className="tm-ctas">
              <a href={wa('Hola, vi los testimonios y quiero asesoría para elegir mi acordeón')} target="_blank" rel="noopener noreferrer" className="tm-btn tm-btn-oro">
                <Icono nombre="whatsapp" tamaño={15} /> Hablar por WhatsApp
              </a>
              <Link href="/tienda" className="tm-btn tm-btn-ghost">Ver la tienda</Link>
            </div>
            <ul className="tm-stats">
              <li><strong>4.9<span style={{ fontSize: '.55em' }}>/5</span></strong><span>calificación</span></li>
              <li><strong>+1.200</strong><span>reseñas verificadas</span></li>
              <li><strong>42</strong><span>países con entregas</span></li>
            </ul>
          </div>
          <div className="tm-collage" aria-hidden="true">
            <div className="tm-collage-foto tm-collage-1"><Image src={`${BASE}/cliente-1.webp`} alt="" width={600} height={600} priority sizes="(max-width: 960px) 60vw, 330px" /></div>
            <div className="tm-collage-foto tm-collage-2"><Image src={`${BASE}/cliente-3.webp`} alt="" width={600} height={600} priority sizes="(max-width: 960px) 50vw, 280px" /></div>
            <div className="tm-collage-foto tm-collage-3"><Image src={`${BASE}/cliente-4.webp`} alt="" width={600} height={600} sizes="(max-width: 960px) 60vw, 330px" /></div>
            <div className="tm-sello"><div className="tm-estrellas">★★★★★</div><strong>4.9</strong><span>Google · Facebook · ML</span></div>
          </div>
        </div>
      </header>

      {/* Filtros + mosaico */}
      <section className="tm-seccion" id="galeria">
        <div className="tm-cabecera tm-reveal">
          <div>
            <div className="tm-eyebrow">— Galería de entregas</div>
            <h2 className="tm-display tm-h2">Ellos ya <span className="tm-oro">lo tienen</span></h2>
          </div>
          <p className="tm-sub">Cada foto es una entrega real. Filtra por país, tipo de acordeón o los que además nos enviaron video.</p>
        </div>
        <div className="tm-filtros tm-reveal" role="group" aria-label="Filtrar testimonios">
          {FILTROS.map((f) => (
            <button key={f.id} type="button" className="tm-chip" aria-pressed={filtro === f.id} onClick={() => setFiltro(f.id)}>
              {f.etiqueta} <small>{conteo[f.id]}</small>
            </button>
          ))}
        </div>
        {visibles.length ? (
          <div className="tm-mosaico" key={filtro}>
            {visibles.map((t, i) => (
              <article key={t.foto} className={`tm-tarjeta${t.destacado ? ' tm-tarjeta--destacada' : ''}`} style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}>
                <div className="tm-tarjeta-visual">
                  <Image src={t.foto} alt={`${t.nombre} con su acordeón ${t.modelo} — ${t.lugar}`} width={t.ancho} height={t.alto} sizes="(max-width: 720px) 92vw, (max-width: 1100px) 46vw, 30vw" loading={i < 3 ? 'eager' : 'lazy'} />
                  <span className="tm-lugar"><Icono nombre="pin" tamaño={11} /> {t.lugar}</span>
                  {t.tags.includes('video') && <span className="tm-video">▶ Video</span>}
                </div>
                <div className="tm-tarjeta-info">
                  <p className={`tm-cita${t.generico ? ' tm-cita--corta' : ''}`}>“{t.frase}”</p>
                  <div className="tm-persona">
                    <div>
                      <div className="tm-nombre"><Icono nombre="check" tamaño={13} /> {t.nombre}</div>
                      <div className="tm-modelo">{t.modelo}</div>
                    </div>
                    <div className="tm-verificado">
                      {t.generico
                        ? <>{t.nombre !== 'Cliente verificado' && <>Cliente verificado<br /> </>}Entrega en {t.lugar.split(',')[0]}</>
                        : <>Reseña<br />verificada</>}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="tm-vacio">Aún no hay testimonios en esta categoría.</p>
        )}
      </section>

      {/* Video */}
      <section className="tm-seccion tm-seccion--suave">
        <ReelsInstagram limite={10} titulo="Testimonios en video" filtro={['vendido', 'entreg', 'cliente', 'gracias', 'felicidades', 'testimonio']} />
      </section>

      {/* Deja tu reseña */}
      <section className="tm-seccion" id="resena">
        <div className="tm-cabecera tm-reveal">
          <div>
            <div className="tm-eyebrow">— ¿Ya recibiste el tuyo?</div>
            <h2 className="tm-display tm-h2">Cómo dejar <span className="tm-oro">tu reseña</span></h2>
          </div>
          <p className="tm-sub">Dos minutos que ayudan a otro acordeonero a decidirse. Elige la red que más uses.</p>
        </div>
        <div className="tm-resenas">
          <a href={GOOGLE_MAPS} target="_blank" rel="noopener noreferrer" className="tm-resena tm-reveal" data-delay="1">
            <span className="tm-resena-icono"><Icono nombre="pin" tamaño={22} /></span>
            <h3>Google Maps</h3>
            <p>Busca «VentaDeAcordeones.com», toca «Escribir una reseña», ponle estrellas y sube la foto con tu acordeón.</p>
            <span>Reseñar en Google <Icono nombre="flecha" tamaño={14} /></span>
          </a>
          <a href={FACEBOOK} target="_blank" rel="noopener noreferrer" className="tm-resena tm-reveal" data-delay="2">
            <span className="tm-resena-icono"><Icono nombre="fb" tamaño={22} /></span>
            <h3>Facebook</h3>
            <p>En nuestra página, pestaña «Opiniones» → «Sí, lo recomiendo». Puedes etiquetarnos en tu foto.</p>
            <span>Opinar en Facebook <Icono nombre="flecha" tamaño={14} /></span>
          </a>
          <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer" className="tm-resena tm-reveal" data-delay="3">
            <span className="tm-resena-icono"><Icono nombre="ig" tamaño={22} /></span>
            <h3>Instagram</h3>
            <p>Sube tu video tocando y menciona a @ventadeacordeones1. Los mejores los compartimos aquí.</p>
            <span>Etiquetarnos en Instagram <Icono nombre="flecha" tamaño={14} /></span>
          </a>
        </div>
        <ul className="tm-pasos tm-reveal">
          <li><b>01</b> Foto o video con tu acordeón</li>
          <li><b>02</b> Cuenta cómo fue la compra y el sonido</li>
          <li><b>03</b> Envíanosla también por WhatsApp y te la publicamos</li>
        </ul>
      </section>

      {/* CTA final */}
      <section className="tm-final">
        <div className="tm-reveal">
          <div className="tm-eyebrow">— El siguiente puedes ser tú</div>
          <h2 className="tm-display tm-h2">Diseña el tuyo <span className="tm-oro">o elige uno listo</span></h2>
          <p>Personalizamos Hohner nuevos pieza por pieza en nuestro taller de Bogotá y los enviamos afinados a cualquier ciudad del mundo. Escríbenos y te asesoramos con fotos reales.</p>
          <div className="tm-ctas">
            <Link href="/acordeones-personalizados" className="tm-btn tm-btn-oro"><Icono nombre="destello" tamaño={15} /> Acordeones personalizados</Link>
            <a href={wa('Hola, quiero asesoría para comprar mi acordeón')} target="_blank" rel="noopener noreferrer" className="tm-btn tm-btn-ghost"><Icono nombre="whatsapp" tamaño={15} /> Escribir por WhatsApp</a>
          </div>
        </div>
        <Image src={`${BASE}/cliente-11.webp`} alt="Cliente con su acordeón Hohner blanco tricolor personalizado" width={600} height={600} sizes="(max-width: 900px) 70vw, 380px" className="tm-final-img tm-reveal" data-delay="1" />
      </section>
    </main>
  )
}
