// Catch-all NO-opcional (CHECKPOINT SEGURO). Atrapa toda ruta aún no migrada y
// monta el SPA actual (react-router vivo dentro del boundary ssr:false).
// Clave: '[...slug]' (no '[[...slug]]') CEDE ante rutas específicas como
// app/(sitio)/producto/[slug] — el opcional las eclipsaba. Se elimina en Fase 2.
import ClientShell from '../_shell/ClientShell'

export default function CatchAllPage() {
  return <ClientShell />
}
