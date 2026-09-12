'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import Resenas from '@/paginas/admin/Resenas/Resenas'

export default function ResenasCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <Resenas />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
