'use client'

import Icono from '@/componentes/ui/Icono'

const ITEMS = [
  { icono: 'herramienta',  texto: 'Taller en Valledupar' },
  { icono: 'globo',        texto: 'Envíos a 42 países' },
  { icono: 'estrella',     texto: 'Hohner Oficial' },
  { icono: 'cat-guitarra', texto: 'Guitarras Profesionales' },
  { icono: 'cat-bajo',     texto: 'Bajos Eléctricos' },
  { icono: 'cat-bateria',  texto: 'Baterías Acústicas y E-Drum' },
  { icono: 'cat-sonido',   texto: 'Sonido Profesional' },
  { icono: 'destello',     texto: 'Personalización Artesanal' },
  { icono: 'escudo',       texto: 'Garantía 5 Años' },
]

const PISTA = [...ITEMS, ...ITEMS]

export default function MarqueeBeneficios() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        {PISTA.flatMap((item, i) => [
          <span key={`item-${i}`} className="m-item">
            <Icono nombre={item.icono} tamaño={14} />
            {item.texto}
          </span>,
          <span key={`dot-${i}`} className="dot" />,
        ])}
      </div>
    </div>
  )
}
