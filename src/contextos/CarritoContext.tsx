import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback, useRef } from 'react'
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

  // Respaldo en memoria para navegadores con almacenamiento bloqueado (modo privado,
  // cookies de terceros restringidas). Antes el catch devolvia un id NUEVO en cada llamada:
  // cada producto se guardaba con un session_id distinto y el carrito se "vaciaba" solo
  // mientras el visitante seguia navegando. Ahora al menos aguanta toda la visita.
  const sessionIdRespaldoRef = useRef<string | null>(null)

  const obtenerSessionIdCarrito = () => {
    const nuevoId = () => `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
    try {
      let sid = window.localStorage.getItem('carrito_session_id')
      if (!sid) {
        sid = nuevoId()
        window.localStorage.setItem('carrito_session_id', sid)
      }
      return sid
    } catch (_) {
      if (!sessionIdRespaldoRef.current) sessionIdRespaldoRef.current = nuevoId()
      return sessionIdRespaldoRef.current
    }
  }

  useEffect(() => {
    const sessionId = obtenerSessionIdCarrito()
    dispatch({ type: TIPOS_ACCION.ESTABLECER_SESSION_ID, payload: sessionId })
  }, [])

  // Se espera a que la sesion de Supabase este resuelta antes de leer el carrito.
  // Antes se lanzaba una consulta con `usuario` todavia en null aunque el visitante
  // estuviera autenticado: esa consulta filtraba por session_id, la politica RLS de
  // `carrito` la devolvia vacia (con JWT presente exige usuario_id = auth.uid()) y el
  // carrito parpadeaba vacio hasta la segunda consulta. Ahora: una peticion menos por
  // carga (menos egress) y sin parpadeo de "carrito vacio".
  useEffect(() => {
    if (estado.sessionId && sesionInicializada) cargarCarrito()
  }, [estado.sessionId, sesionInicializada, usuario])

  useEffect(() => {
    dispatch({ type: TIPOS_ACCION.CALCULAR_TOTALES })
  }, [estado.items])

  // Contador de peticiones: al iniciar sesion se solapan la carga normal y la recarga que
  // dispara la fusion del carrito de invitado. Sin esto, la respuesta vieja (carrito del
  // usuario, todavia vacio) podia llegar despues y pisar a la buena, dejando el carrito
  // vacio en pantalla hasta recargar la pagina. Solo la ultima peticion puede escribir.
  const peticionCargaRef = useRef(0)

  const cargarCarrito = async () => {
    const idPeticion = ++peticionCargaRef.current
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
      if (idPeticion !== peticionCargaRef.current) return // respuesta obsoleta: se descarta
      if (error) throw error
      dispatch({ type: TIPOS_ACCION.CARGAR_CARRITO_EXITO, payload: data || [] })
    } catch (error: any) {
      if (idPeticion !== peticionCargaRef.current) return
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
        // Sin session_id este delete quedaria practicamente sin filtro y la politica RLS
        // de `carrito` no filtra por session_id: podria borrar lineas de otros invitados.
        if (!estado.sessionId) return { success: false, message: 'Carrito no inicializado' }
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

  // Marca de "ya fusionado" por usuario. Permite que el efecto dependa tambien de
  // estado.sessionId sin repetir la RPC en cada render.
  const migradoRef = useRef<string | null>(null)

  const migrarCarritoAUsuario = async (usuarioId: string) => {
    const sid = estado.sessionId
    if (!sid) return
    try {
      let rpcError = null
      try {
        const { error } = await clienteSupabase.rpc('migrar_carrito_a_usuario', {
          p_session_id: sid,
          p_usuario_id: usuarioId
        })
        rpcError = error || null
      } catch (e) { rpcError = e }

      if (rpcError) {
        // Plan B. Con sesion iniciada la politica `carrito_own` exige usuario_id = auth.uid()
        // y las filas de invitado tienen usuario_id NULL, asi que este UPDATE puede no tocar
        // ninguna fila. Se acota con .is('usuario_id', null) para no arrastrar por error
        // lineas que ya son de alguien, y no se borra nada: si falla, el carrito del invitado
        // sigue en la tabla y se reintenta en el proximo cambio de sesion.
        const { error } = await clienteSupabase
          .from('carrito')
          .update({ usuario_id: usuarioId, session_id: null })
          .eq('session_id', sid)
          .is('usuario_id', null)
        if (error) throw error
      }
      migradoRef.current = usuarioId
    } catch (e) {
      migradoRef.current = null // sin marcar: se volvera a intentar
      if (process.env.NODE_ENV !== 'production') {
        console.warn('[carrito] no se pudo fusionar el carrito de invitado:', e)
      }
    } finally {
      // Pase lo que pase se recarga: si la fusion funciono aparecen las lineas del invitado,
      // y si no, al menos se muestra el carrito real del usuario.
      await cargarCarrito()
    }
  }

  useEffect(() => {
    // Al cerrar sesion se olvida la marca: si el mismo visitante deja productos como invitado
    // y vuelve a entrar con la misma cuenta, hay que fusionar otra vez.
    if (!usuario?.id) { migradoRef.current = null; return }
    // estado.sessionId se resuelve en otro efecto y puede llegar DESPUES que la sesion.
    // Antes no estaba en las dependencias: si la sesion se resolvia primero, el efecto se
    // saltaba la fusion y no volvia a ejecutarse nunca -> carrito de invitado huerfano.
    if (!sesionInicializada || !estado.sessionId) return
    if (migradoRef.current === usuario.id) return
    migrarCarritoAUsuario(usuario.id)
  }, [sesionInicializada, usuario, estado.sessionId])

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
