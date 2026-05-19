'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    console.error('[app-error]', error)
  }, [error])

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1.5rem',
      padding: '2rem',
      fontFamily: 'system-ui, sans-serif',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '4rem' }}>⚠️</div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
        Algo salió mal
      </h1>
      <p style={{ color: '#666', maxWidth: '400px', margin: 0 }}>
        Ocurrió un error inesperado. Puedes intentar de nuevo o volver al inicio.
      </p>
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={reset}
          style={{
            padding: '0.75rem 1.5rem',
            background: '#ff6b35',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Intentar de nuevo
        </button>
        <button
          onClick={() => router.push('/')}
          style={{
            padding: '0.75rem 1.5rem',
            background: 'transparent',
            color: '#1a1a2e',
            border: '2px solid #1a1a2e',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '1rem',
          }}
        >
          Ir al inicio
        </button>
      </div>
    </div>
  )
}
