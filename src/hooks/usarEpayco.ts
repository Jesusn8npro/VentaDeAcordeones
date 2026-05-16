/**
 * Hook personalizado para usar ePayco en componentes React
 * Proporciona funciones y estado para manejar pagos con ePayco
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  validarDatosTarjeta, 
  validarDatosCliente, 
  validarDatosPago,
  generarNumeroFactura,
  calcularIVA
} from '../servicios/epayco';
import { EPAYCO_CONFIG } from '../configuracion/constantes';
import servicioEpayco from '../servicios/epayco/servicioEpayco';
import pedidosServicio from '../servicios/pedidosServicio';

export const usarEpayco = () => {
  // Estados del hook
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const [transaccionActual, setTransaccionActual] = useState(null);
  const [servicioListo, setServicioListo] = useState(false);

  // Verificar si ePayco está disponible globalmente
  useEffect(() => {
    let intentos = 0;
    const maxIntentos = 50; // 5 segundos máximo
    
    const verificarEpayco = () => {
      intentos++;
      
      if (typeof window.ePayco !== 'undefined') {
        setServicioListo(true);
        setError(null);
      } else if (intentos < maxIntentos) {
        // Reintentar después de un breve delay
        setTimeout(verificarEpayco, 100);
      } else {
        setError('No se pudo cargar el sistema de pagos. Por favor, recarga la página.');
        setServicioListo(false);
      }
    };
    
    verificarEpayco();
  }, []);

  /**
   * Limpia el estado de error
   */
  const limpiarError = useCallback(() => {
    setError(null);
  }, []);





  /**
   * Calcula el total de un pago incluyendo IVA
   * @param {number} valorBase - Valor base sin IVA
   * @param {number} porcentajeIva - Porcentaje de IVA
   * @returns {Object} Cálculo detallado
   */
  const calcularTotalPago = useCallback((valorBase, porcentajeIva = 19) => {
    return calcularIVA(valorBase, porcentajeIva);
  }, []);

  /**
   * Genera un número de factura único
   * @param {string} prefijo - Prefijo para la factura
   * @returns {string} Número de factura
   */
  const generarFactura = useCallback((prefijo = 'FAC') => {
    return generarNumeroFactura(prefijo);
  }, []);

  /**
   * Procesa un pago usando ePayco OnPage Checkout
   * @param {Object} datosEpayco - Datos del pago para OnPage Checkout
   * @returns {Promise<Object>} Resultado del pago
   */
  const procesarPagoOnPage = useCallback(async (datosEpayco) => {
    setCargando(true);
    setError(null);

    try {
      // Validar datos de entrada
      if (!datosEpayco || !datosEpayco.cliente || !datosEpayco.pedido) {
        throw new Error('Datos de pago incompletos. Verifica la información del cliente y pedido.');
      }

      // Verificar que ePayco esté disponible globalmente
      if (typeof window.ePayco === 'undefined') {
        throw new Error('ePayco SDK no está cargado. Por favor, recarga la página e intenta nuevamente.');
      }

      // Verificar que el checkout esté disponible
      if (typeof window.ePayco.checkout === 'undefined') {
        throw new Error('ePayco checkout no está disponible. Verifica la conexión a internet.');
      }

      // Verificar que configure esté disponible
      if (typeof window.ePayco.checkout.configure !== 'function') {
        throw new Error('ePayco checkout.configure no es una función. Versión del SDK incompatible.');
      }
      // Validar parámetros obligatorios según documentación oficial de ePayco
      if (!EPAYCO_CONFIG.PUBLIC_KEY) {
        throw new Error('PUBLIC_KEY de ePayco no configurada. Verifica las variables de entorno.');
      }

      if (!datosEpayco.pedido.valor || datosEpayco.pedido.valor <= 0) {
        throw new Error('El valor del pedido debe ser mayor a 0.');
      }

      if (!datosEpayco.pedido.referencia) {
        throw new Error('La referencia del pedido es obligatoria.');
      }

      // Configurar los datos para ePayco OnPage Checkout según documentación oficial
      const datosPago = {
        // Información del producto/pedido (obligatorio)
        name: datosEpayco.pedido.descripcion || 'Compra en VentaDeAcordeones.com',
        description: datosEpayco.pedido.descripcion || 'Compra en VentaDeAcordeones.com',
        invoice: datosEpayco.pedido.referencia,
        currency: EPAYCO_CONFIG.CURRENCY.toLowerCase(), // debe ser minúscula
        amount: Math.round(datosEpayco.pedido.valor).toString(), // Redondear para evitar decimales
        tax_base: Math.round(datosEpayco.pedido.subtotal || datosEpayco.pedido.valor).toString(),
        tax: "0", // Sin IVA por ahora
        tax_ico: "0", // Sin impuesto al consumo
        country: EPAYCO_CONFIG.COUNTRY.toLowerCase(), // debe ser minúscula
        lang: "es", // idioma español
        
        // Configuración del checkout
        external: "false", // Para OnPage Checkout
        
        // URLs de respuesta (usando configuración centralizada)
        response: EPAYCO_CONFIG.RESPONSE_URL,
        confirmation: EPAYCO_CONFIG.CONFIRMATION_URL,
        
        // Información del cliente (billing)
        name_billing: `${datosEpayco.cliente.nombre || ''} ${datosEpayco.cliente.apellido || ''}`.trim(),
        address_billing: datosEpayco.cliente.direccion || 'No especificada',
        type_doc_billing: (datosEpayco.cliente.tipoDocumento || 'CC').toLowerCase(),
        mobilephone_billing: datosEpayco.cliente.telefono,
        number_doc_billing: datosEpayco.cliente.numeroDocumento,
        email_billing: datosEpayco.cliente.email,
        
        // Datos extras (opcional)
        extra1: datosEpayco.pedido.id || datosEpayco.pedido.referencia, // ID del pedido en Supabase
        extra2: "ecommerce",
        extra3: datosEpayco.cliente.email
      };
      // Crear una promesa para manejar el resultado del pago
      return new Promise((resolve, reject) => {
        try {
          // Configurar el handler de ePayco con las credenciales según documentación oficial
          const handler = window.ePayco.checkout.configure({
            key: EPAYCO_CONFIG.PUBLIC_KEY,
            test: EPAYCO_CONFIG.TEST_MODE
          });

          // Verificar que el handler se configuró correctamente
          if (!handler || typeof handler.open !== 'function') {
            throw new Error('Error al configurar el handler de ePayco. Verifica las credenciales.');
          }

          // Handler configurado exitosamente - sin logs en producción

          // Declarar variable para timeout
          let timeoutId;

          // Crear función que maneja respuesta y limpia timeout
          const manejarRespuestaConTimeout = async (event) => {
            // Verificar origen por seguridad
            if (event.origin !== 'https://checkout.epayco.co') return;
            
            // Respuesta de ePayco recibida - sin logs en producción
            
            // Limpiar timeout y remover listener
            if (timeoutId) clearTimeout(timeoutId);
            window.removeEventListener('message', manejarRespuestaConTimeout);
            
            // Validar que la respuesta tenga los datos mínimos necesarios
            if (!event.data || (!event.data.ref_payco && !event.data.x_ref_payco)) {
              // Error silencioso para producción - respuesta incompleta
              reject({
                exito: false,
                error: 'Respuesta de ePayco incompleta'
              });
              return;
            }
            
            // Actualizar estado de la transacción
            const transaccionData = {
              referencia: event.data.ref_payco || event.data.x_ref_payco,
              estado: event.data.x_response || 'pendiente',
              datos: event.data
            };
            
            setTransaccionActual(transaccionData);

             // Guardar transacción en Supabase
             try {
               // Guardando transacción en Supabase - sin logs en producción
               
               const resultado = await servicioEpayco.registrarTransaccion({
                 pedidoId: datosEpayco.pedido.id || datosPago.invoice || null,
                 referenciaPago: event.data.ref_payco || event.data.x_ref_payco,
                 estado: event.data.x_response || 'pendiente',
                 respuestaCompleta: event.data,
                 tipo: 'onpage_checkout'
               });
             } catch (errorGuardado) {
               // No fallar el proceso por error de guardado
             }

             // Actualizar el pedido con los datos de ePayco
             try {
               const pedidoId = datosEpayco.pedido.id || datosPago.invoice;
               if (pedidoId) {
                 const pedidoActualizado = await pedidosServicio.actualizarPedidoConEpayco(pedidoId, event.data);
               } else {
               }
             } catch (errorActualizacion) {
               // No fallar el proceso por error de actualización
             }
             
             // Resolver la promesa con los datos de la transacción
             resolve({
               exito: true,
               transaccion: event.data,
               mensaje: 'Pago procesado correctamente'
             });
          };

          // Configurar manejador de cierre del modal
          handler.onCloseModal = function() {
            if (timeoutId) clearTimeout(timeoutId);
            window.removeEventListener('message', manejarRespuestaConTimeout);
            reject({
              exito: false,
              error: 'Pago cancelado por el usuario'
            });
          };

          // Agregar listener
          window.addEventListener('message', manejarRespuestaConTimeout);

          // Configurar timeout de seguridad
          timeoutId = setTimeout(() => {
            window.removeEventListener('message', manejarRespuestaConTimeout);
            reject({
              exito: false,
              error: 'Timeout: El checkout no respondió en el tiempo esperado (30s)'
            });
          }, 30000); // 30 segundos

          // Abrir el checkout con los datos del pago
          try {
            handler.open(datosPago);
          } catch (openError) {
            if (timeoutId) clearTimeout(timeoutId);
            window.removeEventListener('message', manejarRespuestaConTimeout);
            reject({
              exito: false,
              error: 'Error al abrir el checkout: ' + openError.message
            });
            return;
          }

        } catch (handlerError) {
          reject({
            exito: false,
            error: 'Error al configurar el checkout: ' + handlerError.message
          });
        }
      });

    } catch (error) {
      const mensajeError = error.message || 'Error desconocido al procesar el pago';
      setError(mensajeError);
      
      return {
        exito: false,
        error: mensajeError
      };
    } finally {
      setCargando(false);
    }
  }, []);

  /**
   * Reinicia el estado del hook
   */
  const reiniciarEstado = useCallback(() => {
    setCargando(false);
    setError(null);
    setTransaccionActual(null);
  }, []);

  return {
    // Estados
    cargando,
    error,
    transaccionActual,
    servicioListo,

    // Funciones principales
    procesarPagoOnPage,

    // Utilidades
    calcularTotalPago,
    generarFactura,
    
    // Funciones de control
    limpiarError,
    reiniciarEstado,

    // Validaciones (re-exportadas para conveniencia)
    validarDatosTarjeta,
    validarDatosCliente,
    validarDatosPago
  };
};

export default usarEpayco;