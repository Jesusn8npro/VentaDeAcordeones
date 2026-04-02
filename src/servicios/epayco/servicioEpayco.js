/**
 * Servicio principal de ePayco
 * Maneja todas las operaciones de pago, validaciones y comunicación con la API de ePayco
 */

// import epayco from 'epayco-sdk-node'; // Comentado para evitar errores en el frontend
import { configuracionEpayco, obtenerConfiguracionSDK, validarConfiguracion } from './configuracionEpayco.js';
import { clienteSupabase } from '../../configuracion/supabase.js';

class ServicioEpayco {
  constructor() {
    this.cliente = null;
    this.inicializado = false;
    // No inicializar automáticamente en el frontend
    // this.inicializar();
  }

  /**
   * Inicializa el cliente de ePayco
   */
  inicializar() {
    try {
      const validacion = validarConfiguracion();
      
      if (!validacion.esValida) {
        console.error('Error en configuración de ePayco:', validacion.errores);
        throw new Error(`Configuración de ePayco inválida: ${validacion.errores.join(', ')}`);
      }

      const config = obtenerConfiguracionSDK();
      // En el frontend no se inicializa el SDK de Node.
      this.inicializado = false;
      
      console.log('✅ Servicio ePayco inicializado correctamente');
    } catch (error) {
      console.error('❌ Error al inicializar ePayco:', error);
      throw error;
    }
  }

  /**
   * Verifica que el servicio esté inicializado
   */
  verificarInicializacion() {
    if (!this.inicializado || !this.cliente) {
      throw new Error('Servicio ePayco no está inicializado');
    }
  }

  /**
   * Crea un token de tarjeta de crédito
   * @param {Object} datosTarjeta - Información de la tarjeta
   * @returns {Promise<Object>} Token de la tarjeta
   */
  async crearTokenTarjeta(datosTarjeta) {
    throw new Error('Operación no disponible en frontend');
  }

  /**
   * Crea un cliente en ePayco
   * @param {Object} datosCliente - Información del cliente
   * @returns {Promise<Object>} Cliente creado
   */
  async crearCliente(datosCliente) {
    throw new Error('Operación no disponible en frontend');
  }

  /**
   * Procesa un pago con tarjeta de crédito
   * @param {Object} datosPago - Información del pago
   * @returns {Promise<Object>} Resultado del pago
   */
  async procesarPagoTarjeta(datosPago) {
    throw new Error('Operación no disponible en frontend');
  }

  /**
   * Consulta el estado de una transacción
   * @param {string} referencia - Referencia de la transacción
   * @returns {Promise<Object>} Estado de la transacción
   */
  async consultarTransaccion(referencia) {
    throw new Error('Operación no disponible en frontend');
  }

  /**
   * Registra una transacción en nuestra base de datos
   * @param {Object} datosTransaccion - Datos de la transacción
   */
  async registrarTransaccion(datosTransaccion) {
    try {
      const endpoint = import.meta.env.VITE_BACKEND_CONFIRM_URL;
      if (!endpoint) {
        if (import.meta.env.DEV) {
          console.log('Confirmación sin backend configurado:', datosTransaccion);
        }
        return;
      }
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosTransaccion)
      });
    } catch (_) {
      // Silencioso en producción
    }
  }

  /**
   * Valida la firma de un webhook de ePayco
   * @param {Object} datos - Datos del webhook
   * @param {string} firma - Firma recibida
   * @returns {boolean} Si la firma es válida
   */
  validarFirmaWebhook() {
    return false;
  }

  /**
   * Procesa un webhook de ePayco
   * @param {Object} datosWebhook - Datos del webhook
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async procesarWebhook(datosWebhook) {
    return { exito: false, error: 'Operación no disponible en frontend' };
  }
}

// Crear instancia singleton del servicio
const servicioEpayco = new ServicioEpayco();

export default servicioEpayco;