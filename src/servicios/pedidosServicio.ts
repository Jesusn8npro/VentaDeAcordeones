import { clienteSupabase } from '../configuracion/supabase'

/**
 * Servicio para manejar pedidos en Supabase
 */
class PedidosServicio {
  
  /**
   * Crea un nuevo pedido en la base de datos
   * @param {Object} datosPedido - Datos del pedido
   * @returns {Promise<Object>} - Pedido creado con su ID
   */
  async crearPedido(datosPedido) {
    try {
      // Validar datos requeridos
      if (!datosPedido.numero_pedido) {
        throw new Error('Número de pedido es requerido')
      }
      if (!datosPedido.nombre_cliente) {
        throw new Error('Nombre del cliente es requerido')
      }
      if (!datosPedido.email_cliente) {
        throw new Error('Email del cliente es requerido')
      }
      if (!datosPedido.productos || !Array.isArray(datosPedido.productos)) {
        throw new Error('Productos son requeridos y deben ser un array')
      }
      if (!datosPedido.total || datosPedido.total <= 0) {
        throw new Error('Total del pedido debe ser mayor a 0')
      }

      // Preparar datos para inserción
      const pedidoParaInsertar = {
        numero_pedido: datosPedido.numero_pedido,
        usuario_id: datosPedido.usuario_id || null,
        nombre_cliente: datosPedido.nombre_cliente,
        email_cliente: datosPedido.email_cliente,
        telefono_cliente: datosPedido.telefono_cliente || '',
        direccion_envio: datosPedido.direccion_envio || {},
        productos: datosPedido.productos,
        subtotal: datosPedido.subtotal || 0,
        descuento_aplicado: datosPedido.descuento_aplicado || 0,
        costo_envio: datosPedido.costo_envio || 0,
        total: datosPedido.total,
        estado: datosPedido.estado || 'pendiente',
        metodo_pago: datosPedido.metodo_pago || 'epayco',
        referencia_pago: datosPedido.referencia_pago || null,
        notas_cliente: datosPedido.notas_cliente || null,
        notas_admin: datosPedido.notas_admin || null,
        // Campos de ePayco (inicialmente null, se actualizarán después del pago)
        epayco_ref_payco: datosPedido.epayco_ref_payco || null,
        epayco_transaction_id: null,
        epayco_cod_response: null,
        epayco_signature: null,
        epayco_approval_code: null,
        epayco_fecha_transaccion: null,
        epayco_franchise: null,
        epayco_bank_name: null,
        epayco_test_request: datosPedido.epayco_test_request || false,
        epayco_extra_data: null,
        epayco_response_raw: null
      }

      // Insertar en Supabase
      const { data, error } = await clienteSupabase
        .from('pedidos')
        .insert([pedidoParaInsertar])
        .select()
        .single()

      if (error) {
        throw new Error(`Error al crear pedido: ${error.message}`)
      }

      return data

    } catch (error) {
      // Error silencioso para producción
      throw error;
    }
  }

  /**
   * Actualiza un pedido existente con información de ePayco
   * @param {string} pedidoId - ID del pedido
   * @param {Object} datosEpayco - Datos de la respuesta de ePayco
   * @returns {Promise<Object>} - Pedido actualizado
   */
  async actualizarPedidoConEpayco(pedidoId, datosEpayco) {
    try {
      const datosActualizacion = {
        epayco_ref_payco: datosEpayco.x_ref_payco || null,
        epayco_transaction_id: datosEpayco.x_transaction_id || null,
        epayco_cod_response: datosEpayco.x_cod_response || null,
        epayco_signature: datosEpayco.x_signature || null,
        epayco_approval_code: datosEpayco.x_approval_code || null,
        epayco_fecha_transaccion: datosEpayco.x_fecha_transaccion ? new Date(datosEpayco.x_fecha_transaccion) : null,
        epayco_franchise: datosEpayco.x_franchise || null,
        epayco_bank_name: datosEpayco.x_bank_name || null,
        epayco_test_request: datosEpayco.x_test_request === 'TRUE' || datosEpayco.x_test_request === true,
        epayco_extra_data: datosEpayco.x_extra1 ? { 
          extra1: datosEpayco.x_extra1, 
          extra2: datosEpayco.x_extra2, 
          extra3: datosEpayco.x_extra3 
        } : null,
        epayco_response_raw: datosEpayco,
        estado: this.determinarEstadoPedido(datosEpayco.x_cod_response),
        actualizado_el: new Date().toISOString()
      }

      const { data, error } = await clienteSupabase
        .from('pedidos')
        .update(datosActualizacion)
        .eq('id', pedidoId)
        .select()
        .single()

      if (error) {
        throw new Error(`Error al actualizar pedido: ${error.message}`)
      }

      return data

    } catch (error) {
      // Error silencioso para producción
      throw error
    }
  }

  /**
   * Busca un pedido por su número de pedido
   * @param {string} numeroPedido - Número del pedido
   * @returns {Promise<Object|null>} - Pedido encontrado o null
   */
  async buscarPedidoPorNumero(numeroPedido) {
    try {
      const { data, error } = await clienteSupabase
        .from('pedidos')
        .select('*')
        .eq('numero_pedido', numeroPedido)
        .limit(1)

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw new Error(`Error al buscar pedido: ${error.message}`)
      }

      return data && data.length > 0 ? data[0] : null

    } catch (error) {
      // Error silencioso para producción
      throw error
    }
  }

  /**
   * Busca un pedido por referencia de ePayco
   * @param {string} refPayco - Referencia de ePayco
   * @returns {Promise<Object|null>} - Pedido encontrado o null
   */
  async buscarPedidoPorRefEpayco(refPayco) {
    try {
      if (!refPayco) {
        return null
      }

      const { data, error } = await clienteSupabase
        .from('pedidos')
        .select('*')
        .eq('epayco_ref_payco', refPayco)
        .limit(1)

      if (error) {
        // Si es error 406, probablemente el campo no existe
        if (error.message?.includes('406') || error.message?.includes('Not Acceptable')) {
          return null // Retornar null en lugar de lanzar error para no romper el flujo
        }
        
        if (error.code !== 'PGRST116') { // PGRST116 = no rows found
          throw new Error(`Error al buscar pedido: ${error.message}`)
        }
      }

      if (data && data.length > 0) {
        return data[0]
      }

      // Si no se encuentra por epayco_ref_payco, buscar por numero_pedido como fallback
      const { data: dataAlternativa, error: errorAlternativo } = await clienteSupabase
        .from('pedidos')
        .select('*')
        .ilike('numero_pedido', `%${refPayco}%`)
        .limit(1)

      if (errorAlternativo) {
        return null
      }

      if (dataAlternativa && dataAlternativa.length > 0) {
        return dataAlternativa[0]
      }

      return null

    } catch (error) {
      // Error silencioso para producción
      return null
    }
  }

  /**
   * Función de diagnóstico para verificar conectividad con Supabase
   */
  async diagnosticarConectividad() {
    try {
      // 1. Verificar conectividad básica
      const { data: testBasico, error: errorBasico } = await clienteSupabase
        .from('pedidos')
        .select('id')
        .limit(1)

      if (errorBasico) {
        return { conectividad: false, error: errorBasico }
      }

      // 2. Verificar si el campo epayco_ref_payco existe
      const { data: testCampo, error: errorCampo } = await clienteSupabase
        .from('pedidos')
        .select('epayco_ref_payco')
        .limit(1)

      if (errorCampo) {
        return { 
          conectividad: true, 
          campoEpayco: false, 
          error: errorCampo,
          solucion: 'Ejecutar script 01_agregar_campos_epayco_pedidos.sql'
        }
      }

      // 3. Verificar datos existentes
      const { data: testDatos, error: errorDatos } = await clienteSupabase
        .from('pedidos')
        .select('id, numero_pedido, epayco_ref_payco')
        .not('epayco_ref_payco', 'is', null)
        .limit(5)

      return {
        conectividad: true,
        campoEpayco: true,
        datosExistentes: testDatos?.length || 0,
        muestraDatos: testDatos
      }

    } catch (error) {
      // Error silencioso para producción
      return { conectividad: false, error }
    }
  }

  /**
   * Busca un pedido por referencia usando métodos alternativos
   * Esta función es un fallback cuando los campos de ePayco no existen
   * @param {string} referencia - Referencia a buscar
   * @returns {Promise<Object|null>} - Pedido encontrado o null
   */
  async buscarPedidoAlternativo(referencia) {
    try {
      // Primero intentar buscar por número de pedido
      let { data, error } = await clienteSupabase
        .from('pedidos')
        .select('*')
        .eq('numero_pedido', referencia)
        .limit(1)

      if (data && data.length > 0) {
        return data[0]
      }

      // Si no se encuentra, intentar buscar por referencia de pago
      ({ data, error } = await clienteSupabase
        .from('pedidos')
        .select('*')
        .eq('referencia_pago', referencia)
        .limit(1))

      if (data && data.length > 0) {
        return data[0]
      }

      // Si no se encuentra, buscar en todos los pedidos que contengan la referencia
      ({ data, error } = await clienteSupabase
        .from('pedidos')
        .select('*')
        .or(`numero_pedido.eq.${referencia},referencia_pago.eq.${referencia}`)
        .limit(1))

      if (data && data.length > 0) {
        return data[0]
      }

      return null

    } catch (error) {
      // Error silencioso para producción
      return null
    }
  }

  /**
   * Determina el estado del pedido basado en el código de respuesta de ePayco
   * @param {string} codResponse - Código de respuesta de ePayco
   * @returns {string} - Estado del pedido
   */
  determinarEstadoPedido(codResponse) {
    switch (codResponse) {
      case '1': // Transacción aprobada
        return 'pagado'
      case '2': // Transacción rechazada
        return 'rechazado'
      case '3': // Transacción pendiente
        return 'pendiente'
      case '4': // Transacción fallida
        return 'fallido'
      default:
        return 'pendiente'
    }
  }

  /**
   * Obtiene pedidos de un usuario
   * @param {string} usuarioId - ID del usuario
   * @returns {Promise<Array>} - Lista de pedidos
   */
  async obtenerPedidosUsuario(usuarioId) {
    try {
      const { data, error } = await clienteSupabase
        .from('pedidos')
        .select('*')
        .eq('usuario_id', usuarioId)
        .order('creado_el', { ascending: false })

      if (error) {
        throw new Error(`Error al obtener pedidos: ${error.message}`)
      }

      return data || []

    } catch (error) {
      // Error silencioso para producción
      throw error
    }
  }
}

// Exportar instancia única del servicio
export const pedidosServicio = new PedidosServicio()
export default pedidosServicio

// Función export para compatibilidad con código existente
export const buscarPedidoPorRefEpayco = async (refPayco) => {
  return await pedidosServicio.buscarPedidoPorRefEpayco(refPayco)
}