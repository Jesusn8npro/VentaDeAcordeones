import React from 'react'
import './SeccionBeneficios.css'

const BENEFICIOS = [
  {
    icono: '🎵',
    titulo: 'Expertos en acordeones',
    descripcion: 'Llevamos más de 10 años en el mercado. Conocemos cada marca, modelo y estilo musical.',
  },
  {
    icono: '🚚',
    titulo: 'Envíos a toda Colombia',
    descripcion: 'Despachamos con SERVIENTREGA. Tracking en tiempo real para que sigas tu pedido.',
  },
  {
    icono: '🛡️',
    titulo: 'Garantía real',
    descripcion: '6 meses de garantía en acordeones nuevos. Respaldamos cada instrumento que vendemos.',
  },
  {
    icono: '💬',
    titulo: 'Asesoría gratis',
    descripcion: 'No sabes cuál elegir. Escríbenos por WhatsApp y te ayudamos a encontrar el acordeón ideal.',
  },
]

function SeccionBeneficios() {
  return (
    <section className="sb-seccion">
      <div className="sb-contenedor">
        <div className="sb-encabezado">
          <h2 className="sb-titulo">¿Por qué elegirnos?</h2>
          <p className="sb-subtitulo">Tu satisfacción es nuestra prioridad</p>
        </div>

        <div className="sb-grid">
          {BENEFICIOS.map((b) => (
            <div key={b.titulo} className="sb-card">
              <span className="sb-icono">{b.icono}</span>
              <div className="sb-texto">
                <h3 className="sb-card-titulo">{b.titulo}</h3>
                <p className="sb-card-desc">{b.descripcion}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default React.memo(SeccionBeneficios)
