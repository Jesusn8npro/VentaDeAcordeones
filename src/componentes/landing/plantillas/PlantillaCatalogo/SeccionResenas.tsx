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

export default function SeccionResenas({ reviews }: Props) {
  if (!reviews || reviews.length === 0) return null
  return (
    <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #eee' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: '1.5rem', fontSize: '1.5rem' }}>
        ⭐ Opiniones de clientes ({reviews.length})
      </h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        {reviews.map((r) => (
          <div key={r.id} style={{ background: '#fff', border: '1px solid #eee', borderRadius: '10px', padding: '1.25rem', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#ff6b35', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', flexShrink: 0 }}>
                {(r.nombre || 'A')[0].toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong style={{ fontSize: '0.95rem', color: '#2c3e50' }}>{r.nombre}</strong>
                  {r.verificada && (
                    <span style={{ fontSize: '0.75rem', color: '#27ae60', background: '#d4edda', padding: '1px 6px', borderRadius: '4px' }}>
                      ✓ Compra verificada
                    </span>
                  )}
                </div>
                <div style={{ color: '#f39c12', fontSize: '1rem', letterSpacing: '2px' }}>
                  {'★'.repeat(r.calificacion || 5)}{'☆'.repeat(5 - (r.calificacion || 5))}
                </div>
              </div>
              {r.fecha && (
                <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#aaa' }}>
                  {new Date(r.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
            <p style={{ margin: 0, color: '#555', fontSize: '0.95rem', lineHeight: 1.5 }}>{r.comentario}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
