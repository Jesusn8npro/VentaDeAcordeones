import { useState, useCallback } from 'react'
import { clienteSupabase } from '../configuracion/supabase'
import { useAuth } from '../contextos/ContextoAutenticacion'

/**
 * Hook personalizado para manejar cupones de descuento
 * Proporciona funciones para validar, aplicar y gestionar cupones
 */
export const usarCupones = () => {
  const { usuario } = useAuth()
  const [codigoCupon, setCodigoCupon] = useState('')
  const [cargandoCupon, setCargandoCupon] = useState(false)
  const [cuponAplicado, setCuponAplicado] = useState(null)
  const [errorCupon, setErrorCupon] = useState('')

  /**
   * Valida un código de cupón
   * @param {string} codigo - Código del cupón a validar
   * @param {number} subtotal - Subtotal del pedido
   * @param {Array} productos - Array de productos en el carrito
   * @returns {Object} Resultado de la validación
   */
  const validarCupon = useCallback(async (codigo, subtotal = 0, productos = []) => {
    if (!codigo || codigo.trim() === '') {
      setErrorCupon('Por favor ingresa un código de descuento')
      return { valido: false, mensaje: 'Código requerido' }
    }

    setCargandoCupon(true)
    setErrorCupon('')

    try {
      // Llamar a la función de Supabase para validar el cupón
      const { data, error } = await clienteSupabase.rpc('validar_cupon', {
        p_codigo: codigo.toUpperCase().trim(),
        p_usuario_id: usuario?.id || null,
        p_subtotal: subtotal,
        p_productos: JSON.stringify(productos)
      })

      if (error) {
        console.error('Error validando cupón:', error)
        setErrorCupon('Error al validar el cupón. Intenta nuevamente.')
        return { valido: false, mensaje: 'Error de validación' }
      }

      if (data && data.length > 0) {
        const resultado = data[0]
        
        if (resultado.valido) {
          // Cupón válido - guardarlo en el estado
          const cuponData = {
            codigo: codigo.toUpperCase().trim(),
            descuento: resultado.descuento_aplicable,
            codigoId: resultado.codigo_id,
            mensaje: resultado.mensaje
          }
          
          setCuponAplicado(cuponData)
          setErrorCupon('')
          
          return {
            valido: true,
            descuento: resultado.descuento_aplicable,
            mensaje: resultado.mensaje,
            cuponData
          }
        } else {
          // Cupón no válido
          setErrorCupon(resultado.mensaje)
          setCuponAplicado(null)
          
          return {
            valido: false,
            mensaje: resultado.mensaje
          }
        }
      }

      setErrorCupon('Código de descuento no válido')
      return { valido: false, mensaje: 'Código no válido' }

    } catch (error) {
      console.error('Error en validarCupon:', error)
      setErrorCupon('Error al procesar el cupón. Intenta nuevamente.')
      return { valido: false, mensaje: 'Error de conexión' }
    } finally {
      setCargandoCupon(false)
    }
  }, [usuario])

  /**
   * Aplica un cupón después de validarlo
   * @param {string} codigo - Código del cupón
   * @param {number} subtotal - Subtotal del pedido
   * @param {Array} productos - Productos del carrito
   * @returns {Object} Resultado de la aplicación
   */
  const aplicarCupon = useCallback(async (codigo, subtotal, productos = []) => {
    const resultado = await validarCupon(codigo, subtotal, productos)
    
    if (resultado.valido) {
      return {
        exito: true,
        descuento: resultado.descuento,
        mensaje: `¡Cupón aplicado! Descuento: $${resultado.descuento.toLocaleString('es-CO')}`,
        cuponData: resultado.cuponData
      }
    }

    return {
      exito: false,
      mensaje: resultado.mensaje
    }
  }, [validarCupon])

  /**
   * Registra el uso de un cupón en una compra
   * @param {string} pedidoId - ID del pedido
   * @param {Object} cuponData - Datos del cupón aplicado
   * @param {number} subtotal - Subtotal del pedido
   * @returns {boolean} Éxito del registro
   */
  const registrarUsoCupon = useCallback(async (pedidoId, cuponData, subtotal) => {
    if (!cuponData || !pedidoId) return false

    try {
      const { data, error } = await clienteSupabase.rpc('aplicar_cupon', {
        p_codigo: cuponData.codigo,
        p_usuario_id: usuario?.id || null,
        p_pedido_id: pedidoId,
        p_monto_descuento: cuponData.descuento,
        p_subtotal: subtotal,
        p_direccion_ip: null, // Se puede obtener del cliente si es necesario
        p_agente_usuario: navigator.userAgent
      })

      if (error) {
        console.error('Error registrando uso de cupón:', error)
        return false
      }

      return data === true
    } catch (error) {
      console.error('Error en registrarUsoCupon:', error)
      return false
    }
  }, [usuario])

  /**
   * Obtiene los cupones disponibles para mostrar al usuario
   * @returns {Array} Lista de cupones activos
   */
  const obtenerCuponesDisponibles = useCallback(async () => {
    try {
      const { data, error } = await clienteSupabase
        .from('codigos_descuento')
        .select(`
          id,
          codigo,
          nombre,
          descripcion,
          tipo_descuento,
          valor_descuento,
          monto_minimo_compra,
          fecha_fin,
          solo_primera_compra
        `)
        .eq('activo', true)
        .or(`fecha_fin.is.null,fecha_fin.gte.${new Date().toISOString()}`)
        .order('valor_descuento', { ascending: false })

      if (error) {
        console.error('Error obteniendo cupones:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('Error en obtenerCuponesDisponibles:', error)
      return []
    }
  }, [])

  /**
   * Limpia el cupón aplicado
   */
  const limpiarCupon = useCallback(() => {
    setCodigoCupon('')
    setCuponAplicado(null)
    setErrorCupon('')
  }, [])

  /**
   * Calcula el descuento aplicable basado en el cupón y subtotal
   * @param {number} subtotal - Subtotal del pedido
   * @returns {number} Monto del descuento
   */
  const calcularDescuento = useCallback((subtotal) => {
    if (!cuponAplicado || !subtotal) return 0
    
    // El descuento ya viene calculado desde la validación
    return Math.min(cuponAplicado.descuento, subtotal)
  }, [cuponAplicado])

  /**
   * Verifica si hay un cupón aplicado
   * @returns {boolean}
   */
  const tieneCuponAplicado = useCallback(() => {
    return cuponAplicado !== null
  }, [cuponAplicado])

  return {
    // Estados
    codigoCupon,
    setCodigoCupon,
    cargandoCupon,
    cuponAplicado,
    errorCupon,
    
    // Funciones principales
    validarCupon,
    aplicarCupon,
    registrarUsoCupon,
    obtenerCuponesDisponibles,
    
    // Utilidades
    limpiarCupon,
    calcularDescuento,
    tieneCuponAplicado,
    
    // Getters
    cuponValido: cuponAplicado !== null,
    descuentoCupon: cuponAplicado?.descuento || 0,
    mensajeCupon: cuponAplicado?.mensaje || ''
  }
}