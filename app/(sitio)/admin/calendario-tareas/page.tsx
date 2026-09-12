import type { Metadata } from 'next'
import CalendarioTareasCliente from './CalendarioTareasCliente'

export const metadata: Metadata = {
  title: 'Calendario de tareas — Admin',
  robots: { index: false, follow: false },
}

export default function PaginaCalendarioTareasRoute() {
  return <CalendarioTareasCliente />
}
