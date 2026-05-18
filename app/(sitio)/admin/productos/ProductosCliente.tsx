'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const ListaProductos = dynamic(
  () => import('@/paginas/admin/productos/ListaProductos'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function ProductosCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <ListaProductos />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
