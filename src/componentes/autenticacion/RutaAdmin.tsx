'use client'

import React, { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contextos/ContextoAutenticacion'

// Guard de ruta para área Admin: requiere sesión y rol admin
export default function RutaAdmin({ children }) {
  const { sesionInicializada, esAdmin, cargando, usuario } = useAuth()
  const router = useRouter()
  const hasShownInitialLoad = useRef(false)

  const esUsuarioAdmin = typeof esAdmin === 'function' ? esAdmin() : false

  // Redirigir si podemos navegar y el usuario no tiene acceso admin
  useEffect(() => {
    if (!canNavigateImmediately()) return
    if (!sesionInicializada || !usuario) {
      router.replace('/login')
    } else if (!esUsuarioAdmin) {
      router.replace('/')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sesionInicializada, usuario, esUsuarioAdmin, router])

  // OPTIMIZACIÓN: Solo mostrar carga en la primera verificación inicial
  // No mostrar carga durante navegación entre páginas de admin
  const shouldShowLoading = () => {
    // Si ya hemos mostrado la carga inicial una vez, no volver a mostrarla
    if (hasShownInitialLoad.current) {
      return false
    }

    // Solo mostrar carga si realmente estamos en proceso inicial de autenticación
    const isInitialAuth = cargando && !sesionInicializada && !usuario

    if (isInitialAuth) {
      hasShownInitialLoad.current = true
      return true
    }

    return false
  }

  // NAVEGACIÓN FLUIDA: Si ya tenemos datos básicos, permitir navegación inmediata
  const canNavigateImmediately = () => {
    // Si tenemos sesión inicializada y usuario, permitir navegación
    if (sesionInicializada && usuario) {
      return true
    }

    // Si no estamos cargando y no hay sesión, también es claro
    if (!cargando && !sesionInicializada) {
      return true
    }

    return false
  }

  // Mostrar loader SOLO en la primera carga inicial
  if (shouldShowLoading()) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
        fontSize: '16px',
        gap: '8px'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid #f3f3f3',
          borderTop: '3px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div>Verificando acceso...</div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // NAVEGACIÓN INMEDIATA: Si podemos navegar, proceder con las verificaciones
  if (canNavigateImmediately()) {
    // No logueado o sin rol admin: null mientras el useEffect redirige
    if (!sesionInicializada || !usuario || !esUsuarioAdmin) {
      return null
    }

    // Usuario admin verificado: mostrar contenido
    return children
  }

  // FALLBACK: Si no podemos determinar el estado, mostrar contenido
  // (esto evita bloqueos indefinidos)
  return children
}
