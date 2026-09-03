'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTema } from '@/contextos/ContextoTema'
import { I } from '../navIconos'
import './PieDePagina.css'

const NUMERO_WA = '573144865310'
const WA_HREF = `https://wa.me/${NUMERO_WA}`
const CORREO = 'acordeon91@gmail.com'

// Pie en tres franjas: confianza · cuerpo de 5 columnas · legal/pagos.
// Todos los enlaces van a rutas reales; los colores salen de los tokens --vda-* (claro/oscuro).
const CONFIANZA = [
  { Icon: I.Truck,    titulo: 'Envío a toda Colombia',  texto: 'y a 42 países' },
  { Icon: I.Shield,   titulo: 'Pago seguro',            texto: 'ePayco, PSE, Nequi y contra entrega' },
  { Icon: I.Tool,     titulo: 'Garantía real',          texto: 'Taller propio de acordeones' },
  { Icon: I.Whatsapp, titulo: 'Asesoría por WhatsApp',  texto: 'Lun–Sáb · 8 AM – 7 PM', href: WA_HREF },
]

const COLUMNAS = [
  {
    titulo: 'Tienda',
    enlaces: [
      ['Acordeones', '/tienda'],
      ['Rey Vallenato', '/tienda/categoria/acordeones-rey-vallenato'],
      ['Hohner Corona III', '/tienda/categoria/acordeones-hohner-premium'],
      ['Personalizados', '/acordeones-personalizados'],
      ['Para niños', '/tienda/categoria/acordeones-para-ninos'],
      ['Ofertas', '/tienda'],
    ],
  },
  {
    titulo: 'Accesorios y audio',
    enlaces: [
      ['Parrillas', '/accesorios/parrillas-de-acordeon'],
      ['Fuelles', '/accesorios/fuelles-de-acordeon'],
      ['Correas y broches', '/accesorios/correas-de-acordeon'],
      ['Estuches', '/accesorios/estuches-de-acordeon'],
      ['Cajas vallenatas', '/instrumentos/cajas-vallenatas'],
      ['Audífonos y micrófonos', '/audio'],
    ],
  },
  {
    titulo: 'Servicios y ayuda',
    enlaces: [
      ['Taller de acordeones', '/taller'],
      ['Testimonios', '/testimonios'],
      ['Blog', '/blog'],
      ['Preguntas frecuentes', '/preguntas-frecuentes'],
      ['Envíos', '/politica-envio'],
      ['Cambios y devoluciones', '/cambios-devoluciones'],
      ['Contacto', '/contacto'],
    ],
  },
] as const

const PAGOS = ['VISA', 'MC', 'AMEX', 'PSE', 'NEQUI', 'DAVIPLATA', 'EFECTY', 'BANCOLOMBIA', 'ADDI', 'MERCADO PAGO']

const LEGALES = [
  ['Términos', '/terminos-condiciones'],
  ['Privacidad', '/politica-privacidad'],
] as const

const REDES = [
  { Icon: I.Instagram, label: 'Instagram', href: 'https://www.instagram.com/ventadeacordeones1/' },
  { Icon: I.Facebook,  label: 'Facebook',  href: 'https://www.facebook.com/ventadeacordeones' },
  { Icon: I.Tiktok,    label: 'TikTok',    href: 'https://www.tiktok.com/@ventadeacordeones' },
  { Icon: I.Youtube,   label: 'YouTube',   href: 'https://www.youtube.com/@ventadeacordeones' },
  { Icon: I.Whatsapp,  label: 'WhatsApp',  href: WA_HREF },
]

/** Un acordeón en silueta (≈130×70): dos cajas con botones "perforados" y el fuelle como rayas sueltas. */
function AcordeonSilueta({ x, y, giro = 0 }: { x: number; y: number; giro?: number }) {
  const botones = [22, 34, 46].flatMap((cy) => [11, 22].map((cx) => ({ cx, cy })))
  return (
    <g transform={`translate(${x} ${y}) rotate(${giro})`}>
      <rect x="0" y="4" width="34" height="62" rx="5" />
      <rect x="96" y="4" width="34" height="62" rx="5" />
      {[38, 48, 58, 68, 78, 88].map((rx) => <rect key={rx} x={rx} y="12" width="6" height="46" rx="1.5" />)}
      {botones.map((b) => <circle key={`${b.cx}-${b.cy}`} cx={b.cx} cy={b.cy} r="3" fill="var(--vda-fondo)" />)}
      {[22, 34, 46].map((cy) => <rect key={cy} x="106" y={cy - 2} width="16" height="4" rx="2" fill="var(--vda-fondo)" />)}
    </g>
  )
}

/** Silueta decorativa: colinas con dos acordeones, pintada del color del pie sobre el fondo de la página.
 *  Los acordeones van semitransparentes para que el dibujo acompañe sin robar atención. */
function Silueta() {
  return (
    <svg viewBox="0 0 1440 140" preserveAspectRatio="xMidYMax slice" aria-hidden="true" className="pie-silueta" fill="currentColor">
      <path d="M0 140V92C160 62 300 52 420 84C540 116 620 62 760 66C900 70 980 106 1120 88C1240 72 1340 50 1440 82V140Z" />
      <g className="pie-silueta-acordeones">
        <AcordeonSilueta x={150} y={22} giro={-6} />
        <AcordeonSilueta x={1160} y={6} giro={5} />
      </g>
    </svg>
  )
}

function Boletin() {
  const [email, setEmail] = useState('')
  const [listo, setListo] = useState(false)
  const enviar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setListo(true); setEmail('')
    setTimeout(() => setListo(false), 5000)
  }
  return (
    <form onSubmit={enviar} className="pie-boletin" aria-label="Suscripción al boletín">
      <p className="pie-boletin-texto">Ofertas, novedades y consejos de maestros afinadores. Sin spam.</p>
      <div className="pie-boletin-campo">
        <label htmlFor="pie-boletin-email" className="sr-only">Correo electrónico</label>
        <input
          id="pie-boletin-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Tu correo" autoComplete="email"
        />
        <button type="submit" className="cond" aria-live="polite">{listo ? '✓ ¡LISTO!' : 'SUSCRIBIRME'}</button>
      </div>
      {listo && <p className="pie-boletin-gracias pie-fade-in">¡Gracias! Te avisaremos primero de cada novedad.</p>}
    </form>
  )
}

function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 600)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  if (!show) return null
  return (
    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="pie-arriba pie-fade-in" aria-label="Volver arriba">
      <I.ArrowUp className="h-4 w-4" />
    </button>
  )
}

export default function PieDePagina() {
  // useTema se mantiene para re-renderizar al cambiar de modo; los colores salen de los tokens.
  useTema()
  // Acordeón en móvil: sólo una columna de enlaces abierta a la vez; en ≥640px el CSS las muestra todas.
  const [abierta, setAbierta] = useState<string | null>(null)

  return (
    <>
      <footer className="pie" aria-labelledby="pie-titulo">
        <h2 id="pie-titulo" className="sr-only">Pie de página</h2>
        <Silueta />
        <div className="pie-cuerpo">
          {/* ── Franja de confianza ── */}
          <ul className="pie-contenedor pie-confianza" aria-label="Por qué comprar con nosotros">
            {CONFIANZA.map(({ Icon, titulo, texto, href }) => {
              const contenido = (
                <>
                  <span className="pie-confianza-icono"><Icon /></span>
                  <span>
                    <strong className="cond">{titulo}</strong>
                    <small>{texto}</small>
                  </span>
                </>
              )
              return (
                <li key={titulo}>
                  {href
                    ? <a href={href} target="_blank" rel="noopener noreferrer" className="pie-confianza-item">{contenido}</a>
                    : <div className="pie-confianza-item">{contenido}</div>}
                </li>
              )
            })}
          </ul>

          {/* ── Cuerpo: 5 columnas ── */}
          <div className="pie-contenedor pie-grid">
            <div className="pie-marca">
              <Link href="/" className="pie-logo" aria-label="Inicio Venta de Acordeones">
                <span className="pie-logo-icono"><I.Accordion /></span>
                <span className="pie-logo-texto">
                  <span className="cond pie-logo-sup">VENTA DE</span>
                  <span className="cond pie-logo-nombre">ACORDEONES<em>.</em></span>
                </span>
              </Link>
              <p className="pie-marca-frase">
                Acordeones Hohner, personalizados, accesorios y audio. Taller de acordeones en Bogotá con maestros de Valledupar.
              </p>
              <ul className="pie-contacto">
                <li>
                  <I.Whatsapp />
                  <a href={WA_HREF} target="_blank" rel="noopener noreferrer">+57 314 486 5310</a>
                </li>
                <li>
                  <I.Mail />
                  <a href={`mailto:${CORREO}`}>{CORREO}</a>
                </li>
                <li>
                  <I.Clock />
                  <span>Lun–Sáb · 8 AM – 7 PM</span>
                </li>
              </ul>
              <ul className="pie-redes" aria-label="Redes sociales">
                {REDES.map(({ Icon, label, href }) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={`${label} de Venta de Acordeones`} title={label}>
                      <Icon />
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {COLUMNAS.map((col) => {
              const activa = abierta === col.titulo
              const idLista = `pie-lista-${col.titulo.replace(/\s+/g, '-').toLowerCase()}`
              return (
                <nav key={col.titulo} className="pie-col" data-abierta={activa} aria-label={col.titulo}>
                  <button
                    type="button"
                    className="cond pie-col-titulo"
                    aria-expanded={activa}
                    aria-controls={idLista}
                    onClick={() => setAbierta(activa ? null : col.titulo)}
                  >
                    {col.titulo}
                    <I.Chevron className="pie-col-chevron" />
                  </button>
                  <ul id={idLista} className="pie-lista">
                    {col.enlaces.map(([label, href]) => (
                      <li key={label}><Link href={href}>{label}</Link></li>
                    ))}
                  </ul>
                </nav>
              )
            })}

            <div className="pie-col pie-col-boletin">
              <h3 className="cond pie-col-titulo">Boletín</h3>
              <Boletin />
            </div>
          </div>

          {/* ── Fila inferior ── */}
          <div className="pie-inferior">
            <div className="pie-contenedor pie-inferior-fila">
              <ul className="pie-pagos" aria-label="Métodos de pago">
                {PAGOS.map((p) => <li key={p} className="cond">{p}</li>)}
              </ul>
              <ul className="pie-legales">
                {LEGALES.map(([label, href]) => <li key={label}><Link href={href}>{label}</Link></li>)}
              </ul>
              <p className="pie-copy">
                © {new Date().getFullYear()} <strong>Venta de Acordeones S.A.S.</strong> · NIT 901.234.567-8 · Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>
      <BackToTop />
    </>
  )
}
