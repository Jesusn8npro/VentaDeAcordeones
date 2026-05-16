export const TIPOS_ACCION = {
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
} as const

export const estadoInicial = {
  items: [] as any[],
  cargando: false,
  error: null as string | null,
  modalAbierto: false,
  totalItems: 0,
  subtotal: 0,
  descuentos: 0,
  envio: 0,
  total: 0,
  sessionId: null as string | null,
  notificacion: {
    visible: false,
    tipo: 'success' as string,
    titulo: '',
    mensaje: ''
  }
}

export type EstadoCarrito = typeof estadoInicial

export const carritoReducer = (estado: EstadoCarrito, accion: any): EstadoCarrito => {
  switch (accion.type) {
    case TIPOS_ACCION.CARGAR_CARRITO_INICIO:
      return { ...estado, cargando: true, error: null }

    case TIPOS_ACCION.CARGAR_CARRITO_EXITO:
      return { ...estado, cargando: false, items: accion.payload, error: null }

    case TIPOS_ACCION.CARGAR_CARRITO_ERROR:
      return { ...estado, cargando: false, error: accion.payload }

    case TIPOS_ACCION.AGREGAR_ITEM: {
      const itemExistente = estado.items.find(item =>
        item.producto_id === accion.payload.producto_id
      )
      const nuevosItems = itemExistente
        ? estado.items.map(item =>
            item.producto_id === accion.payload.producto_id
              ? { ...item, cantidad: item.cantidad + accion.payload.cantidad }
              : item
          )
        : [...estado.items, accion.payload]
      return { ...estado, items: nuevosItems }
    }

    case TIPOS_ACCION.ACTUALIZAR_CANTIDAD:
      return {
        ...estado,
        items: estado.items
          .map(item =>
            item.id === accion.payload.id
              ? { ...item, cantidad: accion.payload.cantidad }
              : item
          )
          .filter(item => item.cantidad > 0)
      }

    case TIPOS_ACCION.ELIMINAR_ITEM:
      return { ...estado, items: estado.items.filter(item => item.id !== accion.payload) }

    case TIPOS_ACCION.LIMPIAR_CARRITO:
      return { ...estado, items: [] }

    case TIPOS_ACCION.TOGGLE_MODAL:
      return { ...estado, modalAbierto: !estado.modalAbierto }

    case TIPOS_ACCION.CALCULAR_TOTALES: {
      const totalItems = estado.items.reduce((t, item) => t + item.cantidad, 0)
      const subtotal = estado.items.reduce((t, item) => t + item.cantidad * item.precio_unitario, 0)
      const envio = subtotal >= 50000 ? 0 : 5000
      const descuentos = subtotal >= 100000 ? subtotal * 0.1 : 0
      const total = subtotal + envio - descuentos
      return { ...estado, totalItems, subtotal, descuentos, envio, total }
    }

    case TIPOS_ACCION.ESTABLECER_SESSION_ID:
      return { ...estado, sessionId: accion.payload }

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
      return { ...estado, notificacion: { ...estado.notificacion, visible: false } }

    default:
      return estado
  }
}
