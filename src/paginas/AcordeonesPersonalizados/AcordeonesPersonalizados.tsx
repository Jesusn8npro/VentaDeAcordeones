'use client'

import Link from 'next/link'
import Image from 'next/image'
import Icono from '@/componentes/ui/Icono'
import ReelsInstagram from '@/componentes/social/ReelsInstagram'
import './AcordeonesPersonalizados.css'

// Landing de acordeones personalizados. Antes era un scrollytelling con 5 "etapas" en sticky que
// dejaba ~9.000px de pantalla negra y placeholders sin foto ("DISEÑO FEATURED…"). Ahora: página de
// venta clara con recortes REALES de acordeones entregados (public/images/personalizados + hero),
// proceso, opciones, galería, testimonios, reels y FAQ. La experiencia 3D sigue en /landingdelujo.

const WA = '573144865310'
const wa = (t: string) => `https://wa.me/${WA}?text=${encodeURIComponent(t)}`

// `href` enlaza cada diseño con su producto en la tienda (/producto/<slug>); los que aún no tienen ficha llevan a la categoría.
const GALERIA = [
  { img: '/images/personalizados/premium-nacar.webp', nombre: 'Premium nácar',        detalle: 'Cuerpo nacarado blanco · fuelle dorado · botones nacarados', lugar: 'Barrancas',    href: '/producto/acordeon-hohner-premium-nacar-botones-nacarados' },
  { img: '/images/hero/blanco-tricolor.webp',          nombre: 'Blanco Corona III',    detalle: 'Blanco perlado · fuelle dorado · botones ámbar',            lugar: 'Bogotá',       href: '/producto/acordeon-hohner-blanco-premium-con-corona' },
  { img: '/images/hero/azul-tricolor.webp',            nombre: 'Trueno Kolombiano',    detalle: 'Azul nácar · parrilla grabada con nombre · fuelle tricolor', lugar: 'Cundinamarca', href: '/producto/acordeon-hohner-azul-tricolor-trueno-kolombiano' },
  { img: '/images/hero/rojo-xtreme.webp',              nombre: 'Rojo Xtreme',          detalle: 'Rojo nácar · parrilla negra · correas a juego',              lugar: 'Chile',        href: '/tienda/categoria/acordeones-hohner-personalizados' },
  { img: '/images/personalizados/morado.webp',         nombre: 'Morado edición única', detalle: 'Morado nácar · parrilla grabada · fuelle a rayas',           lugar: 'Valledupar',   href: '/producto/acordeon-hohner-morado-edicion-unica' },
  { img: '/images/personalizados/blanco-total.webp',   nombre: 'Blanco total',         detalle: 'Blanco integral · parrilla cromada · botones blancos',        lugar: 'Barranquilla', href: '/producto/acordeon-hohner-blanco-total' },
  { img: '/images/personalizados/verde-original.webp', nombre: 'Verde esmeralda',      detalle: 'Verde nácar · fuelle dorado · parrilla original',            lugar: 'Ibagué',       href: '/producto/acordeon-hohner-verde-esmeralda' },
  { img: '/images/personalizados/azul-corona.webp',    nombre: 'Azul con corona',      detalle: 'Azul nácar · corona blanca · botones blancos',                lugar: 'Cauca',        href: '/producto/acordeon-hohner-azul-con-corona' },
  { img: '/images/personalizados/acordeon-hohner-negro-xtreme-virgen-fuelle-corona-1.webp', nombre: 'Negro Xtreme con Virgen', detalle: 'Negro brillante · Virgen grabada · fuelle con corona', lugar: 'Georgia, USA', href: '/producto/acordeon-hohner-negro-xtreme-virgen-fuelle-corona' },
]

const OPCIONES = [
  { icono: 'destello',      titulo: 'Color y nácar',        texto: 'Rojo, azul, verde, morado, blanco, negro o bicolor. Acabado nacarado de aplicación manual con brillo profundo.' },
  { icono: 'acc-fuelle',    titulo: 'Fuelle a tu gusto',    texto: 'Negro clásico, blanco, dorado, tricolor Colombia o el diseño que nos envíes. Esquineros cromados o dorados.' },
  { icono: 'acc-parrilla',  titulo: 'Parrilla grabada',     texto: 'Corte láser con tu nombre, el de tu agrupación, escudo, virgen o bandera. Cromada, dorada o negra.' },
  { icono: 'acc-broche',    titulo: 'Botones y herrajes',   texto: 'Botones nacarados, negros, blancos o de colores. Herrajes, broches y correas a juego.' },
  { icono: 'estrella',      titulo: 'Corona y firma',       texto: 'Tu nombre, una fecha o una dedicatoria grabada en el cuerpo. La huella permanente del dueño.' },
  { icono: 'herramienta',   titulo: 'Afinación a medida',   texto: 'Tonalidad (GCF, ADG, FBbEb…), tremolo y afinación calibrada por nuestros maestros formados en Valledupar.' },
]

const PROCESO = [
  { n: '01', titulo: 'Nos cuentas tu idea', texto: 'Por WhatsApp: colores, tonalidad, nombre a grabar y referencias. Te asesoramos con fotos de trabajos reales.' },
  { n: '02', titulo: 'Diseño y aprobación', texto: 'Te enviamos el boceto o render 3D. Ajustamos hasta que sea exactamente lo que quieres.' },
  { n: '03', titulo: 'Taller',              texto: 'Un Hohner nuevo se desarma, se nacara, se graba y se ensambla pieza por pieza. 6 a 8 semanas.' },
  { n: '04', titulo: 'Afinación y entrega', texto: 'Se afina a mano, se prueba y viaja en estuche rígido con certificado. A cualquier ciudad o país.' },
]

const FAQ = [
  { p: '¿Cuánto cuesta un acordeón personalizado?', r: 'Depende del acordeón base (Corona II, Corona III, Rey Vallenato) y del nivel de personalización. Te cotizamos en minutos por WhatsApp con el diseño exacto que quieres.' },
  { p: '¿Cuánto tarda?', r: 'Entre 6 y 8 semanas desde la aprobación del diseño. Los trabajos sencillos (parrilla + fuelle) pueden estar en 2 semanas.' },
  { p: '¿Puedo personalizar mi propio acordeón?', r: 'Sí. Recibimos tu acordeón en Bogotá (o por envío desde cualquier ciudad), lo transformamos y lo devolvemos afinado. Muchos clientes renuevan su Hohner de años.' },
  { p: '¿Envían fuera de Colombia?', r: 'Sí. Hemos entregado en Estados Unidos, México, Chile, Ecuador, Panamá, Canadá y España, con embalaje rígido y seguro de tránsito.' },
  { p: '¿Cómo se paga?', r: 'Abono para iniciar el trabajo y saldo contra entrega o antes del despacho. Pagos por PSE, Nequi, tarjeta o transferencia.' },
]

export default function AcordeonesPersonalizados() {
  return (
    <main className="ap">
      {/* Hero */}
      <header className="ap-hero">
        <div className="ap-hero-inner">
          <div className="ap-hero-texto">
            <div className="ap-eyebrow">— Edición a la medida · Taller en Bogotá · Maestros de Valledupar</div>
            <h1 className="ap-display ap-h1">Tu acordeón,<br /><span className="ap-oro">diseñado contigo</span></h1>
            <p className="ap-lead">
              Elige color, nácar, fuelle, parrilla grabada, botones y afinación. Nosotros lo hacemos realidad sobre un
              Hohner nuevo, pieza por pieza, y te lo entregamos afinado en cualquier ciudad del mundo.
            </p>
            <div className="ap-ctas">
              <a href={wa('Hola, quiero diseñar mi acordeón personalizado')} target="_blank" rel="noopener noreferrer" className="ap-btn ap-btn-oro">
                <Icono nombre="whatsapp" tamaño={15} /> Diseñar el mío
              </a>
              <a href="#galeria" className="ap-btn ap-btn-ghost">Ver diseños entregados</a>
              <Link href="/landingdelujo" className="ap-btn ap-btn-link"><Icono nombre="destello" tamaño={14} /> Experiencia 3D</Link>
            </div>
            <ul className="ap-stats">
              <li><strong>+400</strong><span>acordeones únicos</span></li>
              <li><strong>25</strong><span>años de oficio</span></li>
              <li><strong>6–8</strong><span>semanas de entrega</span></li>
            </ul>
          </div>
          <div className="ap-hero-visual">
            <div className="ap-halo" />
            <Image src="/images/personalizados/premium-nacar.webp" alt="Acordeón Hohner personalizado nacarado con fuelle dorado" width={1000} height={760} priority sizes="(max-width: 960px) 86vw, 44vw" className="ap-hero-img" />
            <span className="ap-tag ap-tag-1">Nácar blanco</span>
            <span className="ap-tag ap-tag-2">Fuelle dorado</span>
            <span className="ap-tag ap-tag-3">Botones nacarados</span>
          </div>
        </div>
      </header>

      {/* Galería */}
      <section className="ap-seccion" id="galeria">
        <div className="ap-cabecera">
          <div>
            <div className="ap-eyebrow">— Diseños entregados</div>
            <h2 className="ap-display ap-h2">Cada uno <span className="ap-oro">irrepetible</span></h2>
          </div>
          <p className="ap-sub">Fotos reales de acordeones que salieron del taller. Toca uno y pídelo igual o con tus cambios.</p>
        </div>
        <div className="ap-galeria">
          {GALERIA.map((g) => (
            // Cada diseño abre su ficha de producto (precio, fotos, compra); el WhatsApp queda en los CTAs.
            <Link key={g.nombre} href={g.href} className="ap-obra">
              <div className="ap-obra-visual"><Image src={g.img} alt={`Acordeón personalizado ${g.nombre}`} width={600} height={520} sizes="(max-width: 700px) 90vw, 320px" /></div>
              <div className="ap-obra-info">
                <h3>{g.nombre}</h3>
                <p>{g.detalle}</p>
                <span><Icono nombre="pin" tamaño={11} /> Entregado en {g.lugar} · Ver ficha</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Opciones */}
      <section className="ap-seccion ap-seccion--suave">
        <div className="ap-cabecera">
          <div>
            <div className="ap-eyebrow">— Qué puedes personalizar</div>
            <h2 className="ap-display ap-h2">Todo, <span className="ap-oro">menos el sonido Hohner</span></h2>
          </div>
        </div>
        <div className="ap-opciones">
          {OPCIONES.map((o) => (
            <article key={o.titulo} className="ap-opcion">
              <span className="ap-opcion-icono"><Icono nombre={o.icono as any} tamaño={22} /></span>
              <h3>{o.titulo}</h3>
              <p>{o.texto}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Proceso */}
      <section className="ap-seccion">
        <div className="ap-cabecera">
          <div>
            <div className="ap-eyebrow">— Cómo funciona</div>
            <h2 className="ap-display ap-h2">De la idea <span className="ap-oro">a tus manos</span></h2>
          </div>
        </div>
        <ol className="ap-proceso">
          {PROCESO.map((p) => (
            <li key={p.n} className="ap-paso">
              <span className="ap-paso-num">{p.n}</span>
              <h3>{p.titulo}</h3>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Reels */}
      <section className="ap-seccion ap-seccion--suave">
        <ReelsInstagram limite={8} titulo="Personalizados en acción" filtro={['personaliz', 'diseñ', 'custom', 'nácar', 'nacar']} />
      </section>

      {/* FAQ */}
      <section className="ap-seccion" id="preguntas">
        <div className="ap-cabecera">
          <div>
            <div className="ap-eyebrow">— Preguntas frecuentes</div>
            <h2 className="ap-display ap-h2">Antes de <span className="ap-oro">empezar</span></h2>
          </div>
        </div>
        <div className="ap-faq">
          {FAQ.map((f) => (
            <details key={f.p} className="ap-faq-item">
              <summary>{f.p}<Icono nombre="chevron-abajo" tamaño={16} /></summary>
              <p>{f.r}</p>
            </details>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="ap-final">
        <div>
          <div className="ap-eyebrow">— Empecemos</div>
          <h2 className="ap-display ap-h2">Cuéntanos <span className="ap-oro">cómo lo sueñas</span></h2>
          <p>Un mensaje con tus colores y tu nombre basta. Te respondemos con fotos reales y cotización en minutos.</p>
          <div className="ap-ctas">
            <a href={wa('Hola, quiero cotizar un acordeón personalizado')} target="_blank" rel="noopener noreferrer" className="ap-btn ap-btn-oro"><Icono nombre="whatsapp" tamaño={15} /> Cotizar por WhatsApp</a>
            <Link href="/accesorios/parrillas-de-acordeon" className="ap-btn ap-btn-ghost">Sólo quiero una parrilla grabada</Link>
          </div>
        </div>
        <Image src="/images/hero/rojo-xtreme.webp" alt="Acordeón Hohner rojo personalizado" width={700} height={640} sizes="(max-width: 900px) 70vw, 380px" className="ap-final-img" />
      </section>
    </main>
  )
}
