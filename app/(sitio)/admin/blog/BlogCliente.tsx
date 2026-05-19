'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import AdminBlog from '@/paginas/admin/Blog/AdminBlog'

export default function BlogCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <AdminBlog />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
