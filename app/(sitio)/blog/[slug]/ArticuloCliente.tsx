'use client'

// Body client-side (ssr:false) — idéntico al SPA. ArticuloBlog lee el slug
// vía @/compat/router.useParams() (param `slug` de la ruta /blog/[slug]).
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const ArticuloBlog = dynamic(() => import('@/paginas/blog/ArticuloBlog'), {
  ssr: false,
  loading: () => <CargandoPagina />,
})

export default function ArticuloCliente() {
  return <ArticuloBlog />
}
