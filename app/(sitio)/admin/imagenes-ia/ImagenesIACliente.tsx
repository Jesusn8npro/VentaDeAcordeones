'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const ImagenesIA = dynamic(
  () => import('@/paginas/admin/ImagenesIA/ImagenesIA'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function ImagenesIACliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <ImagenesIA />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
