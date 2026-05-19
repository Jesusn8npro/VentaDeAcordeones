'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import Categorias from '@/paginas/admin/Categorias/Categorias'

export default function CategoriasCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <Categorias />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
