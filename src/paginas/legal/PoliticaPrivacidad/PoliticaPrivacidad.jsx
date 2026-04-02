import React from 'react'
import { ArrowLeft, Shield } from 'lucide-react'
import { Link as RouterLink } from 'react-router-dom'

const PoliticaPrivacidad = () => {
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
          background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
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
          color: #3b82f6;
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
          <Shield className="icono" />
          <h1>Política de Privacidad</h1>
        </div>
        
        <p className="subtitulo">
          Protegemos tu información personal y respetamos tu privacidad
        </p>
        
        <span className="fecha-actualizacion">
          Última actualización: {new Date().toLocaleDateString('es-CO')}
        </span>
      </div>

      <div className="politica-content">
        <div className="seccion">
          <div className="seccion-header">
            <Shield className="seccion-icono" />
            <h2 className="seccion-titulo">Información General</h2>
            </div>
          <div className="seccion-contenido">
            <p>
              La presente Política de Privacidad establece los términos en que <strong>ME LLEVO ESTO</strong> 
              usa y protege la información que es proporcionada por sus usuarios al momento de utilizar 
              nuestro sitio web y servicios.
            </p>
            <p>
              Esta compañía está comprometida con la seguridad de los datos de sus usuarios. Cuando le 
              pedimos llenar los campos de información personal con la cual usted pueda ser identificado, 
              lo hacemos asegurando que solo se empleará de acuerdo con los términos de este documento.
            </p>
            <div className="destacado">
              <strong>Importante:</strong> Esta Política de Privacidad puede cambiar con el tiempo o ser 
              actualizada por lo que le recomendamos revisar continuamente esta página para asegurarse 
              que está de acuerdo con dichos cambios.
            </div>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <Shield className="seccion-icono" />
            <h2 className="seccion-titulo">Información que Recogemos</h2>
          </div>
          <div className="seccion-contenido">
            <p>Nuestro sitio web podrá recoger información personal como:</p>
            <ul>
              <li><strong>Datos personales:</strong> Nombre completo, cédula de ciudadanía, fecha de nacimiento</li>
              <li><strong>Información de contacto:</strong> Dirección de correo electrónico, número de celular, dirección física</li>
              <li><strong>Información demográfica:</strong> Ciudad, departamento, código postal</li>
              <li><strong>Información de compras:</strong> Historial de pedidos, productos adquiridos, métodos de pago</li>
              <li><strong>Información técnica:</strong> Dirección IP, tipo de navegador, páginas visitadas</li>
            </ul>
            <p>
              Así mismo cuando sea necesario podrá ser requerida información específica para procesar 
              algún pedido, realizar una entrega o facturación.
            </p>
          </div>
        </div>

        <div className="seccion">
                  <div className="seccion-header">
            <Shield className="seccion-icono" />
            <h2 className="seccion-titulo">Uso de la Información</h2>
                  </div>
                  <div className="seccion-contenido">
            <p>Nuestro sitio web emplea la información con el fin de:</p>
            <ul>
              <li>Proporcionar el mejor servicio posible</li>
              <li>Mantener un registro de usuarios y pedidos</li>
              <li>Mejorar nuestros productos y servicios</li>
              <li>Procesar transacciones y entregas</li>
              <li>Enviar comunicaciones importantes sobre su cuenta</li>
              <li>Personalizar su experiencia de compra</li>
                    </ul>
            <p>
              Es posible que sean enviados correos electrónicos periódicamente a través de nuestro sitio 
              con ofertas especiales, nuevos productos y otra información publicitaria que consideremos 
              relevante para usted. Estos correos electrónicos serán enviados a la dirección que usted 
              proporcione y podrán ser cancelados en cualquier momento.
            </p>
          </div>
        </div>

        <div className="seccion">
          <div className="seccion-header">
            <Shield className="seccion-icono" />
            <h2 className="seccion-titulo">Seguridad de la Información</h2>
          </div>
          <div className="seccion-contenido">
            <p>
              <strong>ME LLEVO ESTO</strong> está altamente comprometido para cumplir con el compromiso 
              de mantener su información segura. Usamos los sistemas más avanzados y los actualizamos 
              constantemente para asegurarnos que no exista ningún acceso no autorizado.
            </p>
            <p>
              Implementamos medidas de seguridad técnicas, administrativas y físicas para proteger su 
              información personal contra acceso no autorizado, alteración, divulgación o destrucción.
            </p>
                </div>
              </div>
              
        <div className="seccion">
          <div className="seccion-header">
            <Shield className="seccion-icono" />
            <h2 className="seccion-titulo">Control de su Información</h2>
          </div>
          <div className="seccion-contenido">
            <p>
              En cualquier momento usted puede restringir la recopilación o el uso de la información 
              personal que es proporcionada a nuestro sitio web. Cada vez que se le solicite rellenar 
              un formulario, como el de alta de usuario, puede marcar o desmarcar la opción de recibir 
              información por correo electrónico.
            </p>
            <p>
              Esta compañía no venderá, cederá ni distribuirá la información personal que es recopilada 
              sin su consentimiento, salvo que sea requerido por un juez con un orden judicial.
            </p>
            <div className="contacto-info">
              <h4>Contacto para Consultas sobre Privacidad</h4>
              <p><strong>Email:</strong> privacidad@mellevoesto.com</p>
              <p><strong>Teléfono:</strong> +57 300 000 0000</p>
              <p><strong>Dirección:</strong> Cali, Colombia</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PoliticaPrivacidad

