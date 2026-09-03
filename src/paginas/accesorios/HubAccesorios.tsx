'use client'

import Link from 'next/link'
import Image from 'next/image'
import Icono from '@/componentes/ui/Icono'
import ReelsInstagram from '@/componentes/social/ReelsInstagram'
import { CLUSTERS, BASES, NUMERO_WA, type BaseCluster } from '@/datos/clusters'
import './PaginaCluster.css'

// Hub por base (/accesorios, /instrumentos, /audio): reparte a las landings de cada familia (clusters).
// Página pilar SEO: enlaza a todos los clusters de la base y a las otras bases.
export default function HubAccesorios({ base = 'accesorios' }: { base?: BaseCluster }) {
  const b = BASES[base]
  const propios = CLUSTERS.filter((c) => c.base === base)
  const otras = (Object.keys(BASES) as BaseCluster[]).filter((k) => k !== base)
  const wa = (t: string) => `https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(t)}`

  return (
    <main className="cl">
      <header className="cl-hero">
        <div className="cl-hero-inner">
          <nav className="cl-migas" aria-label="Ruta">
            <Link href="/">Inicio</Link><span>/</span><span aria-current="page">{b.nombre}</span>
          </nav>
          <div className="cl-hero-texto">
            <div className="eyebrow">— {b.nombre} para acordeoneros y músicos</div>
            <h1 className="display cl-h1">{b.h1[0]}<br /><span className="accent">{b.h1[1]}</span></h1>
            <p className="cl-lead">{b.intro}</p>
            <div className="cl-ctas">
              <a href={wa(b.wa)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <Icono nombre="whatsapp" tamaño={14} /> Cotizar por WhatsApp
              </a>
              <Link href="/tienda" className="btn btn-ghost">Ver toda la tienda</Link>
            </div>
          </div>
        </div>
      </header>

      <section className="cl-seccion">
        <div className="cl-hub-grid">
          {propios.map((c) => (
            <Link key={c.slug} href={`/${base}/${c.slug}`} className="cl-hub-card">
              <div className="cl-hub-visual">
                <Image src={c.imagen} alt={c.h1.join(' ')} width={400} height={400} sizes="(max-width: 700px) 80vw, 300px" />
              </div>
              <div className="cl-hub-cuerpo">
                <div className="eyebrow">— {c.eyebrow.split('·')[1]?.trim()}</div>
                <h2>{c.h1[0]}</h2>
                <p>{c.h1[1].charAt(0).toUpperCase() + c.h1[1].slice(1)}.</p>
                <span>Ver {c.nombre.toLowerCase()} <Icono nombre="flecha" tamaño={12} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="cl-seccion" style={{ paddingTop: 0 }}>
        <ReelsInstagram limite={8} titulo="Así se ven en acción" />
      </section>

      <section className="cl-seccion" style={{ paddingTop: 0 }}>
        <div className="cl-relacionados">
          <span>Explora también:</span>
          {otras.map((k) => <Link key={k} href={`/${k}`}>{BASES[k].nombre}</Link>)}
          <Link href="/acordeones-personalizados">Acordeones personalizados</Link>
          <Link href="/blog">Blog</Link>
        </div>
      </section>

      <section className="cl-final">
        <div>
          <div className="eyebrow">— ¿No encuentras algo?</div>
          <h2 className="display cl-h2">Lo conseguimos <span className="accent">por ti</span></h2>
          <p>Somos distribuidores de Hohner, Miche, MPRO, Fender y más. Escríbenos con una foto o referencia y te cotizamos.</p>
        </div>
        <a href={wa(b.wa)} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
          <Icono nombre="whatsapp" tamaño={14} /> Pedir cotización
        </a>
      </section>
    </main>
  )
}
