// Home (/). El catch-all NO-opcional app/[...slug] no matchea '/', así que la
// raíz necesita su propia page. Monta el mismo shell SPA (react-router vivo).
import ClientShell from './_shell/ClientShell'

export default function HomePage() {
  return <ClientShell />
}
