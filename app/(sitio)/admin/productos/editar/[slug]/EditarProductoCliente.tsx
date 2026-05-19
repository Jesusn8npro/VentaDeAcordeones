'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import EditarProducto from '@/paginas/admin/PaginaEditarProducto/EditarProducto'

export default function EditarProductoCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <EditarProducto />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
