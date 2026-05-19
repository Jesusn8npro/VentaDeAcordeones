'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CalendarioTareas from '@/paginas/admin/calendario_tareas/CalendarioTareas'

export default function CalendarioTareasCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <CalendarioTareas />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
