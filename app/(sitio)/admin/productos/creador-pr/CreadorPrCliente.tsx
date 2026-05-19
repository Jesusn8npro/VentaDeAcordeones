'use client'
import RutaAdmin from '@/componentes/autenticacion/RutaAdmin'
import DisposicionAdmin from '@/componentes/admin/DisposicionAdmin/DisposicionAdmin'
import CreadorProductos from '@/paginas/admin/CreadorDeProductosPR/CreadorProductosPR'

export default function CreadorPrCliente() {
  return (
    <RutaAdmin>
      <DisposicionAdmin>
        <CreadorProductos />
      </DisposicionAdmin>
    </RutaAdmin>
  )
}
