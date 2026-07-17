'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../contextos/ContextoAutenticacion'

// Guard de ruta para área Admin: requiere sesión y rol admin.
// El gate `montado` garantiza que el servidor y el primer render del cliente
// pinten lo mismo (loader) → sin mismatch de hidratación. La verificación real
// de auth corre solo en el cliente, después de montar.
export default function RutaAdmin({ children }) {
  const { sesionInicializada, esAdmin, cargando, usuario } = useAuth()
  const router = useRouter()
  const [montado, setMontado] = useState(false)

  useEffect(() => {
    setMontado(true)
  }, [])

  const esUsuarioAdmin = typeof esAdmin === 'function' ? esAdmin() : false

  // Redirigir cuando ya montó y la sesión terminó de resolverse.
  // No decidir mientras el perfil siga `_parcial` (rol real aún cargando).
  useEffect(() => {
    if (!montado || cargando || usuario?._parcial) return
    if (!sesionInicializada || !usuario) {
      router.replace('/login')
    } else if (!esUsuarioAdmin) {
      router.replace('/')
    }
  }, [montado, cargando, sesionInicializada, usuario, esUsuarioAdmin, router])

  // Server + primer render de cliente, o perfil aún cargando → loader idéntico
  if (!montado || cargando || (usuario && usuario._parcial)) {
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

  // Ya montado y sesión resuelta. Sin acceso → null mientras el useEffect redirige.
  if (!sesionInicializada || !usuario || !esUsuarioAdmin) {
    return null
  }

  // Usuario admin verificado
  return children
}
