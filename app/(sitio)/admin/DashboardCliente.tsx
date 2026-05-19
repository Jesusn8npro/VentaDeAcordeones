'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DashboardAdmin from '@/paginas/admin/DashboardAdmin/DashboardAdmin'

export default function DashboardCliente() {
  return (
    <RutaAdmin>
      <DashboardAdmin />
    </RutaAdmin>
  )
}
