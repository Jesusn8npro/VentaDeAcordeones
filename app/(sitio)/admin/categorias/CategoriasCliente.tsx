'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const Categorias = dynamic(
  () => import('@/paginas/admin/Categorias/Categorias'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function CategoriasCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <Categorias />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
