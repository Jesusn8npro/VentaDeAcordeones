'use client'

import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'

const OTROS = [
  { id: 'pianos',      icono: 'cat-piano' as const,    etiqueta: 'Pianos y Teclados',  meta: '32 modelos',   ruta: '/tienda' },
  { id: 'guitarras',   icono: 'cat-guitarra' as const,  etiqueta: 'Guitarras',          meta: '48 modelos',   ruta: '/tienda' },
  { id: 'bajos',       icono: 'cat-bajo' as const,      etiqueta: 'Bajos Eléctricos',   meta: '24 modelos',   ruta: '/tienda' },
  { id: 'baterias',    icono: 'cat-bateria' as const,   etiqueta: 'Baterías',           meta: '18 sets',      ruta: '/tienda' },
  { id: 'electronica', icono: 'cat-sonido' as const,    etiqueta: 'Sonido Pro',         meta: '120+ ítems',   ruta: '/tienda' },
  { id: 'cursos',      icono: 'cat-cursos' as const,    etiqueta: 'Cursos',             meta: '12 módulos',   ruta: '/tienda' },
]

export default function OtrosInstrumentos() {
  return (
    <section className="section" id="otros">
      <div className="section-head">
        <div className="left reveal">
          <div className="eyebrow">— TAMBIÉN MANEJAMOS</div>
          <h2 className="display section-title">
            Otros <span className="accent">Instrumentos</span><br />
            <em className="italic">para músicos serios</em>
          </h2>
        </div>
        <p className="section-sub reveal" data-delay="1">
          Pianos, guitarras, bajos, baterías y sonido profesional. Marcas oficiales con garantía.
        </p>
      </div>
      <div className="otros-grid">
        {OTROS.map((o, i) => (
          <Link
            key={o.id}
            href={o.ruta}
            className="otro-card reveal"
            data-delay={i}
          >
            <div className="otro-icon">
              <Icono nombre={o.icono} tamaño={22} />
            </div>
            <div className="otro-name">{o.etiqueta}</div>
            <div className="otro-meta">{o.meta}</div>
            <span className="otro-arrow">
              <Icono nombre="flecha" tamaño={14} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
