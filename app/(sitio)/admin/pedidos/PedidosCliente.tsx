'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import Pedidos from '@/paginas/admin/Pedidos/Pedidos'

export default function PedidosCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <Pedidos />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
