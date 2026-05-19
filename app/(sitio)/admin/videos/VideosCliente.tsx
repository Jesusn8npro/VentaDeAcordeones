'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import VideosIA from '@/paginas/admin/VideosIA/VideosIA'

export default function VideosCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <VideosIA />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
