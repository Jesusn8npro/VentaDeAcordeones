import React from 'react'
import { useNavigate } from 'react-router-dom'

export default function GenericaAdmin({ titulo = 'Vista', descripcion = 'Esta sección está en construcción.' }) {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-fondo-secundario)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{
        background: 'var(--color-fondo)',
        border: '1px solid var(--color-borde)',
        borderRadius: 'var(--radio-borde-xl, 16px)',
        boxShadow: 'var(--sombra-mediana)',
        padding: '48px 40px',
        maxWidth: 480,
        width: '100%',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
      }}>
        {/* Icono */}
        <div style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          background: 'var(--color-primario-50, #ecf3ff)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          marginBottom: 8,
        }}>
          🚧
        </div>

        {/* Título */}
        <h1 style={{
          fontSize: 22,
          fontWeight: 800,
          color: 'var(--color-texto)',
          margin: 0,
        }}>
          {titulo}
        </h1>

        {/* Descripción */}
        <p style={{
          fontSize: 14,
          color: 'var(--color-texto-secundario)',
          lineHeight: 1.6,
          margin: 0,
          maxWidth: 340,
        }}>
          {descripcion}
        </p>

        {/* Badge */}
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--color-advertencia-50, #fff6ed)',
          color: 'var(--color-advertencia-600, #d97706)',
          border: '1px solid var(--color-advertencia, #f59e0b)',
          borderRadius: 999,
          padding: '5px 14px',
          fontSize: 12,
          fontWeight: 600,
        }}>
          En construcción
        </span>

        {/* Botón volver */}
        <button
          onClick={() => navigate(-1)}
          style={{
            marginTop: 8,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'var(--color-primario)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radio-borde-mediano, 8px)',
            padding: '10px 22px',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.2s',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-primario-hover, #3641f5)')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--color-primario)')}
        >
          ← Volver
        </button>
      </div>
    </div>
  )
}
