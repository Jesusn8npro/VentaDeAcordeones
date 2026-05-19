'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import AdminChats from '@/paginas/admin/ManejoDeChats/AdminChats'

export default function ChatsCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <AdminChats />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
