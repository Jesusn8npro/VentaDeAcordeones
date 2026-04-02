import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ProveedorAutenticacion } from './contextos/ContextoAutenticacion'
import { ProveedorTema } from './contextos/ContextoTema'
import App from './App.jsx'
import './estilos/index.css';

// Configuración de seguridad para producción
if (import.meta.env.PROD) {
  // Deshabilitar console.log en producción
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  
  console.log = function(...args) {
    // Solo permitir logs de error críticos
    if (args[0] && args[0].toString().includes('ERROR')) {
      originalError.apply(console, args);
    }
  };
  
  console.warn = function(...args) {
    // Silenciar warnings en producción
    return;
  };
  
  // Mensaje mínimo y sin acceso a propiedades inexistentes
  console.log('%cModo producción activo', 'color: #ff5722; font-weight: bold;');
}

// Importar script de prueba para Supabase (solo en desarrollo)
if (import.meta.env.DEV) {
  import('./utils/test-supabase-insert.js');
}

ReactDOM.createRoot(document.getElementById('root')).render(
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
