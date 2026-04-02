import React from 'react'

export default function GenericaAdmin({ titulo = 'Vista', descripcion = 'Página en construcción.' }) {
  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>{titulo}</h1>
      </div>
      <div style={{ background: 'var(--color-fondo-terciario, #f7f7f7)', borderRadius: '12px', padding: '1rem', color: 'var(--color-texto-secundario, #555)' }}>
        {descripcion}
      </div>
    </div>
  )
}