import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Shield,
  CreditCard,
  ArrowRight,
  Info,
  Home,
  DollarSign,
  Hash,
  Calendar,
  Building
} from 'lucide-react'
import { formatearPrecioCOP } from '../../../utilidades/formatoPrecio'
import servicioEpayco from '../../../servicios/epayco/servicioEpayco'
import './PaginaConfirmacionEpayco.css'

const PaginaConfirmacionEpayco = () => {
  const [searchParams] = useSearchParams()
  const [estado, setEstado] = useState('procesando') // procesando, validando, exitoso, error
  const [mensaje, setMensaje] = useState('Validando transacción con ePayco...')
  const [datosTransaccion, setDatosTransaccion] = useState(null)
  const [progreso, setProgreso] = useState(0)
  const [pasoActual, setPasoActual] = useState(0)
  const [tiempoRestante, setTiempoRestante] = useState(null)

  const pasos = [
    'Recibiendo datos de ePayco',
    'Validando transacción',
    'Confirmando pago',
    'Procesando pedido'
  ]

  useEffect(() => {
    const validarTransaccion = async () => {
      try {
        // Obtener parámetros de ePayco - USANDO LOS NOMBRES CORRECTOS
        const x_ref_payco = searchParams.get('x_ref_payco')
        const x_response = searchParams.get('x_response')
        const x_response_reason_text = searchParams.get('x_response_reason_text')
        const x_amount = searchParams.get('x_amount')
        const x_fecha_transaccion = searchParams.get('x_fecha_transaccion')
        const x_bank_name = searchParams.get('x_bank_name')
        const x_receipt = searchParams.get('x_receipt')
        const x_franchise = searchParams.get('x_franchise')
        const x_cod_response = searchParams.get('x_cod_response')
        const x_description = searchParams.get('x_description')
        const x_transaction_id = searchParams.get('x_transaction_id')
        const x_approval_code = searchParams.get('x_approval_code')
        const x_signature = searchParams.get('x_signature')
        const x_currency_code = searchParams.get('x_currency_code')
        const x_test_request = searchParams.get('x_test_request')

        // También capturar parámetros alternativos por compatibilidad
        const ref_payco = x_ref_payco || searchParams.get('ref_payco')
        const estado_transaccion = x_response || searchParams.get('estado')
        const cod_respuesta = x_cod_response || searchParams.get('cod_respuesta')

        console.log('🔍 Parámetros de confirmación recibidos de ePayco:', {
          x_ref_payco,
          x_response,
          x_response_reason_text,
          x_amount,
          x_fecha_transaccion,
          x_bank_name,
          x_receipt,
          x_franchise,
          x_cod_response,
          x_description,
          x_transaction_id,
          x_approval_code,
          x_signature,
          x_currency_code,
          x_test_request
        })

        if (!ref_payco) {
          setEstado('error')
          setMensaje('Referencia de transacción no encontrada')
          return
        }

        // Paso 1: Recibir datos
        setPasoActual(0)
        setProgreso(25)
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Paso 2: Validar transacción
        setPasoActual(1)
        setEstado('validando')
        setMensaje('Validando transacción con nuestros servidores...')
        setProgreso(50)
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Registrar la transacción en nuestra base de datos con TODOS los datos
        await servicioEpayco.registrarTransaccion({
          referenciaPago: ref_payco,
          estado: estado_transaccion,
          tipo: 'confirmation',
          respuestaCompleta: {
            x_ref_payco,
            x_transaction_id,
            x_cod_response,
            x_response_reason_text,
            x_amount,
            x_fecha_transaccion,
            x_bank_name,
            x_receipt,
            x_franchise,
            x_description,
            x_approval_code,
            x_signature,
            x_currency_code,
            x_test_request,
            x_response,
            // Datos adicionales para compatibilidad
            ref_payco,
            estado_transaccion,
            cod_respuesta,
            timestamp: new Date().toISOString()
          }
        })

        // Paso 3: Confirmar pago
        setPasoActual(2)
        setMensaje('Confirmando estado del pago...')
        setProgreso(75)
        await new Promise(resolve => setTimeout(resolve, 1000))

        const datosValidacion = {
          ref_payco,
          x_ref_payco,
          estado: estado_transaccion,
          x_response,
          cod_respuesta,
          x_cod_response,
          valor: x_amount ? parseFloat(x_amount) : 0,
          x_amount,
          fecha: x_fecha_transaccion,
          banco: x_bank_name,
          recibo: x_receipt,
          franquicia: x_franchise,
          descripcion: x_description,
          transaction_id: x_transaction_id,
          approval_code: x_approval_code,
          signature: x_signature,
          currency_code: x_currency_code,
          test_request: x_test_request
        }

        setDatosTransaccion(datosValidacion)

        // Paso 4: Procesar pedido
        setPasoActual(3)
        setProgreso(100)

        // Determinar el estado final
        if (estado_transaccion === 'Aceptada' || cod_respuesta === '1') {
          setEstado('exitoso')
          setMensaje('¡Transacción validada exitosamente!')
          
          // Iniciar cuenta regresiva para redirección
          let tiempo = 5
          setTiempoRestante(tiempo)
          
          const intervalo = setInterval(() => {
            tiempo--
            setTiempoRestante(tiempo)
            
            if (tiempo <= 0) {
              clearInterval(intervalo)
              // Redirigir a la página de respuesta
              const urlRespuesta = new URL('/respuesta-epayco', window.location.origin)
              Object.entries(datosValidacion).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                  urlRespuesta.searchParams.set(key, value.toString())
                }
              })
              window.location.href = urlRespuesta.toString()
            }
          }, 1000)
          
        } else {
          setEstado('error')
          setMensaje('La transacción no pudo ser validada')
          
          // Redirigir a la página de respuesta con error después de 5 segundos
          let tiempo = 5
          setTiempoRestante(tiempo)
          
          const intervalo = setInterval(() => {
            tiempo--
            setTiempoRestante(tiempo)
            
            if (tiempo <= 0) {
              clearInterval(intervalo)
              const urlRespuesta = new URL('/respuesta-epayco', window.location.origin)
              Object.entries(datosValidacion).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                  urlRespuesta.searchParams.set(key, value.toString())
                }
              })
              window.location.href = urlRespuesta.toString()
            }
          }, 1000)
        }

      } catch (error) {
        console.error('Error validando transacción:', error)
        setEstado('error')
        setMensaje('Error al validar la transacción')
        setPasoActual(-1)
        
        // Redirigir al carrito después de 5 segundos en caso de error
        let tiempo = 5
        setTiempoRestante(tiempo)
        
        const intervalo = setInterval(() => {
          tiempo--
          setTiempoRestante(tiempo)
          
          if (tiempo <= 0) {
            clearInterval(intervalo)
            window.location.href = '/carrito'
          }
        }, 1000)
      }
    }

    validarTransaccion()
  }, [searchParams])

  const renderIconoEstado = () => {
    switch (estado) {
      case 'procesando':
      case 'validando':
        return <div className="spinner-confirmacion"></div>
      case 'exitoso':
        return <CheckCircle size={60} />
      case 'error':
        return <AlertCircle size={60} />
      default:
        return <Clock size={60} />
    }
  }

  const obtenerTituloEstado = () => {
    switch (estado) {
      case 'procesando':
        return 'Procesando Transacción'
      case 'validando':
        return 'Validando Pago'
      case 'exitoso':
        return '¡Pago Confirmado!'
      case 'error':
        return 'Error en la Validación'
      default:
        return 'Verificando...'
    }
  }

  return (
    <div className="pagina-confirmacion-epayco">
      <div className="contenedor-confirmacion">
        {/* Estado principal */}
        <div className={`estado-confirmacion ${estado}`}>
          <div className="icono-estado">
            {renderIconoEstado()}
          </div>
          <h1 className="titulo-confirmacion">{obtenerTituloEstado()}</h1>
          <p className="mensaje-confirmacion">
            {mensaje}
            {estado === 'procesando' && <span className="cargando-puntos"></span>}
          </p>
        </div>

        {/* Información de seguridad */}
        <div className="info-seguridad">
          <div className="icono-seguridad">
            <Shield size={24} />
          </div>
          <div className="texto-seguridad">
            <div className="titulo-seguridad">Transacción Segura</div>
            <div className="descripcion-seguridad">
              Tu pago está siendo procesado de forma segura a través de ePayco
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        {(estado === 'procesando' || estado === 'validando') && (
          <div className="barra-progreso">
            <h4>Progreso de Validación</h4>
            <div className="progreso-contenedor">
              <div 
                className={`progreso-barra ${estado}`}
                style={{ width: `${progreso}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Pasos de validación */}
        <div className="pasos-validacion">
          <h4>Proceso de Validación</h4>
          {pasos.map((paso, index) => (
            <div key={index} className="paso-item">
              <div className={`paso-numero ${
                index < pasoActual ? 'completado' : 
                index === pasoActual ? 'activo' : 'pendiente'
              }`}>
                {index < pasoActual ? '✓' : index + 1}
              </div>
              <div className={`paso-texto ${
                index < pasoActual ? 'completado' : 
                index === pasoActual ? 'activo' : 'pendiente'
              }`}>
                {paso}
              </div>
            </div>
          ))}
        </div>

        {/* Detalles de transacción (si están disponibles) */}
        {datosTransaccion && (
          <div className="detalles-transaccion">
            <h4>
              <CreditCard size={20} />
              Detalles de la Transacción
            </h4>
            <div className="detalle-item">
              <span className="detalle-etiqueta">
                <Hash size={16} /> Referencia
              </span>
              <span className="detalle-valor">{datosTransaccion.ref_payco}</span>
            </div>
            <div className="detalle-item">
              <span className="detalle-etiqueta">
                <DollarSign size={16} /> Valor
              </span>
              <span className="detalle-valor monto">
                {formatearPrecioCOP(datosTransaccion.valor)}
              </span>
            </div>
            {datosTransaccion.fecha && (
              <div className="detalle-item">
                <span className="detalle-etiqueta">
                  <Calendar size={16} /> Fecha
                </span>
                <span className="detalle-valor">{datosTransaccion.fecha}</span>
              </div>
            )}
            {datosTransaccion.banco && (
              <div className="detalle-item">
                <span className="detalle-etiqueta">
                  <Building size={16} /> Banco
                </span>
                <span className="detalle-valor">{datosTransaccion.banco}</span>
              </div>
            )}
          </div>
        )}

        {/* Mensaje de redirección */}
        {(estado === 'exitoso' || estado === 'error') && tiempoRestante !== null && (
          <div className="mensaje-redireccion">
            <Info className="icono-info" size={20} />
            <span>
              {estado === 'exitoso' 
                ? `Serás redirigido a los resultados en ${tiempoRestante} segundos...`
                : `Redirigiendo en ${tiempoRestante} segundos...`
              }
            </span>
          </div>
        )}

        {/* Botón de emergencia */}
        {estado === 'error' && (
          <Link to="/" className="boton-emergencia">
            <Home size={16} />
            Volver al Inicio
          </Link>
        )}

        {/* Información adicional según el estado */}
        {estado === 'exitoso' && (
          <div className="info-seguridad">
            <div className="icono-seguridad">
              <CheckCircle size={24} />
            </div>
            <div className="texto-seguridad">
              <div className="titulo-seguridad">Validación Exitosa</div>
              <div className="descripcion-seguridad">
                Tu pago ha sido confirmado y tu pedido está siendo procesado
              </div>
            </div>
          </div>
        )}

        {estado === 'error' && (
          <div className="info-seguridad">
            <div className="icono-seguridad">
              <AlertCircle size={24} />
            </div>
            <div className="texto-seguridad">
              <div className="titulo-seguridad">Error en la Validación</div>
              <div className="descripcion-seguridad">
                No pudimos validar tu transacción. Por favor, verifica los detalles
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaginaConfirmacionEpayco