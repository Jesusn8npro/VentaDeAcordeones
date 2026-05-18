'use client'

// Body client-side (ssr:false) — idéntico al SPA. PaginaNoEncontrada usa
// @/compat/router.Link (sin react-router-dom).
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const PaginaNoEncontrada = dynamic(
  () => import('@/paginas/sistema/PaginaNoEncontrada/PaginaNoEncontrada'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function NotFoundCliente() {
  return <PaginaNoEncontrada />
}
