import type { Metadata } from 'next'
import LandingDeLujo from '@/paginas/LandingDeLujo/LandingDeLujo'

// Copiada de AcademiaNext (/landingdelujo). Ruta de PRUEBAS mientras se itera: noindex a propósito
// para que Google no la levante con este nombre provisional. Al fijar la URL final se quita el
// robots y se le pone canonical.
export const metadata: Metadata = {
  title: 'Acordeones personalizados hechos a mano',
  description:
    'Diseñamos y armamos tu acordeón pieza por pieza: tus colores, tu nácar, tus herrajes. Te mandamos el diseño en 3D antes de empezar.',
  robots: { index: false, follow: false },
}

export default function PaginaLandingDeLujo() {
  return <LandingDeLujo />
}
