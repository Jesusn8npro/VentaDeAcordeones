'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const CreadorArticulos = dynamic(
  () => import('@/paginas/admin/Blog/CreadorArticulos'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function EditarArticuloCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <CreadorArticulos />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
