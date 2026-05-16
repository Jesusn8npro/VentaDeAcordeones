import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'
import { clienteSupabase } from '../configuracion/supabase'
import { useAuth } from './ContextoAutenticacion'
import { carritoReducer, estadoInicial, TIPOS_ACCION } from './carritoReducer'

const CANTIDAD_MAXIMA_POR_PRODUCTO = 10
const CANTIDAD_MAXIMA_CARRITO = 50

const QUERY_CARRITO = `
  *,
  productos (
    id, nombre, slug, precio, precio_original, activo, stock,
    producto_imagenes ( imagen_principal, imagen_secundaria_1 )
  )
`

const CarritoContext = createContext<any>(null)

export const useCarrito = () => {
  const contexto = useContext(CarritoContext)
  if (!contexto) throw new Error('useCarrito debe usarse dentro de CarritoProvider')
  return contexto
}

export const CarritoProvider = ({ children }: { children: React.ReactNode }) => {
  const [estado, dispatch] = useReducer(carritoReducer, estadoInicial)
  const { usuario, sesionInicializada } = useAuth()

  const obtenerSessionIdCarrito = () => {
    try {
      let sid = window.localStorage.getItem('carrito_session_id')
      if (!sid) {
        sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        window.localStorage.setItem('carrito_session_id', sid)
      }
      return sid
    } catch (_) {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  useEffect(() => {
    const sessionId = obtenerSessionIdCarrito()
    dispatch({ type: TIPOS_ACCION.ESTABLECER_SESSION_ID, payload: sessionId })
  }, [])

  useEffect(() => {
    if (estado.sessionId) cargarCarrito()
  }, [estado.sessionId, usuario])

  useEffect(() => {
    dispatch({ type: TIPOS_ACCION.CALCULAR_TOTALES })
  }, [estado.items])

  const cargarCarrito = async () => {
    try {
      dispatch({ type: TIPOS_ACCION.CARGAR_CARRITO_INICIO })
      let query = clienteSupabase.from('carrito').select(QUERY_CARRITO)

      if (sesionInicializada && usuario) {
        query = query.eq('usuario_id', usuario.id)
      } else {
        const sid = estado.sessionId || obtenerSessionIdCarrito()
        query = query.eq('session_id', sid)
      }

      const { data, error } = await query.order('creado_el', { ascending: false })
      if (error) throw error
      dispatch({ type: TIPOS_ACCION.CARGAR_CARRITO_EXITO, payload: data || [] })
    } catch (error: any) {
      dispatch({ type: TIPOS_ACCION.CARGAR_CARRITO_ERROR, payload: error.message })
    }
  }

  const agregarAlCarrito = useCallback(async (producto: any, cantidad = 1) => {
    try {
      if (!producto?.id) throw new Error('Producto no válido')
      if (cantidad <= 0 || !Number.isInteger(cantidad)) throw new Error('Cantidad inválida')
      if (cantidad > CANTIDAD_MAXIMA_POR_PRODUCTO) throw new Error(`Máximo ${CANTIDAD_MAXIMA_POR_PRODUCTO} unidades por producto`)

      const totalCarrito = estado.items.reduce((t: number, i: any) => t + i.cantidad, 0)
      if (totalCarrito + cantidad > CANTIDAD_MAXIMA_CARRITO) throw new Error(`Máximo ${CANTIDAD_MAXIMA_CARRITO} productos en el carrito`)

      const itemExistente = estado.items.find((item: any) => item.producto_id === producto.id)
      if (itemExistente) {
        if (!itemExistente.id) throw new Error('Error interno: item sin ID válido')
        const nuevaCantidad = (itemExistente.cantidad || 0) + cantidad
        if (nuevaCantidad > CANTIDAD_MAXIMA_POR_PRODUCTO) {
          throw new Error(`Ya tienes ${itemExistente.cantidad} unidades. Máximo ${CANTIDAD_MAXIMA_POR_PRODUCTO}`)
        }
        return await actualizarCantidad(itemExistente.id, nuevaCantidad)
      }

      if (!producto.activo) throw new Error('Este producto no está disponible')
      if (!producto.stock || producto.stock < cantidad) {
        throw new Error(`Stock insuficiente. Solo quedan ${producto.stock || 0} unidades`)
      }

      let usuarioIdFinal = null
      let autenticado = false
      try {
        const { data: { session } } = await clienteSupabase.auth.getSession()
        if (session?.user) { autenticado = true; usuarioIdFinal = session.user.id }
      } catch (_) {}

      if (!autenticado && sesionInicializada && usuario?.id) {
        autenticado = true; usuarioIdFinal = usuario.id
      }

      const sid = !autenticado ? (estado.sessionId || obtenerSessionIdCarrito()) : null
      const nuevoItem = {
        producto_id: producto.id,
        cantidad,
        precio_unitario: producto.precio,
        usuario_id: autenticado ? usuarioIdFinal : null,
        session_id: sid
      }

      const { data, error } = await clienteSupabase
        .from('carrito').insert([nuevoItem]).select(QUERY_CARRITO)
      if (error) throw error

      dispatch({ type: TIPOS_ACCION.AGREGAR_ITEM, payload: data[0] })
      mostrarNotificacion('success', '¡Producto agregado!', 'El producto se ha agregado al carrito')
      return { success: true, message: 'Producto agregado al carrito' }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }, [usuario, estado.sessionId, estado.items])

  const actualizarCantidad = useCallback(async (itemId: string, nuevaCantidad: number) => {
    try {
      if (nuevaCantidad <= 0) return await eliminarDelCarrito(itemId)
      if (!Number.isInteger(nuevaCantidad)) throw new Error('La cantidad debe ser un número entero')
      if (nuevaCantidad > CANTIDAD_MAXIMA_POR_PRODUCTO) throw new Error(`Máximo ${CANTIDAD_MAXIMA_POR_PRODUCTO} unidades`)

      const item = estado.items.find((i: any) => i.id === itemId)
      if (!item) throw new Error('Producto no encontrado en el carrito')
      if (item.productos?.stock < nuevaCantidad) throw new Error(`Stock insuficiente. Solo quedan ${item.productos.stock} unidades`)

      const otroItems = estado.items.filter((i: any) => i.id !== itemId).reduce((t: number, i: any) => t + i.cantidad, 0)
      if (otroItems + nuevaCantidad > CANTIDAD_MAXIMA_CARRITO) throw new Error(`Máximo ${CANTIDAD_MAXIMA_CARRITO} productos en el carrito`)

      const { error } = await clienteSupabase.from('carrito').update({ cantidad: nuevaCantidad }).eq('id', itemId)
      if (error) throw error
      dispatch({ type: TIPOS_ACCION.ACTUALIZAR_CANTIDAD, payload: { id: itemId, cantidad: nuevaCantidad } })
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }, [estado.items])

  const eliminarDelCarrito = useCallback(async (itemId: string) => {
    try {
      const { error } = await clienteSupabase.from('carrito').delete().eq('id', itemId)
      if (error) throw error
      dispatch({ type: TIPOS_ACCION.ELIMINAR_ITEM, payload: itemId })
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }, [])

  const limpiarCarrito = useCallback(async () => {
    try {
      let query = clienteSupabase.from('carrito').delete()
      if (sesionInicializada && usuario) {
        query = query.eq('usuario_id', usuario.id)
      } else {
        query = query.eq('session_id', estado.sessionId)
      }
      const { error } = await query
      if (error) throw error
      dispatch({ type: TIPOS_ACCION.LIMPIAR_CARRITO })
      return { success: true }
    } catch (error: any) {
      return { success: false, message: error.message }
    }
  }, [usuario, estado.sessionId])

  const migrarCarritoAUsuario = async (usuarioId: string) => {
    try {
      let rpcError = null
      try {
        const { error } = await clienteSupabase.rpc('migrar_carrito_a_usuario', {
          p_session_id: estado.sessionId,
          p_usuario_id: usuarioId
        })
        rpcError = error || null
      } catch (e) { rpcError = e }

      if (rpcError) {
        const { error } = await clienteSupabase
          .from('carrito')
          .update({ usuario_id: usuarioId, session_id: null })
          .eq('session_id', estado.sessionId)
        if (error) throw error
      }
      await cargarCarrito()
    } catch (_) {}
  }

  useEffect(() => {
    if (sesionInicializada && usuario && estado.sessionId) {
      migrarCarritoAUsuario(usuario.id)
    }
  }, [sesionInicializada, usuario])

  const mostrarNotificacion = useCallback((tipo: string, titulo: string, mensaje: string) => {
    dispatch({ type: TIPOS_ACCION.MOSTRAR_NOTIFICACION, payload: { tipo, titulo, mensaje } })
    setTimeout(() => dispatch({ type: TIPOS_ACCION.OCULTAR_NOTIFICACION }), 5000)
  }, [])

  const ocultarNotificacion = useCallback(() => {
    dispatch({ type: TIPOS_ACCION.OCULTAR_NOTIFICACION })
  }, [])

  const valorContexto = useMemo(() => ({
    ...estado,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    limpiarCarrito,
    toggleModal: () => dispatch({ type: TIPOS_ACCION.TOGGLE_MODAL }),
    alternarModal: () => dispatch({ type: TIPOS_ACCION.TOGGLE_MODAL }),
    mostrarNotificacion,
    ocultarNotificacion
  }), [estado, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito, mostrarNotificacion, ocultarNotificacion])

  return (
    <CarritoContext.Provider value={valorContexto}>
      {children}
    </CarritoContext.Provider>
  )
}
