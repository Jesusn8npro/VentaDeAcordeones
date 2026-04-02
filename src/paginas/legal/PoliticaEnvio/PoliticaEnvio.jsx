import React from 'react'
import { ArrowLeft, Truck, Clock, MapPin, Package, CreditCard, AlertCircle, CheckCircle } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

const PoliticaEnvio = () => {
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
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%);
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
          color: #7c3aed;
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
        .info-box {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          border: 1px solid #3b82f6;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1rem 0;
        }
        .info-box h4 {
          color: #1e40af;
          margin-bottom: 0.5rem;
        }
        .info-box p {
          margin: 0.25rem 0;
          color: #1e40af;
        }
        .tiempo-box {
          background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
          border: 1px solid #22c55e;
          border-radius: 12px;
          padding: 1.5rem;
          margin: 1rem 0;
        }
        .tiempo-box h4 {
          color: #15803d;
          margin-bottom: 1rem;
        }
        .tiempo-box ul {
          color: #15803d;
        }
        .ciudades-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin: 1rem 0;
        }
        .ciudad-item {
          background: linear-gradient(135deg, #fef7ff 0%, #f3e8ff 100%);
          border: 1px solid #a855f7;
          border-radius: 8px;
          padding: 1rem;
          text-align: center;
        }
        .ciudad-item h5 {
          color: #7c3aed;
          margin-bottom: 0.5rem;
        }
        .ciudad-item p {
          color: #7c3aed;
          margin: 0;
          font-size: 0.875rem;
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
          .ciudades-grid {
            grid-template-columns: 1fr;
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
          <Truck className="icono" />
          <h1>Política de Envío</h1>
        </div>
        
        <p className="subtitulo">
          Conoce nuestros tiempos de entrega, costos y condiciones de envío
        </p>
        
        <span className="fecha-actualizacion">
          Última actualización: {new Date().toLocaleDateString('es-CO')}
        </span>
      </div>

      <div className="politica-content">
        <div className="seccion">
          <div className="seccion-header">
            <Clock className="seccion-icono" />
            <h2 className="seccion-titulo">Tiempos de Envío</h2>
          </div>
          <div className="seccion-contenido">
            <div className="tiempo-box">
              <h4>⏱️ Tiempos de Entrega</h4>
              <ul>
                <li><strong>Ciudades principales:</strong> 48-72 horas hábiles</li>
                <li><strong>Ciudades intermedias:</strong> 3-5 días hábiles</li>
                <li><strong>Municipios:</strong> 5-8 días hábiles</li>
                <li><strong>Áreas rurales:</strong> 8-10 días hábiles</li>
              </ul>
            </div>

            <div className="destacado">
              <strong>📅 Días hábiles:</strong> Los días hábiles son de lunes a viernes, excluyendo 
              los festivos nacionales de Colombia. Los pedidos se procesan y envían únicamente en días hábiles.
            </div>

            <div className="info-box">
              <h4>⚙️ Procesamiento</h4>
              <p>• El tiempo de procesamiento es de 24 horas hábiles aproximadamente</p>
              <p>• Después del procesamiento recibirás tu guía para rastrear tu pedido</p>
              <p>• Recibirás notificación por email y WhatsApp con el número de guía</p>
            </div>

            <div className="importante">
              <strong>⚠️ Importante:</strong> Los periodos de entrega son indicativos y, por consiguiente, 
              no se consideran fechas exactas. Los tiempos pueden variar debido a condiciones climáticas, 
              días festivos, o situaciones logísticas imprevistas.
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <MapPin className="seccion-icono" />
            <h2 className="seccion-titulo">Cobertura de Envío</h2>
          </div>
          <div className="seccion-contenido">
            <p>
              Actualmente realizamos envíos a nivel nacional en Colombia. Nuestro servicio de envío 
              cubre la mayoría de ciudades y municipios del país.
            </p>

            <div className="ciudades-grid">
              <div className="ciudad-item">
                <h5>🏙️ Ciudades Principales</h5>
                <p>Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga</p>
              </div>
              <div className="ciudad-item">
                <h5>🏘️ Ciudades Intermedias</h5>
                <p>Pereira, Manizales, Armenia, Ibagué, Santa Marta, Valledupar</p>
              </div>
              <div className="ciudad-item">
                <h5>🏘️ Municipios</h5>
                <p>La mayoría de municipios con acceso terrestre</p>
              </div>
              <div className="ciudad-item">
                <h5>🌄 Áreas Rurales</h5>
                <p>Con restricciones y tiempos extendidos</p>
              </div>
            </div>

            <div className="importante">
              <strong>⚠️ Restricciones:</strong> Debido a dificultades logísticas a la hora de realizar 
              envíos a determinadas áreas remotas, nos reservamos el derecho a cancelar el pedido y/o a 
              aplicar términos y condiciones adicionales a dicho pedido (incluyendo, sin limitación, 
              la condición de que cada pedido alcance un importe mínimo).
            </div>

            <div className="destacado">
              <strong>🚫 No realizamos envíos a:</strong>
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
            <CreditCard className="seccion-icono" />
            <h2 className="seccion-titulo">Costos de Envío</h2>
          </div>
          <div className="seccion-contenido">
            <div className="info-box">
              <h4>🆓 Envío Gratis</h4>
              <p>• Disponible para compras superiores a $150.000 COP</p>
              <p>• Aplica solo en ciudades principales</p>
              <p>• Promoción por tiempo limitado</p>
              <p>• No acumulable con otras promociones</p>
            </div>

            <div className="tiempo-box">
              <h4>💰 Costos por Zona</h4>
              <ul>
                <li><strong>Ciudades principales:</strong> $8.000 - $15.000 COP</li>
                <li><strong>Ciudades intermedias:</strong> $15.000 - $25.000 COP</li>
                <li><strong>Municipios:</strong> $25.000 - $35.000 COP</li>
                <li><strong>Áreas rurales:</strong> $35.000 - $50.000 COP</li>
              </ul>
            </div>

            <p>
              El costo del envío será determinado en cada caso particular dependiendo del destino, 
              peso y volumen del paquete. Este valor se calculará en el proceso de la compra y te 
              será informado en el momento de la liquidación de la orden, antes de que realices el pago.
            </p>

            <div className="destacado">
              <strong>📦 Factores que afectan el costo:</strong>
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
            <Package className="seccion-icono" />
            <h2 className="seccion-titulo">Empaque y Entrega</h2>
          </div>
          <div className="seccion-contenido">
            <p>
              Todos nuestros productos son empacados cuidadosamente para garantizar que lleguen en 
              perfectas condiciones a su destino.
            </p>

            <div className="info-box">
              <h4>📦 Proceso de Empaque</h4>
              <p>• Utilizamos materiales de alta calidad para el empaque</p>
              <p>• Productos frágiles reciben protección adicional</p>
              <p>• Cada paquete incluye lista de contenido</p>
              <p>• Sellado de seguridad en todos los envíos</p>
            </div>

            <div className="destacado">
              <strong>📋 Información en el paquete:</strong>
              <ul>
                <li>Nombre del destinatario</li>
                <li>Dirección completa de entrega</li>
                <li>Número de teléfono de contacto</li>
                <li>Número de guía de seguimiento</li>
                <li>Instrucciones especiales si las hay</li>
              </ul>
            </div>

            <div className="tiempo-box">
              <h4>✅ Proceso de Entrega</h4>
              <ul>
                <li><strong>Verificación de identidad:</strong> Se solicita cédula al recibir</li>
                <li><strong>Inspección del paquete:</strong> Puedes verificar el estado antes de firmar</li>
                <li><strong>Acuse de recibo:</strong> Se firma digitalmente el recibido</li>
                <li><strong>Notificación:</strong> Recibes confirmación de entrega por email</li>
              </ul>
            </div>

            <div className="importante">
              <strong>⚠️ Importante:</strong> Si no estás presente al momento de la entrega, 
              el transportista dejará una notificación para reagendar la entrega. Tienes hasta 
              3 intentos de entrega antes de que el paquete regrese a nuestras instalaciones.
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <AlertCircle className="seccion-icono" />
            <h2 className="seccion-titulo">Políticas Especiales</h2>
          </div>
          <div className="seccion-contenido">
            <div className="importante">
              <strong>🚫 Productos con restricciones de envío:</strong>
              <ul>
                <li>Productos frágiles requieren manejo especial</li>
                <li>Electrodomésticos grandes pueden tener costos adicionales</li>
                <li>Productos peligrosos requieren documentación especial</li>
                <li>Vehículos tienen proceso de entrega diferente</li>
              </ul>
            </div>

            <div className="destacado">
              <strong>📱 Seguimiento en tiempo real:</strong>
              <ul>
                <li>Recibes notificaciones por WhatsApp</li>
                <li>Seguimiento online con número de guía</li>
                <li>Estimación de tiempo de llegada</li>
                <li>Notificación cuando el paquete está en camino</li>
              </ul>
            </div>

            <div className="info-box">
              <h4>🔄 Reagendamiento de Entrega</h4>
              <p>• Puedes reagendar la entrega hasta 2 veces</p>
              <p>• Contacta al transportista directamente</p>
              <p>• O comunícate con nosotros para asistencia</p>
              <p>• Después de 3 intentos, el paquete regresa a origen</p>
            </div>

            <div className="tiempo-box">
              <h4>📞 Soporte de Envío</h4>
              <ul>
                <li><strong>WhatsApp:</strong> +57 300 000 0000</li>
                <li><strong>Email:</strong> envios@mellevoesto.com</li>
                <li><strong>Horario:</strong> Lunes a Viernes 8:00 AM - 6:00 PM</li>
                <li><strong>Sábados:</strong> 8:00 AM - 12:00 PM</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <CheckCircle className="seccion-icono" />
            <h2 className="seccion-titulo">Garantías de Envío</h2>
          </div>
          <div className="seccion-contenido">
            <div className="destacado">
              <strong>🛡️ Nuestras garantías:</strong>
              <ul>
                <li>Productos llegan en perfecto estado</li>
                <li>Embalaje resistente y seguro</li>
                <li>Seguimiento completo del envío</li>
                <li>Soporte durante todo el proceso</li>
                <li>Compensación por daños en tránsito</li>
              </ul>
            </div>

            <div className="info-box">
              <h4>📋 En caso de problemas:</h4>
              <p>• Contacta inmediatamente nuestro servicio al cliente</p>
              <p>• Documenta el estado del paquete con fotos</p>
              <p>• Conserva el empaque original</p>
              <p>• Te ayudamos a resolver cualquier inconveniente</p>
            </div>

            <p>
              ME LLEVO ESTO se compromete a entregar tus productos de manera segura y oportuna. 
              Si tienes alguna consulta sobre tu envío, no dudes en contactarnos.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PoliticaEnvio

