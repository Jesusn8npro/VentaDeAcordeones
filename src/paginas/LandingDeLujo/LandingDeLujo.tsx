'use client'
import * as React from 'react'
import dynamic from 'next/dynamic'
import { PIELES } from './coreografia'
import { crearEscenario } from './escenarioScroll'
import './sistema.css'
import './LandingDeLujo.css'

// El lienzo 3D sólo existe en el navegador (WebGL) y pesa lo suyo: se carga aparte del HTML para que
// el texto y los CTA se pinten y sean indexables sin esperar a three.
const EscenaAcordeon = dynamic(() => import('./EscenaAcordeon'), { ssr: false })
// Ballpit monta su PROPIO WebGLRenderer. Se carga sólo cuando su sección asoma: dos contextos WebGL
// vivos desde el principio es justo lo que tumba un móvil.
const Ballpit = dynamic(() => import('./Ballpit'), { ssr: false })

/** ¿Este navegador puede con WebGL? Si no, se sirve la versión plana en vez de un hueco negro. */
function hayWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

// Colores de las bolas de la vitrina: el nácar rojo vino, el oro de la filigrana y el negro perla.
const BOLAS = [0x1a1a1f, 0xc0182b, 0xd8b26a, 0xf3ede2]

/** Aparición al entrar en pantalla — el equivalente al `.reveal` + IntersectionObserver del original. */
function Revela({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [dentro, setDentro] = React.useState(false)
  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setDentro(true); io.disconnect() } },
      { threshold: 0.18 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <div ref={ref} className={`reveal ${dentro ? 'in' : ''} ${className}`}>{children}</div>
}

export default function LandingDeLujo() {
  const capaRef = React.useRef<HTMLDivElement>(null)
  const vitrinaRef = React.useRef<HTMLDivElement>(null)
  const avanceRef = React.useRef(0)

  const [soporta3D, setSoporta3D] = React.useState<boolean | null>(null)
  const [reducida, setReducida] = React.useState(false)
  const [compacto, setCompacto] = React.useState(false)
  const [cargado, setCargado] = React.useState(false)
  const [piel, setPiel] = React.useState(0)
  const [menu, setMenu] = React.useState(false)
  const [bolasVivas, setBolasVivas] = React.useState(false)

  React.useEffect(() => {
    setSoporta3D(hayWebGL())
    const mqMov = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mqPeq = window.matchMedia('(max-width: 880px)')
    const leer = () => { setReducida(mqMov.matches); setCompacto(mqPeq.matches) }
    leer()
    mqMov.addEventListener('change', leer)
    mqPeq.addEventListener('change', leer)
    return () => { mqMov.removeEventListener('change', leer); mqPeq.removeEventListener('change', leer) }
  }, [])

  // Motor del acordeón cinemático. En vertical la capa deja de viajar (el original directamente la
  // borra en móvil): el acordeón se queda en el hero y sólo cruza las pieles con el scroll, que es
  // lo único que se puede lucir sin taparle el texto a una pantalla estrecha.
  React.useEffect(() => {
    if (soporta3D !== true) return
    return crearEscenario({
      capa: compacto || reducida ? null : capaRef.current,
      alAvanzar: (p) => { avanceRef.current = p },
    })
  }, [soporta3D, compacto, reducida])

  React.useEffect(() => {
    const el = vitrinaRef.current
    if (!el || soporta3D !== true) return
    const io = new IntersectionObserver(([e]) => setBolasVivas(e.isIntersecting), { rootMargin: '60% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [soporta3D])

  const alListo = React.useCallback(() => setCargado(true), [])
  const lienzo = soporta3D === true && (
    <EscenaAcordeon avanceRef={avanceRef} animacionReducida={reducida} onListo={alListo} onPiel={setPiel} />
  )

  return (
    <div className="apm">
      {/* ===== ACORDEÓN CINEMÁTICO (capa fija tras el contenido) ===== */}
      {!compacto && (
        <div className="accstage" aria-hidden="true">
          <div className="accstage-inner" ref={capaRef}>
            <span className="accstage-halo" />
            {lienzo}
          </div>
        </div>
      )}

      {/* ===== NAV ===== */}
      <nav className="topnav">
        <div className="topnav-in">
          <a className="brand" href="/">
            <span className="mark"><b>A</b></span>
            <span className="name">
              <span className="t">Acordeones a la medida</span>
              <span className="s">Taller Academia Vallenata</span>
            </span>
          </a>
          <button className="navtoggle" aria-label="Menú" onClick={() => setMenu((v) => !v)}>☰</button>
          <div className={`navlinks${menu ? ' open' : ''}`}>
            <a href="#que-es">Qué es</a>
            <a href="#como">Cómo se hace</a>
            <a href="#acabados">Acabados</a>
            <a href="/acordeon-360">Personalizador</a>
            <a href="#cotizar" className="cta">Cotizar el mío ↗</a>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <header className="hero">
        <div className="gridlines" />
        <div className="wrap-wide">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="kicker">Taller propio · Hecho en Colombia</div>
              <h1>El acordeón que ya<br />tienes <em>en la cabeza</em>,<br />hecho <span className="cy">de verdad</span>.</h1>
              <p className="sub">
                Nácar, herrajes, fuelle y hasta el color de cada botón: tú los eliges. Te mandamos el
                <b> diseño en 3D</b> antes de tocar una sola pieza y lo afinamos <b>nota por nota</b> antes
                de despacharlo. Sin catálogo cerrado y sin calcomanías.
              </p>
              <div className="hero-cta">
                <a href="#cotizar" className="btn btn-gold">Cotizar el mío →</a>
                <a href="/acordeon-360" className="btn btn-cyan">Abrir el personalizador</a>
              </div>
              <div className="hero-chips">
                <span className="chip cy"><span className="dot" />Diseño en 3D antes de fabricar</span>
                <span className="chip">Afinación revisada</span>
                <span className="chip">Envío a todo el país</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="ring" /><div className="ring" /><div className="ring" />
              {/* En vertical la capa fija no existe: el lienzo se monta AQUÍ, dentro del hero, para
                  que el móvil también vea el acordeón en 3D sin cruzarse con el texto. */}
              {compacto && <div className="hero-lienzo">{lienzo}</div>}
              {soporta3D === false && (
                <img className="acc" src="/Acordeon PRO MAX.webp" alt="Acordeón personalizado" />
              )}
              <span className="badge b1">◆ {PIELES[piel].nombre}</span>
              <span className="badge b2">⟡ Modelo 3D real</span>
              <span className="badge b3">✦ Edición a la medida</span>
            </div>
          </div>
        </div>
        {soporta3D === true && !cargado && (
          <div className="cargando" role="status"><span className="aro" />Armando tu acordeón…</div>
        )}
      </header>

      <div className="divider" />

      {/* ===== 01 · QUÉ ES ===== */}
      <section id="que-es">
        <div className="wrap">
          <Revela>
            <div className="sec-head">
              <div className="sec-num">01 — QUÉ ES</div>
              <h2>No es un acordeón de catálogo. Es <em>el tuyo</em>.</h2>
              <p>
                Partimos de un instrumento afinado de verdad y lo vestimos pieza por pieza con lo que
                pidas. Cuatro decisiones tuyas, un solo acordeón.
              </p>
            </div>
          </Revela>
          <Revela>
            <div className="pillars">
              <div className="pillar"><span className="ic">🐚</span><div className="n">Nácar</div><div className="d">22 acabados reales</div></div>
              <div className="pillar"><span className="ic">🎨</span><div className="n">Color</div><div className="d">Entero · bicolor · tricolor</div></div>
              <div className="pillar"><span className="ic">⚙️</span><div className="n">Herrajes</div><div className="d">Cromo · oro · acero</div></div>
              <div className="pillar"><span className="ic">🎵</span><div className="n">Afinación</div><div className="d">Nota por nota</div></div>
            </div>
          </Revela>
        </div>
      </section>

      {/* ===== 02 · CÓMO SE HACE ===== */}
      <section id="como">
        <div className="wrap">
          <Revela>
            <div className="sec-head">
              <div className="sec-num">02 — CÓMO SE HACE</div>
              <h2>Lo ves en 3D. <span className="cy">Después existe.</span></h2>
              <p>La decisión que le quita el riesgo a encargar un acordeón: nadie corta nácar hasta que tú digas que sí.</p>
            </div>
          </Revela>

          <Revela>
            <div className="glass panelbig">
              <div className="panel-titulo">Primero se diseña, después se fabrica</div>
              <p className="panel-texto">
                Nos cuentas la idea — un color, una foto, un acordeón que viste en tarima. La montamos
                sobre el modelo 3D real del instrumento, con el mismo nácar y los mismos herrajes que
                van a ir puestos. Cuando el render te enamora, y sólo entonces, entra al taller.
              </p>

              <div className="flowrow">
                <div className="card flowcard">
                  <div className="flow-lab">Paso 01</div>
                  <div className="flow-tit">Tu idea</div>
                  <div className="flow-txt">Un color, una foto o una referencia de tarima</div>
                </div>
                <div className="card flowcard">
                  <div className="flow-lab">Paso 02</div>
                  <div className="flow-tit">Render 3D</div>
                  <div className="flow-txt">El acordeón exacto, girando, antes de existir</div>
                </div>
                <div className="card flowcard flowcard--cy">
                  <div className="flow-lab cy">Paso 03</div>
                  <div className="flow-tit">Taller</div>
                  <div className="flow-txt">Se viste, se hornea, se sella y se afina</div>
                </div>
              </div>

              <div className="grid4 mini">
                <div className="card mini-card"><span className="mini-ic">📐</span><span className="mini-lab">Diseño 3D</span></div>
                <div className="card mini-card"><span className="mini-ic">🐚</span><span className="mini-lab">Corte de nácar</span></div>
                <div className="card mini-card"><span className="mini-ic">🔧</span><span className="mini-lab">Herrajes</span></div>
                <div className="card mini-card"><span className="mini-ic">🎼</span><span className="mini-lab">Afinación</span></div>
              </div>

              <div className="keypoint cy panel-key">
                <b>Por qué se puede prometer:</b> el render sale del mismo modelo 3D que usa nuestro
                personalizador, con las texturas de nácar reales del material que compramos. Lo que ves
                girando en esta página es literalmente el acordeón que se arma.
              </div>
            </div>
          </Revela>
        </div>
      </section>

      {/* ===== 03 · ACABADOS ===== */}
      <section id="acabados">
        <div className="wrap">
          <Revela>
            <div className="sec-head">
              <div className="sec-num">03 — ACABADOS</div>
              <h2>El nácar que va puesto, <em>no una foto parecida</em>.</h2>
              <p>Estos son los acabados que va recorriendo el acordeón mientras bajas. Todos existen y todos se pueden pedir.</p>
            </div>
          </Revela>

          <Revela>
            <div className="acabados">
              {PIELES.map((p, i) => (
                <div key={p.id} className={`acabado${i === piel ? ' activo' : ''}`}>
                  <span
                    className="acabado-img"
                    style={{ backgroundImage: `url(/showroom/pieles/${p.id}/cuerpo_base.webp)` }}
                  />
                  <div className="acabado-txt">
                    <b>{p.nombre}</b>
                    <span>Ref. {p.id.padStart(2, '0')}</span>
                  </div>
                </div>
              ))}
            </div>
          </Revela>

          <Revela>
            <div className="vitrina" ref={vitrinaRef}>
              <span className="vitrina-lab">Nácares del taller</span>
              <div className="vitrina-caja">
                {bolasVivas && !reducida && soporta3D === true && (
                  <Ballpit
                    // El área total de las bolas se ajusta a la de la caja: pasarse las apelotona en
                    // una columna y quedarse corto deja huecos. La fricción va cerca de 1 a propósito
                    // — con valores bajos los impulsos de separación mueren en dos frames y las bolas
                    // se quedan amontonadas sin repartirse.
                    count={90}
                    gravity={0.5}
                    friction={0.995}
                    wallBounce={0.92}
                    followCursor
                    colors={BOLAS}
                    minSize={0.9}
                    maxSize={1.8}
                    ambientIntensity={0.55}
                    lightIntensity={130}
                  />
                )}
              </div>
              <span className="vitrina-lab tenue">Mueve el cursor por encima</span>
            </div>
          </Revela>
        </div>
      </section>

      {/* ===== 04 · POR QUÉ CON NOSOTROS ===== */}
      <section id="garantia">
        <div className="wrap">
          <Revela>
            <div className="sec-head">
              <div className="sec-num">04 — POR QUÉ CON NOSOTROS</div>
              <h2>Taller propio, <em>no reventa</em>.</h2>
              <p>No somos una tienda que importa cajas cerradas. El acordeón se arma, se viste y se afina aquí.</p>
            </div>
          </Revela>

          <Revela>
            <div className="navcards">
              <a className="navcard cy" href="/acordeon-360">
                <span className="glow" />
                <div className="nc-num">PASO 01 · DISEÑO</div>
                <span className="go">↗</span>
                <h3>🎛️ Personalizador 3D</h3>
                <p>Gíralo, cámbiale el nácar, pinta cada sección y guarda tu diseño. Lo que armes ahí es lo que cotizamos.</p>
              </a>
              <a className="navcard" href="#cotizar">
                <span className="glow" />
                <div className="nc-num">PASO 02 · COTIZACIÓN</div>
                <span className="go">↗</span>
                <h3>🧾 Precio cerrado</h3>
                <p>Un solo número, con envío incluido y sin sorpresas a mitad de camino. Se puede pagar por partes.</p>
              </a>
              <a className="navcard vi" href="/cursos">
                <span className="glow" />
                <div className="nc-num">PASO 03 · APRENDIZAJE</div>
                <span className="go">↗</span>
                <h3>🎓 Cursos incluidos</h3>
                <p>Tu acordeón llega con acceso a la academia: desde cero hasta tocar en tarima, con acompañamiento.</p>
              </a>
              <a className="navcard gr" href="/contacto">
                <span className="glow" />
                <div className="nc-num">PASO 04 · ENTREGA</div>
                <span className="go">↗</span>
                <h3>📦 A tu puerta</h3>
                <p>Empaque rígido, revisión de afinación firmada y soporte directo con el taller después de recibirlo.</p>
              </a>
            </div>
          </Revela>

          <Revela className="chip-fila">
            <span className="chip"><span className="dot" style={{ background: 'var(--green)' }} />Cupos abiertos para este mes</span>
          </Revela>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer id="cotizar">
        <div className="wrap">
          <div className="big">&ldquo;El acordeón no se escoge de una lista. Se manda a hacer.&rdquo;</div>
          <p>
            Escríbenos con lo que tengas en mente y te devolvemos el diseño en 3D y el precio cerrado
            antes de empezar. Si no te enamora, se cambia hasta que lo haga.
          </p>
          <div className="ftlinks">
            <a href="/contacto" className="btn btn-gold">Pedir mi diseño</a>
            <a href="/acordeon-360" className="btn btn-ghost">Personalizador</a>
            <a href="/cursos" className="btn btn-ghost">Cursos</a>
          </div>
          <div className="stamp">Academia Vallenata Online · Taller de acordeones a la medida</div>
        </div>
      </footer>
    </div>
  )
}
