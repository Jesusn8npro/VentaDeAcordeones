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
import { Link } from '@/compat/router'
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
    { categoria: 'Compras', pregunta: '¿Cómo comprar en VentaDeAcordeones.com?', respuesta: 'Busca el instrumento, pulsa “Comprar ahora”, completa tus datos y elige tu método de pago. Te confirmamos por WhatsApp y correo con todos los detalles del pedido.', icono: ShoppingCart },
    { categoria: 'Compras', pregunta: '¿Qué productos venden?', respuesta: 'Acordeones diatónicos y cromáticos (Hohner, Rey Vallenato, Bravo, Corona), armónicas, guitarras, bajos, pianos, amplificadores, micrófonos y accesorios para músicos colombianos.', icono: ShoppingCart },
    { categoria: 'Compras', pregunta: '¿Los precios incluyen impuestos?', respuesta: 'Sí. Todos los precios incluyen IVA. Sin costos ocultos al pagar.', icono: ShoppingCart },
    { categoria: 'Compras', pregunta: '¿Puedo personalizar un acordeón?', respuesta: 'Sí. Diseñamos acordeones a tu gusto: elige colores de tapas, fuelles y parrillas. Paga solo el 30% de anticipo y el resto al recibir. Escríbenos por WhatsApp para más detalles.', icono: ShoppingCart },
    { categoria: 'Pagos', pregunta: '¿Qué métodos de pago aceptan?', respuesta: 'Tarjetas débito/crédito (Visa, Mastercard), transferencias bancarias, PSE y consignaciones. Procesamos los pagos de forma segura con ePayco.', icono: CreditCard },
    { categoria: 'Pagos', pregunta: '¿Es seguro pagar con tarjeta?', respuesta: 'Sí. Usamos ePayco con encriptación de nivel bancario. Nunca almacenamos datos de tarjetas en nuestros servidores.', icono: CreditCard },
    { categoria: 'Pagos', pregunta: '¿Puedo pagar en cuotas?', respuesta: 'Sí, con tarjetas de crédito puedes diferir el pago según las opciones de tu banco. Consúltanos también por convenios de financiación.', icono: CreditCard },
    { categoria: 'Envíos', pregunta: '¿Cuánto tarda el envío?', respuesta: 'Despachamos con SERVIENTREGA. Bogotá y ciudades principales: 1–2 días hábiles. Otras ciudades y municipios: 2–5 días hábiles. Recibes número de guía para rastrear.', icono: Truck },
    { categoria: 'Envíos', pregunta: '¿Cuánto cuesta el envío?', respuesta: 'El costo depende del destino y el peso del instrumento. Los acordeones tienen empaque especial reforzado. Consúltanos por WhatsApp para cotizar tu envío específico.', icono: Truck },
    { categoria: 'Envíos', pregunta: '¿Cómo empacan los acordeones?', respuesta: 'Con protección especial: espuma de alta densidad, plástico burbuja y caja reforzada. Garantizamos que tu instrumento llegue en perfectas condiciones.', icono: Truck },
    { categoria: 'Devoluciones', pregunta: '¿Cómo pedir una devolución?', respuesta: 'Escríbenos por WhatsApp al +57 320 849 2093 dentro de los 15 días de recibido. Verificamos el estado, coordinamos la devolución y procesamos el reembolso en 5–10 días hábiles.', icono: RotateCcw },
    { categoria: 'Devoluciones', pregunta: '¿Qué garantía tienen los acordeones?', respuesta: '6 meses de garantía en acordeones nuevos contra defectos de fábrica. No aplica para daños por mal uso, caídas o humedad. Respaldamos cada instrumento que vendemos.', icono: RotateCcw },
    { categoria: 'Devoluciones', pregunta: '¿Cuánto tarda el reembolso?', respuesta: 'Tras recibir y verificar el producto, procesamos en 5–10 días hábiles. El abono en tu cuenta puede tomar 1–2 días adicionales del banco.', icono: RotateCcw },
    { categoria: 'Seguridad', pregunta: '¿Es seguro comprar aquí?', respuesta: 'Sí. Llevamos más de 10 años vendiendo acordeones en Colombia. Cientos de clientes satisfechos, pagos seguros con ePayco y respaldo post-venta real por WhatsApp.', icono: Shield },
    { categoria: 'Seguridad', pregunta: '¿Los instrumentos son originales?', respuesta: 'Sí. Todos nuestros acordeones Hohner son originales con número de serie verificable. Trabajamos directamente con distribuidores autorizados.', icono: Shield },
    { categoria: 'Cuenta', pregunta: '¿Cómo creo una cuenta?', respuesta: 'Pulsa “Registrarse”, completa tu nombre, correo y contraseña. También puedes comprar sin cuenta como invitado.', icono: User },
    { categoria: 'Cuenta', pregunta: '¿Puedo ver el historial de mis pedidos?', respuesta: 'Sí, desde tu perfil en la sección “Mis Pedidos” puedes ver el estado de todos tus pedidos y el tracking del envío.', icono: User },
    { categoria: 'Cuenta', pregunta: '¿Cómo borro mi cuenta?', respuesta: 'Solicítalo por WhatsApp o correo a acordeon91@gmail.com. Eliminamos tus datos en máximo 30 días según la ley 1581 de 2012.', icono: Trash2 }
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
            <a href="https://wa.me/573208492093" className="faq__contacto-card whatsapp">
              <MessageSquare className="faq__contacto-icono" />
              <h3>WhatsApp</h3>
              <p>Respuesta inmediata 24/7</p>
              <span className="faq__badge">Recomendado</span>
            </a>
            <a href="mailto:acordeon91@gmail.com" className="faq__contacto-card email">
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
            <Link to="/tienda" className="faq__btn-primario">
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