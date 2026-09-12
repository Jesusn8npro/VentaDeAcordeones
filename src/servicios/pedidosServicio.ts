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
    // El pedido se crea EN EL SERVIDOR (app/api/pedidos/crear). Aquí solo se manda
    // qué se quiere comprar y a dónde enviarlo: precio, descuento, envío y total
    // los recalcula el servidor contra la BD. Antes esta función insertaba en
    // Supabase con el total que venía del navegador (y descontaba stock), así que
    // cualquiera podía pagar $1.000 por un acordeón de varios millones.
    const productos = Array.isArray(datosPedido?.productos) ? datosPedido.productos : []
    if (productos.length === 0) {
      throw new Error('El carrito está vacío')
    }

    const envio = datosPedido.direccion_envio || {}
    const respuesta = await fetch('/api/pedidos/crear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: productos.map((p) => ({
          producto_id: p.producto_id || p.id,
          cantidad: p.cantidad || 1,
        })),
        cliente: {
          nombre: envio.nombre,
          apellido: envio.apellido,
          email: envio.email || datosPedido.email_cliente,
          telefono: envio.telefono || datosPedido.telefono_cliente,
          direccion: envio.direccion,
          ciudad: envio.ciudad,
          departamento: envio.departamento,
          codigoPostal: envio.codigoPostal,
          instrucciones: envio.instrucciones,
          tipoDocumento: envio.tipoDocumento,
          numeroDocumento: envio.numeroDocumento,
        },
        cupon: datosPedido.cupon || null,
        usuario_id: datosPedido.usuario_id || null,
        notas: datosPedido.notas_cliente || null,
      }),
    })

    const datos = await respuesta.json().catch(() => ({}))
    if (!respuesta.ok) {
      throw new Error(datos?.error || 'No pudimos registrar el pedido')
    }
    return datos
  }

  /**
   * Actualiza un pedido existente con información de ePayco
   * @param {string} pedidoId - ID del pedido
   * @param {Object} datosEpayco - Datos de la respuesta de ePayco
   * @returns {Promise<Object>} - Pedido actualizado
   */
  async actualizarPedidoConEpayco(pedidoId, datosEpayco) {
    // El navegador YA NO marca pedidos como pagados. La única fuente de verdad es
    // la confirmación servidor-a-servidor de ePayco (app/api/epayco/confirmar),
    // que valida la firma y que el monto coincide con el total del pedido antes de
    // tocar el estado o el stock. Antes bastaba con un postMessage falsificado.
    // Esta función se mantiene para la UI: devuelve el estado que corresponde a la
    // respuesta recibida, sin escribir nada en la base de datos.
    return {
      id: pedidoId,
      estado: this.determinarEstadoPedido(datosEpayco?.x_cod_response),
      epayco_ref_payco: datosEpayco?.x_ref_payco || null,
      epayco_transaction_id: datosEpayco?.x_transaction_id || null,
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
      // Antes esto interpolaba la referencia dentro de un filtro .or(): un valor con
      // comas o paréntesis (viene de la URL) podía reescribir la consulta. Con .in()
      // el valor viaja como parámetro y no como sintaxis de filtro.
      ({ data, error } = await clienteSupabase
        .from('pedidos')
        .select('*')
        .in('numero_pedido', [referencia])
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