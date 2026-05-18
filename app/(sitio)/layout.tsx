// Layout del route group (sitio): aplica SOLO a rutas migradas a App Router real.
// Provee el árbol global de providers + armazón (Header/Footer/flotantes).
// El catch-all app/[...slug] y la home app/page.tsx viven en la raíz (fuera de
// este grupo) y conservan su propio árbol (AppShell con react-router) — sin
// doble-wrap de providers.
import Providers from '../providers'

export default function SitioLayout({ children }: { children: React.ReactNode }) {
  return <Providers>{children}</Providers>
}
