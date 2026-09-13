'use client'

import Icono from '@/componentes/ui/Icono'

// Sólo cosas que el catálogo respalda. Antes anunciaba "Guitarras Profesionales" y "Bajos
// Eléctricos", de los que no hay una sola unidad, y "Garantía 5 Años" cuando en la base los
// productos llevan 12 meses.
const ITEMS = [
  { icono: 'herramienta',  texto: 'Taller en Bogotá · envíos al mundo' },
  { icono: 'globo',        texto: 'Envíos a 42 países' },
  { icono: 'estrella',     texto: 'Hohner Oficial' },
  { icono: 'cat-personalizado', texto: 'Acordeones personalizados a la medida' },
  { icono: 'cat-sonido',   texto: 'Micrófonos y audífonos KZ' },
  { icono: 'cat-bateria',  texto: 'Cajas vallenatas y baterías' },
  { icono: 'cat-sonido',   texto: 'Equipos de grabación' },
  { icono: 'destello',     texto: 'Personalización artesanal' },
  { icono: 'escudo',       texto: 'Garantía de 12 meses' },
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
