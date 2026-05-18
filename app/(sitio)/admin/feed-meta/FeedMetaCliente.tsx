'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PanelFeedMeta = dynamic(
  () => import('@/paginas/admin/FeedMeta/PanelFeedMeta'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function FeedMetaCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <PanelFeedMeta />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
