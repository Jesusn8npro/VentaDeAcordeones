'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const VideosIA = dynamic(
  () => import('@/paginas/admin/VideosIA/VideosIA'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function VideosCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <VideosIA />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
