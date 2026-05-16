import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function PaginaSesionCerrada() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/')
    }, 4000)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: '20px' }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 6px 20px rgba(0,0,0,0.08)',
        padding: '32px'
      }}>
        <h1 style={{ margin: 0, fontSize: 28 }}>Sesión cerrada</h1>
        <p style={{ color: '#555', marginTop: 8 }}>
          Has cerrado sesión correctamente. Por seguridad, algunas secciones no estarán disponibles.
        </p>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            onClick={() => navigate('/login')}
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
            onClick={() => navigate('/')}
            style={{
              background: '#f2f2f2',
              color: '#333',
              border: 'none',
              borderRadius: 8,
              padding: '10px 16px',
              cursor: 'pointer'
            }}
          >
            Ir al inicio
          </button>
        </div>

        <div style={{ marginTop: 24, fontSize: 14, color: '#777' }}>
          Serás redirigido automáticamente al inicio en unos segundos.
        </div>
      </div>
    </div>
  )
}