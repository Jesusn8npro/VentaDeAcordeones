import { useEffect } from 'react'

const BASE = 'VentaDeAcordeones.com'

export function useTituloPagina(titulo: string) {
  useEffect(() => {
    document.title = titulo ? `${titulo} — ${BASE}` : BASE
    return () => { document.title = BASE }
  }, [titulo])
}
