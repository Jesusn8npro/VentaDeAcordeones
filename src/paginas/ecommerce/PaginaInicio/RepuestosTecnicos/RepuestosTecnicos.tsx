'use client'

import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'
import { CLUSTERS } from '@/datos/clusters'

// Cada tarjeta lleva a su landing SEO (/accesorios/<cluster>). Antes eran repuestos genéricos
// (lengüetas, resortes…) que enlazaban a /tienda sin producto detrás.
const META: Record<string, string> = {
  'parrillas-de-acordeon': 'Original · inox · personalizada',
  'fuelles-de-acordeon': '18 y 19 pliegues · colores',
  'correas-de-acordeon': 'Acolchadas · Hohner · bordadas',
  'estuches-de-acordeon': 'Rígidos · morral · con tu nombre',
  'broches-de-acordeon': 'Cromados · dorados',
}

export default function RepuestosTecnicos() {
  return (
    <section className="section" id="accesorios">
      <div className="section-head">
        <div className="left reveal">
          <div className="eyebrow">— ACCESORIOS Y REPUESTOS</div>
          <h2 className="display section-title">
            Todo lo que <em className="italic">tu acordeón</em><br />
            <span className="accent">necesita</span>
          </h2>
        </div>
        <p className="section-sub reveal" data-delay="1">
          Parrillas, fuelles, correas, estuches y broches para Hohner Corona, Rey Vallenato y Compadre. Despacho desde Valledupar con factura y garantía.
        </p>
      </div>
      <div className="tecnicos-grid">
        {CLUSTERS.filter((c) => c.base === 'accesorios').map((c, i) => (
          <Link
            key={c.slug}
            href={`/${c.base}/${c.slug}`}
            className="tecnico-card reveal"
            data-delay={i}
          >
            <div className="tecnico-icon">
              <Icono nombre={c.icono as any} tamaño={26} />
            </div>
            <div className="tecnico-meta">// {String(i + 1).padStart(2, '0')} · {META[c.slug]}</div>
            <h3 className="tecnico-title">{c.nombre}</h3>
            <p className="tecnico-desc">{c.intro.split('.')[0]}.</p>
            <span className="tecnico-cta">
              Ver {c.nombre.toLowerCase()} <Icono nombre="flecha" tamaño={12} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
