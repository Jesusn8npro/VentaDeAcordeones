'use client'

import { useState } from 'react'
import Icono from '@/componentes/ui/Icono'

export default function Boletin() {
  const [correo, setCorreo] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [error, setError] = useState('')

  const manejarEnvio = (e: React.FormEvent) => {
    e.preventDefault()
    if (!correo || !correo.includes('@')) {
      setError('Ingresa un correo válido.')
      return
    }
    setError('')
    setEnviado(true)
    setTimeout(() => { setEnviado(false); setCorreo('') }, 4000)
  }

  return (
    <div className="newsletter">
      <div className="newsletter-inner reveal">
        <div>
          <div className="eyebrow">— BOLETÍN VENTA DE ACORDEONES</div>
          <h2 className="display newsletter-title">
            Ofertas <em className="italic">antes</em> que nadie.<br />
            <span className="accent">Drops privados, descuentos, lanzamientos.</span>
          </h2>
          <p className="newsletter-sub">
            Suscríbete y recibe nuestro catálogo PDF actualizado, ofertas relámpago y noticias del taller. Sin spam, prometido.
          </p>
        </div>
        <form className="newsletter-form" onSubmit={manejarEnvio}>
          <div className="newsletter-field">
            <Icono nombre="correo" tamaño={18} />
            <input
              type="email"
              placeholder="tu@email.com"
              value={correo}
              onChange={(e) => { setCorreo(e.target.value); setError('') }}
              aria-label="Correo electrónico"
            />
            <button type="submit" className="btn btn-primary">
              {enviado
                ? <><Icono nombre="estrella" tamaño={14} /> Suscrito</>
                : <>Suscribirme <span className="arrow"><Icono nombre="flecha" tamaño={14} /></span></>
              }
            </button>
          </div>
          {error && <p style={{ color: 'var(--vda-peligro)', fontSize: '13px', marginTop: '8px' }}>{error}</p>}
          <div className="newsletter-perks">
            <span><Icono nombre="estrella" tamaño={12} /> Catálogo PDF gratis</span>
            <span><Icono nombre="rayo" tamaño={12} /> Ofertas relámpago</span>
            <span><Icono nombre="escudo" tamaño={12} /> Sin spam</span>
          </div>
        </form>
      </div>
    </div>
  )
}
