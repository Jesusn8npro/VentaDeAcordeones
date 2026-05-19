'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import ManejoCupones from '@/paginas/admin/ManejoCupones/ManejoCupones'

export default function CuponesCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <ManejoCupones />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
