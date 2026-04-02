// Página de Preguntas Frecuentes — diseño minimalista (sidebar + contenido)
// Todo el contenido y textos en español, sin gradientes y con tipografía sobria.
import { useState } from 'react'
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  CreditCard,
  Truck,
  RotateCcw,
  Shield,
  MessageSquare,
  User,
  Trash2,
  Heart,
  Phone,
  Mail,
  Search
} from 'lucide-react'
import { Link } from 'react-router-dom'
import './PreguntasFrecuentes.css'

export default function PreguntasFrecuentes() {
  // Estado para el acordeón y el buscador
  const [preguntaAbierta, setPreguntaAbierta] = useState(null)
  const [terminoBusqueda, setTerminoBusqueda] = useState('')

  // Utilidad para crear anclajes limpios
  const slugify = (texto) =>
    texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/-+/g, '-')
      .trim()

  // Categorías
  const categorias = [
    { icono: ShoppingCart, titulo: 'Compras' },
    { icono: CreditCard, titulo: 'Pagos' },
    { icono: Truck, titulo: 'Envíos' },
    { icono: RotateCcw, titulo: 'Devoluciones' },
    { icono: Shield, titulo: 'Seguridad' },
    { icono: User, titulo: 'Cuenta' }
  ]

  // Preguntas y respuestas (ejemplo local)
  const preguntas = [
    { categoria: 'Compras', pregunta: '¿Cómo comprar en ME LLEVO ESTO?', respuesta: 'Busca el producto, pulsa “Comprar ahora”, completa tus datos y elige tu método de pago. Te confirmamos por WhatsApp y correo.', icono: ShoppingCart },
    { categoria: 'Compras', pregunta: '¿Qué productos venden?', respuesta: 'Electrónicos, moda, hogar, repuestos, deportes, belleza y más. Si no lo ves, lo conseguimos.', icono: ShoppingCart },
    { categoria: 'Compras', pregunta: '¿Los precios incluyen impuestos?', respuesta: 'Sí. Los precios incluyen IVA y costos aplicables. Sin sorpresas al pagar.', icono: ShoppingCart },
    { categoria: 'Pagos', pregunta: '¿Qué métodos de pago aceptan?', respuesta: 'Tarjetas (Visa, Mastercard, Amex), transferencias, PSE, PayPal y en Bogotá pago contra entrega. Todo seguro.', icono: CreditCard },
    { categoria: 'Pagos', pregunta: '¿Es seguro pagar con tarjeta?', respuesta: 'Usamos encriptación de nivel bancario y proveedores certificados. Nunca almacenamos datos sensibles.', icono: CreditCard },
    { categoria: 'Pagos', pregunta: '¿Puedo pagar contra entrega?', respuesta: 'Sí, disponible en Bogotá. Pagas cuando recibes y verificas tu pedido.', icono: CreditCard },
    { categoria: 'Envíos', pregunta: '¿Cuánto tarda el envío?', respuesta: 'Bogotá: 1–2 días hábiles. Otras ciudades: 2–5 días. Te enviamos guía para rastreo.', icono: Truck },
    { categoria: 'Envíos', pregunta: '¿Cuánto cuesta el envío?', respuesta: 'Gratis en compras superiores a $150.000. Bajo ese valor, de $8.000 a $15.000 según ciudad.', icono: Truck },
    { categoria: 'Envíos', pregunta: '¿Puedo cambiar la dirección de entrega?', respuesta: 'Sí, dentro de las 2 horas siguientes al pedido. Luego, contáctanos por WhatsApp para ayudarte.', icono: Truck },
    { categoria: 'Devoluciones', pregunta: '¿Cómo pedir una devolución?', respuesta: 'Escríbenos por WhatsApp, te damos autorización, coordinamos recogida y reembolsamos en 5–10 días hábiles.', icono: RotateCcw },
    { categoria: 'Devoluciones', pregunta: '¿Cuándo puedo devolver un producto?', respuesta: 'Defectuoso: hasta 30 días. Cambio de opinión: 7 días si está sin uso y con empaque.', icono: RotateCcw },
    { categoria: 'Devoluciones', pregunta: '¿Cuánto tarda el reembolso?', respuesta: 'Tras recibir el producto, procesamos en 5–10 días hábiles. En banco se refleja 1–2 días después.', icono: RotateCcw },
    { categoria: 'Seguridad', pregunta: '¿Es seguro comprar aquí?', respuesta: 'Sí. Empresa constituida, tecnología segura, cumplimiento de privacidad y miles de clientes satisfechos.', icono: Shield },
    { categoria: 'Seguridad', pregunta: '¿Qué garantía tienen los productos?', respuesta: 'Garantía de fabricante y garantía de satisfacción propia. Te ayudamos hasta resolverlo.', icono: Shield },
    { categoria: 'Cuenta', pregunta: '¿Cómo creo una cuenta?', respuesta: 'Pulsa “Registrarse”, completa nombre, correo y teléfono, crea contraseña segura. También puedes comprar como invitado.', icono: User },
    { categoria: 'Cuenta', pregunta: '¿Puedo cambiar mis datos?', respuesta: 'Sí, desde tu perfil o por WhatsApp. Mantenerlos actualizados mejora tu experiencia.', icono: User },
    { categoria: 'Cuenta', pregunta: '¿Cómo borro mi cuenta?', respuesta: 'Solicítalo por WhatsApp o correo. Eliminamos tus datos en máximo 30 días, según ley.', icono: Trash2 }
  ]

  // Filtrado por término de búsqueda
  const preguntasFiltradas = preguntas.filter(p =>
    p.pregunta.toLowerCase().includes(terminoBusqueda.toLowerCase()) ||
    p.respuesta.toLowerCase().includes(terminoBusqueda.toLowerCase())
  )

  const togglePregunta = (index) => {
    setPreguntaAbierta(preguntaAbierta === index ? null : index)
  }

  const preguntasPorCategoria = categorias.map(cat => ({
    ...cat,
    preguntas: preguntasFiltradas.filter(p => p.categoria === cat.titulo)
  }))

  return (
    <main className="faq">
      {/* Encabezado sobrio */}
      <section className="faq__encabezado">
        <div className="contenedor">
          <div className="faq__hero-linea">
            <HelpCircle className="faq__hero-icono" />
            <span>Centro de ayuda</span>
          </div>
          <h1 className="faq__titulo">Preguntas Frecuentes</h1>
          <p className="faq__subtitulo">Usa el buscador o navega por categorías. Todo claro y directo.</p>
        </div>
      </section>

      {/* Contenido principal: Sidebar + Acordeón */}
      <section className="faq__contenido">
        <div className="contenedor">
          <div className="faq__grid">
            {/* Sidebar: buscador + índice */}
            <aside className="faq__sidebar">
              <div className="faq__buscador">
                <Search className="faq__buscador-icono" />
                <input
                  type="text"
                  className="faq__buscador-input"
                  placeholder="Busca una pregunta..."
                  value={terminoBusqueda}
                  onChange={(e) => setTerminoBusqueda(e.target.value)}
                  aria-label="Buscar preguntas frecuentes"
                />
              </div>

              <nav className="faq__indice-vertical">
                <h3 className="faq__indice-titulo">Categorías</h3>
                <ul>
                  {categorias.map((cat, i) => (
                    <li key={i}>
                      <a href={`#cat-${slugify(cat.titulo)}`} className="faq__indice-link">
                        <cat.icono className="faq__indice-icono" />
                        <span>{cat.titulo}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Main: acordeón por categoría */}
            <div className="faq__main">
              <h2 className="faq__seccion-titulo">
                {terminoBusqueda ? `Resultados para "${terminoBusqueda}"` : 'Todas las preguntas'}
              </h2>

              {preguntasPorCategoria.map((cat, cIdx) => {
                if (cat.preguntas.length === 0) return null
                return (
                  <article key={cIdx} className="faq__categoria" id={`cat-${slugify(cat.titulo)}`}>
                    <header className="faq__categoria-header">
                      <cat.icono className="faq__categoria-icono" />
                      <h3 className="faq__categoria-titulo">{cat.titulo}</h3>
                      <span className="faq__categoria-conteo">{cat.preguntas.length} pregunta(s)</span>
                    </header>

                    <div className="faq__lista">
                      {cat.preguntas.map((p, pIdx) => {
                        const indexGlobal = preguntasFiltradas.indexOf(p)
                        const Icono = p.icono
                        const respuestaId = `respuesta-${cIdx}-${pIdx}`
                        return (
                          <div key={pIdx} className={`faq__item ${preguntaAbierta === indexGlobal ? 'abierta' : ''}`}>
                            <button
                              className="faq__item-encabezado"
                              onClick={() => togglePregunta(indexGlobal)}
                              aria-expanded={preguntaAbierta === indexGlobal}
                              aria-controls={respuestaId}
                            >
                              <div className="faq__item-contenido">
                                <Icono className="faq__item-icono" />
                                <span className="faq__item-texto">{p.pregunta}</span>
                              </div>
                              {preguntaAbierta === indexGlobal ? (
                                <ChevronUp className="faq__item-chevron" />
                              ) : (
                                <ChevronDown className="faq__item-chevron" />
                              )}
                            </button>

                            {preguntaAbierta === indexGlobal && (
                              <div className="faq__item-respuesta" id={respuestaId} role="region">
                                <p>{p.respuesta}</p>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </article>
                )
              })}

              {preguntasFiltradas.length === 0 && terminoBusqueda && (
                <div className="faq__sin-resultados">
                  <HelpCircle className="faq__sin-resultados-icono" />
                  <h3>No encontramos resultados</h3>
                  <p>Intenta con otras palabras o contáctanos directamente.</p>
                  <Link to="/contacto" className="faq__btn-accento">
                    <MessageSquare className="faq__btn-icono" />
                    Contactar soporte
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contacto directo */}
      <section className="faq__contacto">
        <div className="contenedor">
          <h2 className="faq__seccion-titulo">¿No encuentras tu respuesta?</h2>
          <p className="faq__seccion-subtitulo">Estamos listos para ayudarte al instante.</p>
          <div className="faq__contacto-grid">
            <a href="https://wa.me/573012345678" className="faq__contacto-card whatsapp">
              <MessageSquare className="faq__contacto-icono" />
              <h3>WhatsApp</h3>
              <p>Respuesta inmediata 24/7</p>
              <span className="faq__badge">Recomendado</span>
            </a>
            <a href="mailto:hola@mellevoesto.com" className="faq__contacto-card email">
              <Mail className="faq__contacto-icono" />
              <h3>Email</h3>
              <p>Respondemos en menos de 2 horas</p>
            </a>
            <a href="tel:+5712345678" className="faq__contacto-card telefono">
              <Phone className="faq__contacto-icono" />
              <h3>Teléfono</h3>
              <p>Lunes a Viernes 8AM – 6PM</p>
            </a>
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="faq__cta">
        <div className="contenedor">
          <h2 className="faq__cta-titulo">¿Listo para comprar con confianza?</h2>
          <p className="faq__cta-subtitulo">Todas tus dudas resueltas, ahora puedes comprar tranquilo.</p>
          <div className="faq__cta-botones">
            <Link to="/productos" className="faq__btn-primario">
              <Heart className="faq__btn-icono" />
              Explorar productos
            </Link>
            <Link to="/contacto" className="faq__btn-secundario">
              <MessageSquare className="faq__btn-icono" />
              Hacer pregunta
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}