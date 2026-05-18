'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const AdminChats = dynamic(
  () => import('@/paginas/admin/ManejoDeChats/AdminChats'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function ChatsCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <AdminChats />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
