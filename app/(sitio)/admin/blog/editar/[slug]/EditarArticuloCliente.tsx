'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CreadorArticulos from '@/paginas/admin/Blog/CreadorArticulos'

export default function EditarArticuloCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <CreadorArticulos />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
