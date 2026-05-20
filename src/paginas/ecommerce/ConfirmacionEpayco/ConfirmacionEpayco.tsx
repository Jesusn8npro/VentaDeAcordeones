'use client'

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import servicioEpayco from '@/servicios/epayco/servicioEpayco';

const ConfirmacionEpayco = () => {
  const searchParams = useSearchParams();
  const [estado, setEstado] = useState('procesando');
  const [mensaje, setMensaje] = useState('Procesando confirmación...');

  useEffect(() => {
    procesarConfirmacion();
  }, []);

  const procesarConfirmacion = async () => {
    try {
      // Obtener TODOS los parámetros de ePayco según documentación oficial
      const parametros = {
        // Parámetros principales
        x_cust_id_cliente: searchParams.get('x_cust_id_cliente'),
        x_ref_payco: searchParams.get('x_ref_payco'),
        x_id_invoice: searchParams.get('x_id_invoice'),
        x_description: searchParams.get('x_description'),
        x_amount: searchParams.get('x_amount'),
        x_amount_country: searchParams.get('x_amount_country'),
        x_amount_ok: searchParams.get('x_amount_ok'),
        x_tax: searchParams.get('x_tax'),
        x_tax_ico: searchParams.get('x_tax_ico'),
        x_amount_base: searchParams.get('x_amount_base'),
        x_currency_code: searchParams.get('x_currency_code'),
        x_bank_name: searchParams.get('x_bank_name'),
        x_cardnumber: searchParams.get('x_cardnumber'),
        x_quotas: searchParams.get('x_quotas'),
        x_response: searchParams.get('x_response'),
        x_response_reason_text: searchParams.get('x_response_reason_text'),
        x_approval_code: searchParams.get('x_approval_code'),
        x_transaction_id: searchParams.get('x_transaction_id'),
        x_fecha_transaccion: searchParams.get('x_fecha_transaccion'),
        x_transaction_date: searchParams.get('x_transaction_date'),
        x_cod_response: searchParams.get('x_cod_response'),
        x_cod_transaction_state: searchParams.get('x_cod_transaction_state'),
        x_transaction_state: searchParams.get('x_transaction_state'),
        x_errorcode: searchParams.get('x_errorcode'),
        x_franchise: searchParams.get('x_franchise'),
        x_business: searchParams.get('x_business'),
        x_customer_doctype: searchParams.get('x_customer_doctype'),
        x_customer_document: searchParams.get('x_customer_document'),
        x_customer_name: searchParams.get('x_customer_name'),
        x_customer_lastname: searchParams.get('x_customer_lastname'),
        x_customer_email: searchParams.get('x_customer_email'),
        x_customer_phone: searchParams.get('x_customer_phone'),
        x_customer_movil: searchParams.get('x_customer_movil'),
        x_customer_ind_pais: searchParams.get('x_customer_ind_pais'),
        x_customer_country: searchParams.get('x_customer_country'),
        x_customer_city: searchParams.get('x_customer_city'),
        x_customer_address: searchParams.get('x_customer_address'),
        x_customer_ip: searchParams.get('x_customer_ip'),
        x_signature: searchParams.get('x_signature'),
        x_test_request: searchParams.get('x_test_request'),
        x_extra1: searchParams.get('x_extra1'),
        x_extra2: searchParams.get('x_extra2'),
        x_extra3: searchParams.get('x_extra3'),
        x_extra4: searchParams.get('x_extra4'),
        x_extra5: searchParams.get('x_extra5'),
        x_extra6: searchParams.get('x_extra6'),
        x_extra7: searchParams.get('x_extra7'),
        x_extra8: searchParams.get('x_extra8'),
        x_extra9: searchParams.get('x_extra9'),
        x_extra10: searchParams.get('x_extra10'),
        
        // Parámetros de compatibilidad (formato anterior)
        ref_payco: searchParams.get('ref_payco') || searchParams.get('x_ref_payco'),
        response: searchParams.get('response') || searchParams.get('x_response'),
        transaction_id: searchParams.get('transaction_id') || searchParams.get('x_transaction_id'),
        approval_code: searchParams.get('approval_code') || searchParams.get('x_approval_code'),
        franchise: searchParams.get('franchise') || searchParams.get('x_franchise'),
        bank_name: searchParams.get('bank_name') || searchParams.get('x_bank_name'),
        cod_response: searchParams.get('cod_response') || searchParams.get('x_cod_response'),
        signature: searchParams.get('signature') || searchParams.get('x_signature'),
        test_request: searchParams.get('test_request') || searchParams.get('x_test_request')
      };

      // Validar firma HMAC-SHA256 en el servidor antes de registrar
      let signature_valida = false;
      try {
        const validacionRes = await fetch('/api/epayco/validar-firma', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            x_ref_payco: parametros.x_ref_payco,
            x_transaction_id: parametros.x_transaction_id,
            x_amount: parametros.x_amount,
            x_currency_code: parametros.x_currency_code,
            x_signature: parametros.x_signature,
            x_cust_id_cliente: parametros.x_cust_id_cliente,
          }),
        });
        const validacionData = await validacionRes.json();
        if (validacionData.valida === false) {
          setEstado('error');
          setMensaje('Firma de pago inválida. Posible manipulación detectada.');
          return;
        }
        signature_valida = validacionData.valida === true;
      } catch {
        // Si el servidor no responde, continuar pero marcar como no validada
        signature_valida = false;
      }

      const logData = {
        epayco_ref_payco: parametros.x_ref_payco || parametros.ref_payco,
        epayco_transaction_id: parametros.x_transaction_id || parametros.transaction_id,
        tipo_evento: 'confirmation',
        cod_response: parametros.x_cod_response || parametros.cod_response,
        mensaje_response: parametros.x_response || parametros.response,
        signature_valida,
        datos_completos: parametros,
        creado_el: new Date().toISOString(),
        x_amount: parametros.x_amount,
        x_currency_code: parametros.x_currency_code,
        x_franchise: parametros.x_franchise,
        x_bank_name: parametros.x_bank_name,
        x_approval_code: parametros.x_approval_code,
        x_customer_email: parametros.x_customer_email,
        x_test_request: parametros.x_test_request
      };

      await servicioEpayco.registrarTransaccion({
        referenciaPago: logData.epayco_ref_payco,
        estado: parametros.x_response,
        respuestaCompleta: logData,
        tipo: 'confirmation'
      });

      // Buscar el pedido por referencia
      if (!parametros.ref_payco) {
        setEstado('error');
        setMensaje('Referencia de pago no válida');
      } else {
        setEstado('exitoso');
        setMensaje('Confirmación registrada. El procesamiento se realiza del lado servidor.');
      }

    } catch (error) {
      setEstado('error');
      setMensaje('Error interno del servidor');
    }
  };

  // Esta página es principalmente para webhooks, no para mostrar al usuario
  // Pero incluimos una respuesta básica por si acaso
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-4">
          {estado === 'procesando' && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          )}
          {estado === 'exitoso' && (
            <div className="text-green-600 text-4xl">✅</div>
          )}
          {estado === 'error' && (
            <div className="text-red-600 text-4xl">❌</div>
          )}
          {estado === 'advertencia' && (
            <div className="text-yellow-600 text-4xl">⚠️</div>
          )}
        </div>
        
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          Confirmación de Pago
        </h1>
        
        <p className="text-gray-600 mb-6">
          {mensaje}
        </p>

        <div className="text-sm text-gray-500">
          <p>Esta página procesa las confirmaciones automáticas de ePayco.</p>
          <p>Si ves esta página, la confirmación se está procesando correctamente.</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmacionEpayco;