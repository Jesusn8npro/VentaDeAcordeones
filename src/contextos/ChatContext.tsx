import React, { createContext, useContext, useState, useMemo, useCallback } from 'react'

const ChatContext = createContext()

export const useChat = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChat debe ser usado dentro de un ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }) => {
  const [chatAbierto, setChatAbierto] = useState(false)

  const abrirChat = useCallback(() => setChatAbierto(true), [])
  const cerrarChat = useCallback(() => setChatAbierto(false), [])
  const alternarChat = useCallback(() => setChatAbierto(!chatAbierto), [chatAbierto])

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
