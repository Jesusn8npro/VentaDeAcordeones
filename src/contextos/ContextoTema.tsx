import React, { createContext, useState, useContext, useEffect, useMemo, useCallback } from 'react'

const ContextoTema = createContext(undefined)

export const useTema = () => {
  const contexto = useContext(ContextoTema)
  if (contexto === undefined) {
    throw new Error('useTema debe ser usado dentro de un ProveedorTema')
  }
  return contexto
}

export const ProveedorTema = ({ children }) => {
  const [tema, setTema] = useState('light')
  const [estaInicializado, setEstaInicializado] = useState(false)

  useEffect(() => {
    // Este código solo se ejecuta en el cliente
    const temaGuardado = localStorage.getItem('tema')
    const temaInicial = temaGuardado || 'light' // Por defecto tema claro

    setTema(temaInicial)
    setEstaInicializado(true)
  }, [])

  useEffect(() => {
    if (estaInicializado) {
      localStorage.setItem('tema', tema)
      // Dos ganchos a la vez: la clase .dark (variante dark: de Tailwind) y data-theme (tokens
      // --vda-* de diseno.css, que son oscuros por defecto y cambian con [data-theme="light"]).
      // Antes sólo se ponía la clase y los tokens nunca se enteraban del cambio de tema.
      document.documentElement.classList.toggle('dark', tema === 'dark')
      document.documentElement.setAttribute('data-theme', tema)
    }
  }, [tema, estaInicializado])

  const alternarTema = useCallback(() => {
    setTema((temaAnterior) => (temaAnterior === 'light' ? 'dark' : 'light'))
  }, [])

  // Valor del contexto optimizado con useMemo
  const valor = useMemo(() => ({
    tema,
    alternarTema
  }), [tema, alternarTema])

  return (
    <ContextoTema.Provider value={valor}>
      {children}
    </ContextoTema.Provider>
  )
}
