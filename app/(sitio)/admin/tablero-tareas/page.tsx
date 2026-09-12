import type { Metadata } from 'next'
import TableroTareasCliente from './TableroTareasCliente'

export const metadata: Metadata = {
  title: 'Tablero de tareas — Admin',
  robots: { index: false, follow: false },
}

export default function PaginaTableroTareasRoute() {
  return <TableroTareasCliente />
}
