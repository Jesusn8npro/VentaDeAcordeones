'use client'

// Body client-side (ssr:false) — idéntico al SPA.
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaBlog = dynamic(() => import('@/paginas/blog/PaginaBlog'), {
  ssr: false,
  loading: () => <CargandoPagina />,
})

export default function BlogCliente() {
  return <PaginaBlog />
}
