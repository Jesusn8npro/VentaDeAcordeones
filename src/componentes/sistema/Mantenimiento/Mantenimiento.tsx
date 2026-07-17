'use client'

import './Mantenimiento.css'

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMERO || '3208492093'
const MENSAJE = encodeURIComponent(
  'Hola 👋 Quiero información sobre acordeones mientras actualizan la web.'
)

/**
 * Página / overlay de "Estamos actualizando la plataforma".
 * Se muestra al público mientras MODO_MANTENIMIENTO está activo.
 * El admin logueado ve el sitio real (gate en ArmazonGlobal).
 */
export default function Mantenimiento() {
  return (
    <div className="mant-wrap">
      <div className="mant-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="VentaDeAcordeones.com" className="mant-logo" />

        <span className="mant-badge">
          <span className="mant-punto" />
          Actualizando la plataforma
        </span>

        <h1 className="mant-titulo">
          Estamos construyendo algo <span>increíble</span>
        </h1>

        <p className="mant-texto">
          Nuestra tienda de acordeones se está renovando para darte una
          experiencia mucho mejor. Volvemos muy pronto. Mientras tanto, escríbenos
          por WhatsApp y te asesoramos sin compromiso.
        </p>

        <div className="mant-acciones">
          <a
            className="mant-btn mant-btn-wa"
            href={`https://wa.me/57${WHATSAPP}?text=${MENSAJE}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 Escríbenos por WhatsApp
          </a>
        </div>

        <p className="mant-marca">VentaDeAcordeones.com · Colombia</p>
      </div>
    </div>
  )
}
