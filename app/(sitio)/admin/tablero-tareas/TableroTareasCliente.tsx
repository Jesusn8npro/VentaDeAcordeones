'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import TableroTareas from '@/paginas/admin/CalendarioTareas/TableroTareas'

export default function TableroTareasCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <TableroTareas />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
