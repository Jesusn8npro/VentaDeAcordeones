import { Fraunces, Bricolage_Grotesque, JetBrains_Mono } from 'next/font/google'

// Trío tipográfico del sistema de diseño (guias_diseños/modelo3dlanding.html + assets/system.css):
//   Fraunces            → titulares, con la itálica como acento de color
//   Bricolage Grotesque → cuerpo de texto
//   JetBrains Mono      → etiquetas, numeración de sección, chips y botones
// Se cargan SOLO en esta ruta: el resto de la plataforma sigue con Inter y no paga estas fuentes.
// Los nombres de variable llevan prefijo `fuente-` porque sistema.css reserva --serif/--display/--mono
// para el alias local, igual que en el CSS original.
const serif = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--fuente-serif',
})

const display = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--fuente-display',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '600'],
  display: 'swap',
  variable: '--fuente-mono',
})

export default function LandingDeLujoLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${serif.variable} ${display.variable} ${mono.variable}`}>{children}</div>
}
