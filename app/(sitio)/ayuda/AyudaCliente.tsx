'use client'

// Body client-side (ssr:false) — idéntico al SPA.
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const Ayuda = dynamic(() => import('@/paginas/ayuda/Ayuda'), {
  ssr: false,
  loading: () => <CargandoPagina />,
})

export default function AyudaCliente() {
  return <Ayuda />
}
