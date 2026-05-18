'use client'

import dynamic from 'next/dynamic'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const Usuarios = dynamic(
  () => import('@/paginas/admin/Usuarios/Usuarios'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function UsuariosCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <Usuarios />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
