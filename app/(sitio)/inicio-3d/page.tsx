import type { Metadata } from 'next'
import Inicio3dCliente from './Inicio3dCliente'

// Página en construcción — no indexar mientras se arma el Inicio 3D.
export const metadata: Metadata = {
  title: 'Inicio 3D',
  robots: { index: false, follow: false },
}

export default function Pagina() {
  return <Inicio3dCliente />
}
