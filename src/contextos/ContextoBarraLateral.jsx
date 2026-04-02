import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'

const ContextoBarraLateral = createContext(undefined)

export const useBarraLateral = () => {
  const contexto = useContext(ContextoBarraLateral)
  if (!contexto) {
    throw new Error('useBarraLateral debe ser usado dentro de un ProveedorBarraLateral')
  }
  return contexto
}

export const ProveedorBarraLateral = ({ children }) => {
  const [estaExpandida, setEstaExpandida] = useState(true)
  const [movilAbierto, setMovilAbierto] = useState(false)
  const [esMovil, setEsMovil] = useState(false)
  const [estaEnHover, setEstaEnHover] = useState(false)
  const [itemActivo, setItemActivo] = useState(null)
  const [submenuAbierto, setSubmenuAbierto] = useState(null)

  useEffect(() => {
    const manejarRedimensionamiento = () => {
      const movil = window.innerWidth < 1024 // Igual que el ejemplo original
      setEsMovil(movil)
      if (!movil) {
        setMovilAbierto(false)
      }
    }

    manejarRedimensionamiento()
    window.addEventListener('resize', manejarRedimensionamiento)

    return () => {
      window.removeEventListener('resize', manejarRedimensionamiento)
    }
  }, [])

  const alternarBarraLateral = useCallback(() => {
    if (window.innerWidth >= 1024) {
      setEstaExpandida((prev) => !prev)
    } else {
      setMovilAbierto((prev) => !prev)
    }
  }, [])

  const alternarBarraLateralMovil = useCallback(() => {
    setMovilAbierto((prev) => !prev)
  }, [])

  const alternarSubmenu = useCallback((index, tipoMenu) => {
    setSubmenuAbierto((prev) => {
      // Si es el mismo item, cerrarlo
      if (prev && prev.tipo === tipoMenu && prev.index === index) {
        return null
      }
      
      // Si es diferente, abrir el nuevo
      return { tipo: tipoMenu, index }
    })
  }, [])

  // Valor del contexto optimizado con useMemo
  const valor = useMemo(() => ({
    estaExpandida: esMovil ? false : estaExpandida,
    movilAbierto,
    estaEnHover,
    itemActivo,
    submenuAbierto,
    alternarBarraLateral,
    alternarBarraLateralMovil,
    setEstaEnHover,
    setItemActivo,
    alternarSubmenu,
    setSubmenuAbierto,
  }), [esMovil, estaExpandida, movilAbierto, estaEnHover, itemActivo, submenuAbierto, alternarBarraLateral, alternarBarraLateralMovil, alternarSubmenu])

  return (
    <ContextoBarraLateral.Provider value={valor}>
      {children}
    </ContextoBarraLateral.Provider>
  )
}
