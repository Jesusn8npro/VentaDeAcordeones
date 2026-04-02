import { CONFIGURACION } from '../configuracion/constantes'

export function usarFormato() {
  const formatearPrecio = (precio) => {
    return new Intl.NumberFormat(CONFIGURACION.formatoMoneda, {
      style: 'currency',
      currency: CONFIGURACION.moneda,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio)
  }

  const formatearFecha = (fecha) => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(fecha))
  }

  const formatearFechaCorta = (fecha) => {
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(fecha))
  }

  const formatearNumero = (numero) => {
    return new Intl.NumberFormat('es-CO').format(numero)
  }

  const truncarTexto = (texto, longitud = 100) => {
    if (texto.length <= longitud) return texto
    return texto.substring(0, longitud) + '...'
  }

  const generarSlug = (texto) => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  return {
    formatearPrecio,
    formatearFecha,
    formatearFechaCorta,
    formatearNumero,
    truncarTexto,
    generarSlug
  }
}




























