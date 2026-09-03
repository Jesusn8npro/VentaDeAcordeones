'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PaginaSesionCerrada() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/')
    }, 4000)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '20px' }}>
      <div style={{
        background: 'var(--vda-superficie)',
        border: '1px solid var(--vda-linea)',
        color: 'var(--vda-tinta)',
        borderRadius: 12,
        boxShadow: 'var(--vda-sombra-card)',
        padding: '32px'
      }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Sesión cerrada</h1>
        <p style={{ color: 'var(--vda-tinta-dim)', marginTop: 8 }}>
          Has cerrado sesión correctamente. Por seguridad, algunas secciones no estarán disponibles.
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            onClick={() => router.push('/login')}
            style={{
              background: '#ff6a00',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '10px 16px',
              cursor: 'pointer'
            }}
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              background: 'var(--vda-superficie-3)',
              color: 'var(--vda-tinta)',
              border: 'none',
              borderRadius: 8,
              padding: '10px 16px',
              cursor: 'pointer'
            }}
          >
            Ir al inicio
          </button>
        </div>

        <div style={{ marginTop: 24, fontSize: 14, color: 'var(--vda-tinta-muted)' }}>
          Serás redirigido automáticamente al inicio en unos segundos.
        </div>
      </div>
    </div>
  )
}