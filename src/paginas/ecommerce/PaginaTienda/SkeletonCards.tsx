'use client'

import React from 'react'

/**
 * SkeletonCards — placeholders de tarjeta mientras carga la tienda.
 * Se renderizan como hijos directos del grid (.tienda-grid) para ocupar
 * exactamente las celdas que ocuparán los productos (sin salto de layout).
 */
export default function SkeletonCards({ cantidad = 8 }: { cantidad?: number }) {
  return (
    <>
      {Array.from({ length: cantidad }).map((_, i) => (
        <div key={i} className="tienda-skeleton" aria-hidden="true">
          <div className="tienda-skeleton-img" />
          <div className="tienda-skeleton-linea" style={{ width: '82%' }} />
          <div className="tienda-skeleton-linea" style={{ width: '48%' }} />
          <div className="tienda-skeleton-linea tienda-skeleton-precio" style={{ width: '60%' }} />
        </div>
      ))}
    </>
  )
}
