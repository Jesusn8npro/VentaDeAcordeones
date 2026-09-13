import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { BookOpen, Users, Star, Clock } from 'lucide-react'
import './PaginaBlog.css'
import SidebarBlog from './SidebarBlog'
import { clienteSupabase } from '../../configuracion/supabase'

import Paginacion from './Paginacion';

// Antes las portadas ausentes (y el skeleton de carga) se pedían a https://picsum.photos: una
// petición a un tercero en producción por cada tarjeta, lenta y fuera de nuestro control. Ahora
// el fallback es un asset local que ya se sirve con caché inmutable.
const PORTADA_FALLBACK = '/images/og/portada.jpg'

// next/image rompe el render si el host no está en images.remotePatterns (next.config.mjs), y las
// portadas vienen de la base de datos. Si la URL es absoluta y de un host no permitido, se cae al
// asset local en vez de tumbar toda la página del blog.
const HOSTS_PERMITIDOS = /(^|\.)(supabase\.co|ventadeacordeones\.com)$/
const portadaSegura = (url) => {
  if (!url) return PORTADA_FALLBACK
  if (!/^https?:\/\//i.test(url)) return url
  try {
    return HOSTS_PERMITIDOS.test(new URL(url).hostname) ? url : PORTADA_FALLBACK
  } catch {
    return PORTADA_FALLBACK
  }
}

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
            {/* Este bloque venía de una plantilla genérica de tienda: hablaba de "compras
                inteligentes" y de tendencias en "tecnología, hogar y vehículos". Aquí sólo se
                venden acordeones, así que el texto responde a lo que de verdad se teclea en
                Google antes de gastarse cinco millones. */}
            <div className="etiqueta-blog">
              <span className="icono-blog">🪗</span>
              Guías del taller
            </div>

            <h1 id="titulo-hero-blog" className="hero-claro-titulo">
              Todo lo que hay que saber
              <span className="texto-destacado"> antes de comprar un acordeón</span>
            </h1>

            <p className="hero-claro-descripcion">
              Cuánto cuesta de verdad, qué tonalidad te sirve, en qué se diferencia un Corona III
              de un Rey Vallenato y cómo saber si el usado que te ofrecen vale la pena. Lo
              escribimos nosotros, desde el taller, después de reparar y afinar acordeones todos
              los días en Bogotá.
            </p>

            {/* Beneficios para el comprador */}
            <div className="hero-beneficios" role="list" aria-label="Qué vas a encontrar">
              <div className="beneficio" role="listitem">
                <div className="beneficio-icono" aria-hidden="true">💰</div>
                <div className="beneficio-texto">
                  <strong>Precios reales</strong>
                  <span>Cuánto cuesta cada modelo en Colombia</span>
                </div>
              </div>
              <div className="beneficio" role="listitem">
                <div className="beneficio-icono" aria-hidden="true">🎵</div>
                <div className="beneficio-texto">
                  <strong>Qué acordeón comprar</strong>
                  <span>Tonalidad y modelo según lo que tocas</span>
                </div>
              </div>
              <div className="beneficio" role="listitem">
                <div className="beneficio-icono" aria-hidden="true">🔧</div>
                <div className="beneficio-texto">
                  <strong>Mantenimiento</strong>
                  <span>Cómo cuidarlo para que dure toda la vida</span>
                </div>
              </div>
            </div>

            {/* CTA principal */}
            <div className="hero-claro-acciones">
              <a href="#articulos" className="btn-principal-claro" title="Ver las guías de compra">
                Ver las guías
                <span className="flecha-clara">→</span>
              </a>
              <a href="/tienda" className="btn-secundario-claro" title="Ir al catálogo de acordeones">
                Ver acordeones en venta
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
                    {/* Placeholder sin red: reserva el mismo 16:9 que la portada real (sin saltos de layout). */}
                    <div
                      aria-hidden="true"
                      style={{ width: '100%', aspectRatio: '480 / 270', background: 'var(--vda-superficie-2)' }}
                    />
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
              <p style={{color:'var(--vda-peligro)'}}>Error: {error}</p>
            )}

            {!cargando && !error && articulos.length === 0 && (
              <p>No hay artículos publicados todavía.</p>
            )}

            {!cargando && !error && articulos.map((a) => (
              <article className="tarjeta-articulo" key={a.slug}>
                <div className="tarjeta-media">
                  <Image
                    src={portadaSegura(a.portada_url)}
                    alt={a.titulo}
                    width={480}
                    height={270}
                    sizes="(max-width: 991px) 100vw, (max-width: 1400px) 40vw, 400px"
                    loading="lazy"
                  />
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