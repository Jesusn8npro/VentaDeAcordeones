'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import Inventario from '@/paginas/admin/Inventario/Inventario'

export default function InventarioCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <Inventario />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
