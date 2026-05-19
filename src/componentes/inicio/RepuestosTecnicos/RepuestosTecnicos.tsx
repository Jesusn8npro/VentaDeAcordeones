'use client'

import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'

const TECNICOS = [
  {
    id: 'lenguetas',
    icono: 'acc-lengueta' as const,
    etiqueta: 'Lengüetas',
    meta: 'Hohner, Voci Armoniche',
    desc: 'Lengüetas a mano y máquina para todos los modelos.',
  },
  {
    id: 'resortes',
    icono: 'acc-resorte' as const,
    etiqueta: 'Resortes',
    meta: 'Acero templado',
    desc: 'Resortes de teclado, bajos y registro. Calidad europea.',
  },
  {
    id: 'celuloide',
    icono: 'acc-celuloide' as const,
    etiqueta: 'Celuloide',
    meta: 'Hojas decorativas',
    desc: 'Hojas de celuloide nácar, negro, rojo, perla y colores especiales.',
  },
  {
    id: 'herramientas',
    icono: 'acc-herramientas' as const,
    etiqueta: 'Herramientas',
    meta: 'Llaves, alicates',
    desc: 'Set completo de herramientas profesionales para afinación y reparación.',
  },
]

export default function RepuestosTecnicos() {
  return (
    <section className="section" id="tecnicos">
      <div className="section-head">
        <div className="left reveal">
          <div className="eyebrow">— PARA AFINADORES Y TÉCNICOS</div>
          <h2 className="display section-title">
            Repuestos <em className="italic">de</em><br />
            <span className="accent">Calidad Profesional</span>
          </h2>
        </div>
        <p className="section-sub reveal" data-delay="1">
          Surtimos talleres de afinación en toda Latinoamérica. Despacho directo desde Valledupar con factura y garantía.
        </p>
      </div>
      <div className="tecnicos-grid">
        {TECNICOS.map((t, i) => (
          <Link
            key={t.id}
            href="/tienda"
            className="tecnico-card reveal"
            data-delay={i}
          >
            <div className="tecnico-icon">
              <Icono nombre={t.icono} tamaño={26} />
            </div>
            <div className="tecnico-meta">// {String(i + 1).padStart(2, '0')} · {t.meta}</div>
            <h3 className="tecnico-title">{t.etiqueta}</h3>
            <p className="tecnico-desc">{t.desc}</p>
            <span className="tecnico-cta">
              Ver catálogo <Icono nombre="flecha" tamaño={12} />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
