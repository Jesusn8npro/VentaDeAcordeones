'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const CambiosDevoluciones = dynamic(
  () => import('@/paginas/legal/CambiosDevoluciones/CambiosDevoluciones'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function CambiosDevolucionesCliente() {
  return <CambiosDevoluciones />
}
