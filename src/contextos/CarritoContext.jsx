import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react'
import { clienteSupabase } from '../configuracion/supabase'
import { useAuth } from './ContextoAutenticacion'

// Estado inicial del carrito
const estadoInicial = {
  items: [],
  cargando: false,
  error: null,
  modalAbierto: false,
  totalItems: 0,
  subtotal: 0,
  descuentos: 0,
  envio: 0,
  total: 0,
  sessionId: null,
  notificacion: {
    visible: false,
    tipo: 'success',
    titulo: '',
    mensaje: ''
  }
}

// Tipos de acciones
const TIPOS_ACCION = {
  CARGAR_CARRITO_INICIO: 'CARGAR_CARRITO_INICIO',
  CARGAR_CARRITO_EXITO: 'CARGAR_CARRITO_EXITO',
  CARGAR_CARRITO_ERROR: 'CARGAR_CARRITO_ERROR',
  AGREGAR_ITEM: 'AGREGAR_ITEM',
  ACTUALIZAR_CANTIDAD: 'ACTUALIZAR_CANTIDAD',
  ELIMINAR_ITEM: 'ELIMINAR_ITEM',
  LIMPIAR_CARRITO: 'LIMPIAR_CARRITO',
  TOGGLE_MODAL: 'TOGGLE_MODAL',
  CALCULAR_TOTALES: 'CALCULAR_TOTALES',
  ESTABLECER_SESSION_ID: 'ESTABLECER_SESSION_ID',
  MOSTRAR_NOTIFICACION: 'MOSTRAR_NOTIFICACION',
  OCULTAR_NOTIFICACION: 'OCULTAR_NOTIFICACION'
}

// Reducer del carrito
const carritoReducer = (estado, accion) => {
  switch (accion.type) {
    case TIPOS_ACCION.CARGAR_CARRITO_INICIO:
      return {
        ...estado,
        cargando: true,
        error: null
      }

    case TIPOS_ACCION.CARGAR_CARRITO_EXITO:
      return {
        ...estado,
        cargando: false,
        items: accion.payload,
        error: null
      }

    case TIPOS_ACCION.CARGAR_CARRITO_ERROR:
      return {
        ...estado,
        cargando: false,
        error: accion.payload
      }

    case TIPOS_ACCION.AGREGAR_ITEM:
      const itemExistente = estado.items.find(item => 
        item.producto_id === accion.payload.producto_id
      )

      let nuevosItems
      if (itemExistente) {
        nuevosItems = estado.items.map(item =>
          item.producto_id === accion.payload.producto_id
            ? { ...item, cantidad: item.cantidad + accion.payload.cantidad }
            : item
        )
      } else {
        nuevosItems = [...estado.items, accion.payload]
      }

      return {
        ...estado,
        items: nuevosItems
      }

    case TIPOS_ACCION.ACTUALIZAR_CANTIDAD:
      return {
        ...estado,
        items: estado.items.map(item =>
          item.id === accion.payload.id
            ? { ...item, cantidad: accion.payload.cantidad }
            : item
        ).filter(item => item.cantidad > 0)
      }

    case TIPOS_ACCION.ELIMINAR_ITEM:
      return {
        ...estado,
        items: estado.items.filter(item => item.id !== accion.payload)
      }

    case TIPOS_ACCION.LIMPIAR_CARRITO:
      return {
        ...estado,
        items: []
      }

    case TIPOS_ACCION.TOGGLE_MODAL:
      return {
        ...estado,
        modalAbierto: !estado.modalAbierto
      }

    case TIPOS_ACCION.CALCULAR_TOTALES:
      const totalItems = estado.items.reduce((total, item) => total + item.cantidad, 0)
      const subtotal = estado.items.reduce((total, item) => 
        total + (item.cantidad * item.precio_unitario), 0
      )
      
      // Calcular envío (gratis si es mayor a $50,000)
      const envio = subtotal >= 50000 ? 0 : 5000
      
      // Calcular descuentos (ejemplo: 10% si es mayor a $100,000)
      const descuentos = subtotal >= 100000 ? subtotal * 0.1 : 0
      
      const total = subtotal + envio - descuentos

      return {
        ...estado,
        totalItems,
        subtotal,
        descuentos,
        envio,
        total
      }

    case TIPOS_ACCION.ESTABLECER_SESSION_ID:
      return {
        ...estado,
        sessionId: accion.payload
      }

    case TIPOS_ACCION.MOSTRAR_NOTIFICACION:
      return {
        ...estado,
        notificacion: {
          visible: true,
          tipo: accion.payload.tipo || 'success',
          titulo: accion.payload.titulo || '',
          mensaje: accion.payload.mensaje || ''
        }
      }

    case TIPOS_ACCION.OCULTAR_NOTIFICACION:
      return {
        ...estado,
        notificacion: {
          ...estado.notificacion,
          visible: false
        }
      }

    default:
      return estado
  }
}

// Crear contexto
const CarritoContext = createContext()

// Hook personalizado para usar el contexto
export const useCarrito = () => {
  const contexto = useContext(CarritoContext)
  if (!contexto) {
    throw new Error('useCarrito debe usarse dentro de CarritoProvider')
  }
  return contexto
}

// Proveedor del contexto
export const CarritoProvider = ({ children }) => {
  const [estado, dispatch] = useReducer(carritoReducer, estadoInicial)
  const { usuario, sesionInicializada } = useAuth()

  // Helper: obtener/crear un sessionId consistente desde localStorage
  const obtenerSessionIdCarrito = () => {
    try {
      let sid = window.localStorage.getItem('carrito_session_id')
      if (!sid) {
        sid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        window.localStorage.setItem('carrito_session_id', sid)
      }
      return sid
    } catch (_) {
      // Fallback si localStorage falla
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
  }

  // Generar o recuperar session ID
  useEffect(() => {
    const sessionId = obtenerSessionIdCarrito()
    dispatch({ type: TIPOS_ACCION.ESTABLECER_SESSION_ID, payload: sessionId })
  }, [])

  // Cargar carrito al inicializar
  useEffect(() => {
    if (estado.sessionId) {
      cargarCarrito()
    }
  }, [estado.sessionId, usuario])

  // Calcular totales cuando cambien los items
  useEffect(() => {
    dispatch({ type: TIPOS_ACCION.CALCULAR_TOTALES })
  }, [estado.items])

  // Función para cargar el carrito desde Supabase
  const cargarCarrito = async () => {
    try {
      dispatch({ type: TIPOS_ACCION.CARGAR_CARRITO_INICIO })

      let query = clienteSupabase
        .from('carrito')
        .select(`
          *,
          productos (
            id,
            nombre,
            slug,
            precio,
            precio_original,
            activo,
            stock,
            producto_imagenes (
              imagen_principal,
              imagen_secundaria_1
            )
          )
        `)

      // Filtrar por usuario o session
      console.log('🔍 cargarCarrito - Verificando filtros:', {
        sesionInicializada,
        usuario,
        hasUsuario: !!usuario,
        usuarioId: usuario?.id,
        sessionId: estado.sessionId
      })
      
      if (sesionInicializada && usuario) {
        console.log('🔍 Filtrando por usuario_id:', usuario.id)
        query = query.eq('usuario_id', usuario.id)
      } else {
        const sid = estado.sessionId || obtenerSessionIdCarrito()
        console.log('🔍 Filtrando por session_id:', sid)
        query = query.eq('session_id', sid)
      }

      const { data, error } = await query.order('creado_el', { ascending: false })

      if (error) throw error

      dispatch({ 
        type: TIPOS_ACCION.CARGAR_CARRITO_EXITO, 
        payload: data || [] 
      })

    } catch (error) {
      console.error('Error al cargar carrito:', error)
      dispatch({ 
        type: TIPOS_ACCION.CARGAR_CARRITO_ERROR, 
        payload: error.message 
      })
    }
  }

  // Memoizar funciones para evitar re-renders innecesarios
  const agregarAlCarrito = useCallback(async (producto, cantidad = 1) => {
    try {
      // Debug: Mostrar estructura completa del producto
      console.log('🔍 DEBUG - Producto recibido en agregarAlCarrito:', {
        producto,
        tieneId: !!producto?.id,
        id: producto?.id,
        keys: producto ? Object.keys(producto) : 'producto es null/undefined'
      })

      // Validaciones de entrada
      if (!producto || !producto.id) {
        console.error('❌ Producto inválido:', { producto, id: producto?.id })
        throw new Error('Producto no válido')
      }

      if (cantidad <= 0) {
        throw new Error('La cantidad debe ser mayor a 0')
      }

      if (!Number.isInteger(cantidad)) {
        throw new Error('La cantidad debe ser un número entero')
      }

      // Límites de cantidad
      const CANTIDAD_MAXIMA_POR_PRODUCTO = 10
      const CANTIDAD_MAXIMA_CARRITO = 50

      if (cantidad > CANTIDAD_MAXIMA_POR_PRODUCTO) {
        throw new Error(`No puedes agregar más de ${CANTIDAD_MAXIMA_POR_PRODUCTO} unidades de este producto`)
      }

      // Verificar cantidad total en el carrito
      const cantidadTotalCarrito = estado.items.reduce((total, item) => total + item.cantidad, 0)
      if (cantidadTotalCarrito + cantidad > CANTIDAD_MAXIMA_CARRITO) {
        throw new Error(`No puedes tener más de ${CANTIDAD_MAXIMA_CARRITO} productos en tu carrito`)
      }

      // Verificar si el producto ya está en el carrito
      const itemExistente = estado.items.find(item => 
        item.producto_id === producto.id
      )

      if (itemExistente) {
        console.log('🔍 Item existente encontrado:', {
          itemExistente,
          hasId: !!itemExistente?.id,
          id: itemExistente?.id
        })
        
        // Verificar que el item tenga ID antes de continuar
        if (!itemExistente?.id) {
          console.error('❌ Item existente sin ID válido:', itemExistente)
          throw new Error('Error interno: El item del carrito no tiene ID válido')
        }
        
        const nuevaCantidad = (itemExistente.cantidad || 0) + cantidad
        if (nuevaCantidad > CANTIDAD_MAXIMA_POR_PRODUCTO) {
          throw new Error(`Ya tienes ${itemExistente.cantidad || 0} unidades. No puedes agregar más de ${CANTIDAD_MAXIMA_POR_PRODUCTO} en total`)
        }
        
        // Si ya existe, actualizar cantidad
        return await actualizarCantidad(itemExistente.id, nuevaCantidad)
      }

      // Verificar disponibilidad del producto
      if (!producto.activo) {
        throw new Error('Este producto no está disponible')
      }

      // Verificar stock disponible
      if (!producto.stock || producto.stock < cantidad) {
        throw new Error(`Stock insuficiente. Solo quedan ${producto.stock || 0} unidades disponibles`)
      }

      // Verificar sesión directamente desde Supabase para evitar condiciones de carrera
      let usuarioIdFinal = null
      let autenticado = false
      try {
        const { data: { session } } = await clienteSupabase.auth.getSession()
        if (session?.user) {
          autenticado = true
          usuarioIdFinal = session.user.id
        }
      } catch (_) {
        // Ignorar errores de lectura de sesión, usaremos contexto
      }

      // Fallback al contexto si no pudimos obtener sesión directa
      if (!autenticado && sesionInicializada && usuario?.id) {
        autenticado = true
        usuarioIdFinal = usuario.id
      }

      // Si es invitado, asegurar session_id
      const sid = !autenticado ? (estado.sessionId || obtenerSessionIdCarrito()) : null
      if (!autenticado && !sid) {
        console.warn('⚠️ No se pudo determinar session_id para invitado')
      }

      const nuevoItem = {
        producto_id: producto.id,
        cantidad,
        precio_unitario: producto.precio,
        usuario_id: autenticado ? usuarioIdFinal : null,
        // Asegurar que siempre enviamos session_id en modo invitado
        session_id: sid
      }

      // Guardar en Supabase
      const { data, error } = await clienteSupabase
        .from('carrito')
        .insert([nuevoItem])
        .select(`
          *,
          productos (
            id,
            nombre,
            slug,
            precio,
            precio_original,
            activo,
            stock,
            producto_imagenes (
              imagen_principal,
              imagen_secundaria_1
            )
          )
        `)

      if (error) {
        console.error('❌ RLS/Insert error detalles:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          nuevoItem,
          sesionInicializada,
          usuarioId: usuarioIdFinal || usuario?.id,
          sessionIdUsada: sid
        })
        throw error
      }

      // Actualizar estado local
      dispatch({ 
        type: TIPOS_ACCION.AGREGAR_ITEM, 
        payload: data[0] 
      })

      // Mostrar notificación de éxito
      mostrarNotificacion('success', '¡Producto agregado!', 'El producto se ha agregado correctamente al carrito')

      return { success: true, message: 'Producto agregado al carrito' }

    } catch (error) {
       console.error('Error al agregar al carrito:', error)
       return { success: false, message: error.message }
     }
   }, [usuario, estado.sessionId])

  // Función para actualizar cantidad
  const actualizarCantidad = useCallback(async (itemId, nuevaCantidad) => {
    try {
      console.log('🔄 actualizarCantidad llamada con:', {
        itemId,
        nuevaCantidad,
        hasItemId: !!itemId,
        usuario: usuario,
        hasUsuario: !!usuario,
        usuarioId: usuario?.id,
        sesionInicializada
      })
      
      if (nuevaCantidad <= 0) {
        return await eliminarDelCarrito(itemId)
      }

      // Validaciones
      if (!Number.isInteger(nuevaCantidad)) {
        throw new Error('La cantidad debe ser un número entero')
      }

      const CANTIDAD_MAXIMA_POR_PRODUCTO = 10
      if (nuevaCantidad > CANTIDAD_MAXIMA_POR_PRODUCTO) {
        throw new Error(`No puedes tener más de ${CANTIDAD_MAXIMA_POR_PRODUCTO} unidades de este producto`)
      }

      // Buscar el item en el carrito
      const item = estado.items.find(i => i.id === itemId)
      if (!item) {
        throw new Error('Producto no encontrado en el carrito')
      }

      // Verificar stock disponible
      if (item.productos && item.productos.stock < nuevaCantidad) {
        throw new Error(`Stock insuficiente. Solo quedan ${item.productos.stock} unidades disponibles`)
      }

      // Verificar límite total del carrito
      const CANTIDAD_MAXIMA_CARRITO = 50
      const cantidadTotalSinEsteItem = estado.items
        .filter(i => i.id !== itemId)
        .reduce((total, i) => total + i.cantidad, 0)
      
      if (cantidadTotalSinEsteItem + nuevaCantidad > CANTIDAD_MAXIMA_CARRITO) {
        throw new Error(`No puedes tener más de ${CANTIDAD_MAXIMA_CARRITO} productos en tu carrito`)
      }

      const { error } = await clienteSupabase
        .from('carrito')
        .update({ cantidad: nuevaCantidad })
        .eq('id', itemId)

      if (error) throw error

      dispatch({ 
        type: TIPOS_ACCION.ACTUALIZAR_CANTIDAD, 
        payload: { id: itemId, cantidad: nuevaCantidad } 
      })

      return { success: true }

    } catch (error) {
       console.error('Error al actualizar cantidad:', error)
       return { success: false, message: error.message }
     }
   }, [usuario, estado.sessionId])

  // Función para eliminar del carrito
  const eliminarDelCarrito = useCallback(async (itemId) => {
    try {
      const { error } = await clienteSupabase
        .from('carrito')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      dispatch({ 
        type: TIPOS_ACCION.ELIMINAR_ITEM, 
        payload: itemId 
      })

      return { success: true }

    } catch (error) {
       console.error('Error al eliminar del carrito:', error)
       return { success: false, message: error.message }
     }
   }, [usuario, estado.sessionId])

  // Función para limpiar carrito
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

    } catch (error) {
       console.error('Error al limpiar carrito:', error)
       return { success: false, message: error.message }
     }
   }, [usuario, estado.sessionId])

  // Función para migrar carrito de sesión a usuario
  const migrarCarritoAUsuario = async (usuarioId) => {
    try {
      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('🔄 migrarCarritoAUsuario llamada con:', {
          usuarioId,
          hasUsuarioId: !!usuarioId,
          sessionId: estado.sessionId
        })
      }

      // Intentar migración vía RPC (segura con SECURITY DEFINER)
      let rpcError = null
      try {
        const { data: migrados, error } = await clienteSupabase.rpc('migrar_carrito_a_usuario', {
          p_session_id: estado.sessionId,
          p_usuario_id: usuarioId
        })
        rpcError = error || null
        if (!error && import.meta.env.VITE_DEBUG === 'true') {
          console.log('✅ RPC migrar_carrito_a_usuario ejecutada. Registros afectados:', migrados)
        }
      } catch (e) {
        rpcError = e
      }

      // Fallback: si RPC no existe o falla, intentar UPDATE directo (respetando RLS)
      if (rpcError) {
        const { error } = await clienteSupabase
          .from('carrito')
          .update({ 
            usuario_id: usuarioId,
            session_id: null 
          })
          .eq('session_id', estado.sessionId)
        if (error) throw error
      }

      if (import.meta.env.VITE_DEBUG === 'true') {
        console.log('✅ Carrito migrado exitosamente, recargando...')
      }
      await cargarCarrito()

    } catch (error) {
      console.error('❌ Error al migrar carrito:', error)
    }
  }

  // Función para toggle modal
  const toggleModal = () => {
    dispatch({ type: TIPOS_ACCION.TOGGLE_MODAL })
  }

  // Función para obtener productos relacionados
  const obtenerProductosRelacionados = async (categoriaId) => {
    try {
      const { data, error } = await clienteSupabase
        .from('productos')
        .select('*')
        .eq('categoria_id', categoriaId)
        .eq('activo', true)
        .gt('stock', 0)
        .limit(4)

      if (error) throw error
      return data || []

    } catch (error) {
      console.error('Error al obtener productos relacionados:', error)
      return []
    }
  }

  // Migrar carrito cuando el usuario inicie sesión
  useEffect(() => {
    console.log('🔄 useEffect migrarCarrito:', {
      sesionInicializada,
      usuario,
      hasUsuario: !!usuario,
      usuarioId: usuario?.id,
      sessionId: estado.sessionId
    })
    
    if (sesionInicializada && usuario && estado.sessionId) {
      console.log('🔄 Llamando migrarCarritoAUsuario con usuario.id:', usuario.id)
      migrarCarritoAUsuario(usuario.id)
    }
  }, [sesionInicializada, usuario])

  // Función para mostrar notificación
  const mostrarNotificacion = useCallback((tipo, titulo, mensaje) => {
    dispatch({
      type: TIPOS_ACCION.MOSTRAR_NOTIFICACION,
      payload: { tipo, titulo, mensaje }
    })

    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
      dispatch({ type: TIPOS_ACCION.OCULTAR_NOTIFICACION })
    }, 5000)
  }, [])

  const ocultarNotificacion = useCallback(() => {
    dispatch({ type: TIPOS_ACCION.OCULTAR_NOTIFICACION })
  }, [])

  // Memoizar el valor del contexto
  const valorContexto = useMemo(() => ({
    ...estado,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    limpiarCarrito,
    toggleModal: () => dispatch({ type: TIPOS_ACCION.TOGGLE_MODAL }),
    alternarModal: () => dispatch({ type: TIPOS_ACCION.TOGGLE_MODAL }), // Alias para compatibilidad
    mostrarNotificacion,
    ocultarNotificacion
  }), [estado, agregarAlCarrito, actualizarCantidad, eliminarDelCarrito, limpiarCarrito, mostrarNotificacion, ocultarNotificacion])

  return (
    <CarritoContext.Provider value={valorContexto}>
      {children}
    </CarritoContext.Provider>
  )
}