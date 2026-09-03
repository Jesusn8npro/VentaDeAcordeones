'use client'

import { useEffect, useState } from 'react'
import './Mantenimiento.css'

const WHATSAPP = '3144865310'
const MENSAJE = encodeURIComponent(
  'Hola 👋 Quiero información sobre acordeones mientras actualizan la web.'
)

// Fecha objetivo del lanzamiento (contador de 7 días).
// 👉 Cuando definas la fecha real, cámbiala aquí (formato ISO, hora Colombia -05:00).
const FECHA_OBJETIVO = new Date('2026-07-24T20:00:00-05:00').getTime()

type Tiempo = { d: number; h: number; m: number; s: number }

/**
 * Página / overlay de "Estamos actualizando la plataforma".
 * Se muestra al público mientras el modo mantenimiento está activo.
 * El admin logueado ve el sitio real (gate en ArmazonGlobal).
 */
export default function Mantenimiento() {
  // null en el primer render (server + hidratación) → sin mismatch. Se calcula al montar.
  const [t, setT] = useState<Tiempo | null>(null)

  useEffect(() => {
    const calc = () => {
      const diff = FECHA_OBJETIVO - Date.now()
      if (diff <= 0) {
        setT({ d: 0, h: 0, m: 0, s: 0 })
        return
      }
      setT({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [])

  const dd = (n: number) => String(n).padStart(2, '0')
  const items: Array<[string, string]> = t
    ? [[String(t.d), 'Días'], [dd(t.h), 'Horas'], [dd(t.m), 'Min'], [dd(t.s), 'Seg']]
    : [['--', 'Días'], ['--', 'Horas'], ['--', 'Min'], ['--', 'Seg']]

  return (
    <div className="mant-wrap">
      <div className="mant-card">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-oficial.png" alt="VentaDeAcordeones.com" className="mant-logo" />

        <span className="mant-badge">
          <span className="mant-punto" />
          Actualizando la plataforma
        </span>

        <h1 className="mant-titulo">
          Estamos renovando tu tienda de <span>acordeones</span>
        </h1>

        <p className="mant-texto">
          Estamos construyendo una experiencia totalmente nueva para que compres
          tu acordeón más fácil, seguro y con la mejor asesoría de Colombia.
          Vuelve pronto — falta muy poco.
        </p>

        {/* ── Contador de lanzamiento ── */}
        <div className="mant-contador" aria-label="Cuenta regresiva para el lanzamiento">
          {items.map(([valor, etiqueta]) => (
            <div className="mant-cd-item" key={etiqueta}>
              <span className="mant-cd-num">{valor}</span>
              <span className="mant-cd-lbl">{etiqueta}</span>
            </div>
          ))}
        </div>
        <p className="mant-cd-nota">⏳ Lanzamiento estimado</p>

        {/* ── Qué estamos preparando ── */}
        <div className="mant-features">
          <div className="mant-feat"><span>🛍️</span> Nueva tienda online</div>
          <div className="mant-feat"><span>🔒</span> Pago 100% seguro</div>
          <div className="mant-feat"><span>🚚</span> Envíos a toda Colombia</div>
          <div className="mant-feat"><span>🎯</span> Asesoría experta</div>
        </div>

        {/* ── WhatsApp ── */}
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

        <p className="mant-marcas">Hohner · Gabbanelli · Guerrini · Fismen · y más</p>
        <p className="mant-marca">VentaDeAcordeones.com · Colombia</p>
      </div>
    </div>
  )
}
