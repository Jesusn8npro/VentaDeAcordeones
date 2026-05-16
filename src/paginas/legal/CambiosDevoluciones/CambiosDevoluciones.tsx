import React from 'react'
import { ArrowLeft, RefreshCw, CreditCard, AlertCircle, Mail } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import '../politica-layout.css'

const CambiosDevoluciones = () => {
  return (
    <div className="politica-container">
      <div className="politica-header">
        <div className="header-navegacion">
          <RouterLink to="/" className="boton-volver">
            <ArrowLeft className="icono" />
            Volver al Inicio
          </RouterLink>
        </div>
        <div className="titulo-principal">
          <RefreshCw className="icono" />
          <h1 style={{ background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)' }}>
            Política de Cambios y Devoluciones
          </h1>
        </div>
        <p className="subtitulo">Conoce nuestros términos para cambios, devoluciones y derecho de retracto</p>
        <span className="fecha-actualizacion">
          Última actualización: {new Date().toLocaleDateString('es-CO')}
        </span>
      </div>

      <div className="politica-content">
        <div className="seccion">
          <div className="seccion-header">
            <RefreshCw className="seccion-icono" style={{ color: '#dc2626' }} />
            <h2 className="seccion-titulo">Políticas de Cambio</h2>
          </div>
          <div className="seccion-contenido">
            <p>
              Si deseas hacer el cambio de alguno de los productos que adquiriste a través de nuestra
              tienda virtual <strong>VentaDeAcordeones.com</strong>, puedes hacerlo de la siguiente manera:
            </p>
            <div className="destacado">
              <strong>Tiempo límite:</strong> En un plazo de cinco (5) días calendario desde la fecha de recepción del paquete puedes solicitar el cambio.
            </div>
            <p>Para solicitar un cambio, debes escribir al correo <strong>acordeon91@gmail.com</strong> o por WhatsApp al número <strong>+57 320 849 2093</strong> especificando la siguiente información:</p>
            <div className="formato-solicitud">
              <h4>Información Requerida para el Cambio:</h4>
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
            <p>Te contestaremos indicando el procedimiento correspondiente y si la solicitud es autorizada de acuerdo a las políticas, términos y condiciones de VentaDeAcordeones.com.</p>
            <div className="importante">
              <strong>Condiciones importantes:</strong>
              <ul>
                <li>Los costos de transporte y los demás que conlleve el cambio serán cubiertos por el cliente</li>
                <li>El producto que vas a cambiar no debe estar usado, modificado o alterado de su estado original</li>
                <li>Debe estar en buen estado, limpio y con sus etiquetas originales</li>
                <li>Los cambios pueden tardar hasta 10 días hábiles</li>
                <li>Solo puedes hacer cambio de producto 1 (una) vez</li>
              </ul>
            </div>
            <div className="horario-atencion">
              <strong>Horario de atención:</strong> De lunes a viernes de 8:00 a.m. a 12:30 p.m. y de 2:00 p.m. a 5:30 p.m.
            </div>
            <div className="importante">
              <strong>Productos sin cambio:</strong> Los productos en promoción o con descuento, de nuestra sección de OFERTAS no tienen cambio. Estos productos presentan alguna de las siguientes condiciones: remanufacturadas o discontinuadas, por lo tanto, la garantía legal no será exigible.
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <AlertCircle className="seccion-icono" style={{ color: '#dc2626' }} />
            <h2 className="seccion-titulo">Error en la Entrega de Producto</h2>
          </div>
          <div className="seccion-contenido">
            <p>Si el producto entregado no es el correcto, tendrás <strong>5 días calendario</strong> a partir del momento de la entrega para informar acerca del error y solicitar el cambio.</p>
            <p>Debes enviar un correo electrónico a <strong>acordeon91@gmail.com</strong>, de lunes a viernes de 8:00am a 12:30 pm y de 2:00pm a 5:30 pm.</p>
            <p>Recibido el correo se procederá al análisis del caso, se confirmará si fue o no un error de VentaDeAcordeones.com quien, de ser así, asumirá el valor de recogida del producto y el envío del nuevo producto.</p>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <CreditCard className="seccion-icono" style={{ color: '#dc2626' }} />
            <h2 className="seccion-titulo">Derecho de Retracto</h2>
          </div>
          <div className="seccion-contenido">
            <p>De conformidad con el artículo 47 de la ley 1480 de 2011, el cliente tendrá derecho a retractarse de su compra dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la fecha de entrega de su pedido.</p>
            <p>En el evento en que se haga uso de la facultad de retracto, se resolverá el contrato y se deberá reintegrar el dinero que el consumidor hubiese pagado.</p>
            <div className="importante">
              <strong>Excepciones al derecho de retracto:</strong>
              <ul>
                <li>Contratos de prestación de servicios cuya prestación haya comenzado con el acuerdo del consumidor</li>
                <li>Contratos de suministro de bienes confeccionados conforme a las especificaciones del consumidor o claramente personalizados</li>
                <li>Contratos de suministro de bienes que, por su naturaleza, no puedan ser devueltos o puedan deteriorarse o caducar con rapidez</li>
                <li>Contratos de adquisición de bienes perecederos o de uso personal</li>
              </ul>
            </div>
            <div className="destacado">
              <strong>Reembolso:</strong> VentaDeAcordeones.com devolverá al cliente la suma pagada en un plazo máximo de treinta (30) días calendario desde el momento en que ejerció el derecho.
            </div>
            <div className="formato-solicitud">
              <h4>Para ejercer el derecho de retracto:</h4>
              <ul>
                <li>Enviar correo electrónico a <strong>acordeon91@gmail.com</strong> con el asunto: "RETRACTO"</li>
                <li>Incluir los datos de compra y de contacto</li>
                <li>Hacer la solicitud formal de la devolución</li>
                <li>Dar fe de que el producto está en las mismas condiciones en las que fue recibido</li>
                <li>La solicitud debe ser presentada dentro los 5 primeros días hábiles</li>
              </ul>
            </div>
            <div className="importante">
              <strong>Condiciones para la devolución:</strong>
              <ul>
                <li>El producto debe estar nuevo, sin daños o deterioro</li>
                <li>Debe tener todas las etiquetas y empaques originales</li>
                <li>Los costos de transporte serán cubiertos por el cliente</li>
              </ul>
            </div>
            <p><strong>Métodos de reembolso:</strong></p>
            <ul>
              <li><strong>Tarjeta crédito:</strong> Se realizará el reembolso por medio de PayU solicitando la reversión del valor</li>
              <li><strong>Tarjeta débito, Baloto o Efecty:</strong> Se reembolsará por transferencia bancaria a la cuenta que nos informe</li>
            </ul>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <CreditCard className="seccion-icono" style={{ color: '#dc2626' }} />
            <h2 className="seccion-titulo">Reversión del Pago</h2>
          </div>
          <div className="seccion-contenido">
            <p>Si tu compra fue ejecutada mediante pagos como tarjeta de crédito, débito o cualquier otro medio de pago electrónico, y cumple con las causales estipuladas en el Art 51 de la Ley 1480 de 2011, podrás solicitar la reversión de pago dentro de los <strong>5 días hábiles</strong> siguientes a la fecha en que tuviste noticia de la operación fraudulenta o no solicitada.</p>
            <div className="destacado">
              <strong>Causales para reversión de pago:</strong>
              <ul>
                <li>Fraude en la transacción</li>
                <li>Operación no solicitada</li>
                <li>Cuando no te llega el producto</li>
                <li>Cuando el producto no cumpla con las características atribuidas</li>
                <li>Defectos en el producto adquirido</li>
              </ul>
            </div>
            <div className="formato-solicitud">
              <h4>Para ejercer tu derecho de reversión:</h4>
              <p>Envía un correo electrónico a <strong>acordeon91@gmail.com</strong> con: nombre completo, cédula y razón por la que se requiere la reversión del pago.</p>
            </div>
            <div className="importante">
              <strong>No aplica para:</strong> Efecty, Baloto, Pago referenciado en bancos, Pago contra entrega en efectivo, ni compras realizadas en el exterior.
            </div>
            <div className="importante">
              <strong>Advertencia:</strong> Los Usuarios que procedan a solicitar la Reversión de mala fe serán sancionados por la Superintendencia de Industria y Comercio hasta por cincuenta (50) SMMLV.
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <Mail className="seccion-icono" style={{ color: '#dc2626' }} />
            <h2 className="seccion-titulo">Información de Contacto</h2>
          </div>
          <div className="seccion-contenido">
            <div className="contacto-info">
              <h4>Contacto para Cambios y Devoluciones</h4>
              <p><strong>Email:</strong> acordeon91@gmail.com</p>
              <p><strong>WhatsApp:</strong> +57 320 849 2093</p>
              <p><strong>Dirección:</strong> Cali, Colombia</p>
              <p><strong>Horario:</strong> Lunes a Viernes 8:00 AM - 12:30 PM y 2:00 PM - 5:30 PM</p>
            </div>
            <p>Para cualquier consulta sobre cambios, devoluciones o ejercer tu derecho de retracto, no dudes en contactarnos.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CambiosDevoluciones
