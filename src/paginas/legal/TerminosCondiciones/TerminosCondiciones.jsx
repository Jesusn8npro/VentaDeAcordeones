import React from 'react'
import { ArrowLeft, FileText, ShoppingCart, CreditCard, Truck, Package, Users, Shield } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import './TerminosCondiciones.css'

const TerminosCondiciones = () => {
  return (
    <div className="termsNeutral">
      {/* Header minimalista y sobrio */}
      <div className="terms-header">
        <div className="terms-nav">
          <RouterLink to="/" className="terms-back">
            <ArrowLeft className="terms-icon" />
            Volver al inicio
          </RouterLink>
        </div>

        <div className="terms-title-row">
          <FileText className="terms-icon" />
          <h1 className="terms-title">Términos y Condiciones</h1>
        </div>

        <p className="terms-subtitle">
          Marco de uso y operaciones de nuestra plataforma y servicios
        </p>

        <span className="terms-date">
          Última actualización: {new Date().toLocaleDateString('es-CO')}
        </span>
      </div>

      <div className="terms-content">
        <div className="terms-section">
          <div className="terms-section-header">
            <FileText className="terms-icon" />
            <h2 className="terms-section-title">Información General</h2>
          </div>
          <div className="terms-section-body">
            <p>
              Para todos los efectos transaccionales y legales, será el vendedor <strong>ME LLEVO ESTO</strong>, 
              sociedad distribuidora de artículos para el hogar y vehículos, sujeta a las leyes colombianas, 
              con existencia legal y domicilio principal en la ciudad de Cali, Colombia.
            </p>
            <p>
              Las transacciones que se efectúen a través del sitio ME LLEVO ESTO (el "Sitio") se sujetan 
              a los presentes términos y condiciones (los "Términos y Condiciones") y particularmente lo 
              previsto para las ventas a distancia por las disposiciones colombianas aplicables a la materia.
            </p>
            <div className="terms-note">
              <strong>Importante:</strong> Al realizar una transacción en el Sitio, se entiende el conocimiento 
              y aceptación de los Términos y Condiciones descritos a continuación. Igualmente, cualquier 
              usuario que visite el Sitio se entiende que conoce y acepta todas y cada una de las condiciones 
              de estos Términos y Condiciones.
            </div>
          </div>
        </div>

        <div className="terms-section">
          <div className="terms-section-header">
            <Users className="terms-icon" />
            <h2 className="terms-section-title">Registro de Cliente</h2>
          </div>
          <div className="terms-section-body">
            <p>
              ME LLEVO ESTO opera el Sitio, mediante el cual los clientes podrán comprar los productos que 
              se ofrecen a través del mismo, entre los cuales se encuentran a manera enunciativa: artículos 
              de hogar, cuidado personal, deporte, tecnología, mascotas y vehículos.
            </p>
            <div className="terms-alert">
              <strong>Requisito:</strong> El registro del cliente en este Sitio es indispensable para comprar productos.
            </div>

            <p>Para el registro, el Cliente debe proporcionar sus datos básicos incluyendo:</p>
            <ul>
              <li>Información personal como el número de cédula de ciudadanía</li>
              <li>Dirección completa</li>
              <li>Números de teléfono</li>
              <li>Dirección de correo electrónico</li>
            </ul>

            <div className="terms-note">
              <strong>Declaración del cliente:</strong> El Cliente al ingresar sus datos declara de buena 
              fe que los mismos corresponden a información veraz y vigente.
            </div>

            <p>
              Los datos de los clientes serán tratados de acuerdo con las políticas de tratamiento de la 
              información de ME LLEVO ESTO que se integran a los presentes términos y condiciones.
            </p>

            <div className="terms-alert">
              <strong>Restricción de edad:</strong> El registro y las compras en el sitio por su parte 
              como cliente, deberán ser realizados por personas capaces de conformidad con la ley colombiana 
              exclusivamente.
            </div>
            </div>
          </div>

        <div className="terms-section">
          <div className="terms-section-header">
            <ShoppingCart className="terms-icon" />
            <h2 className="terms-section-title">Productos y Precios</h2>
          </div>
          <div className="terms-section-body">
            <p>
              Las características esenciales de cada uno de los productos que se comercializan a través de 
              esta página son las exhibidas gráficamente para cada uno de ellos, anotando que en ocasiones, 
              el color o algunas otras características pueden variar.
            </p>

            <div className="terms-info">
              <h4>💰 Información de Precios</h4>
              <p>• Encontrará el precio de cada producto, incluyendo todos los impuestos y costos adicionales</p>
              <p>• El cliente declara entender y aceptar que el precio de los productos puede cambiar dependiendo el color o modelo que escoja</p>
              <p>• Los precios están expresados en pesos colombianos (COP)</p>
                  </div>

            <div className="terms-alert">
              <strong>Disponibilidad del producto:</strong> El cliente del portal web ME LLEVO ESTO 
              declara entender y aceptar que entre el momento en que realiza la selección del producto 
              y el momento en el que efectivamente se realiza la aceptación de la transacción por parte 
              de la respectiva entidad financiera, el producto seleccionado se puede agotar.
                </div>

            <p>
              En caso de agotamiento, ME LLEVO ESTO queda facultado para devolver la transacción y en 
              consecuencia devolver el dinero pagado por el producto agotado, informando dicha situación 
              al cliente dentro de los dos (2) días hábiles siguientes al momento en que se generó la 
              compra.
            </p>
          </div>
        </div>

        <div className="terms-section">
          <div className="terms-section-header">
            <Truck className="terms-icon" />
            <h2 className="terms-section-title">Entrega y Envío</h2>
          </div>
          <div className="terms-section-body">
            <p>
              ME LLEVO ESTO enviará el producto por medio de <strong>SERVIENTREGA</strong> y este llegará 
              a su destino en un tiempo máximo de ocho (8) días hábiles siguientes al momento en que se 
              generó y comprobó el pago de la compra según la ciudad de destino.
            </p>

            <div className="terms-info">
              <h4>📦 Información de Entrega</h4>
              <p>• El cliente recibirá una notificación con el número de guía una vez su pedido sea despachado</p>
              <p>• En la etapa inicial del proyecto solo se realizarán envíos nacionales</p>
              <p>• Los pedidos se envían solo en días hábiles (lunes a viernes, excluyendo festivos)</p>
              <p>• Todas las entregas irán acompañadas con un acuse de recibo</p>
              </div>
              
            <div className="terms-note">
              <strong>🚚 Costo de envío:</strong> Estamos ofreciendo como una modalidad el envío gratis 
              que será por tiempo limitado, sin embargo hay ciudades o municipios para las cuales no 
              aplica el flete gratis y deberán pagar el valor del envío.
              </div>

            <p>
              El costo del envío de estas ciudades será determinado en cada caso particular dependiendo 
              del destino, peso y volumen del paquete. Este valor se calculará en el proceso de la compra 
              y te será informado en el momento de la liquidación de la orden, antes de que realices el pago.
            </p>

            <div className="terms-alert">
              <strong>⚠️ Áreas remotas:</strong> Debido a dificultades logísticas a la hora de realizar 
              envíos a determinadas áreas remotas, nos reservamos el derecho a cancelar el pedido y/o a 
              aplicar términos y condiciones adicionales a dicho pedido.
            </div>
          </div>
        </div>

        <div className="terms-section">
          <div className="terms-section-header">
            <Package className="terms-icon" />
            <h2 className="terms-section-title">Política de Envío</h2>
          </div>
          <div className="terms-section-body">
            <div className="terms-info">
              <h4>📋 Términos de Envío</h4>
              <p><strong>⏱️ Tiempo de envío:</strong> 48/72 horas a ciudades principales</p>
              <p><strong>📅 Tiempo estimado:</strong> Esto puede variar dependiendo de los días hábiles</p>
              <p><strong>🆓 Envío gratis:</strong> El envío será gratis siempre y cuando se especifique en la oferta</p>
              <p><strong>⚙️ Procesamiento:</strong> El tiempo de procesamiento es de 24 hr hábiles aproximadamente</p>
              <p><strong>📱 Seguimiento:</strong> Después del procesamiento recibirás tu guía para rastrear tu pedido</p>
            </div>
                </div>
              </div>

        <div className="terms-section">
          <div className="terms-section-header">
            <Shield className="terms-icon" />
            <h2 className="terms-section-title">Políticas Especiales para Vehículos</h2>
          </div>
          <div className="terms-section-body">
            <div className="terms-vehiculos">
              <h4>🚗 Condiciones Especiales para Automóviles</h4>
              <p>
                Para la venta de vehículos, aplican términos y condiciones especiales debido a la 
                naturaleza de estos productos:
              </p>
              
              <ul>
                <li><strong>Inspección previa:</strong> Todos los vehículos están sujetos a inspección técnica antes de la entrega</li>
                <li><strong>Documentación:</strong> Se requiere documentación adicional para la transferencia de propiedad</li>
                <li><strong>Tiempo de entrega:</strong> Los vehículos pueden tener tiempos de entrega extendidos (hasta 15 días hábiles)</li>
                <li><strong>Garantía:</strong> Los vehículos cuentan con garantía específica según el modelo y año</li>
                <li><strong>Financiación:</strong> Disponemos de opciones de financiación para vehículos</li>
                <li><strong>Seguro:</strong> Recomendamos contratar seguro vehicular antes de la entrega</li>
                <li><strong>Matrícula:</strong> El proceso de matrícula puede tomar tiempo adicional</li>
              </ul>
            </div>

            <div className="terms-alert">
              <strong>⚠️ Restricciones para vehículos:</strong>
              <ul>
                <li>No aplica derecho de retracto para vehículos usados</li>
                <li>Los cambios están limitados a defectos de fábrica únicamente</li>
                <li>Se requiere inspección técnica obligatoria</li>
                <li>El comprador debe tener licencia de conducción vigente</li>
              </ul>
            </div>

            <div className="terms-note">
              <strong>📋 Documentos requeridos para vehículos:</strong>
              <ul>
                <li>Cédula de ciudadanía</li>
                <li>Licencia de conducción vigente</li>
                <li>Certificado de ingresos (si aplica financiación)</li>
                <li>Referencias comerciales</li>
              </ul>
            </div>
                </div>
              </div>
              
        <div className="terms-section">
          <div className="terms-section-header">
            <CreditCard className="terms-icon" />
            <h2 className="terms-section-title">Promociones y Cupones</h2>
          </div>
          <div className="terms-section-body">
            <p>
              Los Clientes autorizan expresamente a ME LLEVO ESTO para enviarles promociones al correo 
              electrónico registrado en el Sitio, conforme a las características de cada Cliente según 
              las compras y enlaces visitados.
            </p>

            <div className="terms-info">
              <h4>🎟️ Uso de Cupones</h4>
              <p>• El uso de los cupones de descuento no es acumulable con otras promociones o descuentos</p>
              <p>• Únicamente deberá ser usado una vez por cada cliente</p>
              <p>• Solo podrá ser usado por personas mayores de 18 años</p>
              <p>• Los cupones tienen fecha de vencimiento específica</p>
            </div>

            <div className="terms-note">
              <strong>📅 Vigencia de promociones:</strong> Las ofertas y/o promociones tendrán una vigencia 
              indicada y comunicada al usuario, de lo contrario se entenderá que la promoción se extiende 
              hasta agotar el inventario destinado para esta oferta.
            </div>

            <p>
              Las promociones no son acumulables con otras promociones o descuentos a menos que en el 
              sitio se especifique lo contrario.
            </p>

            <div className="terms-alert">
              <strong>⚠️ Cancelación de promociones:</strong> El Cliente podrá solicitar la suspensión 
              de toda comunicación promocional o publicitaria enviada a su correo electrónico, enviando 
              un correo en este sentido a info@mellevoesto.com
            </div>
                </div>
              </div>

        <div className="terms-section">
          <div className="terms-section-header">
            <Shield className="terms-icon" />
            <h2 className="terms-section-title">Seguridad y Protección</h2>
          </div>
          <div className="terms-section-body">
            <p>
              Por razones de seguridad en la transacción y proteger a sus clientes, ME LLEVO ESTO se 
              reserva el derecho de solicitar datos adicionales con el fin de corroborar datos personales 
              así como también no procesar temporal o definitivamente las compras realizadas por aquellos 
              clientes cuyos datos no hayan podido ser confirmados.
            </p>

            <div className="terms-alert">
              <strong>⚠️ Reserva de derechos:</strong> ME LLEVO ESTO se reserva el derecho de eliminar 
              cualquier registro previamente aceptado o rechazar una nueva solicitud, sin que esté 
              obligado a comunicar o exponer las razones de su decisión y sin que ello genere derecho 
              para el cliente a solicitar de su parte, el resarcimiento de perjuicios.
            </div>

            <div className="terms-note">
              <strong>🔒 Autorización de datos:</strong> Adicionalmente, autorizan los términos y condiciones 
              de PayU y su manejo de datos personales, los cuales están disponibles en www.payulatam.co, 
              ya que son ellos la plataforma de pagos contratada por ME LLEVO ESTO.
            </div>
          </div>
        </div>

        <div className="terms-section">
          <div className="terms-section-header">
            <FileText className="terms-icon" />
            <h2 className="terms-section-title">Modificaciones</h2>
          </div>
          <div className="terms-section-body">
            <p>
              ME LLEVO ESTO se reserva el derecho de modificar estos términos y condiciones en cualquier 
              momento. Los cambios serán notificados a través de nuestro sitio web y por correo electrónico 
              a los usuarios registrados.
            </p>
            
            <div className="terms-note">
              <strong>📝 Aceptación:</strong> El uso continuado del sitio después de cualquier modificación 
              constituye la aceptación de los nuevos términos y condiciones.
            </div>

            <div className="terms-info">
              <h4>📞 Contacto</h4>
              <p><strong>📧 Email:</strong> info@mellevoesto.com</p>
              <p><strong>📱 Teléfono:</strong> +57 300 000 0000</p>
              <p><strong>🏢 Dirección:</strong> Cali, Colombia</p>
              <p><strong>🕒 Horario:</strong> Lunes a Viernes 8:00 AM - 12:30 PM y 2:00 PM - 5:30 PM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TerminosCondiciones