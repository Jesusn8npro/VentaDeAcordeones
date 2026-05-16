import React from 'react'
import { Star } from 'lucide-react'
import './SidebarBlog.css'

export default function SidebarBlog() {
  return (
    <aside className="sidebar-blog" aria-label="Sidebar del blog">
      {/* Suscripción */}
      <div className="caja-sidebar">
        <h3 className="titulo-caja">Tips Exclusivos Semanales</h3>
        <p className="texto-caja">Recibe técnicas avanzadas, ofertas exclusivas y descuentos especiales.</p>
        <form className="form-suscripcion" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="tu@email.com" aria-label="Correo" />
          <button type="submit">Suscribirme</button>
        </form>
        <ul className="lista-beneficios">
          <li>Tips exclusivos semanales</li>
          <li>Descuentos especiales</li>
          <li>Trucos de profesionales</li>
        </ul>
      </div>

      {/* Cursos populares */}
      <div className="caja-sidebar">
        <h3 className="titulo-caja">Cursos Más Populares</h3>
        <ul className="lista-cursos">
          <li>
            <img src="https://picsum.photos/seed/curso-basico/96/64" alt="Curso Acordeón Básico" loading="lazy" decoding="async" width="96" height="64" />
            <div>
              <p className="curso-nombre">Acordeón Básico</p>
              <div className="mini-rating"><Star size={14} /> 4.9</div>
              <p className="precio">$79.900</p>
            </div>
          </li>
          <li>
            <img src="https://picsum.photos/seed/curso-avanzado/96/64" alt="Técnicas Avanzadas" loading="lazy" decoding="async" width="96" height="64" />
            <div>
              <p className="curso-nombre">Técnicas Avanzadas</p>
              <div className="mini-rating"><Star size={14} /> 4.8</div>
              <p className="precio">$99.900</p>
            </div>
          </li>
        </ul>
        <a className="btn-cta-cursos" href="/tienda">Ver Todos los Cursos</a>
      </div>

      {/* Testimonios */}
      <div className="caja-sidebar">
        <h3 className="titulo-caja">Lo que Dicen Nuestros Estudiantes</h3>
        <div className="testimonio">
          <div className="avatar peque">MC</div>
          <div>
            <p className="texto-testimonio">"Veo mi avance semanalmente. Sus explicaciones son claras y me han mejorado muchísimo mi técnica."</p>
            <p className="autor-testimonio">María Carmen · Valledupar</p>
          </div>
        </div>
        <div className="testimonio">
          <div className="avatar peque">AR</div>
          <div>
            <p className="texto-testimonio">"Los tutoriales son increíbles. Pude aprender con ejercicios prácticos y progresivos."</p>
            <p className="autor-testimonio">Andrés Rodríguez · Barranquilla</p>
          </div>
        </div>
      </div>

      {/* Síguenos */}
      <div className="caja-sidebar">
        <h3 className="titulo-caja">Síguenos</h3>
        <ul className="redes">
          <li><span>Instagram</span><strong>12K</strong></li>
          <li><span>YouTube</span><strong>85K</strong></li>
          <li><span>Facebook</span><strong>30K</strong></li>
        </ul>
      </div>
    </aside>
  )
}