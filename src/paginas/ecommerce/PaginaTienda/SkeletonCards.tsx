'use client'

import React from 'react'

export default function SkeletonCards() {
  return (
    <div className="tienda-productos">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.5s infinite',
            borderRadius: '12px',
            height: '320px'
          }} />
        ))}
        <style>{`
          @keyframes skeleton-shimmer {
            0% { background-position: 200% 0 }
            100% { background-position: -200% 0 }
          }
        `}</style>
      </div>
    </div>
  )
}
