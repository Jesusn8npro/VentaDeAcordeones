'use client'

// Árbol global de providers: réplica EXACTA del orden de src/main.tsx + src/App.tsx
//   ProveedorTema > ProveedorAutenticacion > ComponenteSeguridad >
//   ChatProvider > CarritoProvider > FavoritosProvider > ArmazonGlobal
//
// Gate `mounted`: en SSR y primer render cliente se devuelve {children} tal cual
// (passthrough). Esto:
//   - evita crashes SSR (contextos tocan window/localStorage en render),
//   - mantiene el body como client-side (idéntico al SPA original),
//   - deja pasar el JSON-LD/markup server de page.tsx al HTML (SEO intacto),
//   - sin hydration mismatch (primer render cliente == SSR).
import { useEffect, useState } from 'react'
import { ProveedorTema } from '@/contextos/ContextoTema'
import { ProveedorAutenticacion } from '@/contextos/ContextoAutenticacion'
import { ComponenteSeguridad } from '@/componentes/seguridad/ComponenteSeguridad'
import { ChatProvider } from '@/contextos/ChatContext'
import { CarritoProvider } from '@/contextos/CarritoContext'
import FavoritosProvider from '@/contextos/FavoritosContext'
import ArmazonGlobal from './ArmazonGlobal'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  if (!montado) return <>{children}</>

  return (
    <ProveedorTema>
      <ProveedorAutenticacion>
        <ComponenteSeguridad>
          <ChatProvider>
            <CarritoProvider>
              <FavoritosProvider>
                <ArmazonGlobal>{children}</ArmazonGlobal>
              </FavoritosProvider>
            </CarritoProvider>
          </ChatProvider>
        </ComponenteSeguridad>
      </ProveedorAutenticacion>
    </ProveedorTema>
  )
}
