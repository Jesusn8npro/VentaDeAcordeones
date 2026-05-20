import { useEffect } from 'react'
import { useTituloPagina } from '../../hooks/useTitulosPagina'
import AcordeonSvg from './AcordeonSvg'
import './AcordeonesPersonalizados.css'

const WA = '573208492093'
const WA_PERSONALIZADO = `https://wa.me/${WA}?text=Hola%2C%20quiero%20un%20acorde%C3%B3n%20personalizado`
const WA_COTIZAR = `https://wa.me/${WA}?text=Hola%2C%20quiero%20cotizar%20un%20acorde%C3%B3n%20personalizado`

function ImagenSlot({ placeholder }: { placeholder: string }) {
  return (
    <div className="ap-imagen-slot">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/>
        <circle cx="8.5" cy="8.5" r="1.5"/>
        <path d="m21 15-5-5L5 21"/>
      </svg>
      <span>{placeholder}</span>
    </div>
  )
}

const IconoWA = () => (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.5 3.5A11.7 11.7 0 003.2 19.3L2 22l2.8-1.1A11.7 11.7 0 1020.5 3.5zM12 20.2c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-2.9.8.8-2.8-.2-.3A9.7 9.7 0 1112 20.2zm5.6-7.3c-.3-.2-1.8-.9-2.1-1s-.5-.1-.7.2-.8 1-1 1.2-.4.2-.7 0c-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.3-.4.4-.6s.1-.4 0-.6c0-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.4c.2.2 2.5 3.8 6 5.3.8.4 1.5.6 2 .8.8.3 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.5-.3z"/>
  </svg>
)

const CAPTIONS = [
  { stage: 1, kicker: 'Etapa 01 · Base',    title: <>Rey<br/>Vallenato.</>,          body: 'Partimos de un acordeón de competencia, calibrado nota por nota. La materia prima de una pieza que será irrepetible.' },
  { stage: 2, kicker: 'Etapa 02 · Cuerpo',  title: <>Acabado<br/><em>nacarado.</em></>, body: 'El cuerpo se recubre con un acabado nacarado de aplicación manual. Brillo profundo, textura de joya, color a elección.' },
  { stage: 3, kicker: 'Etapa 03 · Grilla',  title: <>Grilla<br/><em>dorada.</em></>,  body: 'Se monta una grilla dorada calada a mano. Cada perforación dibuja la firma visual que diferencia tu instrumento.' },
  { stage: 4, kicker: 'Etapa 04 · Grabado', title: <>Tu<br/><em>nombre.</em></>,       body: 'Grabamos a buril tu nombre, una fecha o una dedicatoria sobre el cuerpo. Es la huella permanente del dueño.' },
  { stage: 5, kicker: 'Etapa 05 · Entrega', title: <>Pieza<br/><em>única.</em></>,     body: 'El acordeón se entrega en estuche de presentación con certificado de autenticidad. Un objeto que ya solo le pertenece a ti.' },
]

const GALERIA = [
  { feat: true,  placeholder: 'DISEÑO FEATURED · ACORDEÓN NEGRO Y ORO', tag: 'Edición #018', nombre: 'El Cacique', year: '2025' },
  { feat: false, placeholder: 'ACORDEÓN BLANCO NACARADO',                tag: 'Edición #015', nombre: 'Marfil',     year: '2025' },
  { feat: false, placeholder: 'ACORDEÓN ROJO BURDEOS',                   tag: 'Edición #012', nombre: 'Burdeos',    year: '2024' },
  { feat: false, placeholder: 'ACORDEÓN AZUL CON GRILLA DORADA',         tag: 'Edición #009', nombre: 'Cobalto',    year: '2024' },
  { feat: false, placeholder: 'ACORDEÓN VERDE ESMERALDA',                tag: 'Edición #007', nombre: 'Esmeralda',  year: '2023' },
]

const STATS = [['38', 'Años de oficio'], ['+420', 'Acordeones únicos'], ['12', 'Reyes Vallenatos']]

export default function AcordeonesPersonalizados() {
  useTituloPagina('Acordeones Personalizados')

  useEffect(() => {
    window.scrollTo(0, 0)

    // Nav scrolled
    const nav = document.getElementById('ap-nav')
    const onNavScroll = () => {
      if (window.scrollY > 20) nav?.classList.add('scrolled')
      else nav?.classList.remove('scrolled')
    }
    window.addEventListener('scroll', onNavScroll, { passive: true })

    // Scrollytelling
    const stageEl    = document.querySelector('.ap-stage') as HTMLElement
    const svgEl      = document.getElementById('ap-accordionSvg') as HTMLElement
    const cards      = Array.from(document.querySelectorAll('.ap-caption-card')) as HTMLElement[]
    const heroLeft   = document.getElementById('ap-heroLeft')
    const stageNum   = document.getElementById('ap-stageNum')
    const rail       = document.querySelectorAll('#ap-progress .ap-progress-rail span')
    const progLabel  = document.getElementById('ap-progressLabel')
    const frame      = document.getElementById('ap-productFrame')
    const labels     = ['Base', 'Cuerpo', 'Grilla', 'Grabado', 'Entrega']

    const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

    const onScroll = () => {
      if (!stageEl) return
      const rect = stageEl.getBoundingClientRect()
      const vh = window.innerHeight
      const total = rect.height - vh
      const scrolled = clamp(-rect.top, 0, total)
      const prog = total > 0 ? scrolled / total : 0
      const idx = clamp(Math.floor(prog * 5), 0, 4)

      if (svgEl && svgEl.dataset.stage !== String(idx)) svgEl.dataset.stage = String(idx)

      const heroVis = clamp(1 - prog * 5, 0, 1)
      if (heroLeft) {
        heroLeft.style.opacity = String(heroVis)
        heroLeft.style.pointerEvents = heroVis < 0.1 ? 'none' : 'auto'
        heroLeft.style.transform = `translateY(-50%) translateX(${(1 - heroVis) * -20}px)`
      }

      cards.forEach(c => {
        const cs = parseInt(c.dataset.stage ?? '0', 10) - 1
        c.classList.toggle('is-active', cs === idx && prog > 0.05)
      })

      if (stageNum)  stageNum.textContent = String(idx + 1).padStart(2, '0') + ' / 05'
      if (progLabel) progLabel.textContent = labels[idx]
      rail.forEach((b, i) => (b as HTMLElement).classList.toggle('is-on', i <= idx))
      if (frame) frame.style.transform = `scale(${1 + prog * 0.04})`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    onScroll()

    // Reveal on scroll
    const io = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in') }),
      { threshold: 0.12 }
    )
    document.querySelectorAll('.ap-reveal').forEach(el => io.observe(el))

    // Gold button cursor shine
    const onMouseMove = (e: Event) => {
      const btn = e.currentTarget as HTMLElement
      const me = e as MouseEvent
      const r = btn.getBoundingClientRect()
      btn.style.setProperty('--mx', ((me.clientX - r.left) / r.width * 100) + '%')
      btn.style.setProperty('--my', ((me.clientY - r.top) / r.height * 100) + '%')
    }
    const goldBtns = document.querySelectorAll('.ap-btn-gold')
    goldBtns.forEach(b => b.addEventListener('mousemove', onMouseMove))

    return () => {
      window.removeEventListener('scroll', onNavScroll)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      io.disconnect()
      goldBtns.forEach(b => b.removeEventListener('mousemove', onMouseMove))
    }
  }, [])

  return (
    <div className="ap-landing">

      {/* ── NAV ── */}
      <nav className="ap-nav" id="ap-nav">
        <div className="ap-brand">
          <span className="ap-brand-mark" />
          <span className="ap-brand-name">VENTADE<b>ACORDEONES</b>.COM</span>
        </div>
        <div className="ap-nav-links">
          <a href="#ap-proceso">Proceso</a>
          <a href="#ap-beneficios">Beneficios</a>
          <a href="#ap-disenos">Diseños</a>
          <a href="#ap-historia">Historia</a>
        </div>
        <a className="ap-nav-cta" href={WA_PERSONALIZADO} target="_blank" rel="noopener">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.5 14.4l-2.4-1.2c-.3-.1-.7-.1-.9.2l-.9 1.1c-.2.2-.5.3-.7.2-1-.4-2.4-1.6-3.2-2.4-.8-.8-2-2.2-2.4-3.2-.1-.3 0-.5.2-.7l1.1-.9c.3-.2.4-.6.2-.9L7.6 4.5c-.2-.4-.7-.5-1-.3l-1.4 1c-.5.3-.7.9-.7 1.4.2 1.7 1 4 3.3 6.3 2.3 2.3 4.6 3.1 6.3 3.3.5.1 1.1-.2 1.4-.7l1-1.4c.2-.3.1-.8-.3-1z"/>
          </svg>
          Comprar por WhatsApp
        </a>
      </nav>

      {/* ── HERO + SCROLLYTELLING ── */}
      <div className="ap-stage" id="ap-proceso">
        <div className="ap-sticky">
          <div className="ap-spotlight" />
          <div className="ap-floor-line" />

          <div className="ap-meta">
            <span className="ap-dot" />
            <span>Fabricación Artesanal</span>
            <span>·</span>
            <span className="ap-stage-num" id="ap-stageNum">00 / 05</span>
          </div>

          {/* Hero copy — visible solo en stage 0 */}
          <div className="ap-hero-left" id="ap-heroLeft">
            <div className="ap-hero-eyebrow">Edición a la medida</div>
            <h1 className="ap-hero-title">Tu acordeón<em>único.</em></h1>
            <p className="ap-hero-body">
              Acordeones Rey Vallenato personalizados pieza por pieza. Acabados nacarados,
              grillas doradas y grabados a mano. Cada uno es irrepetible.
            </p>
            <div className="ap-hero-actions">
              <a className="ap-btn-gold" href={WA_PERSONALIZADO} target="_blank" rel="noopener">
                <IconoWA />
                Comprar por WhatsApp
              </a>
              <a className="ap-btn-ghost" href="#ap-disenos">
                Ver diseños
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Acordeón SVG animado */}
          <AcordeonSvg />

          {/* Captions etapas */}
          <div className="ap-caption">
            <div className="ap-caption-stack">
              {CAPTIONS.map(({ stage, kicker, title, body }) => (
                <article key={stage} className="ap-caption-card" data-stage={stage}>
                  <div className="ap-cap-kicker">{kicker}</div>
                  <h2 className="ap-cap-title">{title}</h2>
                  <p className="ap-cap-body">{body}</p>
                </article>
              ))}
            </div>
          </div>

          {/* Indicador de progreso */}
          <div className="ap-progress" id="ap-progress">
            <div className="ap-progress-rail">
              {[0,1,2,3,4].map(i => <span key={i}/>)}
            </div>
            <span className="ap-progress-label" id="ap-progressLabel">Base</span>
          </div>

          <div className="ap-scroll-hint">
            Desliza para personalizar
            <span className="ap-line"/>
          </div>
        </div>
      </div>

      {/* ── BENEFICIOS ── */}
      <section className="ap-block" id="ap-beneficios">
        <div className="ap-section-head ap-reveal">
          <div>
            <div className="ap-section-eyebrow">Por qué elegirnos</div>
            <h2 className="ap-section-title">Hecho para <em>durar.</em></h2>
          </div>
          <p className="ap-section-sub">Cuatro principios que rigen cada acordeón que sale de nuestro taller. Sin atajos, sin compromisos.</p>
        </div>
        <div className="ap-benefits ap-reveal">
          <div className="ap-benefit">
            <div className="ap-b-num">01</div>
            <svg className="ap-b-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <circle cx="24" cy="24" r="20"/><circle cx="24" cy="24" r="12"/><circle cx="24" cy="24" r="4" fill="currentColor"/>
            </svg>
            <h3 className="ap-b-title">100% Personalizado</h3>
            <p className="ap-b-body">Cada pieza se diseña contigo: color, grilla, grabado y detalles. Ningún acordeón sale igual a otro.</p>
          </div>
          <div className="ap-benefit">
            <div className="ap-b-num">02</div>
            <svg className="ap-b-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <path d="M24 4v40M4 24h40"/><rect x="14" y="14" width="20" height="20" transform="rotate(45 24 24)"/>
            </svg>
            <h3 className="ap-b-title">Sonido Rey Vallenato</h3>
            <p className="ap-b-body">Calibrado por afinadores con experiencia en festivales. La precisión sonora nunca se sacrifica por la estética.</p>
          </div>
          <div className="ap-benefit">
            <div className="ap-b-num">03</div>
            <svg className="ap-b-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <path d="M24 4l5 14h15l-12 9 5 16-13-9-13 9 5-16-12-9h15z"/>
            </svg>
            <h3 className="ap-b-title">Acabados de Lujo</h3>
            <p className="ap-b-body">Lacados nacarados, grillas en latón dorado, herrajes pulidos. Calidad de joyería aplicada al instrumento.</p>
          </div>
          <div className="ap-benefit">
            <div className="ap-b-num">04</div>
            <svg className="ap-b-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
              <rect x="8" y="8" width="32" height="32"/><path d="M16 24l6 6 12-12"/>
            </svg>
            <h3 className="ap-b-title">Garantía de por Vida</h3>
            <p className="ap-b-body">Soporte técnico, mantenimiento y afinación garantizados mientras el instrumento esté en tus manos.</p>
          </div>
        </div>
      </section>

      {/* ── DISEÑOS ── */}
      <section className="ap-block" id="ap-disenos">
        <div className="ap-section-head ap-reveal">
          <div>
            <div className="ap-section-eyebrow">Diseños realizados</div>
            <h2 className="ap-section-title">El archivo del <em>taller.</em></h2>
          </div>
          <p className="ap-section-sub">Una selección de acordeones únicos entregados a artistas, coleccionistas y reyes vallenatos.</p>
        </div>
        <div className="ap-gallery ap-reveal">
          {GALERIA.map(({ feat, placeholder, tag, nombre, year }) => (
            <div key={nombre} className={`ap-gallery-item${feat ? ' feat' : ''}`}>
              <ImagenSlot placeholder={placeholder}/>
              <div className="ap-g-meta">
                <div>
                  <div className="ap-g-tag">{tag}</div>
                  <div className="ap-g-name">{nombre}</div>
                </div>
                <div className="ap-g-tag">{year}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HISTORIA ── */}
      <section className="ap-block ap-historia" id="ap-historia">
        <div className="ap-story">
          <div className="ap-story-img ap-reveal">
            <ImagenSlot placeholder="MAESTRO LUTHIER EN TALLER · BLANCO Y NEGRO"/>
            <div className="ap-stamp">Taller · Valledupar</div>
          </div>
          <div className="ap-story-content ap-reveal">
            <div className="ap-section-eyebrow">Nuestra historia</div>
            <h2>Tres generaciones<br/>tras una <em>misma nota.</em></h2>
            <p>Comenzamos como un pequeño taller en Valledupar en 1987, atendiendo a los músicos que llegaban antes del Festival a pedir afinaciones. Lo que empezó siendo servicio técnico se convirtió, con los años, en una obsesión por construir el acordeón perfecto.</p>
            <p>Hoy fabricamos por encargo. Cada cliente nos visita o nos escribe, conversamos sobre el sonido, el color, el grabado, el momento de su vida que el instrumento debe acompañar. Después, lo construimos como si fuera para nosotros mismos.</p>
            <div className="ap-story-stats">
              {STATS.map(([num, label]) => (
                <div key={label}>
                  <div className="ap-stat-num">{num}</div>
                  <div className="ap-stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="ap-cta ap-reveal">
        <div className="ap-cta-eyebrow">Hagamos el tuyo</div>
        <h2>Empieza tu<br/><em>acordeón hoy.</em></h2>
        <p>Cuéntanos por WhatsApp cómo lo imaginas. En menos de 24 horas te enviamos un boceto, presupuesto y tiempos de entrega. Sin compromiso.</p>
        <a className="ap-btn-gold" href={WA_COTIZAR} target="_blank" rel="noopener">
          <IconoWA/>
          Hablar por WhatsApp
        </a>
        <div className="ap-cta-meta">
          <span>Envíos a toda Colombia</span>
          <span>Pagos en cuotas</span>
          <span>Certificado de autenticidad</span>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ap-footer">
        <div className="ap-foot-row">
          <div className="ap-brand">
            <span className="ap-brand-mark"/>
            <span className="ap-brand-name">VENTADE<b>ACORDEONES</b>.COM</span>
          </div>
          <div className="ap-foot-nav">
            <a href="#ap-proceso">Proceso</a>
            <a href="#ap-beneficios">Beneficios</a>
            <a href="#ap-disenos">Diseños</a>
            <a href="#ap-historia">Historia</a>
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener">WhatsApp</a>
          </div>
        </div>
        <div className="ap-foot-bottom">
          <span>© 2026 ventadeacordeones.com</span>
          <span>Valledupar · Colombia</span>
          <span>Fabricación artesanal · Edición limitada</span>
        </div>
      </footer>

      {/* ── Botón flotante WhatsApp ── */}
      <a className="ap-wa-float" href={WA_PERSONALIZADO} target="_blank" rel="noopener" aria-label="WhatsApp">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.5 3.5A11.7 11.7 0 003.2 19.3L2 22l2.8-1.1A11.7 11.7 0 1020.5 3.5zM12 20.2c-1.7 0-3.4-.5-4.8-1.3l-.3-.2-2.9.8.8-2.8-.2-.3A9.7 9.7 0 1112 20.2zm5.6-7.3c-.3-.2-1.8-.9-2.1-1s-.5-.1-.7.2-.8 1-1 1.2-.4.2-.7 0c-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.3-.4.4-.6s.1-.4 0-.6c0-.2-.7-1.7-1-2.3-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.1-1.2 2.8s1.2 3.2 1.4 3.4c.2.2 2.5 3.8 6 5.3.8.4 1.5.6 2 .8.8.3 1.6.2 2.2.1.7-.1 2-.8 2.3-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.5-.3z"/>
        </svg>
      </a>

    </div>
  )
}
