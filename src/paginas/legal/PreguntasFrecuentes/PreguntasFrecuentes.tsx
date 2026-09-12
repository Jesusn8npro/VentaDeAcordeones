'use client'

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
import Link from 'next/link'
import './PreguntasFrecuentes.css'
import { PREGUNTAS_FAQ, CATEGORIAS_FAQ } from './preguntasFrecuentesDatos'

// Cada categoría (y la excepción Trash2) tiene su icono lucide; los datos sólo guardan el nombre.
const ICONOS: Record<string, typeof HelpCircle> = { Compras: ShoppingCart, Pagos: CreditCard, Envíos: Truck, Devoluciones: RotateCcw, Seguridad: Shield, Cuenta: User, Trash2 }
const iconoDe = (clave: string) => ICONOS[clave] ?? HelpCircle

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

  // Preguntas, categorías e iconos: los textos viven en preguntasFrecuentesDatos.ts (compartidos con el JSON-LD FAQPage).
  const categorias = CATEGORIAS_FAQ.map((titulo) => ({ icono: iconoDe(titulo), titulo }))
  const preguntas = PREGUNTAS_FAQ.map((p) => ({ ...p, icono: iconoDe(p.icono ?? p.categoria) }))

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
                  <Link href="/contacto" className="faq__btn-accento">
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
            <a href="https://wa.me/573144865310" className="faq__contacto-card whatsapp">
              <MessageSquare className="faq__contacto-icono" />
              <h3>WhatsApp</h3>
              {/* No hay atención 24/7: es un taller con horario. */}
              <p>+57 314 486 5310 · en horario de atención</p>
              <span className="faq__badge">Recomendado</span>
            </a>
            <a href="mailto:acordeon91@gmail.com" className="faq__contacto-card email">
              <Mail className="faq__contacto-icono" />
              <h3>Email</h3>
              <p>acordeon91@gmail.com</p>
            </a>
            {/* El número era un marcador de posición (+57 1 234 5678): no existía. */}
            <a href="tel:+573144865310" className="faq__contacto-card telefono">
              <Phone className="faq__contacto-icono" />
              <h3>Teléfono</h3>
              <p>+57 314 486 5310 · Lunes a Viernes 8AM – 6PM</p>
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
            <Link href="/tienda" className="faq__btn-primario">
              <Heart className="faq__btn-icono" />
              Explorar productos
            </Link>
            <Link href="/contacto" className="faq__btn-secundario">
              <MessageSquare className="faq__btn-icono" />
              Hacer pregunta
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}