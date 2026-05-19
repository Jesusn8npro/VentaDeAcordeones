'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import TableroTareas from '@/paginas/admin/calendario_tareas/TableroTareas'

export default function TableroTareasCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <TableroTareas />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
