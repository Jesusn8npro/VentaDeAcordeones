'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const ManejoCupones = dynamic(
  () => import('@/paginas/admin/ManejoCupones/ManejoCupones'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function CuponesCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <ManejoCupones />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
