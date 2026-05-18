'use client'

// Reproduce EXACTAMENTE el árbol de src/main.tsx (sin ReactDOM.createRoot:
// Next monta). react-router-dom sigue vivo aquí dentro → checkpoint seguro.
import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { ProveedorAutenticacion } from '@/contextos/ContextoAutenticacion'
import { ProveedorTema } from '@/contextos/ContextoTema'
import App from '@/App'

export default function AppShell() {
  useEffect(() => {
    const onOffline = () => {
      const banner = document.createElement('div')
      banner.id = 'offline-banner'
      banner.textContent =
        '📡 Sin conexión — Algunas funciones pueden no estar disponibles'
      Object.assign(banner.style, {
        position: 'fixed', top: '0', left: '0', right: '0', zIndex: '99999',
        background: '#1a1a2e', color: '#fff', textAlign: 'center',
        padding: '10px', fontSize: '14px', fontWeight: '500',
      })
      document.body.prepend(banner)
    }
    const onOnline = () => document.getElementById('offline-banner')?.remove()
    window.addEventListener('offline', onOffline)
    window.addEventListener('online', onOnline)
    return () => {
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  return (
    <BrowserRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ProveedorTema>
        <ProveedorAutenticacion>
          <App />
        </ProveedorAutenticacion>
      </ProveedorTema>
    </BrowserRouter>
  )
}
