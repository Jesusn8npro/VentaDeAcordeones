import React, { useEffect, useState } from 'react'
import { BookOpen, Users, Star, Clock } from 'lucide-react'
import './PaginaBlog.css'
import SidebarBlog from './SidebarBlog'
import { clienteSupabase } from '../../configuracion/supabase'

import Paginacion from './Paginacion';

/**
 * PaginaBlog - Página principal del Blog
 *
 * Primera sección: Hero con título, descripción, métricas y CTA.
 * - Altura reducida respecto a la referencia para ser más compacta.
 * - Totalmente adaptado al estilo de la tienda (tonos modernos y legibles).
 */
export default function PaginaBlog() {
  const [articulos, setArticulos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalArticulos, setTotalArticulos] = useState(0)
  const articulosPorPagina = 6

  useEffect(() => {
    let activo = true;

    const cargarArticulos = async () => {
      setCargando(true);
      setError(null);

      try {
        // Contar el total de artículos publicados
        const { count, error: countError } = await clienteSupabase
          .from('articulos_web')
          .select('*', { count: 'exact', head: true })
          .eq('estado_publicacion', 'publicado');

        if (countError) throw countError;
        if (activo) setTotalArticulos(count);

        // Calcular el rango de la paginación
        const desde = (paginaActual - 1) * articulosPorPagina;
        const hasta = desde + articulosPorPagina - 1;

        // Obtener los artículos de la página actual
        const { data, error: fetchError } = await clienteSupabase
          .from('articulos_web')
          .select('id, titulo, slug, resumen_breve, portada_url, lectura_min, fecha_publicacion, autor, calificacion')
          .eq('estado_publicacion', 'publicado')
          .order('fecha_publicacion', { ascending: false })
          .range(desde, hasta);

        if (!activo) return;

        if (fetchError) {
          throw fetchError;
        }
        
        setArticulos(Array.isArray(data) ? data : []);

      } catch (e) {
        if (activo) {
          setError(e?.message || 'Error cargando artículos');
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarArticulos();

    return () => {
      activo = false;
    };
  }, [paginaActual]);

  const handlePageChange = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <section className="hero-blog-claro" aria-labelledby="titulo-hero-blog">
        {/* Fondo luminoso y elegante */}
        <div className="hero-claro-fondo" aria-hidden="true">
          <div className="forma-luminosa forma-1"></div>
          <div className="forma-luminosa forma-2"></div>
          <div className="forma-luminosa forma-3"></div>
        </div>

        {/* Contenido principal del hero */}
        <div className="hero-claro-contenedor">
          <div className="hero-claro-textos">
            <div className="etiqueta-blog">
              <span className="icono-blog">🎯</span>
              Centro de Conocimiento
            </div>
            
            <h1 id="titulo-hero-blog" className="hero-claro-titulo">
              Blog de Compras Inteligentes
              <span className="texto-destacado"> y Tendencias</span>
            </h1>
            
            <p className="hero-claro-descripcion">
              Encuentra guías expertas para comprar en nuestra tienda, descubre productos 
              innovadores, aprende sobre economía del consumidor y mantente actualizado 
              con las últimas tendencias en tecnología, hogar, vehículos y mucho más.
            </p>

            {/* Beneficios para el comprador */}
            <div className="hero-beneficios" role="list" aria-label="Beneficios para compradores">
              <div className="beneficio" role="listitem">
                <div className="beneficio-icono" aria-hidden="true">💡</div>
                <div className="beneficio-texto">
                  <strong>Guías de Compra</strong>
                  <span>Consejos expertos para elegir mejor</span>
                </div>
              </div>
              <div className="beneficio" role="listitem">
                <div className="beneficio-icono" aria-hidden="true">🚀</div>
                <div className="beneficio-texto">
                  <strong>Productos Innovadores</strong>
                  <span>Descubre las últimas novedades</span>
                </div>
              </div>
              <div className="beneficio" role="listitem">
                <div className="beneficio-icono" aria-hidden="true">💰</div>
                <div className="beneficio-texto">
                  <strong>Economía y Finanzas</strong>
                  <span>Aprende a administrar mejor</span>
                </div>
              </div>
            </div>

            {/* CTA principal */}
            <div className="hero-claro-acciones">
              <a href="#articulos" className="btn-principal-claro" title="Explorar artículos de ayuda">
                Explorar Guías de Compra
                <span className="flecha-clara">→</span>
              </a>
              <a href="#articulos" className="btn-secundario-claro" title="Ver productos innovadores">
                Descubrir Productos Novedosos
              </a>
            </div>
          </div>


        </div>
      </section>

      {/* Listado de artículos + Sidebar */}
      <section id="articulos" className="articulos-contenedor" aria-label="Listado de artículos">
        <div className="grid-blog-pagina">
          {/* Izquierda: tarjetas de artículos */}
          <div className="listado-articulos" aria-live="polite">
            {cargando && (
              Array.from({ length: articulosPorPagina }).map((_, i) => (
                <article className="tarjeta-articulo" key={`skeleton-${i}`} aria-busy="true">
                  <div className="tarjeta-media">
                    <img src={`https://picsum.photos/seed/blog-skeleton-${i}/480/270`} alt="Cargando artículo" width="480" height="270" />
                  </div>
                  <div className="tarjeta-cuerpo">
                    <span className="badge">General</span>
                    <h3 className="tarjeta-titulo">Cargando…</h3>
                    <p className="tarjeta-meta">—</p>
                    <p className="tarjeta-resumen">Preparando contenido…</p>
                  </div>
                </article>
              ))
            )}

            {!cargando && error && (
              <p style={{color:'#b91c1c'}}>Error: {error}</p>
            )}

            {!cargando && !error && articulos.length === 0 && (
              <p>No hay artículos publicados todavía.</p>
            )}

            {!cargando && !error && articulos.map((a) => (
              <article className="tarjeta-articulo" key={a.slug}>
                <div className="tarjeta-media">
                  <img src={a.portada_url || `https://picsum.photos/seed/${a.slug}/480/270`} alt={a.titulo} loading="lazy" decoding="async" width="480" height="270" />
                </div>
                <div className="tarjeta-cuerpo">
                  <span className="badge">General</span>
                  <h3 className="tarjeta-titulo">{a.titulo}</h3>
                  <p className="tarjeta-meta">
                    <span style={{marginRight:8}}>Por {a.autor}</span>
                    <span style={{marginRight:8}}>{new Date(a.fecha_publicacion).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    <span style={{marginRight:8}}><Clock size={14}/> {a.lectura_min ?? 5} min</span>
                    <span><Star size={14}/> {a.calificacion ?? 4.8}</span>
                  </p>
                  <p className="tarjeta-resumen">{a.resumen_breve}</p>
                  <a className="btn-leer" href={`/blog/${a.slug}`}>Leer Artículo →</a>
                </div>
              </article>
            ))}

            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={Math.ceil(totalArticulos / articulosPorPagina)}
              onPageChange={handlePageChange}
            />
          </div>

          {/* Derecha: Sidebar */}
          <SidebarBlog />
        </div>
      </section>
    </>
  )
}