'use client'

const TESTIMONIOS = [
  {
    destacado: true,
    estrellas: 5,
    texto: 'Pedí un Rey Vallenato personalizado para el cumpleaños de mi papá. Le grabaron su nombre y un escudo del Cesar. El sonido es de otra dimensión. La atención, impecable de principio a fin.',
    nombre: 'Camilo Restrepo',
    lugar: 'Medellín, COL',
    iniciales: 'CR',
  },
  {
    estrellas: 5,
    texto: 'Compré desde Miami y llegó en menos de dos semanas, perfectamente empacado y afinado. El acordeón suena exactamente como en el video. Volveré a comprar.',
    nombre: 'Yulissa Mendoza',
    lugar: 'Miami, USA',
    iniciales: 'YM',
  },
  {
    estrellas: 5,
    texto: 'Son los únicos que entienden de verdad un acordeón vallenato. Me ayudaron a elegir, ajustaron afinación a mi voz y me regalaron una correa de cuero. Cinco estrellas no alcanzan.',
    nombre: 'Luis Eduardo Mejía',
    lugar: 'Valledupar, COL',
    iniciales: 'LM',
  },
]

export default function TestimoniosClientes() {
  return (
    <div className="testimonials-wrap">
      <section className="section">
        <div className="section-head">
          <div className="left reveal">
            <div className="eyebrow">— Clientes</div>
            <h2 className="display section-title">
              La Palabra <em className="italic">de quien ya</em><br />
              <span className="accent">lo tiene en sus manos</span>
            </h2>
          </div>
          <p className="section-sub reveal" data-delay="1">
            4.9 / 5 · más de 1.200 reseñas verificadas en Google, Facebook y Mercado Libre.
          </p>
        </div>
        <div className="tst-grid">
          {TESTIMONIOS.map((t, i) => (
            <div
              key={i}
              className={`tst${t.destacado ? ' featured' : ''} reveal`}
              data-delay={i}
            >
              <div className="quote">&ldquo;</div>
              <div className="stars">{'★'.repeat(t.estrellas)}</div>
              <p className="text">{t.texto}</p>
              <div className="tst-person">
                <div className="tst-avatar">
                  <span>{t.iniciales}</span>
                </div>
                <div>
                  <div className="tst-name">{t.nombre}</div>
                  <div className="tst-loc">{t.lugar}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
