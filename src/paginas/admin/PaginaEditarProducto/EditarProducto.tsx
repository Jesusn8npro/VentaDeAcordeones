import React from 'react'
import { useParams } from '@/compat/router'
import CreadorProductosPR from '../CreadorDeProductosPR/CreadorProductosPR'

/**
 * EditarProducto - Página para editar productos existentes
 * Ahora usa el componente CreadorProductosPR
 */

const EditarProducto = () => {
  const { slug } = useParams()

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
