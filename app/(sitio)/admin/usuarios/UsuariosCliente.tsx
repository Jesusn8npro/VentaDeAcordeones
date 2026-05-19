'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import Usuarios from '@/paginas/admin/Usuarios/Usuarios'

export default function UsuariosCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <Usuarios />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
