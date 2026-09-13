'use client'

import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'
import { etiquetaConteo, type ConteosClusters } from '@/datos/conteosClusters'

// Rutas reales (antes todas iban a /tienda). Las cifras se cuentan contra el catálogo en cada
// revalidación: las que estaban escritas aquí se quedaban viejas en cuanto entraba stock nuevo.
const OTROS = [
  { id: 'cajas',       icono: 'cat-bateria' as const,   etiqueta: 'Cajas Vallenatas', cuenta: 'cajas-vallenatas',     unidad: ['modelo', 'modelos'] as [string, string], respaldo: 'Madera y acrílico',      ruta: '/instrumentos/cajas-vallenatas' },
  { id: 'baterias',    icono: 'cat-bateria' as const,   etiqueta: 'Baterías',         cuenta: 'baterias',             unidad: ['set', 'sets'] as [string, string],       respaldo: 'Junior y profesionales', ruta: '/instrumentos/baterias' },
  { id: 'audifonos',   icono: 'cat-sonido' as const,    etiqueta: 'Audífonos KZ',     cuenta: 'audifonos',            unidad: ['modelo', 'modelos'] as [string, string], respaldo: 'In-ear',                 ruta: '/audio/audifonos' },
  { id: 'microfonos',  icono: 'cat-sonido' as const,    etiqueta: 'Micrófonos',       cuenta: 'microfonos',           unidad: ['modelo', 'modelos'] as [string, string], respaldo: 'Shure y Takstar',        ruta: '/audio/microfonos' },
  { id: 'grabacion',   icono: 'cat-sonido' as const,    etiqueta: 'Grabación',        cuenta: 'equipos-de-grabacion', unidad: ['equipo', 'equipos'] as [string, string], respaldo: 'Interfaces · monitores', ruta: '/audio/equipos-de-grabacion' },
  { id: 'amplis',      icono: 'cat-guitarra' as const,  etiqueta: 'Amplificadores',   cuenta: 'amplificadores',       unidad: ['modelo', 'modelos'] as [string, string], respaldo: 'Fender',                 ruta: '/audio/amplificadores' },
]

export default function OtrosInstrumentos({ conteos }: { conteos?: ConteosClusters }) {
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
            <div className="otro-meta">{etiquetaConteo(conteos?.[o.cuenta], o.unidad[0], o.unidad[1]) || o.respaldo}</div>
            <span className="otro-arrow">
              <Icono nombre="flecha" tamaño={14} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
