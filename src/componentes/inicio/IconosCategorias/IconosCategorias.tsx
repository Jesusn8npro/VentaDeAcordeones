'use client'

import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'

const CATEGORIAS = [
  { id: 'nuevos',         icono: 'cat-acordeon',     etiqueta: 'Acordeones',     meta: 'Todos los modelos', destacado: true,  ruta: '/tienda' },
  { id: 'personalizados', icono: 'cat-personalizado', etiqueta: 'Personalizados', meta: 'Edición única',     destacado: false, ruta: '/acordeones-personalizados' },
  { id: 'parrillas',      icono: 'acc-parrilla',     etiqueta: 'Parrillas',      meta: '24 modelos',        destacado: false, ruta: '/tienda' },
  { id: 'correas',        icono: 'cat-correa',       etiqueta: 'Correas',        meta: '38 ítems',          destacado: false, ruta: '/tienda' },
  { id: 'fuelles',        icono: 'acc-fuelle',       etiqueta: 'Fuelles',        meta: '12 ítems',          destacado: false, ruta: '/tienda' },
  { id: 'estuches',       icono: 'cat-estuche',      etiqueta: 'Estuches',       meta: '18 modelos',        destacado: false, ruta: '/tienda' },
  { id: 'broches',        icono: 'acc-broche',       etiqueta: 'Broches',        meta: '15 ítems',          destacado: false, ruta: '/tienda' },
  { id: 'tecnicos',       icono: 'acc-herramientas', etiqueta: 'Para Técnicos',  meta: 'Lengüetas, resortes…', destacado: false, ruta: '/tienda' },
]

export default function IconosCategorias() {
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
        {CATEGORIAS.map((cat) => (
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
            <div className="cat-ico-meta">{cat.meta}</div>
          </Link>
        ))}
      </div>
    </section>
  )
}
