'use client'

import Link from 'next/link'
import Image from 'next/image'
import Icono from '@/componentes/ui/Icono'
import TarjetaProductoLujo from '@/componentes/producto/TarjetaProductoLujo'
import ReelsInstagram from '@/componentes/social/ReelsInstagram'
import { CLUSTERS, BASES, NUMERO_WA, type Cluster } from '@/datos/clusters'
import './PaginaCluster.css'

interface Props {
  cluster: Cluster
  productos: any[]
}

const wa = (texto: string) => `https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(texto)}`

export default function PaginaCluster({ cluster: c, productos }: Props) {
  const hermanos = CLUSTERS.filter((x) => x.slug !== c.slug && x.base === c.base)
  const base = BASES[c.base]
  const desde = productos.length ? Math.min(...productos.map((p) => Number(p.precio) || Infinity)) : null

  return (
    <main className="cl">
      {/* ── Hero ── */}
      <header className="cl-hero">
        <div className="cl-hero-inner">
          <nav className="cl-migas" aria-label="Ruta">
            <Link href="/">Inicio</Link><span>/</span>
            <Link href={`/${c.base}`}>{base.nombre}</Link><span>/</span>
            <span aria-current="page">{c.nombre}</span>
          </nav>
          <div className="cl-hero-grid">
            <div className="cl-hero-texto">
              <div className="eyebrow">— {c.eyebrow}</div>
              <h1 className="display cl-h1">
                {c.h1[0]}<br /><span className="accent">{c.h1[1]}</span>
              </h1>
              <p className="cl-lead">{c.intro}</p>
              <div className="cl-chips">
                {c.chips.map((ch) => <span key={ch} className="cl-chip"><Icono nombre="check" tamaño={12} /> {ch}</span>)}
              </div>
              <div className="cl-ctas">
                <a href="#productos" className="btn btn-primary">
                  Ver {c.nombre.toLowerCase()} {desde && Number.isFinite(desde) ? <small>desde ${desde.toLocaleString('es-CO')}</small> : null}
                </a>
                <a href={wa(c.waTexto)} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                  <Icono nombre="whatsapp" tamaño={14} /> Asesoría por WhatsApp
                </a>
              </div>
              <ul className="cl-garantias">
                <li><Icono nombre="camion" tamaño={14} /> Envío a toda Colombia</li>
                <li><Icono nombre="escudo" tamaño={14} /> Garantía real</li>
                <li><Icono nombre="herramienta" tamaño={14} /> Taller en Bogotá · envíos al mundo</li>
              </ul>
            </div>
            <div className="cl-hero-visual">
              <div className="cl-hero-halo" />
              <Image src={c.imagen} alt={`${c.nombre} de acordeón`} width={900} height={900} priority sizes="(max-width: 900px) 80vw, 40vw" className="cl-hero-img" />
            </div>
          </div>
        </div>
      </header>

      {/* ── Productos ── */}
      <section className="cl-seccion" id="productos">
        <div className="cl-cabecera">
          <div>
            <div className="eyebrow">— Catálogo</div>
            <h2 className="display cl-h2">{c.nombre} <span className="accent">disponibles</span></h2>
          </div>
          <p className="cl-sub">Precios en pesos colombianos con IVA. Pago seguro con ePayco, PSE, Nequi o contra entrega.</p>
        </div>
        {productos.length ? (
          <div className="cl-grid-productos">
            {productos.map((p) => <TarjetaProductoLujo key={p.id} producto={p} />)}
          </div>
        ) : (
          <div className="cl-vacio">
            <p>Estamos actualizando el catálogo de {c.nombre.toLowerCase()}. Escríbenos y te cotizamos hoy mismo.</p>
            <a href={wa(c.waTexto)} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><Icono nombre="whatsapp" tamaño={14} /> Cotizar por WhatsApp</a>
          </div>
        )}
      </section>

      {/* ── Beneficios ── */}
      <section className="cl-seccion cl-seccion--suave">
        <div className="cl-cabecera">
          <div>
            <div className="eyebrow">— Por qué con nosotros</div>
            <h2 className="display cl-h2">Hechos para <span className="accent">acordeoneros</span></h2>
          </div>
        </div>
        <div className="cl-beneficios">
          {c.beneficios.map((b, i) => (
            <article key={b.titulo} className="cl-beneficio">
              <span className="cl-num">{String(i + 1).padStart(2, '0')}</span>
              <h3>{b.titulo}</h3>
              <p>{b.texto}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── Guía ── */}
      <section className="cl-seccion cl-guia">
        <div className="cl-guia-grid">
          <div>
            <div className="eyebrow">— Guía de compra</div>
            <h2 className="display cl-h2">{c.guia.titulo}</h2>
            {c.guia.parrafos.map((t) => <p key={t.slice(0, 30)}>{t}</p>)}
          </div>
          {c.guia.lista ? (
            <aside className="cl-pasos">
              <div className="cl-pasos-titulo">Checklist rápido</div>
              <ol>
                {c.guia.lista.map((l) => <li key={l}>{l}</li>)}
              </ol>
              <a href={wa(`${c.waTexto}. ¿Me ayudas a elegir?`)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <Icono nombre="whatsapp" tamaño={14} /> Te ayudamos a elegir
              </a>
            </aside>
          ) : null}
        </div>
      </section>

      {/* ── Reels ── */}
      <section className="cl-seccion">
        <ReelsInstagram limite={8} titulo={`${c.nombre} en acción`} filtro={c.palabras} />
      </section>

      {/* ── FAQ ── */}
      <section className="cl-seccion cl-seccion--suave" id="preguntas">
        <div className="cl-cabecera">
          <div>
            <div className="eyebrow">— Preguntas frecuentes</div>
            <h2 className="display cl-h2">Lo que <span className="accent">nos preguntan</span></h2>
          </div>
        </div>
        <div className="cl-faq">
          {c.faq.map((f) => (
            <details key={f.p} className="cl-faq-item">
              <summary>{f.p}<Icono nombre="chevron-abajo" tamaño={16} /></summary>
              <p>{f.r}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── Otros accesorios + enlaces ── */}
      <section className="cl-seccion">
        <div className="cl-cabecera">
          <div>
            <div className="eyebrow">— {c.base === 'accesorios' ? 'Completa tu acordeón' : 'También en ' + base.nombre.toLowerCase()}</div>
            <h2 className="display cl-h2">Más <span className="accent">{base.nombre.toLowerCase()}</span></h2>
          </div>
          <Link href={`/${c.base}`} className="cl-enlace">Ver todos <Icono nombre="flecha" tamaño={12} /></Link>
        </div>
        <div className="cl-hermanos">
          {hermanos.map((h) => (
            <Link key={h.slug} href={`/${h.base}/${h.slug}`} className="cl-hermano">
              <Image src={h.imagen} alt={h.nombre} width={240} height={240} sizes="120px" />
              <div>
                <h3>{h.nombre}</h3>
                <p>{h.h1[1]}</p>
              </div>
              <Icono nombre="flecha" tamaño={14} />
            </Link>
          ))}
        </div>
        <div className="cl-relacionados">
          <span>También te puede interesar:</span>
          <Link href="/tienda/categoria/acordeones-rey-vallenato">Acordeones Rey Vallenato</Link>
          <Link href="/tienda/categoria/acordeones-hohner-premium">Hohner Corona III</Link>
          <Link href="/acordeones-personalizados">Acordeones personalizados</Link>
          {(Object.keys(BASES) as (keyof typeof BASES)[]).filter((k) => k !== c.base).map((k) => (
            <Link key={k} href={`/${k}`}>{BASES[k].nombre}</Link>
          ))}
          <Link href="/blog">Blog del acordeonero</Link>
        </div>
      </section>

      {/* ── CTA final ── */}
      <section className="cl-final">
        <div>
          <div className="eyebrow">— Hablemos</div>
          <h2 className="display cl-h2">¿Dudas con tu <span className="accent">{c.nombre.toLowerCase()}</span>?</h2>
          <p>Respondemos en minutos. Envíanos una foto de tu acordeón y te decimos exactamente qué necesitas.</p>
        </div>
        <a href={wa(c.waTexto)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          <Icono nombre="whatsapp" tamaño={14} /> Escribir al taller
        </a>
      </section>
    </main>
  )
}
