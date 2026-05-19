'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import ImagenesIA from '@/paginas/admin/ImagenesIA/ImagenesIA'

export default function ImagenesIACliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <ImagenesIA />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
