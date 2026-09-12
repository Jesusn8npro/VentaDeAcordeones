'use client'

import React from 'react'

interface Resena {
  id: string | number
  nombre?: string
  calificacion?: number
  comentario?: string
  fecha?: string
  verificada?: boolean
}

interface Props {
  reviews: Resena[]
}

/**
 * Opiniones de clientes. Se pinta SÓLO con reseñas reales que vengan de la base:
 * si no hay ninguna (hoy `usarLandingData` devuelve la lista vacía a propósito, hasta
 * que exista la tabla `resenas`), la sección desaparece en vez de rellenarse con
 * testimonios inventados.
 *
 * Los colores quemados de antes (#ff6b35, #27ae60, #d4edda, #f39c12) se cambiaron por
 * tokens --vda-*: con el tema claro el badge verde sobre verde era ilegible.
 */
export default function SeccionResenas({ reviews }: Props) {
  if (!reviews || reviews.length === 0) return null

  return (
    <section className="pcat-resenas">
      <h2>Opiniones de clientes ({reviews.length})</h2>
      <div className="pcat-resenas-grid">
        {reviews.map((r) => {
          const estrellas = Math.min(5, Math.max(0, Number(r.calificacion) || 0))
          return (
            <article key={r.id} className="pcat-resena">
              <div className="pcat-resena-cab">
                <div className="pcat-resena-avatar" aria-hidden="true">
                  {(r.nombre || 'A')[0].toUpperCase()}
                </div>
                <div>
                  <div className="pcat-resena-nombre">
                    {r.nombre || 'Cliente'}
                    {r.verificada && <span className="pcat-resena-verificada"> Compra verificada</span>}
                  </div>
                  {estrellas > 0 && (
                    <div className="pcat-resena-estrellas" aria-label={`${estrellas} de 5 estrellas`}>
                      {'★'.repeat(estrellas)}{'☆'.repeat(5 - estrellas)}
                    </div>
                  )}
                </div>
                {r.fecha && (
                  <time className="pcat-resena-fecha" dateTime={r.fecha}>
                    {new Date(r.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </time>
                )}
              </div>
              {r.comentario && <p>{r.comentario}</p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}
