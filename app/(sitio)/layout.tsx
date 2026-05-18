// Layout del route group (sitio): aplica SOLO a rutas migradas a App Router real.
// Provee el árbol global de providers + armazón (Header/Footer/flotantes).
// El catch-all app/[...slug] y la home app/page.tsx viven en la raíz (fuera de
// este grupo) y conservan su propio árbol (AppShell con react-router) — sin
// doble-wrap de providers.
//
// <Suspense> GLOBAL por encima del gate de Providers: Next exige que cualquier
// componente que use useSearchParams()/usePathname() (vía @/compat/router) esté
// bajo un boundary de Suspense para el prerender. Aquí cubre TODA ruta migrada.
import { Suspense } from 'react'
import Providers from '../providers'
import CargandoPagina from '@/componentes/sistema/CargandoPagina'

export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<CargandoPagina />}>
      <Providers>{children}</Providers>
    </Suspense>
  )
}
