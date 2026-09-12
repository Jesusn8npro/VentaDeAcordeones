'use client'

import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Clock, Star, ChevronDown, AlertTriangle, Loader, Play, Pause } from 'lucide-react';
import './ArticuloBlog.css';
import SidebarBlog from './SidebarBlog';
import { clienteSupabase } from '../../configuracion/supabase';

const slugify = (text) => (text ?? '').toString().toLowerCase()
  .replace(/\s+/g, '-')
  .replace(/[^\w\-]+/g, '')
  .replace(/--+/g, '-')
  .replace(/^-+/, '')
  .replace(/-+$/, '');

// Markdown inline (**negrita**, *cursiva*, [texto](ruta)) → nodos React.
// Sin dangerouslySetInnerHTML: el texto viene de la BD y nunca se inyecta como HTML.
const INLINE_RE = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\)|(?<![*\w])\*[^*\n]+\*(?![*\w]))/g;
const esRutaSegura = (href) => /^(\/|#|https?:\/\/|mailto:|tel:)/i.test(href);

const formatearInline = (texto) => {
  if (typeof texto !== 'string' || !texto) return texto;
  const partes = texto.split(INLINE_RE).filter(Boolean);
  if (partes.length === 1 && !INLINE_RE.test(texto)) return texto;
  return partes.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) return <strong key={i}>{p.slice(2, -2)}</strong>;
    const enlace = p.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    if (enlace && esRutaSegura(enlace[2])) {
      const [, label, href] = enlace;
      const externo = /^https?:\/\//i.test(href);
      return externo
        ? <a key={i} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
        : <Link key={i} href={href}>{label}</Link>;
    }
    if (p.length > 2 && p.startsWith('*') && p.endsWith('*')) return <em key={i}>{p.slice(1, -1)}</em>;
    return p;
  });
};

// Componente para renderizar el contenido dinámico del artículo
const RenderizadorContenido = ({ secciones }) => {
  if (!Array.isArray(secciones)) {
    return <p>El contenido del artículo no es válido.</p>;
  }

  return secciones.map((seccion, index) => {
    // Los encabezados usan el mismo id que la tabla de contenidos (slugify(contenido)).
    const id = seccion.tipo === 'encabezado' && seccion.contenido
      ? slugify(seccion.contenido)
      : `seccion-${index}`;

    switch (seccion.tipo) {
      case 'encabezado':
        const Nivel = `h${seccion.nivel || 2}`;
        return <Nivel key={id} id={id} className="bloque-titulo">{seccion.contenido}</Nivel>;

      case 'parrafo':
        return <p key={id} className="bloque-texto">{formatearInline(seccion.contenido)}</p>;

      case 'imagen':
        if (!seccion.url) return null;
        return (
          <figure key={id} className="imagen-inline">
            <img src={seccion.url} alt={seccion.alt || 'Imagen del artículo'} loading="lazy" decoding="async" />
            {seccion.caption && <figcaption>{seccion.caption}</figcaption>}
          </figure>
        );

      case 'lista':
        const Lista = seccion.ordenada ? 'ol' : 'ul';
        return (
          <Lista key={id} className="bloque-texto">
            {Array.isArray(seccion.items) && seccion.items.map((item, i) => <li key={i}>{formatearInline(item)}</li>)}
          </Lista>
        );

      case 'tabla':
        if (!Array.isArray(seccion.filas)) return null;
        return (
          <div key={id} className="tabla-scroll">
            <table className="tabla-articulo">
              {Array.isArray(seccion.cabecera) && seccion.cabecera.length > 0 && (
                <thead>
                  <tr>{seccion.cabecera.map((c, i) => <th key={i} scope="col">{formatearInline(c)}</th>)}</tr>
                </thead>
              )}
              <tbody>
                {seccion.filas.map((fila, f) => (
                  <tr key={f}>{Array.isArray(fila) && fila.map((c, i) => <td key={i}>{formatearInline(c)}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'faq':
        if (!Array.isArray(seccion.preguntas) || seccion.preguntas.length === 0) return null;
        return (
          <section key={id} id="preguntas-frecuentes" className="faq-articulo" aria-labelledby="faq-articulo-titulo">
            <h2 id="faq-articulo-titulo" className="bloque-titulo">{seccion.titulo || 'Preguntas frecuentes'}</h2>
            {seccion.preguntas.map((p, i) => (
              <details key={i} className="faq-item" open={i === 0}>
                <summary>
                  <span>{p.pregunta}</span>
                  <ChevronDown size={18} className="icono" aria-hidden="true" />
                </summary>
                <div className="faq-respuesta"><p>{formatearInline(p.respuesta)}</p></div>
              </details>
            ))}
          </section>
        );

      default:
        return null;
    }
  });
};

// Componente para el reproductor de audio TTS
const ReproductorAudio = ({ texto }) => {
  const [reproduciendo, setReproduciendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [tiempoActual, setTiempoActual] = useState('0:00');
  const [duracion, setDuracion] = useState('0:00');
  const utteranceRef = useRef(null);

  const formatearTiempo = (segundos) => {
    const s = Math.floor(segundos);
    return `${Math.floor(s / 60)}:${('0' + (s % 60)).slice(-2)}`;
  };

  const limpiarSpeech = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }
    if (utteranceRef.current) {
      utteranceRef.current.onend = null;
      utteranceRef.current.onerror = null;
      utteranceRef.current.onboundary = null;
    }
  };

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!texto || !synth) return;

    const handleBoundary = (event) => {
      if (utteranceRef.current) {
        const textoHablado = utteranceRef.current.text.substring(0, event.charIndex + event.charLength);
        const progresoCalculado = (textoHablado.length / utteranceRef.current.text.length) * 100;
        setProgreso(progresoCalculado);
        
        // Estimación del tiempo actual
        const duracionEstimada = utteranceRef.current.estimatedDuration || (utteranceRef.current.text.length / 10); // Asumir 10 caracteres/seg
        const tiempoTranscurrido = (progresoCalculado / 100) * duracionEstimada;
        setTiempoActual(formatearTiempo(tiempoTranscurrido));
      }
    };

    const ut = new SpeechSynthesisUtterance(texto);
    ut.lang = 'es-ES';
    utteranceRef.current = ut;

    ut.onstart = () => {
      const duracionEstimada = ut.text.length / 10; // Estimación simple
      ut.estimatedDuration = duracionEstimada;
      setDuracion(formatearTiempo(duracionEstimada));
    };
    
    ut.onboundary = handleBoundary;
    ut.onend = () => {
      setReproduciendo(false);
      setProgreso(100);
      setTiempoActual(duracion);
    };
    ut.onerror = () => {
      setReproduciendo(false);
    };

    return () => limpiarSpeech();
  }, [texto]);

  const togglePlay = () => {
    const synth = window.speechSynthesis;
    if (!synth || !utteranceRef.current) return;

    if (reproduciendo) {
      synth.pause();
    } else {
      if (synth.paused) {
        synth.resume();
      } else {
        limpiarSpeech(); // Limpia cualquier estado anterior antes de hablar
        // Re-adjuntar listeners porque se pierden al cancelar
        utteranceRef.current.onend = () => { setReproduciendo(false); setProgreso(100); setTiempoActual(duracion); };
        utteranceRef.current.onerror = () => { setReproduciendo(false); };
        utteranceRef.current.onboundary = (event) => {
          if (utteranceRef.current) {
            const textoHablado = utteranceRef.current.text.substring(0, event.charIndex + event.charLength);
            const progresoCalculado = (textoHablado.length / utteranceRef.current.text.length) * 100;
            setProgreso(progresoCalculado);
            const duracionEstimada = utteranceRef.current.estimatedDuration || (utteranceRef.current.text.length / 10);
            const tiempoTranscurrido = (progresoCalculado / 100) * duracionEstimada;
            setTiempoActual(formatearTiempo(tiempoTranscurrido));
          }
        };
        synth.speak(utteranceRef.current);
      }
    }
    setReproduciendo(!reproduciendo);
  };

  if (!texto) return null;

  return (
    <div className="reproductor-audio">
      <button onClick={togglePlay} className="btn-play" aria-label={reproduciendo ? 'Pausar audio' : 'Reproducir audio'}>
        {reproduciendo ? <Pause size={24} /> : <Play size={24} />}
      </button>
      <div className="progreso-audio">
        <div className="barra-progreso" style={{ width: `${progreso}%` }}></div>
      </div>
      <div className="tiempo-audio">{tiempoActual} / {duracion}</div>
    </div>
  );
};


// Página de detalle de artículo con contenido completo y tabla de contenidos
// `initialData` lo manda el Server Component ya consultado: con el articulo en la mano
// no se muestra ningun spinner y el texto completo viaja en el HTML (antes el articulo
// se pedia otra vez desde el navegador y los buscadores solo veian "Cargando...").
const normalizarArticulo = (data: any) => {
  if (!data) return null;
  const secciones = typeof data.secciones === 'string' ? JSON.parse(data.secciones) : data.secciones;
  const cta = typeof data.cta === 'string' ? JSON.parse(data.cta) : data.cta;
  return { ...data, secciones, cta };
};

export default function ArticuloBlog({ initialData }: { initialData?: any }) {
  const params = useParams();
  const slug = params.slug as string;
  const [resumenExpandido, setResumenExpandido] = useState(false);
  const [articuloData, setArticuloData] = useState(() => {
    try { return normalizarArticulo(initialData); } catch { return null; }
  });
  const [cargando, setCargando] = useState(!initialData);
  const [error, setError] = useState(null);

  const formatearFecha = (iso) => {
    try {
      return new Date(iso).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  useEffect(() => {
    let activo = true;
    // Con el articulo ya pintado desde el servidor no se repite la consulta.
    if (initialData) return () => { activo = false; window.speechSynthesis.cancel(); };
    async function cargar() {
      if (!slug) {
        setCargando(false);
        setError('No se ha especificado un artículo para cargar.');
        return;
      }
      
      setCargando(true);
      setError(null);
      setArticuloData(null);

      try {
        const { data, error: err } = await clienteSupabase
          .from('articulos_web')
          .select('*')
          .eq('slug', slug)
          .eq('estado_publicacion', 'publicado')
          .limit(1)
          .maybeSingle();
        
        if (err) throw err;

        if (activo) {
          if (data) {
            setArticuloData(normalizarArticulo(data));
          } else {
            setArticuloData(null);
          }
        }
      } catch (e) {
        if (activo) {
          setError(e?.message || 'Error cargando el artículo.');
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    }
    
    cargar();

    return () => {
      activo = false;
      window.speechSynthesis.cancel();
    };
  }, [slug]);

  if (cargando) {
    return (
      <div className="pagina-blog-estado">
        <Loader className="animate-spin" size={48} />
        <p>Cargando artículo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pagina-blog-estado error">
        <AlertTriangle size={48} />
        <h2>Error al Cargar</h2>
        <p>{error}</p>
        <Link href="/blog" className="btn-cta">Volver al Blog</Link>
      </div>
    );
  }

  if (!articuloData) {
    return (
      <div className="pagina-blog-estado">
        <AlertTriangle size={48} />
        <h2>Artículo no encontrado</h2>
        <p>El artículo que buscas no existe o no está disponible.</p>
        <Link href="/blog" className="btn-cta">Volver al Blog</Link>
      </div>
    );
  }

  // `autor` puede traer un uuid en filas antiguas: en ese caso se usa el nombre por defecto.
  const autorValido = typeof articuloData.autor === 'string' && articuloData.autor && !/^[0-9a-f-]{36}$/i.test(articuloData.autor);
  const cabecera = {
    titulo: articuloData.titulo,
    autor: autorValido ? articuloData.autor : 'Jesús González',
    autorIniciales: articuloData.autor_iniciales || 'JG',
    fecha: formatearFecha(articuloData.fecha_publicacion),
    lecturaMin: articuloData.lectura_min ?? 0,
    rating: articuloData.calificacion ?? 0,
    portada: articuloData.portada_url || 'https://picsum.photos/1200/700'
  };

  const resumenBreveActual = articuloData.resumen_breve;
  const resumenCompletoActual = articuloData.resumen_completo;
  
  const secciones = Array.isArray(articuloData.secciones) ? articuloData.secciones : [];
  // La TOC solo lista H2 (los H3 son subapartados) y añade la FAQ si existe.
  const encabezados = secciones.filter(s => s.tipo === 'encabezado' && (s.nivel || 2) <= 2);
  const tieneFaq = secciones.some(s => s.tipo === 'faq' && Array.isArray(s.preguntas) && s.preguntas.length);

  const textoPlano = (t) => (typeof t === 'string' ? t.replace(/\*\*|\*/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') : '');
  const textoParaHablar = [
    cabecera.titulo,
    resumenCompletoActual || resumenBreveActual,
    ...secciones.map(s => {
      if (s.tipo === 'lista' && Array.isArray(s.items)) return s.items.map(textoPlano).join(', ');
      if (s.tipo === 'faq' && Array.isArray(s.preguntas)) return s.preguntas.map(p => `${p.pregunta}. ${textoPlano(p.respuesta)}`).join('. ');
      if (s.tipo === 'tabla') return '';
      return textoPlano(s.contenido);
    }).filter(Boolean)
  ].join('. ');

  return (
    <div className="pagina-blog">
      <section className="seccion-articulos articulo-contenedor">
        <div className="grid-blog">
          <article className="articulo">
            <header className="articulo-header">
              <h1 className="articulo-titulo">{cabecera.titulo}</h1>
              <div className="articulo-meta">
                <div className="avatar" aria-label="Autor">{cabecera.autorIniciales}</div>
                <span>Por {cabecera.autor}</span>
                <span className="fecha">{cabecera.fecha}</span>
                <span className="dot">•</span>
                <span className="lectura" aria-label="Tiempo de lectura"><Clock size={14} /> {cabecera.lecturaMin} min</span>
                <span className="dot">•</span>
                <span className="rating" aria-label="Valoración"><Star size={14} className="icono" /> {cabecera.rating}</span>
              </div>
            </header>

            <div className="articulo-imagen">
              <img src={cabecera.portada} alt={cabecera.titulo} loading="lazy" decoding="async" />
            </div>

            <ReproductorAudio texto={textoParaHablar} />

            {(resumenBreveActual || resumenCompletoActual) && (
              <div className="resumen-destacado" aria-live="polite">
                <p className={`resumen-texto ${resumenExpandido ? 'expandido' : 'clamp'}`}>
                  {resumenExpandido && resumenCompletoActual ? resumenCompletoActual : resumenBreveActual}
                </p>
                {resumenCompletoActual && (
                  <button
                    className={`btn-resumen ${resumenExpandido ? 'activo' : ''}`}
                    onClick={() => setResumenExpandido(v => !v)}
                    aria-expanded={resumenExpandido}
                  >
                    <span>{resumenExpandido ? 'Ocultar resumen' : 'Ver Resumen Completo'}</span>
                    <ChevronDown size={16} className="icono" />
                  </button>
                )}
              </div>
            )}

            <div className="articulo-contenido">
              {encabezados.length > 1 && (
                <nav className="tabla-contenidos" aria-label="Tabla de contenidos">
                  <p className="toc-title">Contenido</p>
                  <ul>
                    {encabezados.map((sec, i) => (
                      <li key={`${slugify(sec.contenido)}-${i}`}><a href={`#${slugify(sec.contenido)}`}>{sec.contenido}</a></li>
                    ))}
                    {tieneFaq && <li key="faq"><a href="#preguntas-frecuentes">Preguntas frecuentes</a></li>}
                  </ul>
                </nav>
              )}

              <RenderizadorContenido secciones={secciones} />

              {Array.isArray(articuloData.cta?.items) && articuloData.cta.items.length > 0 && (
                <div className="cta-articulo" aria-label="Acciones recomendadas">
                  {articuloData.cta.items.map((item, idx) => {
                    const estilo = item.estilo === 'outline' ? 'outline' : item.estilo === 'whatsapp' ? 'whatsapp' : '';
                    const target = item.estilo === 'whatsapp' ? '_blank' : undefined;
                    const rel = item.estilo === 'whatsapp' ? 'noopener noreferrer' : undefined;
                    return (
                      <a key={idx} className={`btn-cta ${estilo}`} href={item.href} target={target} rel={rel}>{item.texto}</a>
                    );
                  })}
                </div>
              )}
            </div>
          </article>

          <SidebarBlog />
        </div>
      </section>
    </div>
  );
}