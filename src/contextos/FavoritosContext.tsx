import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'
import { clienteSupabase } from '../configuracion/supabase'
import { useAuth } from './ContextoAutenticacion'

const estadoInicial = {
  favoritos: [],
  cargando: false,
  error: null,
  contadorFavoritos: 0
}

const TIPOS_ACCION = {
  CARGAR_FAVORITOS_INICIO: 'CARGAR_FAVORITOS_INICIO',
  CARGAR_FAVORITOS_EXITO: 'CARGAR_FAVORITOS_EXITO',
  CARGAR_FAVORITOS_ERROR: 'CARGAR_FAVORITOS_ERROR',
  AGREGAR_FAVORITO: 'AGREGAR_FAVORITO',
  QUITAR_FAVORITO: 'QUITAR_FAVORITO',
  LIMPIAR_FAVORITOS: 'LIMPIAR_FAVORITOS',
  ACTUALIZAR_CONTADOR: 'ACTUALIZAR_CONTADOR',
  SINCRONIZAR_INICIO: 'SINCRONIZAR_INICIO',
  SINCRONIZAR_EXITO: 'SINCRONIZAR_EXITO',
  SINCRONIZAR_ERROR: 'SINCRONIZAR_ERROR'
}

const favoritosReducer = (estado, accion) => {
  switch (accion.type) {
    case TIPOS_ACCION.CARGAR_FAVORITOS_INICIO:
      return { ...estado, cargando: true, error: null }

    case TIPOS_ACCION.CARGAR_FAVORITOS_EXITO:
      return {
        ...estado,
        favoritos: accion.payload,
        contadorFavoritos: accion.payload.length,
        cargando: false,
        error: null
      }

    case TIPOS_ACCION.CARGAR_FAVORITOS_ERROR:
      return { ...estado, cargando: false, error: accion.payload }

    case TIPOS_ACCION.AGREGAR_FAVORITO: {
      const nuevosFavoritos = [...estado.favoritos, accion.payload]
      return { ...estado, favoritos: nuevosFavoritos, contadorFavoritos: nuevosFavoritos.length }
    }

    case TIPOS_ACCION.QUITAR_FAVORITO: {
      const favoritosFiltrados = estado.favoritos.filter(
        favorito => favorito.producto_id !== accion.payload
      )
      return { ...estado, favoritos: favoritosFiltrados, contadorFavoritos: favoritosFiltrados.length }
    }

    case TIPOS_ACCION.LIMPIAR_FAVORITOS:
      return { ...estado, favoritos: [], contadorFavoritos: 0 }

    case TIPOS_ACCION.ACTUALIZAR_CONTADOR:
      return { ...estado, contadorFavoritos: accion.payload }

    case TIPOS_ACCION.SINCRONIZAR_INICIO:
      return { ...estado, cargando: true }

    case TIPOS_ACCION.SINCRONIZAR_EXITO:
      return {
        ...estado,
        favoritos: accion.payload,
        contadorFavoritos: accion.payload.length,
        cargando: false,
        error: null
      }

    case TIPOS_ACCION.SINCRONIZAR_ERROR:
      return { ...estado, cargando: false, error: accion.payload }

    default:
      return estado
  }
}

const FavoritosContext = createContext()

const FavoritosProvider = ({ children }) => {
  const [estado, dispatch] = useReducer(favoritosReducer, estadoInicial)
  const { usuario, sesionInicializada } = useAuth()

  const cargarFavoritosDesdeDB = async () => {
    if (!usuario?.id) return []

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(usuario.id)) return []

    try {
      const { data: favoritosDB, error: errorFavoritos } = await clienteSupabase
        .from('favoritos')
        .select('producto_id,usuario_id,created_at')
        .eq('usuario_id', usuario.id)

      if (errorFavoritos) return []

      const ids = Array.from(new Set((favoritosDB || []).map(f => f.producto_id))).filter(Boolean)
      if (ids.length === 0) return []

      const { data: productos } = await clienteSupabase
        .from('productos')
        .select('id, nombre, slug, descripcion, precio, precio_original, descuento, stock, activo')
        .in('id', ids)

      const { data: imagenes } = await clienteSupabase
        .from('producto_imagenes')
        .select('producto_id, imagen_principal, imagen_secundaria_1, imagen_secundaria_2, imagen_secundaria_3, imagen_secundaria_4')
        .in('producto_id', ids)

      const mapaProductos = new Map()
      for (const p of (productos || [])) {
        mapaProductos.set(p.id, p)
      }

      const mapaImagenes = new Map()
      for (const img of (imagenes || [])) {
        mapaImagenes.set(img.producto_id, img)
      }

      const combinados = (favoritosDB || []).map(fav => {
        const p = mapaProductos.get(fav.producto_id) || {}
        const img = mapaImagenes.get(fav.producto_id) || {}
        return {
          producto_id: fav.producto_id,
          usuario_id: fav.usuario_id,
          created_at: fav.created_at || new Date().toISOString(),
          producto_nombre: p.nombre || null,
          slug: p.slug || null,
          precio: p.precio ?? null,
          precio_original: p.precio_original ?? p.precio ?? null,
          descuento: p.descuento ?? (p.precio_original > p.precio ? Math.round(((p.precio_original - p.precio) / p.precio_original) * 100) : 0),
          stock: p.stock ?? 1,
          producto_activo: p.activo ?? true,
          producto_descripcion: p.descripcion || '',
          imagen_principal: img.imagen_principal || null,
          imagen_secundaria_1: img.imagen_secundaria_1 || null,
          imagen_secundaria_2: img.imagen_secundaria_2 || null,
          imagen_secundaria_3: img.imagen_secundaria_3 || null,
          imagen_secundaria_4: img.imagen_secundaria_4 || null,
          categoria_nombre: null
        }
      })

      const ordenados = [...combinados].sort((a, b) => {
        const fa = new Date(a?.created_at || 0)
        const fb = new Date(b?.created_at || 0)
        return fb - fa
      })
      const mapa = new Map()
      for (const item of ordenados) {
        const key = item.producto_id || item.id
        if (!mapa.has(key)) mapa.set(key, item)
      }
      return Array.from(mapa.values())
    } catch (_) {
      return []
    }
  }

  const agregarFavoritoDB = async (productoId) => {
    if (!usuario?.id) return false
    try {
      const { data, error } = await clienteSupabase.rpc('agregar_favorito', {
        p_usuario_id: usuario.id,
        p_producto_id: productoId
      })
      if (error) return false
      return data
    } catch (_) {
      return false
    }
  }

  const quitarFavoritoDB = async (productoId) => {
    if (!usuario?.id) return false
    try {
      const { data, error } = await clienteSupabase.rpc('quitar_favorito', {
        p_usuario_id: usuario.id,
        p_producto_id: productoId
      })
      if (error) return false
      return data
    } catch (_) {
      return false
    }
  }

  const migrarFavoritosADB = async () => {
    if (!usuario?.id) return
    try {
      const favoritosLocal = JSON.parse(localStorage.getItem('favoritos') || '[]')
      if (favoritosLocal.length === 0) return
      for (const favorito of favoritosLocal) {
        await agregarFavoritoDB(favorito.producto_id)
      }
      localStorage.removeItem('favoritos')
      await cargarFavoritos()
    } catch (_) {}
  }

  const cargarFavoritosDesdeStorage = useCallback(() => {
    try {
      dispatch({ type: TIPOS_ACCION.CARGAR_FAVORITOS_INICIO })
      const favoritosGuardados = localStorage.getItem('favoritos')
      const favoritos = favoritosGuardados ? JSON.parse(favoritosGuardados) : []
      dispatch({ type: TIPOS_ACCION.CARGAR_FAVORITOS_EXITO, payload: favoritos })
    } catch (_) {
      dispatch({ type: TIPOS_ACCION.CARGAR_FAVORITOS_ERROR, payload: 'Error al cargar favoritos' })
    }
  }, [])

  const esFavorito = useCallback((productoId) => {
    return estado.favoritos.some(favorito => favorito.producto_id === productoId)
  }, [estado.favoritos])

  const sincronizarFavoritos = useCallback(async () => {
    dispatch({ type: TIPOS_ACCION.SINCRONIZAR_INICIO })
    try {
      if (sesionInicializada && usuario?.id) {
        const favoritosDB = await cargarFavoritosDesdeDB()
        dispatch({ type: TIPOS_ACCION.SINCRONIZAR_EXITO, payload: favoritosDB })
      } else {
        cargarFavoritosDesdeStorage()
      }
    } catch (_) {
      dispatch({ type: TIPOS_ACCION.SINCRONIZAR_ERROR, payload: 'Error al sincronizar favoritos' })
    }
  }, [sesionInicializada, usuario?.id, cargarFavoritosDesdeStorage])

  const agregarFavorito = useCallback(async (producto) => {
    try {
      if (esFavorito(producto.id)) return false

      if (sesionInicializada && usuario?.id) {
        const exito = await agregarFavoritoDB(producto.id)
        if (exito) {
          await sincronizarFavoritos()
          return true
        }
        return false
      } else {
        const nuevoFavorito = {
          id: Date.now().toString(),
          producto_id: producto.id,
          usuario_id: 'temp-user',
          fecha_agregado: new Date().toISOString(),
          producto_nombre: producto.nombre,
          precio: producto.precio,
          precio_original: producto.precio_original,
          imagen_principal: producto.imagen_principal || producto.imagen,
          slug: producto.slug,
          producto_imagenes: producto.producto_imagenes || null,
          disponible: producto.activo
        }
        dispatch({ type: TIPOS_ACCION.AGREGAR_FAVORITO, payload: nuevoFavorito })
        return true
      }
    } catch (_) {
      return false
    }
  }, [esFavorito, sesionInicializada, usuario?.id, sincronizarFavoritos])

  const quitarFavorito = useCallback(async (productoId) => {
    try {
      if (sesionInicializada && usuario?.id) {
        const exito = await quitarFavoritoDB(productoId)
        if (exito) {
          await sincronizarFavoritos()
          return true
        }
        return false
      } else {
        dispatch({ type: TIPOS_ACCION.QUITAR_FAVORITO, payload: productoId })
        const favoritosActualizados = estado.favoritos.filter(
          favorito => favorito.producto_id !== productoId
        )
        if (favoritosActualizados.length === 0) {
          localStorage.removeItem('favoritos')
        } else {
          localStorage.setItem('favoritos', JSON.stringify(favoritosActualizados))
        }
        return true
      }
    } catch (_) {
      return false
    }
  }, [sesionInicializada, usuario?.id, estado.favoritos, sincronizarFavoritos])

  const cargarFavoritos = useCallback(async () => {
    if (sesionInicializada && usuario?.id) {
      await sincronizarFavoritos()
    } else {
      cargarFavoritosDesdeStorage()
    }
  }, [sesionInicializada, usuario?.id, sincronizarFavoritos, cargarFavoritosDesdeStorage])

  const alternarFavorito = useCallback(async (producto) => {
    if (esFavorito(producto.id)) {
      return await quitarFavorito(producto.id)
    } else {
      return await agregarFavorito(producto)
    }
  }, [esFavorito, quitarFavorito, agregarFavorito])

  const limpiarFavoritos = useCallback(() => {
    dispatch({ type: TIPOS_ACCION.LIMPIAR_FAVORITOS })
    localStorage.removeItem('favoritos')
  }, [])

  const manejarCierreSesion = useCallback(() => {
    dispatch({ type: TIPOS_ACCION.LIMPIAR_FAVORITOS })
  }, [])

  const obtenerFavoritosPaginados = useCallback((pagina = 1, limite = 12) => {
    const inicio = (pagina - 1) * limite
    const fin = inicio + limite
    return estado.favoritos.slice(inicio, fin)
  }, [estado.favoritos])

  useEffect(() => {
    cargarFavoritos()
  }, [sesionInicializada, usuario?.id])

  useEffect(() => {
    if (sesionInicializada && usuario?.id) {
      const favoritosLocal = localStorage.getItem('favoritos')
      if (favoritosLocal) {
        migrarFavoritosADB()
      }
    }
  }, [sesionInicializada, usuario?.id])

  useEffect(() => {
    if (!sesionInicializada && estado.favoritos.length > 0) {
      localStorage.setItem('favoritos', JSON.stringify(estado.favoritos))
    }
  }, [estado.favoritos, sesionInicializada])

  const valor = useMemo(() => ({
    favoritos: estado.favoritos,
    cargando: estado.cargando,
    error: estado.error,
    contadorFavoritos: estado.contadorFavoritos,
    esFavorito,
    agregarFavorito,
    quitarFavorito,
    alternarFavorito,
    limpiarFavoritos,
    obtenerFavoritosPaginados,
    cargarFavoritosDesdeStorage,
    cargarFavoritos,
    manejarCierreSesion,
    sincronizarFavoritos
  }), [estado, esFavorito, agregarFavorito, quitarFavorito, alternarFavorito, limpiarFavoritos, obtenerFavoritosPaginados, cargarFavoritosDesdeStorage, cargarFavoritos, manejarCierreSesion, sincronizarFavoritos])

  return (
    <FavoritosContext.Provider value={valor}>
      {children}
    </FavoritosContext.Provider>
  )
}

const useFavoritos = () => {
  const contexto = useContext(FavoritosContext)
  if (!contexto) {
    throw new Error('useFavoritos debe ser usado dentro de un FavoritosProvider')
  }
  return contexto
}

export { useFavoritos }
export default FavoritosProvider
