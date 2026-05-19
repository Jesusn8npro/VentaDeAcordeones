'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import GestionProductos from '@/paginas/admin/GestionProductos/GestionProductos'

export default function GestionProductosCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <GestionProductos />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
