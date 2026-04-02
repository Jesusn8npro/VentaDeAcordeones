// Utilidades para manejo de localStorage

export const almacenamientoLocal = {
  // Guardar datos
  guardar: (clave, datos) => {
    try {
      const datosSerializados = JSON.stringify(datos)
      localStorage.setItem(clave, datosSerializados)
      return true
    } catch (error) {
      console.error('Error al guardar en localStorage:', error)
      return false
    }
  },

  // Obtener datos
  obtener: (clave, valorPorDefecto = null) => {
    try {
      const datosSerializados = localStorage.getItem(clave)
      if (datosSerializados === null) {
        return valorPorDefecto
      }
      return JSON.parse(datosSerializados)
    } catch (error) {
      console.error('Error al obtener de localStorage:', error)
      return valorPorDefecto
    }
  },

  // Eliminar datos
  eliminar: (clave) => {
    try {
      localStorage.removeItem(clave)
      return true
    } catch (error) {
      console.error('Error al eliminar de localStorage:', error)
      return false
    }
  },

  // Limpiar todo
  limpiar: () => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.error('Error al limpiar localStorage:', error)
      return false
    }
  },

  // Verificar si existe una clave
  existe: (clave) => {
    return localStorage.getItem(clave) !== null
  }
}

// Claves específicas de la aplicación
export const CLAVES_LOCAL_STORAGE = {
  CARRITO_TEMPORAL: 'me_llevo_esto_carrito_temporal',
  FILTROS_PRODUCTOS: 'me_llevo_esto_filtros_productos',
  PREFERENCIAS_USUARIO: 'me_llevo_esto_preferencias',
  HISTORIAL_BUSQUEDA: 'me_llevo_esto_historial_busqueda',
  PRODUCTOS_VISTOS: 'me_llevo_esto_productos_vistos'
}




























