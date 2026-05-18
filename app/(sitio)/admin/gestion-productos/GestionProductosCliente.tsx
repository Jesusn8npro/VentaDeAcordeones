'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const GestionProductos = dynamic(
  () => import('@/paginas/admin/GestionProductos/GestionProductos'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function GestionProductosCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <GestionProductos />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
