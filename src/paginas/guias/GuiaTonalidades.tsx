'use client'

// Guía de compra: qué tonalidad de acordeón elegir (/guia-tonalidades).
// Es la duda que frena la primera compra, así que la página está armada para resolverla rápido:
// respuesta corta arriba, tabla comparable, ficha por tonalidad con enlace al catálogo real,
// y sólo después la teoría. Todo el copy verificable vive en datosTonalidades.ts.

import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'
import { NUMERO_WA } from '@/datos/clusters'
import { TONALIDADES, FAQ_TONALIDADES, type Tonalidad } from './datosTonalidades'
import './GuiaTonalidades.css'

const wa = (texto: string) => `https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(texto)}`

// Las de fábrica van al catálogo; las de encargo no están publicadas y una búsqueda vacía es
// justo lo que hace que el cliente se vaya. Esas van a WhatsApp con la tonalidad ya escrita.
const accionDe = (t: Tonalidad) =>
  t.disponibilidad === 'De fábrica'
    ? { href: t.href, externo: false, verbo: 'Ver acordeones', corto: 'Ver' }
    : { href: wa(`Hola, quiero cotizar un acordeón en ${t.sigla} (${t.notas}). ¿Cómo funciona el encargo?`), externo: true, verbo: 'Cotizar un', corto: 'Cotizar' }

const PASOS_CANTANTE = [
  'Elige tres canciones del repertorio que de verdad van a tocar.',
  'Que el cantante las haga sin acompañamiento y ubica dónde se le va el aire.',
  'Pruébalas en GCF: es la referencia y lo más probable es que ahí queden.',
  'Si se ahoga en el agudo, baja un tono (FBbEb). Si suena flojo, sube uno (ADG).',
  'Avísale al bajo y a la guitarra antes de comprar: ellos sí transportan, el acordeón no.',
]

export default function GuiaTonalidades() {
  return (
    <main className="gt">
      {/* ── Hero ── */}
      <header className="gt-hero">
        <div className="gt-hero-inner">
          <nav className="gt-migas" aria-label="Ruta">
            <Link href="/">Inicio</Link><span aria-hidden="true">/</span>
            <Link href="/tienda">Tienda</Link><span aria-hidden="true">/</span>
            <span aria-current="page">Guía de tonalidades</span>
          </nav>

          <div className="gt-eyebrow">— Guía de compra · Acordeón diatónico</div>
          <h1 className="gt-h1">
            ¿Qué tonalidad de acordeón<br />
            <span className="gt-oro">elegir para tocar vallenato?</span>
          </h1>
          <p className="gt-lead">
            Es la pregunta que más nos hacen antes de comprar el primer acordeón, y la que más
            gente deja pasar sin resolver. Aquí te explicamos en lenguaje llano qué significan
            GCF, ADG, FBbEb y Do/Fa/Sib, qué se toca con cada una y cuál te conviene según lo
            que vayas a hacer con el instrumento.
          </p>

          {/* Respuesta corta primero: quien no lee nada más ya se lleva la decisión tomada. */}
          <aside className="gt-respuesta" aria-labelledby="gt-respuesta-titulo">
            <div className="gt-respuesta-tag">La respuesta corta</div>
            <p id="gt-respuesta-titulo">
              Si es tu primer acordeón, cómpralo en <strong>GCF (Sol, Do, Fa)</strong>. Es la
              tonalidad estándar del vallenato, la tenemos de fábrica y es para la que están
              escritos los métodos y los tutoriales con los que vas a aprender.
            </p>
            <p className="gt-respuesta-pero">
              La excepción: si tu maestro toca en otra tonalidad, cómprate la de él. Van a tocar
              juntos todos los días y eso pesa más que cualquier regla general.
            </p>
            <div className="gt-respuesta-ctas">
              <Link href="/tienda?q=GCF" className="gt-btn gt-btn-primario">
                Ver acordeones GCF <Icono nombre="flecha" tamaño={14} />
              </Link>
              <a href={wa('Hola, no sé qué tonalidad de acordeón me conviene. ¿Me ayudan a elegir?')} target="_blank" rel="noopener noreferrer" className="gt-btn gt-btn-fantasma">
                <Icono nombre="whatsapp" tamaño={14} /> Que un maestro me ayude
              </a>
            </div>
          </aside>
        </div>
      </header>

      {/* ── Tabla comparativa ── */}
      <section className="gt-seccion" id="comparar" aria-labelledby="gt-comparar-t">
        <div className="gt-cabecera">
          <div>
            <div className="gt-eyebrow">— De un vistazo</div>
            <h2 className="gt-h2" id="gt-comparar-t">Las cuatro tonalidades <span className="gt-oro">que manejamos</span></h2>
          </div>
          <p className="gt-sub">
            Todas son el mismo instrumento con distinto juego de voces. Cambia en qué tres
            escalas te deja tocar, no la calidad ni la garantía.
          </p>
        </div>

        <div className="gt-tabla-scroll">
          <table className="gt-tabla">
            <caption className="gt-sr">Comparación de tonalidades de acordeón diatónico</caption>
            <thead>
              <tr>
                <th scope="col">Tonalidad</th>
                <th scope="col">Notas</th>
                <th scope="col">Frente al GCF</th>
                <th scope="col">Disponibilidad</th>
                <th scope="col"><span className="gt-sr">Enlace al catálogo</span></th>
              </tr>
            </thead>
            <tbody>
              {TONALIDADES.map((t) => {
                const a = accionDe(t)
                return (
                  <tr key={t.id} className={t.destacada ? 'gt-fila-destacada' : undefined}>
                    <th scope="row">
                      <span className="gt-sigla">{t.sigla}</span>
                      {t.apodo ? <span className="gt-apodo">{t.apodo}</span> : null}
                    </th>
                    <td className="gt-notas">{t.notas}</td>
                    <td>{t.relacion}</td>
                    <td>
                      <span className={`gt-pill ${t.disponibilidad === 'De fábrica' ? 'gt-pill-si' : 'gt-pill-encargo'}`}>
                        {t.disponibilidad}
                      </span>
                    </td>
                    <td className="gt-tabla-cta">
                      {a.externo
                        ? <a href={a.href} target="_blank" rel="noopener noreferrer">{a.corto} <Icono nombre="flecha" tamaño={12} /></a>
                        : <Link href={a.href}>{a.corto} <Icono nombre="flecha" tamaño={12} /></Link>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Qué es la tonalidad ── */}
      <section className="gt-seccion gt-seccion--suave" id="que-es" aria-labelledby="gt-quees-t">
        <div className="gt-teoria">
          <div className="gt-teoria-texto">
            <div className="gt-eyebrow">— Lo básico, sin enredos</div>
            <h2 className="gt-h2" id="gt-quees-t">Qué es la tonalidad <span className="gt-oro">en un acordeón diatónico</span></h2>
            <p>
              El acordeón vallenato es <strong>diatónico y bisonoro</strong>. Diatónico quiere
              decir que no tiene todas las notas: tiene tres filas de botones y cada fila es una
              escala mayor completa. Bisonoro quiere decir que cada botón da una nota al abrir
              el fuelle y otra distinta al cerrarlo. Por eso suena como suena, y por eso no es
              un piano al que le puedas pedir cualquier tono.
            </p>
            <p>
              Las tres filas van separadas por una cuarta. En un GCF son Sol, Do y Fa; en un ADG
              son La, Re y Sol. El nombre de la tonalidad no es más que esas tres escalas dichas
              de corrido. Los bajos de la mano izquierda están armados sobre las mismas tres.
            </p>
            <p>
              Con eso tienes las tres mayores, sus relativas menores y unos cuantos semitonos que
              se sacan cruzando filas. Lo que queda fuera, queda fuera: <strong>no hay manera de
              transportar un acordeón diatónico</strong>. Si la canción está en una tonalidad que
              el instrumento no tiene, o se le cambia el tono a la canción o se cambia de acordeón.
              Esa es toda la razón por la que existe esta guía.
            </p>
          </div>
          <aside className="gt-glosario">
            <div className="gt-glosario-titulo">Para entenderte con el maestro</div>
            <dl>
              <dt>Fila</dt>
              <dd>Cada una de las tres hileras de botones de la mano derecha. Una fila, una escala.</dd>
              <dt>Bisonoro</dt>
              <dd>Un botón, dos notas: una abriendo el fuelle y otra cerrándolo.</dd>
              <dt>Cruzar filas</dt>
              <dd>Buscar notas en la fila de al lado para sacar lo que la escala no tiene.</dd>
              <dt>Pitos o voces</dt>
              <dd>Las lengüetas que suenan. Son las que definen la tonalidad del acordeón.</dd>
              <dt>De fábrica</dt>
              <dd>Sale del inventario, sin esperar encargo. Es el caso de GCF y ADG.</dd>
            </dl>
          </aside>
        </div>
      </section>

      {/* ── Ficha por tonalidad ── */}
      <section className="gt-seccion" id="tonalidades" aria-labelledby="gt-ton-t">
        <div className="gt-cabecera">
          <div>
            <div className="gt-eyebrow">— Una por una</div>
            <h2 className="gt-h2" id="gt-ton-t">Qué se toca <span className="gt-oro">con cada tonalidad</span></h2>
          </div>
          <p className="gt-sub">
            Hablamos de registros y de usos, no de nombres propios: la tonalidad que usa cada
            artista es cosa suya y cambia de disco a disco.
          </p>
        </div>

        <div className="gt-fichas">
          {TONALIDADES.map((t) => {
          const a = accionDe(t)
          // id en el articulo: el mega menu enlaza directo a una tonalidad concreta
          // (/guia-tonalidades#fbbeb), asi que cada ficha necesita su propio ancla.
          return (
            <article key={t.id} id={t.id} className={`gt-ficha${t.destacada ? ' gt-ficha--destacada' : ''}`} style={{ scrollMarginTop: '120px' }}>
              {t.destacada ? <span className="gt-badge">La recomendada para empezar</span> : null}
              <header className="gt-ficha-cab">
                <h3>
                  {t.sigla}
                  {t.apodo ? <span className="gt-apodo">{t.apodo}</span> : null}
                </h3>
                <p className="gt-notas">{t.notas}</p>
              </header>
              <p className="gt-ficha-texto">{t.resumen}</p>
              <div className="gt-ficha-meta">
                <span className={`gt-pill ${t.disponibilidad === 'De fábrica' ? 'gt-pill-si' : 'gt-pill-encargo'}`}>
                  {t.disponibilidad}
                </span>
              </div>
              <ul className="gt-ficha-lista">
                {t.paraQuien.map((p) => (
                  <li key={p}><Icono nombre="check" tamaño={13} /> {p}</li>
                ))}
              </ul>
              {a.externo ? (
                <a href={a.href} target="_blank" rel="noopener noreferrer" className="gt-ficha-enlace">
                  {a.verbo} {t.sigla} <Icono nombre="flecha" tamaño={13} />
                </a>
              ) : (
                <Link href={a.href} className="gt-ficha-enlace">
                  {a.verbo} {t.sigla} <Icono nombre="flecha" tamaño={13} />
                </Link>
              )}
            </article>
          )})}
        </div>

        <p className="gt-nota">
          Las tonalidades de fábrica las ves en el catálogo con precio. Las de encargo no las
          publicamos, porque el precio y el tiempo dependen del modelo:{' '}
          <a href={wa('Hola, busco un acordeón en una tonalidad de encargo. ¿Me ayudan con el precio y el tiempo?')} target="_blank" rel="noopener noreferrer">
            escríbenos y te los confirmamos antes de que pagues nada.
          </a>
        </p>
      </section>

      {/* ── Principiante ── */}
      <section className="gt-seccion gt-seccion--suave" id="principiante" aria-labelledby="gt-prin-t">
        <div className="gt-cabecera">
          <div>
            <div className="gt-eyebrow">— Tu primer acordeón</div>
            <h2 className="gt-h2" id="gt-prin-t">Por qué un principiante <span className="gt-oro">debería empezar en GCF</span></h2>
          </div>
        </div>
        <div className="gt-razones">
          <article className="gt-razon">
            <span className="gt-num">01</span>
            <h3>Todo el material está en GCF</h3>
            <p>Los métodos, las clases y los videos con los que vas a aprender están hechos para esta tonalidad. Empezar en otra es traducir cada lección.</p>
          </article>
          <article className="gt-razon">
            <span className="gt-num">02</span>
            <h3>Te sientas a tocar con cualquiera</h3>
            <p>Es la tonalidad que más se maneja en el vallenato. En una parranda o en un ensayo no tienes que preguntar nada antes de arrancar.</p>
          </article>
          <article className="gt-razon">
            <span className="gt-num">03</span>
            <h3>La tenemos de fábrica</h3>
            <p>Sale del inventario. No esperas un encargo para empezar a estudiar, y los repuestos y el servicio de taller son los de siempre.</p>
          </article>
          <article className="gt-razon">
            <span className="gt-num">04</span>
            <h3>Se revende sin drama</h3>
            <p>El día que quieras subir de modelo, un GCF tiene mercado. Una tonalidad poco común se vende más despacio y siempre hay que explicarla.</p>
          </article>
        </div>
        <div className="gt-honesto">
          <Icono nombre="escudo" tamaño={16} />
          <p>
            <strong>Dicho con franqueza:</strong> no existe una tonalidad mejor que otra. GCF es la
            recomendación por defecto porque quita fricción mientras aprendes, no porque suene
            mejor. Si ya sabes por qué quieres una FBbEb o una Do/Fa/Sib, cómprala tranquilo: la
            conseguimos por encargo.
          </p>
        </div>
      </section>

      {/* ── Acompañar a un cantante ── */}
      <section className="gt-seccion" id="cantante" aria-labelledby="gt-cant-t">
        <div className="gt-cantante">
          <div className="gt-cantante-texto">
            <div className="gt-eyebrow">— Para conjunto</div>
            <h2 className="gt-h2" id="gt-cant-t">Cómo elegir la tonalidad <span className="gt-oro">para acompañar a un cantante</span></h2>
            <p>
              Aquí la regla cambia: ya no manda lo que tú tocas, manda dónde le suena bien la voz.
              El bajo y la guitarra transportan en un segundo; el acordeón no. Así que en la
              práctica <strong>el acordeón es el que define el tono del conjunto</strong>, y por
              eso hay que elegirlo pensando en el que canta.
            </p>
            <p>
              Un tono arriba o un tono abajo decide si el cantante llega cómodo al coro o llega
              gritando. No hay una tonalidad “de cantante”: hay una que le queda a esa voz. Esta
              es la prueba que hacemos en la tienda antes de recomendar nada.
            </p>
          </div>
          <aside className="gt-prueba">
            <div className="gt-prueba-titulo">La prueba de los cinco minutos</div>
            <ol>
              {PASOS_CANTANTE.map((p) => <li key={p}>{p}</li>)}
            </ol>
            <a href={wa('Hola, necesito un acordeón para acompañar a un cantante y no sé qué tonalidad pedir.')} target="_blank" rel="noopener noreferrer" className="gt-btn gt-btn-primario gt-btn-bloque">
              <Icono nombre="whatsapp" tamaño={14} /> Háganla conmigo por WhatsApp
            </a>
          </aside>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="gt-seccion gt-seccion--suave" id="preguntas" aria-labelledby="gt-faq-t">
        <div className="gt-cabecera">
          <div>
            <div className="gt-eyebrow">— Preguntas frecuentes</div>
            <h2 className="gt-h2" id="gt-faq-t">Lo que <span className="gt-oro">siempre nos preguntan</span></h2>
          </div>
        </div>
        <div className="gt-faq">
          {FAQ_TONALIDADES.map((f, i) => (
            <details key={f.p} className="gt-faq-item" open={i === 0}>
              <summary>{f.p}<Icono nombre="chevron-abajo" tamaño={16} /></summary>
              <p>{f.r}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Enlaces a catálogo ── */}
      <section className="gt-seccion" aria-labelledby="gt-cat-t">
        <div className="gt-cabecera">
          <div>
            <div className="gt-eyebrow">— Ya lo tienes claro</div>
            <h2 className="gt-h2" id="gt-cat-t">Da el <span className="gt-oro">siguiente paso</span></h2>
          </div>
        </div>
        <div className="gt-atajos">
          {TONALIDADES.map((t) => {
            const a = accionDe(t)
            const dentro = (
              <>
                <span className="gt-atajo-sigla">{t.sigla}</span>
                <span className="gt-atajo-notas">{t.notas}</span>
                <span className={`gt-pill ${t.disponibilidad === 'De fábrica' ? 'gt-pill-si' : 'gt-pill-encargo'}`}>{t.disponibilidad}</span>
                <Icono nombre="flecha" tamaño={14} />
              </>
            )
            return a.externo
              ? <a key={t.id} href={a.href} target="_blank" rel="noopener noreferrer" className="gt-atajo">{dentro}</a>
              : <Link key={t.id} href={a.href} className="gt-atajo">{dentro}</Link>
          })}
        </div>
        <div className="gt-relacionados">
          <span>También te puede servir:</span>
          <Link href="/tienda/categoria/acordeones-rey-vallenato">Acordeones Rey Vallenato</Link>
          <Link href="/tienda/categoria/acordeones-hohner-premium">Hohner Corona III</Link>
          <Link href="/tienda/categoria/acordeones-para-ninos">Acordeones para niños</Link>
          <Link href="/acordeones-personalizados">Acordeones personalizados</Link>
          <Link href="/taller">Taller y afinación</Link>
          <Link href="/accesorios">Accesorios</Link>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="gt-final">
        <div className="gt-final-caja">
          <div className="gt-eyebrow">— Hablemos</div>
          <h2 className="gt-h2">Dinos qué vas a tocar y <span className="gt-oro">te decimos cuál pedir</span></h2>
          <p>
            Un maestro del taller te responde por WhatsApp. Cuéntale si es tu primer acordeón, con
            quién vas a tocar y quién canta: con eso basta para acertar la tonalidad a la primera.
          </p>
          <a href={wa('Hola, leí la guía de tonalidades y quiero que me ayuden a elegir la mía.')} target="_blank" rel="noopener noreferrer" className="gt-btn gt-btn-primario">
            <Icono nombre="whatsapp" tamaño={14} /> Escribir al +57 314 486 5310
          </a>
        </div>
      </section>
    </main>
  )
}
