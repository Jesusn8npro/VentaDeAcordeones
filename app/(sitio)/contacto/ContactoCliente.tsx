'use client'

import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const Contacto = dynamic(
  () => import('@/paginas/empresa/Contacto/Contacto'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function ContactoCliente() {
  return <Contacto />
}
