import type { Metadata } from 'next'
import Mantenimiento from '@/componentes/sistema/Mantenimiento/Mantenimiento'

export const metadata: Metadata = {
  title: 'Estamos actualizando',
  description: 'Estamos preparando una nueva experiencia. Volvemos muy pronto.',
  robots: { index: false, follow: false },
}

export default function PaginaMantenimiento() {
  return <Mantenimiento />
}
