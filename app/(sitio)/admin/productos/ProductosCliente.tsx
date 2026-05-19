'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import ListaProductos from '@/paginas/admin/productos/ListaProductos'

export default function ProductosCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <ListaProductos />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
