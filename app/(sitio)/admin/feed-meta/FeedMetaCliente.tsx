'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import PanelFeedMeta from '@/paginas/admin/FeedMeta/PanelFeedMeta'

export default function FeedMetaCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <PanelFeedMeta />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
