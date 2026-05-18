import React from 'react'
import { useNavigate } from '@/compat/router'
import './SeccionBeneficios.css'

const BENEFICIOS = [
  {
    icono: '🪗',
    titulo: 'Especialistas en Acordeones',
    descripcion: 'Más de 10 años vendiendo y personalizando acordeones en Colombia. Conocemos cada marca, modelo y tonalidad.',
  },
  {
    icono: '🚚',
    titulo: 'Envíos a Toda Colombia',
    descripcion: 'Despachamos con SERVIENTREGA a cualquier ciudad. Tracking en tiempo real para que sigas tu pedido.',
  },
  {
    icono: '✨',
    titulo: 'Personalización Completa',
    descripcion: 'Elige colores, fuelles, parrillas y accesorios. Diseñamos el acordeón de tus sueños — paga solo el 30% de anticipo.',
    cta: 'Personalizar',
    enlace: '/tienda/categoria/acordeones-personalizados',
  },
  {
    icono: '🛡️',
    titulo: 'Garantía Real',
    descripcion: '6 meses de garantía en acordeones nuevos. Respaldamos cada instrumento que vendemos con soporte post-venta.',
  },
  {
    icono: '💬',
    titulo: 'Asesoría Gratis por WhatsApp',
    descripcion: '¿No sabes cuál elegir? Escríbenos y te ayudamos a encontrar el acordeón ideal para tu estilo y presupuesto.',
    cta: 'Chatear',
    enlace: 'https://wa.me/573208492093',
    externo: true,
  },
  {
    icono: '🎓',
    titulo: 'Academia Online',
    descripcion: 'Aprende a tocar acordeón con nuestros cursos y recursos educativos. Para principiantes y músicos avanzados.',
  },
]

function SeccionBeneficios() {
  const navigate = useNavigate()

  return (
    <section className="sb-seccion">
      <div className="sb-contenedor">
        <div className="sb-encabezado">
          <h2 className="sb-titulo">¿Por qué elegirnos?</h2>
          <p className="sb-subtitulo">Tu música, nuestros acordeones — La tienda de confianza en Colombia</p>
        </div>

        <div className="sb-grid">
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className="sb-card">
              <span className="sb-icono">{b.icono}</span>
              <div className="sb-texto">
                <h3 className="sb-card-titulo">{b.titulo}</h3>
                <p className="sb-card-desc">{b.descripcion}</p>
                {b.cta && (
                  b.externo
                    ? <a href={b.enlace} target="_blank" rel="noopener noreferrer" className="sb-cta">{b.cta} →</a>
                    : <button className="sb-cta" onClick={() => navigate(b.enlace!)}>{b.cta} →</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default React.memo(SeccionBeneficios)
