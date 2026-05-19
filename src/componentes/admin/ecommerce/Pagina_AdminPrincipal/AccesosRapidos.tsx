'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCartIcon, BoxCubeIcon, PackageIcon } from '../../iconos/IconosAdmin'

const accesos = [
  {
    icono: <ShoppingCartIcon />,
    label: 'Ver todos los pedidos',
    ruta: '/admin/pedidos',
    variante: 'acceso-primario'
  },
  {
    icono: <BoxCubeIcon />,
    label: 'Agregar producto',
    ruta: '/admin/productos/agregar',
    variante: 'acceso-acento'
  },
  {
    icono: <PackageIcon />,
    label: 'Ver inventario',
    ruta: '/admin/inventario',
    variante: 'acceso-exito'
  }
]

const AccesosRapidos = () => {
  const router = useRouter()

  return (
    <div className="accesos-rapidos-seccion">
      <h3 className="accesos-titulo">Accesos rápidos</h3>
      <div className="accesos-grid">
        {accesos.map((a) => (
          <button
            key={a.ruta}
            className={`acceso-btn ${a.variante}`}
            onClick={() => router.push(a.ruta)}
            type="button"
          >
            <span className="acceso-icono">{a.icono}</span>
            <span className="acceso-label">{a.label}</span>
            <span className="acceso-flecha">→</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default AccesosRapidos
