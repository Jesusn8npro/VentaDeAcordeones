'use client'

import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'
import { etiquetaConteo, type ConteosClusters } from '@/datos/conteosClusters'

// Cada tarjeta lleva a su landing de cluster (/acordeones/… y /accesorios/…), no a /tienda.
// `meta` sale del catálogo real; el texto de `respaldo` sólo aparece si la consulta falla.
const CATEGORIAS: {
  id: string
  icono: string
  etiqueta: string
  ruta: string
  cuenta?: string
  unidad?: [string, string]
  respaldo: string
  destacado?: boolean
}[] = [
  { id: 'personalizados', icono: 'cat-personalizado', etiqueta: 'Personalizados', ruta: '/acordeones/personalizados', cuenta: 'personalizados', unidad: ['diseño', 'diseños'], respaldo: 'Edición única', destacado: true },
  { id: 'rey-vallenato', icono: 'cat-acordeon', etiqueta: 'Rey Vallenato', ruta: '/acordeones/rey-vallenato', cuenta: 'rey-vallenato', unidad: ['modelo', 'modelos'], respaldo: 'El clásico' },
  { id: 'premium', icono: 'cat-acordeon', etiqueta: 'Hohner Premium', ruta: '/acordeones/hohner-premium', cuenta: 'hohner-premium', unidad: ['modelo', 'modelos'], respaldo: 'Corona y Bravo' },
  { id: 'parrillas', icono: 'acc-parrilla', etiqueta: 'Parrillas', ruta: '/accesorios/parrillas-de-acordeon', cuenta: 'parrillas-de-acordeon', unidad: ['modelo', 'modelos'], respaldo: 'Corte láser' },
  { id: 'fuelles', icono: 'acc-fuelle', etiqueta: 'Fuelles', ruta: '/accesorios/fuelles-de-acordeon', cuenta: 'fuelles-de-acordeon', unidad: ['modelo', 'modelos'], respaldo: 'A tu medida' },
  { id: 'correas', icono: 'cat-correa', etiqueta: 'Correas', ruta: '/accesorios/correas-de-acordeon', cuenta: 'correas-de-acordeon', unidad: ['modelo', 'modelos'], respaldo: 'Bordadas' },
  { id: 'estuches', icono: 'cat-estuche', etiqueta: 'Estuches', ruta: '/accesorios/estuches-de-acordeon', cuenta: 'estuches-de-acordeon', unidad: ['modelo', 'modelos'], respaldo: 'Rígidos' },
  { id: 'broches', icono: 'acc-broche', etiqueta: 'Broches', ruta: '/accesorios/broches-de-acordeon', cuenta: 'broches-de-acordeon', unidad: ['juego', 'juegos'], respaldo: 'Originales' },
]

export default function IconosCategorias({ conteos }: { conteos?: ConteosClusters }) {
  return (
    <section className="cat-icons" id="catalogo">
      <div className="section-head" style={{ marginBottom: 30 }}>
        <div className="left reveal">
          <div className="eyebrow">— TODO PARA TU ACORDEÓN</div>
          <h2 className="display section-title">
            Acordeones, <em className="italic">accesorios</em><br />
            y <span className="accent">repuestos técnicos</span>
          </h2>
        </div>
        <p className="section-sub reveal" data-delay="1">
          Todo lo que necesitas en un solo lugar. Despacho rápido, garantía real, soporte de maestros.
        </p>
      </div>
      <div className="cat-icons-grid reveal" data-delay="2">
        {CATEGORIAS.map((cat) => {
          const meta =
            (cat.cuenta && cat.unidad && etiquetaConteo(conteos?.[cat.cuenta], cat.unidad[0], cat.unidad[1])) ||
            cat.respaldo
          return (
            <Link
              key={cat.id}
              href={cat.ruta}
              className={`cat-ico${cat.destacado ? ' featured' : ''}`}
            >
              <div className="cat-ico-img">
                {cat.destacado && (
                  <span className="cat-ico-badge">
                    <Icono nombre="estrella" tamaño={8} /> Oficial
                  </span>
                )}
                <Icono nombre={cat.icono} tamaño={32} />
                <div className="cat-ico-glow" />
              </div>
              <div className="cat-ico-label">{cat.etiqueta}</div>
              <div className="cat-ico-meta">{meta}</div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
