'use client'

import Icono from '@/componentes/ui/Icono'

const VALORES = [
  {
    n: '01', icono: 'herramienta' as const,
    titulo: 'Taller Propio',
    desc: 'Cada acordeón pasa por las manos de nuestros maestros lutieres en Valledupar antes de salir.',
  },
  {
    n: '02', icono: 'globo' as const,
    titulo: 'Envíos Internacionales',
    desc: 'Despachos asegurados a 42 países con embalaje rígido y seguro de tránsito incluido.',
  },
  {
    n: '03', icono: 'destello' as const,
    titulo: 'Personalización Única',
    desc: 'Maderas, nácar, cuero y grabados a la medida. Tu acordeón será uno y solamente uno en el mundo.',
  },
  {
    n: '04', icono: 'escudo' as const,
    titulo: 'Garantía de Calidad',
    desc: 'Cinco años de garantía estructural y afinación. Servicio técnico de por vida para nuestros clientes.',
  },
]

export default function ValoresMarca() {
  return (
    <div className="values-wrap">
      <section className="section">
        <div className="section-head">
          <div className="left reveal">
            <div className="eyebrow">— Por Qué Comprar Aquí</div>
            <h2 className="display section-title">
              Cuatro Razones <em className="italic">que</em><br />
              <span className="accent">Marcan la Diferencia</span>
            </h2>
          </div>
        </div>
        <div className="values-grid">
          {VALORES.map((v, i) => (
            <div
              key={v.n}
              className="value reveal"
              data-delay={i}
            >
              <div className="value-icon">
                <Icono nombre={v.icono} tamaño={24} />
              </div>
              <div className="value-num">// {v.n}</div>
              <div className="value-title">{v.titulo}</div>
              <p className="value-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
