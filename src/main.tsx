import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ProveedorAutenticacion } from './contextos/ContextoAutenticacion'
import { ProveedorTema } from './contextos/ContextoTema'
import App from './App'
import './estilos/index.css'

window.addEventListener('offline', () => {
  const banner = document.createElement('div')
  banner.id = 'offline-banner'
  banner.textContent = '📡 Sin conexión — Algunas funciones pueden no estar disponibles'
  Object.assign(banner.style, {
    position: 'fixed', top: '0', left: '0', right: '0', zIndex: '99999',
    background: '#1a1a2e', color: '#fff', textAlign: 'center',
    padding: '10px', fontSize: '14px', fontWeight: '500'
  })
  document.body.prepend(banner)
})
window.addEventListener('online', () => {
  document.getElementById('offline-banner')?.remove()
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    <ProveedorTema>
      <ProveedorAutenticacion>
        <App />
      </ProveedorAutenticacion>
    </ProveedorTema>
  </BrowserRouter>,
)
