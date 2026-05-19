'use client'

import Link from 'next/link'
import Icono from '@/componentes/ui/Icono'

const NUMERO_WA = '573208492093'

export default function CtaFinalInicio() {
  return (
    <section className="cta-final">
      <div className="eyebrow cta-eyebrow reveal">— Última parada</div>
      <h2 className="display cta-title reveal" data-delay="1">
        ¿Listo Para Encontrar<br />
        <span className="accent">Tu Acordeón?</span>
        <em className="italic"> El que va a sonar contigo, no a tu lado.</em>
      </h2>
      <p className="cta-sub reveal" data-delay="2">
        Explora la colección completa o agenda una llamada con uno de nuestros maestros. Te ayudamos a encontrar el tuyo.
      </p>
      <div className="cta-actions reveal" data-delay="3">
        <Link href="/tienda" className="btn btn-primary">
          Ver Catálogo Completo
          <span className="arrow"><Icono nombre="flecha" tamaño={14} /></span>
        </Link>
        <a
          href={`https://wa.me/${NUMERO_WA}?text=Hola%2C%20quiero%20agendar%20una%20llamada`}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp"
        >
          <Icono nombre="whatsapp" tamaño={14} />
          Hablar con un Maestro
        </a>
      </div>
    </section>
  )
}
