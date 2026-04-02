import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

const RespuestaEpayco = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [estadoPago, setEstadoPago] = useState('cargando');
  const [datosPago, setDatosPago] = useState({});

  useEffect(() => {
    // Obtener parámetros de la URL
    const parametros = {
      ref_payco: searchParams.get('ref_payco'),
      response: searchParams.get('response'),
      transaction_id: searchParams.get('transaction_id'),
      approval_code: searchParams.get('approval_code'),
      franchise: searchParams.get('franchise'),
      bank_name: searchParams.get('bank_name'),
      cod_response: searchParams.get('cod_response'),
      signature: searchParams.get('signature'),
      test_request: searchParams.get('test_request')
    };

    setDatosPago(parametros);

    // Determinar estado del pago basado en cod_response
    const codigoRespuesta = parametros.cod_response;
    
    if (codigoRespuesta === '1') {
      setEstadoPago('exitoso');
    } else if (codigoRespuesta === '2') {
      setEstadoPago('rechazado');
    } else if (codigoRespuesta === '3') {
      setEstadoPago('pendiente');
    } else {
      setEstadoPago('error');
    }

    // Log para debugging
    console.log('📄 Respuesta de ePayco:', parametros);
  }, [searchParams]);

  const obtenerIcono = () => {
    switch (estadoPago) {
      case 'exitoso':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'rechazado':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'pendiente':
        return <Clock className="w-16 h-16 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-16 h-16 text-orange-500" />;
      default:
        return <Clock className="w-16 h-16 text-gray-500 animate-spin" />;
    }
  };

  const obtenerTitulo = () => {
    switch (estadoPago) {
      case 'exitoso':
        return '¡Pago Exitoso!';
      case 'rechazado':
        return 'Pago Rechazado';
      case 'pendiente':
        return 'Pago Pendiente';
      case 'error':
        return 'Error en el Pago';
      default:
        return 'Procesando...';
    }
  };

  const obtenerMensaje = () => {
    switch (estadoPago) {
      case 'exitoso':
        return 'Tu pago ha sido procesado exitosamente. Recibirás un email de confirmación.';
      case 'rechazado':
        return 'Tu pago fue rechazado. Por favor, verifica los datos de tu tarjeta e intenta nuevamente.';
      case 'pendiente':
        return 'Tu pago está siendo procesado. Te notificaremos cuando se complete.';
      case 'error':
        return 'Ocurrió un error al procesar tu pago. Por favor, contacta con soporte.';
      default:
        return 'Procesando tu pago...';
    }
  };

  const obtenerColorFondo = () => {
    switch (estadoPago) {
      case 'exitoso':
        return 'bg-green-50 border-green-200';
      case 'rechazado':
        return 'bg-red-50 border-red-200';
      case 'pendiente':
        return 'bg-yellow-50 border-yellow-200';
      case 'error':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const manejarContinuar = () => {
    if (estadoPago === 'exitoso') {
      navigate('/perfil/pedidos'); // Ir a ver pedidos
    } else {
      navigate('/carrito'); // Volver al carrito para intentar de nuevo
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className={`max-w-md w-full bg-white rounded-lg shadow-lg border-2 ${obtenerColorFondo()} p-8 text-center`}>
        <div className="flex justify-center mb-6">
          {obtenerIcono()}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          {obtenerTitulo()}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {obtenerMensaje()}
        </p>

        {/* Detalles del pago */}
        {datosPago.ref_payco && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-700 mb-2">Detalles del Pago:</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Referencia:</span> {datosPago.ref_payco}</p>
              {datosPago.transaction_id && (
                <p><span className="font-medium">ID Transacción:</span> {datosPago.transaction_id}</p>
              )}
              {datosPago.approval_code && (
                <p><span className="font-medium">Código Aprobación:</span> {datosPago.approval_code}</p>
              )}
              {datosPago.franchise && (
                <p><span className="font-medium">Franquicia:</span> {datosPago.franchise}</p>
              )}
              {datosPago.bank_name && (
                <p><span className="font-medium">Banco:</span> {datosPago.bank_name}</p>
              )}
              {datosPago.test_request === 'true' && (
                <p className="text-orange-600 font-medium">⚠️ Transacción de Prueba</p>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="space-y-3">
          <button
            onClick={manejarContinuar}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
              estadoPago === 'exitoso'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {estadoPago === 'exitoso' ? 'Ver Mis Pedidos' : 'Volver al Carrito'}
          </button>
          
          <button
            onClick={() => navigate('/')}
            className="w-full py-3 px-4 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
          >
            Ir al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default RespuestaEpayco;