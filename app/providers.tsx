'use client'

import { ProveedorTema } from '@/contextos/ContextoTema'
import { ProveedorAutenticacion } from '@/contextos/ContextoAutenticacion'
import { ComponenteSeguridad } from '@/componentes/seguridad/ComponenteSeguridad'
import { ChatProvider } from '@/contextos/ChatContext'
import { CarritoProvider } from '@/contextos/CarritoContext'
import FavoritosProvider from '@/contextos/FavoritosContext'
import ArmazonGlobal from './ArmazonGlobal'

export default function Providers({ children }: { children: React.ReactNode }) {
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
