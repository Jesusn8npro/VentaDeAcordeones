import React from 'react'
import { ArrowLeft, Truck, Clock, MapPin, Package, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'
import '../politica-layout.css'

const PoliticaEnvio = () => {
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
          <Truck className="icono" />
          <h1 style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)' }}>
            Política de Envío
          </h1>
        </div>
        <p className="subtitulo">Conoce nuestros tiempos de entrega, costos y condiciones de envío</p>
        <span className="fecha-actualizacion">
          Última actualización: {new Date().toLocaleDateString('es-CO')}
        </span>
      </div>

      <div className="politica-content">
        <div className="seccion">
          <div className="seccion-header">
            <Clock className="seccion-icono" style={{ color: '#7c3aed' }} />
            <h2 className="seccion-titulo">Tiempos de Envío</h2>
          </div>
          <div className="seccion-contenido">
            <div className="tiempo-box">
              <h4>Tiempos de Entrega</h4>
              <ul>
                <li><strong>Ciudades principales:</strong> 48-72 horas hábiles</li>
                <li><strong>Ciudades intermedias:</strong> 3-5 días hábiles</li>
                <li><strong>Municipios:</strong> 5-8 días hábiles</li>
                <li><strong>Áreas rurales:</strong> 8-10 días hábiles</li>
              </ul>
            </div>
            <div className="destacado">
              <strong>Días hábiles:</strong> Los días hábiles son de lunes a viernes, excluyendo los festivos nacionales de Colombia. Los pedidos se procesan y envían únicamente en días hábiles.
            </div>
            <div className="info-box">
              <h4>Procesamiento</h4>
              <p>• El tiempo de procesamiento es de 24 horas hábiles aproximadamente</p>
              <p>• Después del procesamiento recibirás tu guía para rastrear tu pedido</p>
              <p>• Recibirás notificación por email y WhatsApp con el número de guía</p>
            </div>
            <div className="importante">
              <strong>Importante:</strong> Los periodos de entrega son indicativos y, por consiguiente, no se consideran fechas exactas. Los tiempos pueden variar debido a condiciones climáticas, días festivos, o situaciones logísticas imprevistas.
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <MapPin className="seccion-icono" style={{ color: '#7c3aed' }} />
            <h2 className="seccion-titulo">Cobertura de Envío</h2>
          </div>
          <div className="seccion-contenido">
            <p>Actualmente realizamos envíos a nivel nacional en Colombia. Nuestro servicio de envío cubre la mayoría de ciudades y municipios del país.</p>
            <div className="ciudades-grid">
              <div className="ciudad-item">
                <h5>Ciudades Principales</h5>
                <p>Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga</p>
              </div>
              <div className="ciudad-item">
                <h5>Ciudades Intermedias</h5>
                <p>Pereira, Manizales, Armenia, Ibagué, Santa Marta, Valledupar</p>
              </div>
              <div className="ciudad-item">
                <h5>Municipios</h5>
                <p>La mayoría de municipios con acceso terrestre</p>
              </div>
              <div className="ciudad-item">
                <h5>Áreas Rurales</h5>
                <p>Con restricciones y tiempos extendidos</p>
              </div>
            </div>
            <div className="importante">
              <strong>Restricciones:</strong> Debido a dificultades logísticas a la hora de realizar envíos a determinadas áreas remotas, nos reservamos el derecho a cancelar el pedido y/o a aplicar términos y condiciones adicionales a dicho pedido.
            </div>
            <div className="destacado">
              <strong>No realizamos envíos a:</strong>
              <ul>
                <li>San Andrés y Providencia</li>
                <li>Algunas zonas de difícil acceso</li>
                <li>Direcciones con restricciones de seguridad</li>
                <li>Direcciones incompletas o incorrectas</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <CreditCard className="seccion-icono" style={{ color: '#7c3aed' }} />
            <h2 className="seccion-titulo">Costos de Envío</h2>
          </div>
          <div className="seccion-contenido">
            <div className="info-box">
              <h4>Envío Gratis</h4>
              <p>• Disponible para compras superiores a $150.000 COP</p>
              <p>• Aplica solo en ciudades principales</p>
              <p>• Promoción por tiempo limitado</p>
              <p>• No acumulable con otras promociones</p>
            </div>
            <div className="tiempo-box">
              <h4>Costos por Zona</h4>
              <ul>
                <li><strong>Ciudades principales:</strong> $8.000 - $15.000 COP</li>
                <li><strong>Ciudades intermedias:</strong> $15.000 - $25.000 COP</li>
                <li><strong>Municipios:</strong> $25.000 - $35.000 COP</li>
                <li><strong>Áreas rurales:</strong> $35.000 - $50.000 COP</li>
              </ul>
            </div>
            <p>El costo del envío será determinado en cada caso particular dependiendo del destino, peso y volumen del paquete.</p>
            <div className="destacado">
              <strong>Factores que afectan el costo:</strong>
              <ul>
                <li>Peso del paquete</li>
                <li>Volumen del paquete</li>
                <li>Distancia de envío</li>
                <li>Tipo de producto (frágil, peligroso, etc.)</li>
                <li>Seguro de envío (opcional)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <Package className="seccion-icono" style={{ color: '#7c3aed' }} />
            <h2 className="seccion-titulo">Empaque y Entrega</h2>
          </div>
          <div className="seccion-contenido">
            <p>Todos nuestros productos son empacados cuidadosamente para garantizar que lleguen en perfectas condiciones a su destino.</p>
            <div className="info-box">
              <h4>Proceso de Empaque</h4>
              <p>• Utilizamos materiales de alta calidad para el empaque</p>
              <p>• Productos frágiles reciben protección adicional</p>
              <p>• Cada paquete incluye lista de contenido</p>
              <p>• Sellado de seguridad en todos los envíos</p>
            </div>
            <div className="tiempo-box">
              <h4>Proceso de Entrega</h4>
              <ul>
                <li><strong>Verificación de identidad:</strong> Se solicita cédula al recibir</li>
                <li><strong>Inspección del paquete:</strong> Puedes verificar el estado antes de firmar</li>
                <li><strong>Acuse de recibo:</strong> Se firma digitalmente el recibido</li>
                <li><strong>Notificación:</strong> Recibes confirmación de entrega por email</li>
              </ul>
            </div>
            <div className="importante">
              <strong>Importante:</strong> Si no estás presente al momento de la entrega, el transportista dejará una notificación para reagendar la entrega. Tienes hasta 3 intentos de entrega antes de que el paquete regrese a nuestras instalaciones.
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <AlertCircle className="seccion-icono" style={{ color: '#7c3aed' }} />
            <h2 className="seccion-titulo">Políticas Especiales</h2>
          </div>
          <div className="seccion-contenido">
            <div className="info-box">
              <h4>Reagendamiento de Entrega</h4>
              <p>• Puedes reagendar la entrega hasta 2 veces</p>
              <p>• Contacta al transportista directamente</p>
              <p>• O comunícate con nosotros para asistencia</p>
              <p>• Después de 3 intentos, el paquete regresa a origen</p>
            </div>
            <div className="tiempo-box">
              <h4>Soporte de Envío</h4>
              <ul>
                <li><strong>WhatsApp:</strong> +57 320 849 2093</li>
                <li><strong>Email:</strong> acordeon91@gmail.com</li>
                <li><strong>Horario:</strong> Lunes a Viernes 8:00 AM - 6:00 PM</li>
                <li><strong>Sábados:</strong> 8:00 AM - 12:00 PM</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <CheckCircle className="seccion-icono" style={{ color: '#7c3aed' }} />
            <h2 className="seccion-titulo">Garantías de Envío</h2>
          </div>
          <div className="seccion-contenido">
            <div className="destacado">
              <strong>Nuestras garantías:</strong>
              <ul>
                <li>Productos llegan en perfecto estado</li>
                <li>Embalaje resistente y seguro</li>
                <li>Seguimiento completo del envío</li>
                <li>Soporte durante todo el proceso</li>
                <li>Compensación por daños en tránsito</li>
              </ul>
            </div>
            <div className="info-box">
              <h4>En caso de problemas:</h4>
              <p>• Contacta inmediatamente nuestro servicio al cliente</p>
              <p>• Documenta el estado del paquete con fotos</p>
              <p>• Conserva el empaque original</p>
              <p>• Te ayudamos a resolver cualquier inconveniente</p>
            </div>
            <p>VentaDeAcordeones.com se compromete a entregar tus productos de manera segura y oportuna. Si tienes alguna consulta sobre tu envío, no dudes en contactarnos.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PoliticaEnvio
