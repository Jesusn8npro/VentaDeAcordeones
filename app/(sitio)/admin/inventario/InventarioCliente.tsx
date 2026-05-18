'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const Inventario = dynamic(
  () => import('@/paginas/admin/Inventario/Inventario'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function InventarioCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <Inventario />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
