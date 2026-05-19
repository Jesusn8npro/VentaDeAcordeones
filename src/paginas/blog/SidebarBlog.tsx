'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { clienteSupabase } from '../../configuracion/supabase'
import './SidebarBlog.css'

export default function SidebarBlog() {
  const [productosDestacados, setProductosDestacados] = useState<any[]>([])

  useEffect(() => {
    clienteSupabase
      .from('productos')
      .select(`id, nombre, slug, precio, producto_imagenes(imagen_principal)`)
      .eq('activo', true)
      .eq('destacado', true)
      .gt('stock', 0)
      .order('creado_el', { ascending: false })
      .limit(3)
      .then(({ data }) => setProductosDestacados(data || []))
  }, [])
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

      {/* Acordeones destacados */}
      <div className="caja-sidebar">
        <h3 className="titulo-caja">Acordeones Destacados</h3>
        <ul className="lista-cursos">
          {productosDestacados.map(producto => {
            const imagen = producto.producto_imagenes?.[0]?.imagen_principal || '/logo.svg'
            const precio = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(producto.precio)
            return (
              <li key={producto.id}>
                <Link href={`/producto/${producto.slug}`}>
                  <img src={imagen} alt={producto.nombre} loading="lazy" decoding="async" width="96" height="64" style={{ objectFit: 'cover', borderRadius: '6px' }} />
                </Link>
                <div>
                  <Link href={`/producto/${producto.slug}`}>
                    <p className="curso-nombre">{producto.nombre}</p>
                  </Link>
                  <p className="precio">{precio}</p>
                </div>
              </li>
            )
          })}
        </ul>
        <Link className="btn-cta-cursos" href="/tienda">Ver toda la tienda</Link>
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