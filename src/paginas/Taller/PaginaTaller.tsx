import Link from 'next/link'
import Image from 'next/image'
import Icono from '@/componentes/ui/Icono'
import ReelsInstagram from '@/componentes/social/ReelsInstagram'
import { NUMERO_WA } from '@/datos/clusters'
import './PaginaTaller.css'

// Landing /taller — "Taller de acordeones en Bogotá". Página estática (sin Supabase): la conversión
// es por WhatsApp. FAQ_TALLER y SERVICIOS_TALLER se exportan para el JSON-LD de app/(sitio)/taller/page.tsx.

const wa = (t: string) => `https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(t)}`
const WA_GENERAL = wa('Hola, necesito reparar/afinar mi acordeón')

export const SERVICIOS_TALLER = [
  {
    icono: 'acc-lengueta', titulo: 'Afinación completa', tiempo: '2 a 4 días',
    incluye: ['Limpieza de voces y placas', 'Ajuste de tono nota por nota', 'Calibración del tremolo (brillo)'],
    enlace: { href: '/accesorios', texto: 'Ver accesorios' },
    wa: 'Hola, quiero cotizar una afinación completa para mi acordeón',
  },
  {
    icono: 'destello', titulo: 'Cambio de pitos / voces', tiempo: '3 a 6 días',
    incluye: ['Lengüetas Hohner originales', 'Encerado y montaje de placas', 'Calibración y afinación final'],
    enlace: { href: '/blog/cambio-de-pitos-acordeon-bogota', texto: 'Guía: cambio de pitos' },
    wa: 'Hola, necesito cambio de pitos (voces) para mi acordeón',
  },
  {
    icono: 'acc-fuelle', titulo: 'Cambio de fuelle y cinta', tiempo: '2 a 5 días',
    incluye: ['Fuelle nuevo sellado sin fugas', 'Cinta para fuelles y esquineros', 'Prueba de hermeticidad'],
    enlace: { href: '/accesorios/fuelles-de-acordeon', texto: 'Fuelles de acordeón' },
    wa: 'Hola, quiero cambiar el fuelle de mi acordeón',
  },
  {
    icono: 'acc-parrilla', titulo: 'Cambio de parrilla y herrajes', tiempo: '1 a 3 días',
    incluye: ['Parrilla cromada, dorada o grabada', 'Broches, correas y esquineros', 'Ajuste de tornillería'],
    enlace: { href: '/accesorios/parrillas-de-acordeon', texto: 'Parrillas de acordeón' },
    wa: 'Hola, quiero cambiar la parrilla o herrajes de mi acordeón',
  },
  {
    icono: 'estrella', titulo: 'Restauración integral', tiempo: '2 a 4 semanas',
    incluye: ['Nacarado y celuloide nuevo', 'Botones, teclado y mecánica', 'Afinación completa incluida'],
    enlace: { href: '/accesorios/broches-de-acordeon', texto: 'Broches y herrajes' },
    wa: 'Hola, quiero restaurar por completo mi acordeón',
  },
  {
    icono: 'escudo', titulo: 'Mantenimiento preventivo', tiempo: '1 a 2 días',
    incluye: ['Limpieza profunda interna', 'Lubricación de mecánica y botones', 'Revisión de fugas y válvulas'],
    enlace: { href: '/blog/mantenimiento-de-acordeon-guia-completa', texto: 'Guía de mantenimiento' },
    wa: 'Hola, quiero un mantenimiento preventivo para mi acordeón',
  },
  {
    icono: 'cat-personalizado', titulo: 'Personalización', tiempo: '2 a 8 semanas',
    incluye: ['Colores nácar y fuelle a tu gusto', 'Parrilla grabada con tu nombre', 'Tonalidad a medida'],
    enlace: { href: '/acordeones-personalizados', texto: 'Acordeones personalizados' },
    wa: 'Hola, quiero personalizar mi acordeón',
  },
] as const

const PROCESO = [
  { icono: 'whatsapp', titulo: 'Nos escribes', texto: 'Con video o fotos del problema. Entre más detalle, más precisa la cotización.' },
  { icono: 'buscar', titulo: 'Diagnóstico y cotización', texto: 'En minutos te decimos qué tiene tu acordeón y cuánto cuesta arreglarlo.' },
  { icono: 'pin', titulo: 'Recibimos el acordeón', texto: 'En mano en Bogotá o por envío desde cualquier ciudad de Colombia o del exterior.' },
  { icono: 'herramienta', titulo: 'Reparación con prueba', texto: 'Trabajamos y te enviamos video con prueba de sonido antes de cerrar.' },
  { icono: 'camion', titulo: 'Entrega o envío asegurado', texto: 'Recoges en Bogotá o lo despachamos con seguro de tránsito y guía.' },
]

const EMBALAJE = [
  { titulo: 'Estuche rígido', texto: 'Siempre en su estuche. Si no tienes, te prestamos o vendemos uno.' },
  { titulo: 'Protege el fuelle', texto: 'Papel o espuma entre los pliegues y broches cerrados para que no se abra.' },
  { titulo: 'Caja doble', texto: 'Estuche dentro de una caja de cartón con relleno en todos los lados.' },
  { titulo: 'Marca "frágil"', texto: 'Rotula la caja por todas las caras y añade nuestros datos de contacto.' },
]

const TRANSPORTADORAS = [
  { nombre: 'Servientrega', detalle: 'Nacional · 1 a 3 días' },
  { nombre: 'Interrapidísimo', detalle: 'Nacional · 1 a 3 días' },
  { nombre: 'DHL', detalle: 'Internacional · 4 a 8 días' },
]

const SINTOMAS = [
  { s: 'Pierde aire al abrir o cerrar', d: 'Fuelle o válvulas con fuga', r: 'Cambio de fuelle o sellado' },
  { s: 'Una nota no suena', d: 'Pito trabado, roto o sucio', r: 'Cambio de pitos / limpieza' },
  { s: 'Se escucha desafinado', d: 'Lengüetas con óxido o desgaste', r: 'Afinación completa' },
  { s: 'Un botón se queda pegado', d: 'Mecánica sucia o resorte vencido', r: 'Mantenimiento preventivo' },
  { s: 'Ruido metálico o zumbido', d: 'Pito flojo o placa sin cera', r: 'Encerado y calibración' },
  { s: 'Fuelle roto o despegado', d: 'Cartón vencido o esquineros sueltos', r: 'Cambio de fuelle y cinta' },
  { s: 'Herrajes o broches flojos', d: 'Tornillería y broches desgastados', r: 'Cambio de herrajes' },
  { s: 'Parrilla suelta o rota', d: 'Golpe o tornillos barridos', r: 'Cambio de parrilla' },
]

export const FAQ_TALLER = [
  { p: '¿Cuánto tarda la reparación de un acordeón?', r: 'Una afinación o mantenimiento tarda entre 2 y 4 días hábiles. Cambio de pitos o fuelle, de 3 a 6 días. Una restauración integral puede tomar de 2 a 4 semanas según el estado del instrumento. Te damos la fecha exacta al cotizar.' },
  { p: '¿Cuánto cuesta una afinación de acordeón?', r: 'Depende del número de voces, del estado de las lengüetas y de si necesita cambio de pitos. Envíanos un video por WhatsApp y te cotizamos en minutos, sin costo y sin compromiso.' },
  { p: '¿Cambian pitos de Hohner Corona III y Rey Vallenato?', r: 'Sí. Trabajamos con lengüetas Hohner originales para Corona II, Corona III, Rey Vallenato, Panther y Compadre, además de acordeones italianos. Cada juego se encera, se monta y se afina a mano.' },
  { p: '¿Reciben acordeones de otras ciudades?', r: 'Sí. Recibimos acordeones de toda Colombia por Servientrega o Interrapidísimo, y del exterior por DHL. Te guiamos con el embalaje y el envío de vuelta va asegurado.' },
  { p: '¿Qué garantía tiene el trabajo?', r: 'Todos los trabajos tienen 90 días de garantía en mano de obra. Los repuestos Hohner originales conservan además la garantía de fábrica.' },
  { p: '¿Puedo afinar o limpiar mi acordeón en casa?', r: 'La limpieza externa y del fuelle sí. La afinación de lengüetas requiere afinador, herramientas y experiencia: un lijado de más arruina el pito. Si quieres intentarlo, lee nuestra guía del blog y consúltanos antes.' },
  { p: '¿Cada cuánto debo hacerle mantenimiento?', r: 'Si tocas con frecuencia, una revisión al año. Si el acordeón viaja mucho, vive en clima húmedo o costero, cada 6 meses. La prevención es mucho más barata que cambiar pitos oxidados.' },
  { p: '¿Restauran acordeones viejos o heredados?', r: 'Sí, es de lo que más nos gusta hacer. Recuperamos Hohner de los años 70, 80 y 90: nacarado nuevo, celuloide, botones, fuelle y afinación completa. Quedan sonando como el primer día.' },
]

const GUIAS = [
  { href: '/blog/cambio-de-pitos-acordeon-bogota', titulo: 'Cambio de pitos de acordeón en Bogotá', texto: 'Cuándo cambiarlos, cuáles usar y qué esperar del taller.' },
  { href: '/blog/mantenimiento-de-acordeon-guia-completa', titulo: 'Mantenimiento de acordeón: guía completa', texto: 'Rutina de cuidado para que dure décadas.' },
  { href: '/blog/donde-reparar-acordeon-en-bogota', titulo: '¿Dónde reparar un acordeón en Bogotá?', texto: 'Qué mirar antes de entregar tu instrumento.' },
  { href: '/blog/como-afinar-y-limpiar-tu-acordeon-en-casa', titulo: 'Cómo afinar y limpiar tu acordeón en casa', texto: 'Lo que sí puedes hacer tú y lo que no.' },
  { href: '/blog/cuidado-del-fuelle-y-cinta-para-fuelles', titulo: 'Cuidado del fuelle y cinta para fuelles', texto: 'Evita fugas y alarga la vida del fuelle.' },
]

const Ext = ({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={className}>{children}</a>
)

export default function PaginaTaller() {
  return (
    <main className="tl">
      {/* ── Hero ── */}
      <header className="tl-hero">
        <div className="tl-hero-inner">
          <nav className="tl-migas" aria-label="Ruta">
            <Link href="/">Inicio</Link><span>/</span>
            <span aria-current="page">Taller de acordeones</span>
          </nav>
          <div className="tl-hero-grid">
            <div className="tl-hero-texto">
              <div className="eyebrow">— Taller de acordeones · Bogotá</div>
              <h1 className="display tl-h1">Tu acordeón vuelve a sonar<br /><span className="accent">como el primer día</span></h1>
              <p className="tl-lead">
                Afinación, cambio de pitos, fuelles, parrillas y restauración con maestros afinadores formados en Valledupar.
                Atendemos en Bogotá y recibimos acordeones de toda Colombia y del exterior por envío asegurado.
              </p>
              <div className="tl-ctas">
                <Ext href={WA_GENERAL} className="btn btn-primary"><Icono nombre="whatsapp" tamaño={14} /> Cotizar mi reparación</Ext>
                <a href="#servicios" className="btn btn-ghost">Ver servicios <Icono nombre="chevron-abajo" tamaño={14} /></a>
              </div>
              <ul className="tl-garantias">
                <li><Icono nombre="escudo" tamaño={14} /> 90 días de garantía</li>
                <li><Icono nombre="camion" tamaño={14} /> Envío de ida y vuelta asegurado</li>
                <li><Icono nombre="check" tamaño={14} /> Repuestos Hohner originales</li>
              </ul>
            </div>
            <div className="tl-hero-visual" aria-hidden="true">
              <div className="tl-hero-halo" />
              <div className="tl-hero-anillo" />
              <Image src="/images/hero/rey-vallenato-negro.webp" alt="Acordeón Hohner Rey Vallenato negro en el taller" width={900} height={900} priority sizes="(max-width: 1000px) 78vw, 42vw" className="tl-hero-img" />
              <span className="tl-flot tl-flot--1"><Icono nombre="acc-lengueta" tamaño={14} /> Afinación a oído y con afinador</span>
              <span className="tl-flot tl-flot--2"><Icono nombre="escudo" tamaño={14} /> Garantía 90 días mano de obra</span>
              <span className="tl-flot tl-flot--3"><Icono nombre="destello" tamaño={14} /> Repuestos originales Hohner</span>
            </div>
          </div>
        </div>
        <div className="tl-franja">
          <div className="tl-franja-inner">
            <div className="tl-dato"><strong>+25</strong><span>años afinando acordeones</span></div>
            <div className="tl-dato"><strong>+400</strong><span>acordeones reparados al año</span></div>
            <div className="tl-dato"><strong>Valledupar</strong><span>escuela de nuestros maestros</span></div>
            <div className="tl-dato"><strong>Colombia</strong><span>y el exterior por envío</span></div>
          </div>
        </div>
      </header>

      {/* ── Servicios ── */}
      <section className="tl-seccion" id="servicios">
        <div className="tl-cabecera">
          <div>
            <div className="eyebrow">— Servicios del taller</div>
            <h2 className="display tl-h2">Todo lo que tu acordeón <span className="accent">necesita</span></h2>
          </div>
          <p className="tl-sub">Sin precios de lista: cada acordeón es distinto. Nos envías un video y te cotizamos en minutos por WhatsApp.</p>
        </div>
        <div className="tl-servicios">
          {SERVICIOS_TALLER.map((s, i) => (
            <article key={s.titulo} className="tl-servicio" style={{ '--i': i } as React.CSSProperties}>
              <div className="tl-servicio-top">
                <span className="tl-servicio-icono"><Icono nombre={s.icono} tamaño={22} /></span>
                <span className="tl-servicio-tiempo">{s.tiempo}</span>
              </div>
              <h3>{s.titulo}</h3>
              <ul>
                {s.incluye.map((x) => <li key={x}><Icono nombre="check" tamaño={12} /> {x}</li>)}
              </ul>
              <div className="tl-servicio-pie">
                <Ext href={wa(s.wa)} className="tl-servicio-cta"><Icono nombre="whatsapp" tamaño={13} /> Cotización por WhatsApp</Ext>
                <Link href={s.enlace.href} className="tl-servicio-enlace">{s.enlace.texto} <Icono nombre="flecha" tamaño={12} /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ── Proceso ── */}
      <section className="tl-seccion tl-seccion--suave" id="proceso">
        <div className="tl-cabecera">
          <div>
            <div className="eyebrow">— Cómo trabajamos</div>
            <h2 className="display tl-h2">De tu WhatsApp <span className="accent">a la tarima</span></h2>
          </div>
          <p className="tl-sub">Cinco pasos, cero sorpresas. Siempre sabes en qué va tu acordeón.</p>
        </div>
        <ol className="tl-proceso">
          {PROCESO.map((p, i) => (
            <li key={p.titulo} className="tl-paso">
              <div className="tl-paso-cab">
                <span className="tl-paso-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="tl-paso-icono"><Icono nombre={p.icono} tamaño={18} /></span>
              </div>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Envío ── */}
      <section className="tl-seccion" id="envio">
        <div className="tl-envio-grid">
          <div className="tl-envio-texto">
            <div className="eyebrow">— ¿No estás en Bogotá?</div>
            <h2 className="display tl-h2">Envía tu acordeón <span className="accent">al taller</span></h2>
            <p>Cada semana recibimos acordeones de la Costa, los Santanderes, el Eje Cafetero, los Llanos y del exterior. Empácalo bien, despáchalo y nosotros nos encargamos del resto: lo reparamos, te enviamos video con prueba de sonido y lo devolvemos asegurado.</p>
            <div className="tl-transportadoras">
              {TRANSPORTADORAS.map((t) => (
                <div key={t.nombre} className="tl-transportadora">
                  <Icono nombre="camion" tamaño={16} />
                  <div><strong>{t.nombre}</strong><span>{t.detalle}</span></div>
                </div>
              ))}
            </div>
            <ul className="tl-envio-notas">
              <li><Icono nombre="escudo" tamaño={14} /> Seguro de tránsito por el valor declarado, ida y vuelta.</li>
              <li><Icono nombre="rayo" tamaño={14} /> Te avisamos al recibirlo y al despacharlo, con guía de rastreo.</li>
            </ul>
            <Ext href={wa('Hola, quiero enviar mi acordeón al taller desde otra ciudad')} className="btn btn-primary"><Icono nombre="whatsapp" tamaño={14} /> Coordinar mi envío</Ext>
          </div>
          <aside className="tl-embalaje">
            <div className="tl-embalaje-titulo">Guía de embalaje</div>
            <ol>
              {EMBALAJE.map((e) => (
                <li key={e.titulo}><strong>{e.titulo}</strong><span>{e.texto}</span></li>
              ))}
            </ol>
            <Link href="/accesorios/estuches-de-acordeon" className="tl-embalaje-enlace">Ver estuches rígidos <Icono nombre="flecha" tamaño={12} /></Link>
          </aside>
        </div>
      </section>

      {/* ── Síntomas ── */}
      <section className="tl-seccion tl-seccion--suave" id="sintomas">
        <div className="tl-cabecera">
          <div>
            <div className="eyebrow">— Diagnóstico rápido</div>
            <h2 className="display tl-h2">¿Le pasa esto <span className="accent">a tu acordeón?</span></h2>
          </div>
          <p className="tl-sub">Identifica el síntoma y sabrás qué servicio lo resuelve. Si dudas, mándanos un video.</p>
        </div>
        <div className="tl-sintomas">
          {SINTOMAS.map((x) => (
            <Ext key={x.s} href={wa(`Hola, mi acordeón ${x.s.toLowerCase()}. ¿Me cotizan?`)} className="tl-sintoma">
              <span className="tl-sintoma-punto" />
              <div>
                <strong>{x.s}</strong>
                <span>{x.d}</span>
              </div>
              <em>{x.r}</em>
            </Ext>
          ))}
        </div>
      </section>

      {/* ── Reels ── */}
      <section className="tl-seccion">
        <ReelsInstagram limite={8} titulo="El taller en acción" filtro={['taller', 'afina', 'pito', 'fuelle', 'repar']} />
      </section>

      {/* ── FAQ ── */}
      <section className="tl-seccion tl-seccion--suave" id="preguntas">
        <div className="tl-cabecera">
          <div>
            <div className="eyebrow">— Preguntas frecuentes</div>
            <h2 className="display tl-h2">Lo que <span className="accent">nos preguntan</span></h2>
          </div>
        </div>
        <div className="tl-faq">
          {FAQ_TALLER.map((f) => (
            <details key={f.p} className="tl-faq-item">
              <summary>{f.p}<Icono nombre="chevron-abajo" tamaño={16} /></summary>
              <p>{f.r}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Guías del blog ── */}
      <section className="tl-seccion">
        <div className="tl-cabecera">
          <div>
            <div className="eyebrow">— Guías del blog</div>
            <h2 className="display tl-h2">Aprende a cuidar <span className="accent">tu acordeón</span></h2>
          </div>
          <Link href="/blog" className="tl-enlace">Ver el blog <Icono nombre="flecha" tamaño={12} /></Link>
        </div>
        <div className="tl-guias">
          {GUIAS.map((g, i) => (
            <Link key={g.href} href={g.href} className="tl-guia">
              <span className="tl-guia-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{g.titulo}</h3>
              <p>{g.texto}</p>
              <span className="tl-guia-leer">Leer guía <Icono nombre="flecha" tamaño={12} /></span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="tl-final">
        <div className="tl-final-card">
          <div className="tl-final-texto">
            <div className="eyebrow">— Hablemos</div>
            <h2 className="display tl-h2">Mándanos un video <span className="accent">y te cotizamos hoy</span></h2>
            <p>Respondemos en minutos. Cientos de acordeoneros ya confiaron en el taller: <Link href="/testimonios">lee sus testimonios</Link>.</p>
          </div>
          <div className="tl-final-ctas">
            <Ext href={WA_GENERAL} className="btn btn-primary"><Icono nombre="whatsapp" tamaño={14} /> Escribir al taller</Ext>
            <Link href="/testimonios" className="btn btn-ghost"><Icono nombre="estrella" tamaño={14} /> Testimonios</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
