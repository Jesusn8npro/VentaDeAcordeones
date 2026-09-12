import { actualizarFeed } from './api/meta/actualizacion-automatica'

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  // Fire-and-forget: con `await` el primer request tras cada deploy esperaba a que terminara el
  // feed de Meta. El feed no hace falta para servir páginas, así que se lanza en segundo plano y
  // el servidor queda listo de inmediato. El .catch() evita un unhandled rejection.
  void actualizarFeed().catch(() => {
    // No interrumpir el arranque del servidor si falla el feed inicial
  })
}
