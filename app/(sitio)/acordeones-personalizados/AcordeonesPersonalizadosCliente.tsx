'use client'

// Body client-side (ssr:false) — idéntico al SPA. AcordeonesPersonalizados usa
// window/document (scrollytelling) en useEffect: por eso ssr:false.
import dynamic from 'next/dynamic'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

const AcordeonesPersonalizados = dynamic(
  () => import('@/paginas/AcordeonesPersonalizados/AcordeonesPersonalizados'),
  { ssr: false, loading: () => <CargandoPagina /> }
)

export default function AcordeonesPersonalizadosCliente() {
  return <AcordeonesPersonalizados />
}
