'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const CreadorProductos = dynamic(
  () => import('@/paginas/admin/CreadorDeProductosPR/CreadorProductosPR'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function AgregarProductoCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <CreadorProductos />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
