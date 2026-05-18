'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const DashboardAdmin = dynamic(
  () => import('@/paginas/admin/DashboardAdmin/DashboardAdmin'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function DashboardCliente() {
  return (
    <RutaAdmin>
      <DashboardAdmin />
    </RutaAdmin>
  )
}
