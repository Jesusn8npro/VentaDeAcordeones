import { actualizarFeed } from './api/meta/actualizacion-automatica'

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  try {
    await actualizarFeed()
  } catch (e: any) {
    // No interrumpir el arranque del servidor si falla el feed inicial
  }
}
