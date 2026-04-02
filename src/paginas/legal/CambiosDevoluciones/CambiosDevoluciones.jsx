import React from 'react'
import { ArrowLeft, RefreshCw, Truck, CreditCard, AlertCircle, Clock, Mail, Phone } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

const CambiosDevoluciones = () => {
  return (
    <div className="politica-container">
      <style jsx>{`
        .politica-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .politica-header {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          margin-bottom: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .header-navegacion {
          margin-bottom: 1.5rem;
        }
        .boton-volver {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f1f5f9;
          color: #475569;
          text-decoration: none;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          transition: all 0.2s ease;
          font-weight: 500;
        }
        .boton-volver:hover {
          background: #e2e8f0;
          color: #334155;
          transform: translateX(-2px);
        }
        .titulo-principal {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .titulo-principal h1 {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 0;
        }
        .subtitulo {
          color: #64748b;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }
        .fecha-actualizacion {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          display: inline-block;
        }
        .politica-content {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(226, 232, 240, 0.8);
        }
        .seccion {
          margin-bottom: 2.5rem;
        }
        .seccion:last-child {
          margin-bottom: 0;
        }
        .seccion-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
          padding-bottom: 0.75rem;
          border-bottom: 2px solid #e2e8f0;
        }
        .seccion-icono {
          width: 24px;
          height: 24px;
          color: #dc2626;
        }
        .seccion-titulo {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }
        .seccion-contenido {
          color: #475569;
          line-height: 1.7;
          font-size: 1rem;
        }
        .seccion-contenido p {
          margin-bottom: 1rem;
        }
        .seccion-contenido ul {
          margin: 1rem 0;
          padding-left: 1.5rem;
        }
        .seccion-contenido li {
          margin-bottom: 0.5rem;
        }
        .destacado {
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border: 1px solid #f59e0b;
          border-radius: 12px;
          padding: 1rem;
          margin: 1rem 0;
        }
        .destacado strong {
          color: #92400e;
        }
        .importante {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          border: 1px solid #ef4444;
          border-radius: 12px;
          padding: 1rem;
          margin: 1rem 0;
        }
        .importante strong {
          color: #dc2626;
        }
        .contacto-info {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border: 1px solid #3b82f6;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1rem 0;
        }
        .contacto-info h4 {
          color: #1e40af;
          margin-bottom: 0.5rem;
        }
        .contacto-info p {
          margin: 0.25rem 0;
          color: #1e40af;
        }
        .formato-solicitud {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #22c55e;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1rem 0;
        }
        .formato-solicitud h4 {
          color: #15803d;
          margin-bottom: 1rem;
        }
        .formato-solicitud ul {
          color: #15803d;
        }
        .horario-atencion {
          background: linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%);
          border: 1px solid #a855f7;
          border-radius: 12px;
          padding: 1rem;
          margin: 1rem 0;
        }
        .horario-atencion strong {
          color: #7c3aed;
        }
        @media (max-width: 768px) {
          .politica-container {
            padding: 1rem;
          }
          .titulo-principal h1 {
            font-size: 2rem;
          }
          .politica-header,
          .politica-content {
            padding: 1.5rem;
          }
        }
      `}</style>

      <div className="politica-header">
        <div className="header-navegacion">
          <RouterLink to="/" className="boton-volver">
            <ArrowLeft className="icono" />
            Volver al Inicio
          </RouterLink>
        </div>
        
        <div className="titulo-principal">
          <RefreshCw className="icono" />
          <h1>Política de Cambios y Devoluciones</h1>
        </div>
        
        <p className="subtitulo">
          Conoce nuestros términos para cambios, devoluciones y derecho de retracto
        </p>
        
        <span className="fecha-actualizacion">
          Última actualización: {new Date().toLocaleDateString('es-CO')}
        </span>
      </div>

      <div className="politica-content">
        <div className="seccion">
          <div className="seccion-header">
            <RefreshCw className="seccion-icono" />
            <h2 className="seccion-titulo">Políticas de Cambio</h2>
          </div>
          <div className="seccion-contenido">
            <p>
              Si deseas hacer el cambio de alguno de los productos que adquiriste a través de nuestra 
              tienda virtual <strong>ME LLEVO ESTO</strong>, puedes hacerlo de la siguiente manera:
            </p>
            
            <div className="destacado">
              <strong>Tiempo límite:</strong> En un plazo de cinco (5) días calendario desde la fecha 
              de recepción del paquete puedes solicitar el cambio.
            </div>

            <p>Para solicitar un cambio, debes escribir al correo <strong>info@mellevoesto.com</strong> 
            o por WhatsApp al número <strong>+57 300 000 0000</strong> especificando la siguiente información:</p>

            <div className="formato-solicitud">
              <h4>📋 Información Requerida para el Cambio:</h4>
              <ul>
                <li><strong>Forma de cambio:</strong> Especificar el motivo</li>
                <li><strong>Nombre completo:</strong> Como aparece en la cédula</li>
                <li><strong>Cédula:</strong> Número de identificación</li>
                <li><strong>Número de pedido:</strong> Código de la compra</li>
                <li><strong>Fecha del pedido:</strong> Cuando realizaste la compra</li>
                <li><strong>Número de contacto:</strong> Teléfono para comunicarnos</li>
                <li><strong>Producto:</strong> Descripción del artículo a cambiar</li>
              </ul>
            </div>

            <p>
              Te contestaremos indicando el procedimiento correspondiente y si la solicitud es autorizada 
              de acuerdo a las políticas, términos y condiciones de ME LLEVO ESTO.
            </p>

            <div className="importante">
              <strong>⚠️ Condiciones importantes:</strong>
              <ul>
                <li>Los costos de transporte y los demás que conlleve el cambio serán cubiertos por el cliente</li>
                <li>El producto que vas a cambiar no debe estar usado, modificado o alterado de su estado original</li>
                <li>Debe estar en buen estado, limpio y con sus etiquetas originales</li>
                <li>Los cambios pueden tardar hasta 10 días hábiles</li>
                <li>Solo puedes hacer cambio de producto 1 (una) vez</li>
              </ul>
            </div>

            <div className="horario-atencion">
              <strong>🕒 Horario de atención:</strong> De lunes a viernes de 8:00 a.m. a 12:30 p.m. 
              y de 2:00 p.m. a 5:30 p.m.
            </div>

            <div className="importante">
              <strong>❌ Productos sin cambio:</strong> Los productos en promoción o con descuento, 
              de nuestra sección de OFERTAS no tienen cambio. Estos productos presentan alguna de las 
              siguientes condiciones: remanufacturadas o discontinuadas, por lo tanto, la garantía 
              legal no será exigible.
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <AlertCircle className="seccion-icono" />
            <h2 className="seccion-titulo">Error en la Entrega de Producto</h2>
          </div>
          <div className="seccion-contenido">
            <p>
              Si el producto entregado no es el correcto, tendrás <strong>5 días calendario</strong> 
              a partir del momento de la entrega para informar acerca del error y solicitar el cambio.
            </p>
            
            <p>
              Debes enviar un correo electrónico a <strong>info@mellevoesto.com</strong>, de lunes a 
              viernes de 8:00am a 12:30 pm y de 2:00pm a 5:30 pm.
            </p>

            <p>
              Recibido el correo se procederá al análisis del caso, se confirmará si fue o no un error 
              de ME LLEVO ESTO quien, de ser así, asumirá el valor de recogida del producto y el envío 
              del nuevo producto.
            </p>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <CreditCard className="seccion-icono" />
            <h2 className="seccion-titulo">Derecho de Retracto</h2>
          </div>
          <div className="seccion-contenido">
            <p>
              De conformidad con el artículo 47 de la ley 1480 de 2011, el cliente tendrá derecho a 
              retractarse de su compra dentro de los <strong>cinco (5) días hábiles</strong> siguientes 
              a la fecha de entrega de su pedido.
            </p>

            <p>
              En el evento en que se haga uso de la facultad de retracto, se resolverá el contrato y 
              se deberá reintegrar el dinero que el consumidor hubiese pagado. El consumidor deberá 
              devolver el producto al productor o proveedor por los mismos medios y en las mismas 
              condiciones en que lo recibió.
            </p>

            <div className="importante">
              <strong>⚠️ Excepciones al derecho de retracto:</strong>
              <ul>
                <li>Contratos de prestación de servicios cuya prestación haya comenzado con el acuerdo del consumidor</li>
                <li>Contratos de suministro de bienes o servicios cuyo precio esté sujeto a fluctuaciones de coeficientes del mercado financiero</li>
                <li>Contratos de suministro de bienes confeccionados conforme a las especificaciones del consumidor o claramente personalizados</li>
                <li>Contratos de suministro de bienes que, por su naturaleza, no puedan ser devueltos o puedan deteriorarse o caducar con rapidez</li>
                <li>Contratos de servicios de apuestas y loterías</li>
                <li>Contratos de adquisición de bienes perecederos</li>
                <li>Contratos de adquisición de bienes de uso personal</li>
              </ul>
            </div>

            <div className="destacado">
              <strong>💰 Reembolso:</strong> ME LLEVO ESTO devolverá al cliente la suma pagada en un 
              plazo máximo de treinta (30) días calendario desde el momento en que ejerció el derecho.
            </div>

            <div className="formato-solicitud">
              <h4>📋 Para ejercer el derecho de retracto:</h4>
              <ul>
                <li>Enviar correo electrónico a <strong>info@mellevoesto.com</strong> con el asunto: "RETRACTO"</li>
                <li>Incluir los datos de compra y de contacto</li>
                <li>Hacer la solicitud formal de la devolución</li>
                <li>Dar fe de que el producto está en las mismas condiciones en las que fue recibido</li>
                <li>La solicitud debe ser presentada por el titular de la compra dentro los 5 primeros días hábiles</li>
                <li>El cliente debe devolver inmediatamente el producto en las mismas condiciones que lo recibió</li>
              </ul>
            </div>

            <div className="importante">
              <strong>⚠️ Condiciones para la devolución:</strong>
              <ul>
                <li>El producto debe estar nuevo, sin daños o deterioro</li>
                <li>Debe tener todas las etiquetas y empaques originales</li>
                <li>Si el producto no se encuentra empacado en su empaque original, no se generará la recepción</li>
                <li>Los costos de transporte serán cubiertos por el cliente</li>
              </ul>
            </div>

            <p>
              <strong>Métodos de reembolso:</strong>
            </p>
            <ul>
              <li><strong>Tarjeta crédito:</strong> Se realizará el reembolso por medio de PayU solicitando la reversión del valor</li>
              <li><strong>Tarjeta débito, Baloto o Efecty:</strong> Se reembolsará por transferencia bancaria a la cuenta que nos informe</li>
            </ul>

            <div className="importante">
              <strong>❌ No aplica para:</strong> Artículos vendidos en el exterior.
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <CreditCard className="seccion-icono" />
            <h2 className="seccion-titulo">Reversión del Pago</h2>
          </div>
          <div className="seccion-contenido">
            <p>
              Si tu compra realizada en ME LLEVO ESTO fue ejecutada mediante pagos como tarjeta de 
              crédito, débito o cualquier otro medio de pago electrónico, y cumple con las causales 
              estipuladas en el Art 51 de la Ley 1480 de 2011, podrás solicitar la reversión de pago 
              dentro de los <strong>5 días hábiles</strong> siguientes a la fecha en que tuviste noticia 
              de la operación fraudulenta o no solicitada.
            </p>

            <div className="destacado">
              <strong>📋 Causales para reversión de pago:</strong>
              <ul>
                <li>Fraude en la transacción</li>
                <li>Operación no solicitada</li>
                <li>Cuando no te llega el producto</li>
                <li>Cuando el Producto no cumpla con las características inherentes o las atribuidas por la información que se suministre sobre él</li>
                <li>Defectos en el producto adquirido</li>
              </ul>
            </div>

            <div className="formato-solicitud">
              <h4>📋 Para ejercer tu derecho de reversión:</h4>
              <p>Envía un correo electrónico a <strong>info@mellevoesto.com</strong> con:</p>
              <ul>
                <li>Nombre completo</li>
                <li>Cédula</li>
                <li>Razón por que se requiere la reversión del pago</li>
              </ul>
            </div>

            <div className="importante">
              <strong>⚠️ Condiciones importantes:</strong>
              <ul>
                <li>El producto debe estar en buen estado y limpio</li>
                <li>La reversión de pago solo aplica para mecanismos de comercio electrónico (internet, PSE, Call Center)</li>
                <li>Debe haberse utilizado tarjeta de crédito, débito o instrumento de pago electrónico</li>
                <li>No aplica para: Efecty, Baloto, Pago referenciado (en bancos) y Pago contra entrega en efectivo</li>
                <li>Para medios de pago electrónicos, el responsable de devolver el dinero corre por cuenta de tu entidad bancaria</li>
                <li>La queja debe ser presentada por el titular del producto financiero</li>
                <li>En caso de devolución, el proveedor recogerá el producto en las mismas condiciones y lugar donde se recibió</li>
              </ul>
            </div>

            <div className="importante">
              <strong>❌ No aplica para:</strong> Compras realizadas en el exterior.
            </div>

            <div className="destacado">
              <strong>📚 Información adicional:</strong> Para conocer más a fondo tu derecho y las 
              obligaciones que de él desprenden para ejercerlo, consulta el 
              <a href="http://www.sic.gov.co/sites/default/files/normatividad/Decreto_587_2016.pdf" 
                 target="_blank" rel="noopener noreferrer" 
                 style={{color: '#1e40af', textDecoration: 'underline'}}> Decreto 587 de 2016</a>
            </div>

            <div className="importante">
              <strong>⚠️ Advertencia:</strong> Los Usuarios que procedan a solicitar la Reversión de 
              mala fe serán sancionados por la Superintendencia de Industria y Comercio hasta por 
              cincuenta (50) SMMLV.
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <Mail className="seccion-icono" />
            <h2 className="seccion-titulo">Información de Contacto</h2>
          </div>
          <div className="seccion-contenido">
            <div className="contacto-info">
              <h4>📞 Contacto para Cambios y Devoluciones</h4>
              <p><strong>📧 Email:</strong> info@mellevoesto.com</p>
              <p><strong>📱 WhatsApp:</strong> +57 300 000 0000</p>
              <p><strong>🏢 Dirección:</strong> Cali, Colombia</p>
              <p><strong>🕒 Horario:</strong> Lunes a Viernes 8:00 AM - 12:30 PM y 2:00 PM - 5:30 PM</p>
            </div>
            
            <p>
              Para cualquier consulta sobre cambios, devoluciones o ejercer tu derecho de retracto, 
              no dudes en contactarnos a través de los medios mencionados anteriormente.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CambiosDevoluciones

