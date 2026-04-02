import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'

// Crear el contexto
const ChatContext = createContext()

// Hook personalizado para usar el contexto
export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat debe ser usado dentro de un ChatProvider')
  }
  return context
}

// Proveedor del contexto
export const ChatProvider = ({ children }) => {
  const [chatAbierto, setChatAbierto] = useState(false)

  // Memoizar funciones para evitar re-renders innecesarios
  const abrirChat = useCallback(() => setChatAbierto(true), [])
  const cerrarChat = useCallback(() => setChatAbierto(false), [])
  const alternarChat = useCallback(() => setChatAbierto(!chatAbierto), [chatAbierto])

  // Memoizar el valor del contexto
  const value = useMemo(() => ({
    chatAbierto,
    abrirChat,
    cerrarChat,
    alternarChat,
    setChatAbierto
  }), [chatAbierto, abrirChat, cerrarChat, alternarChat])

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export default ChatContext