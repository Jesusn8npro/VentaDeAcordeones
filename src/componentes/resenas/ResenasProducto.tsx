'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Star, ShieldCheck, MessageCircle, Loader2, Check } from 'lucide-react'
import { clienteSupabase } from '../../configuracion/supabase'
import './ResenasProducto.css'

/**
 * Reseñas verificadas de un producto.
 *
 * POR QUÉ existe: la ficha mostraba una media y unos testimonios inventados.
 * Aquí solo se pinta lo que hay en la BD y solo puede opinar quien compró
 * (lo comprueba el servidor en /api/resenas, no este componente).
 *
 * REGLA: si el producto no tiene ni una reseña aprobada NO se dibuja la sección
 * —ni media, ni barras vacías, ni "sé el primero en opinar" con estrellas
 * apagadas—. En su lugar queda una nota discreta para que quien ya lo compró
 * cuente su experiencia por WhatsApp. Mientras carga tampoco se pinta nada,
 * para que no aparezca un hueco y luego se mueva la página.
 */

const WHATSAPP = '573144865310'
const MIN_COMENTARIO = 10
const MAX_COMENTARIO = 1500
const VISIBLES_INICIALES = 4

type Resena = {
  id: string
  calificacion: number
  titulo: string | null
  comentario: string
  nombre_autor: string
  ciudad: string | null
  verificada: boolean
  respuesta_tienda: string | null
  creado_el: string
}

type Datos = {
  total: number
  media: number
  reparto: Record<string, number>
  resenas: Resena[]
  puedeOpinar: boolean
  yaOpino: boolean
}

const fechaCorta = (iso: string): string => {
  try {
    return new Date(iso).toLocaleDateString('es-CO', { year: 'numeric', month: 'long' })
  } catch {
    return ''
  }
}

/** Estrellas de solo lectura. `valor` puede venir con decimales (la media). */
function Estrellas({ valor, tam = 14 }: { valor: number; tam?: number }) {
  return (
    <span className="vres-estrellas" aria-label={`${valor} de 5`}>
      {[1, 2, 3, 4, 5].map(n => (
        <Star
          key={n}
          size={tam}
          aria-hidden="true"
          className={n <= Math.round(valor) ? 'vres-star llena' : 'vres-star'}
        />
      ))}
    </span>
  )
}

export default function ResenasProducto({
  productoId,
  nombreProducto = '',
}: {
  productoId?: string
  nombreProducto?: string
}) {
  const [datos, setDatos] = useState<Datos | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [expandido, setExpandido] = useState(false)
  const [formAbierto, setFormAbierto] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [enviada, setEnviada] = useState(false)
  const [error, setError] = useState('')

  const [calificacion, setCalificacion] = useState(0)
  const [hoverEstrella, setHoverEstrella] = useState(0)
  const [titulo, setTitulo] = useState('')
  const [comentario, setComentario] = useState('')
  const [nombre, setNombre] = useState('')
  const [ciudad, setCiudad] = useState('')

  const cargar = useCallback(async () => {
    if (!productoId) return
    let accessToken: string | null = null
    try {
      const { data } = await clienteSupabase.auth.getSession()
      accessToken = data?.session?.access_token || null
      const u = data?.session?.user
      if (u && !nombre) {
        setNombre(
          String(u.user_metadata?.nombre || u.user_metadata?.full_name || (u.email || '').split('@')[0] || '').slice(0, 60),
        )
      }
    } catch {
      /* sin sesión: la lista pública se carga igual */
    }
    setToken(accessToken)

    try {
      const res = await fetch(`/api/resenas?producto_id=${encodeURIComponent(productoId)}`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('fallo')
      setDatos(await res.json())
    } catch {
      // Sin datos no se pinta nada: la ficha queda exactamente como está hoy.
      setDatos({ total: 0, media: 0, reparto: {}, resenas: [], puedeOpinar: false, yaOpino: false })
    }
  }, [productoId, nombre])

  useEffect(() => {
    cargar()
    // Solo al montar / cambiar de producto: no hace falta reaccionar al nombre.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productoId])

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (calificacion < 1) return setError('Elige cuántas estrellas le das.')
    if (comentario.trim().length < MIN_COMENTARIO) {
      return setError(`Cuéntanos un poco más (mínimo ${MIN_COMENTARIO} caracteres).`)
    }
    setEnviando(true)
    try {
      const res = await fetch('/api/resenas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          producto_id: productoId,
          calificacion,
          titulo: titulo.trim(),
          comentario: comentario.trim(),
          nombre: nombre.trim(),
          ciudad: ciudad.trim(),
        }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No pudimos guardar tu reseña.')
      setEnviada(true)
      setFormAbierto(false)
    } catch (err: any) {
      setError(err?.message || 'No pudimos guardar tu reseña.')
    } finally {
      setEnviando(false)
    }
  }

  const urlWhatsapp = useMemo(() => {
    const texto = encodeURIComponent(
      `Hola, compré ${nombreProducto || 'un producto'} en VentaDeAcordeones.com y quiero contarles mi experiencia para la reseña.`,
    )
    return `https://wa.me/${WHATSAPP}?text=${texto}`
  }, [nombreProducto])

  // Mientras no hay respuesta del servidor no se ocupa ni un píxel.
  if (!productoId || !datos) return null

  const { total, media, reparto, resenas, puedeOpinar, yaOpino } = datos
  const maxBarra = Math.max(1, ...[5, 4, 3, 2, 1].map(s => Number(reparto?.[s] ?? reparto?.[String(s)] ?? 0)))
  const listaVisible = expandido ? resenas : resenas.slice(0, VISIBLES_INICIALES)

  const formulario = (
    <form className="vres-form" onSubmit={enviar}>
      <div className="vres-form-fila">
        <span className="vres-label">Tu calificación</span>
        <div
          className="vres-picker"
          onMouseLeave={() => setHoverEstrella(0)}
          role="radiogroup"
          aria-label="Calificación de 1 a 5 estrellas"
        >
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={calificacion === n}
              aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
              className={`vres-picker-btn ${n <= (hoverEstrella || calificacion) ? 'on' : ''}`}
              onMouseEnter={() => setHoverEstrella(n)}
              onFocus={() => setHoverEstrella(n)}
              onClick={() => setCalificacion(n)}
            >
              <Star size={26} aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>

      <label className="vres-campo">
        <span className="vres-label">Título (opcional)</span>
        <input
          type="text"
          value={titulo}
          maxLength={120}
          placeholder="Lo que más te gustó, en pocas palabras"
          onChange={e => setTitulo(e.target.value)}
        />
      </label>

      <label className="vres-campo">
        <span className="vres-label">Tu experiencia</span>
        <textarea
          value={comentario}
          maxLength={MAX_COMENTARIO}
          rows={4}
          placeholder="¿Cómo suena? ¿Cómo llegó? ¿Lo recomiendas?"
          onChange={e => setComentario(e.target.value)}
        />
        <span className="vres-contador">
          {comentario.length}/{MAX_COMENTARIO}
        </span>
      </label>

      <div className="vres-form-grid">
        <label className="vres-campo">
          <span className="vres-label">Nombre</span>
          <input type="text" value={nombre} maxLength={60} onChange={e => setNombre(e.target.value)} />
        </label>
        <label className="vres-campo">
          <span className="vres-label">Ciudad (opcional)</span>
          <input type="text" value={ciudad} maxLength={80} placeholder="Valledupar" onChange={e => setCiudad(e.target.value)} />
        </label>
      </div>

      {error && <p className="vres-error">{error}</p>}

      <div className="vres-form-pie">
        <button type="submit" className="vres-enviar" disabled={enviando}>
          {enviando ? <Loader2 size={15} className="vres-girando" /> : <Check size={15} />}
          {enviando ? 'Enviando…' : 'Publicar mi reseña'}
        </button>
        <span className="vres-nota">Se publica cuando la revisemos. No editamos lo que escribes.</span>
      </div>
    </form>
  )

  // ── Caso 1: todavía no hay ninguna reseña ─────────────────────────────────
  // Ni media, ni barras, ni estrellas apagadas: solo una invitación honesta.
  if (total === 0) {
    return (
      <section className="vres-vacio" aria-label="Reseñas del producto">
        {enviada ? (
          <p className="vres-vacio-txt">
            <Check size={14} aria-hidden="true" /> Recibimos tu reseña. Se publica aquí en cuanto la revisemos.
          </p>
        ) : (
          <>
            <p className="vres-vacio-txt">
              Todavía no publicamos reseñas de este producto. Solo mostramos las de clientes que lo compraron
              de verdad, así que la lista tarda en llenarse.
            </p>
            <div className="vres-vacio-acciones">
              {puedeOpinar && !yaOpino && (
                <button type="button" className="vres-enlace-btn" onClick={() => setFormAbierto(v => !v)}>
                  <Star size={14} aria-hidden="true" /> {formAbierto ? 'Cerrar' : 'Escribir mi reseña'}
                </button>
              )}
              <a className="vres-wa" href={urlWhatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={14} aria-hidden="true" /> ¿Ya lo tienes? Cuéntanos por WhatsApp
              </a>
            </div>
            {puedeOpinar && !yaOpino && formAbierto && formulario}
          </>
        )}
      </section>
    )
  }

  // ── Caso 2: hay reseñas reales ────────────────────────────────────────────
  return (
    <section className="vres" aria-label="Reseñas verificadas">
      <header className="vres-cabecera">
        <div className="vres-resumen">
          <div className="vres-eyebrow">— Reseñas verificadas</div>
          <div className="vres-media">
            <strong>{media.toFixed(1)}</strong>
            <span className="vres-media-sub">/ 5</span>
          </div>
          <Estrellas valor={media} tam={16} />
          <p className="vres-total">
            {total} {total === 1 ? 'reseña de un cliente' : 'reseñas de clientes'} con compra confirmada
          </p>
        </div>

        <div className="vres-barras">
          {[5, 4, 3, 2, 1].map(s => {
            const n = Number(reparto?.[s] ?? reparto?.[String(s)] ?? 0)
            return (
              <div className="vres-barra" key={s}>
                <span className="vres-barra-n">{s}★</span>
                <div className="vres-barra-riel">
                  <span style={{ width: `${Math.round((n / maxBarra) * 100)}%` }} />
                </div>
                <span className="vres-barra-cnt">{n}</span>
              </div>
            )
          })}
        </div>
      </header>

      {enviada && (
        <p className="vres-ok">
          <Check size={14} aria-hidden="true" /> Recibimos tu reseña. Se publica en cuanto la revisemos.
        </p>
      )}

      {puedeOpinar && !yaOpino && !enviada && (
        <div className="vres-invita">
          <button type="button" className="vres-enlace-btn" onClick={() => setFormAbierto(v => !v)}>
            <Star size={14} aria-hidden="true" /> {formAbierto ? 'Cerrar' : 'Compraste este producto · escribe tu reseña'}
          </button>
        </div>
      )}
      {puedeOpinar && !yaOpino && formAbierto && formulario}

      <div className="vres-lista">
        {listaVisible.map(r => (
          <article className="vres-item" key={r.id}>
            <div className="vres-item-top">
              <Estrellas valor={r.calificacion} />
              {r.verificada && (
                <span className="vres-sello">
                  <ShieldCheck size={12} aria-hidden="true" /> Compra verificada
                </span>
              )}
            </div>
            {r.titulo && <h3 className="vres-item-titulo">{r.titulo}</h3>}
            <p className="vres-item-txt">{r.comentario}</p>
            <footer className="vres-item-pie">
              <span className="vres-avatar" aria-hidden="true">
                {(r.nombre_autor || 'C').charAt(0).toUpperCase()}
              </span>
              <span className="vres-item-autor">
                <strong>{r.nombre_autor}</strong>
                <span>
                  {[r.ciudad, fechaCorta(r.creado_el)].filter(Boolean).join(' · ')}
                </span>
              </span>
            </footer>
            {r.respuesta_tienda && (
              <div className="vres-respuesta">
                <strong>Respuesta de VentaDeAcordeones.com</strong>
                <p>{r.respuesta_tienda}</p>
              </div>
            )}
          </article>
        ))}
      </div>

      {resenas.length > VISIBLES_INICIALES && (
        <button type="button" className="vres-mas" onClick={() => setExpandido(v => !v)}>
          {expandido ? 'Ver menos' : `Ver las ${resenas.length} reseñas`}
        </button>
      )}
    </section>
  )
}
