'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import CreadorProductosPR from '../CreadorDeProductosPR/CreadorProductosPR'

/**
 * EditarProducto - Página para editar productos existentes
 * Ahora usa el componente CreadorProductosPR
 */

const EditarProducto = () => {
  const params = useParams()
  const slug = params.slug as string

  const manejarExito = (_producto) => {
    // Aquí puedes agregar lógica adicional si es necesaria
  }

  return (
    <CreadorProductosPR 
      modo="editar"
      slug={slug}
      onSuccess={manejarExito}
    />
  )
}

export default EditarProducto
