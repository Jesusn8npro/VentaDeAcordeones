'use client'

import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'

// Rutas reales (antes todas iban a /tienda) y cifras del catálogo importado de Miche (2026-09).
const OTROS = [
  { id: 'cajas',       icono: 'cat-bateria' as const,   etiqueta: 'Cajas Vallenatas',     meta: 'Madera y acrílico',  ruta: '/instrumentos/cajas-vallenatas' },
  { id: 'baterias',    icono: 'cat-bateria' as const,   etiqueta: 'Baterías',             meta: '11 sets',            ruta: '/instrumentos/baterias' },
  { id: 'audifonos',   icono: 'cat-sonido' as const,    etiqueta: 'Audífonos KZ',         meta: '40 modelos',         ruta: '/audio/audifonos' },
  { id: 'microfonos',  icono: 'cat-sonido' as const,    etiqueta: 'Micrófonos',           meta: '44 modelos',         ruta: '/audio/microfonos' },
  { id: 'grabacion',   icono: 'cat-sonido' as const,    etiqueta: 'Grabación',            meta: 'Interfaces · monitores', ruta: '/audio/equipos-de-grabacion' },
  { id: 'amplis',      icono: 'cat-guitarra' as const,  etiqueta: 'Amplificadores',       meta: 'Fender',             ruta: '/tienda/categoria/amplificadores' },
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
