'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const EditarProducto = dynamic(
  () => import('@/paginas/admin/PaginaEditarProducto/EditarProducto'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function EditarProductoCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <EditarProducto />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
