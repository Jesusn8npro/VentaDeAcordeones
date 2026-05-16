import { clienteSupabase } from '../configuracion/supabase'
import { pedidosServicio } from './pedidosServicio'

/**
 * Servicio para sincronizar estados de transacciones con ePayco
 */
class SincronizacionEpayco {
  
  constructor() {
    // Configuración de ePayco (debes configurar estas variables en tu .env)
    this.EPAYCO_PUBLIC_KEY = import.meta.env.VITE_EPAYCO_PUBLIC_KEY
    this.EPAYCO_PRIVATE_KEY = import.meta.env.VITE_EPAYCO_PRIVATE_KEY
    this.EPAYCO_TEST = import.meta.env.VITE_EPAYCO_TEST === 'true'
    this.EPAYCO_API_URL = this.EPAYCO_TEST 
      ? 'https://secure.epayco.co/validation/v1/reference'
      : 'https://secure.epayco.co/validation/v1/reference'
  }

  /**
   * Verifica el estado de una transacción en ePayco
   * @param {string} refPayco - Referencia de ePayco
   * @returns {Promise<Object>} - Estado de la transacción
   */
  async verificarEstadoTransaccion(refPayco) {
    try {

      const response = await fetch(`${this.EPAYCO_API_URL}/${refPayco}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.EPAYCO_PRIVATE_KEY}`
        }
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()

      return {
        success: data.success || false,
        data: data.data || null,
        estado: this.mapearEstadoEpayco(data.data?.x_cod_response),
        fechaActualizacion: new Date().toISOString()
      }

    } catch (error) {
      return {
        success: false,
        error: error.message,
        fechaActualizacion: new Date().toISOString()
      }
    }
  }

  /**
   * Mapea el código de respuesta de ePayco a un estado legible
   * @param {string} codResponse - Código de respuesta de ePayco
   * @returns {string} - Estado mapeado
   */
  mapearEstadoEpayco(codResponse) {
    switch (codResponse) {
      case '1':
        return 'aprobada'
      case '2':
        return 'rechazada'
      case '3':
        return 'pendiente'
      case '4':
        return 'fallida'
      case '6':
        return 'reversada'
      case '7':
        return 'retenida'
      case '8':
        return 'iniciada'
      case '9':
        return 'expirada'
      case '10':
        return 'abandonada'
      case '11':
        return 'cancelada'
      case '12':
        return 'antifraude'
      default:
        return 'desconocido'
    }
  }

  /**
   * Sincroniza el estado de un pedido específico con ePayco
   * @param {string} pedidoId - ID del pedido
   * @returns {Promise<Object>} - Resultado de la sincronización
   */
  async sincronizarPedido(pedidoId) {
    try {

      // Obtener el pedido de la base de datos
      const { data: pedido, error } = await clienteSupabase
        .from('pedidos')
        .select('*')
        .eq('id', pedidoId)
        .single()

      if (error || !pedido) {
        throw new Error('Pedido no encontrado')
      }

      if (!pedido.epayco_ref_payco) {
        throw new Error('El pedido no tiene referencia de ePayco')
      }

      // Verificar estado en ePayco
      const estadoEpayco = await this.verificarEstadoTransaccion(pedido.epayco_ref_payco)

      if (!estadoEpayco.success) {
        throw new Error(`Error al consultar ePayco: ${estadoEpayco.error}`)
      }

      // Actualizar pedido si hay cambios
      const estadoActual = pedido.estado
      const nuevoEstado = pedidosServicio.determinarEstadoPedido(estadoEpayco.data?.x_cod_response)

      if (estadoActual !== nuevoEstado) {
        
        await pedidosServicio.actualizarPedidoConEpayco(pedidoId, estadoEpayco.data)
        
        // Registrar la sincronización
        await this.registrarSincronizacion(pedidoId, estadoActual, nuevoEstado, estadoEpayco.data)
      }

      return {
        success: true,
        pedidoId,
        estadoAnterior: estadoActual,
        estadoNuevo: nuevoEstado,
        cambioDetectado: estadoActual !== nuevoEstado,
        datosEpayco: estadoEpayco.data
      }

    } catch (error) {
      return {
        success: false,
        pedidoId,
        error: error.message
      }
    }
  }

  /**
   * Sincroniza todos los pedidos pendientes con ePayco
   * @returns {Promise<Array>} - Resultados de la sincronización
   */
  async sincronizarPedidosPendientes() {
    try {

      // Obtener pedidos pendientes con referencia de ePayco
      const { data: pedidos, error } = await clienteSupabase
        .from('pedidos')
        .select('id, numero_pedido, epayco_ref_payco, estado')
        .in('estado', ['pendiente', 'procesando'])
        .not('epayco_ref_payco', 'is', null)
        .order('creado_el', { ascending: false })
        .limit(50) // Limitar para evitar sobrecarga

      if (error) {
        throw new Error(`Error al obtener pedidos: ${error.message}`)
      }

      const resultados = []

      // Sincronizar cada pedido (con delay para evitar rate limiting)
      for (const pedido of pedidos || []) {
        const resultado = await this.sincronizarPedido(pedido.id)
        resultados.push(resultado)
        
        // Delay de 500ms entre consultas
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      return resultados

    } catch (error) {
      throw error
    }
  }

  /**
   * Registra una sincronización en la base de datos
   * @param {string} pedidoId - ID del pedido
   * @param {string} estadoAnterior - Estado anterior
   * @param {string} estadoNuevo - Estado nuevo
   * @param {Object} datosEpayco - Datos de ePayco
   */
  async registrarSincronizacion(pedidoId, estadoAnterior, estadoNuevo, datosEpayco) {
    try {
      const { error } = await clienteSupabase
        .from('transacciones_epayco_logs')
        .insert([{
          referencia_pago: datosEpayco?.x_ref_payco,
          tipo: 'sincronizacion',
          estado: this.mapearEstadoEpayco(datosEpayco?.x_cod_response),
          respuesta_completa: {
            pedido_id: pedidoId,
            estado_anterior: estadoAnterior,
            estado_nuevo: estadoNuevo,
            datos_epayco: datosEpayco,
            fecha_sincronizacion: new Date().toISOString()
          }
        }])

      if (error) {
      }
    } catch (error) {
    }
  }

  /**
   * Programa sincronización automática cada cierto tiempo
   * @param {number} intervalMinutos - Intervalo en minutos (por defecto 15)
   */
  programarSincronizacionAutomatica(intervalMinutos = 15) {
    
    setInterval(async () => {
      try {
        const resultados = await this.sincronizarPedidosPendientes()
        const cambios = resultados.filter(r => r.cambioDetectado).length
      } catch (error) {
      }
    }, intervalMinutos * 60 * 1000)
  }
}

// Exportar instancia única del servicio
export const sincronizacionEpayco = new SincronizacionEpayco()
export default sincronizacionEpayco