import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Bot, User, Send, Loader2, Sparkles, RotateCcw, MessageCircle } from 'lucide-react';
import './CrearArticuloIA.css';
import FormularioArticulo from '../FormularioArticulo';
import { clienteSupabase } from '../../../../configuracion/supabase';

const CrearArticuloIA = ({
  onArticuloCreado = () => {},
  articuloParaEditar = null
}) => {
  const CLAVE_CONVERSACION = articuloParaEditar?.id
    ? `creador_articulo_ia_conversacion_editar_${articuloParaEditar.id}`
    : 'creador_articulo_ia_conversacion_crear';

  const CLAVE_ARTICULO_GENERADO = articuloParaEditar?.id
    ? `creador_articulo_ia_articulo_editar_${articuloParaEditar.id}`
    : 'creador_articulo_ia_articulo_crear';

  const [pasoActual, setPasoActual] = useState(() => {
    const datosGuardados = localStorage.getItem(CLAVE_CONVERSACION);
    return datosGuardados ? JSON.parse(datosGuardados).paso || 1 : 1;
  });

  const [listaMensajes, setListaMensajes] = useState(() => {
    const datosGuardados = localStorage.getItem(CLAVE_CONVERSACION);
    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados);
      return datos.mensajes || [{
        id: 1,
        tipo: 'agente',
        contenido: '¡Hola! Soy tu asistente IA para crear artículos de blog. Dime sobre qué quieres escribir.',
        marcaTiempo: Date.now()
      }];
    }
    return [{
      id: 1,
      tipo: 'agente',
      contenido: '¡Hola! Soy tu asistente IA para crear artículos de blog. Dime sobre qué quieres escribir.',
      marcaTiempo: Date.now()
    }];
  });

  const [textoMensaje, setTextoMensaje] = useState('');
  const [estaCargando, setEstaCargando] = useState(false);
  const [mensajeError, setMensajeError] = useState('');

  const [articulo, setArticulo] = useState(() => {
    const datosGuardados = localStorage.getItem(CLAVE_ARTICULO_GENERADO);
    try {
      return datosGuardados ? JSON.parse(datosGuardados) : (articuloParaEditar || null);
    } catch {
      return articuloParaEditar || null;
    }
  });

  const [conversacionId, setConversacionId] = useState(() => {
    const idGuardado = localStorage.getItem('creadorArticuloIA_conversacion_id');
    return idGuardado || `conv_${Date.now()}`;
  });

  const referenciaChat = useRef(null);

  const guardarEstadoEnLocalStorage = useCallback(() => {
    const datosConversacion = {
      paso: pasoActual,
      mensajes: listaMensajes,
      marcaTiempo: Date.now(),
    };
    localStorage.setItem(CLAVE_CONVERSACION, JSON.stringify(datosConversacion));

    if (articulo) {
      localStorage.setItem(CLAVE_ARTICULO_GENERADO, JSON.stringify(articulo));
    } else {
      localStorage.removeItem(CLAVE_ARTICULO_GENERADO);
    }

    localStorage.setItem('creadorArticuloIA_conversacion_id', conversacionId);
  }, [pasoActual, listaMensajes, articulo, conversacionId, CLAVE_CONVERSACION, CLAVE_ARTICULO_GENERADO]);

  useEffect(() => {
    guardarEstadoEnLocalStorage();
  }, [guardarEstadoEnLocalStorage]);

  useEffect(() => {
    if (articulo) {
      localStorage.setItem(CLAVE_ARTICULO_GENERADO, JSON.stringify(articulo));
    } else {
      localStorage.removeItem(CLAVE_ARTICULO_GENERADO);
    }
  }, [articulo, CLAVE_ARTICULO_GENERADO]);

  useEffect(() => {
    if (referenciaChat.current) {
      referenciaChat.current.scrollTop = referenciaChat.current.scrollHeight;
    }
  }, [listaMensajes]);

  const limpiarConversacion = useCallback(() => {
    localStorage.removeItem(CLAVE_CONVERSACION);
    localStorage.removeItem(CLAVE_ARTICULO_GENERADO);
    localStorage.removeItem('creadorArticuloIA_conversacion_id');
    setListaMensajes([{
      id: 1,
      tipo: 'agente',
      contenido: '¡Hola! Soy tu asistente IA para crear artículos de blog. Dime sobre qué quieres escribir.',
      marcaTiempo: Date.now()
    }]);
    setArticulo(null);
    setPasoActual(1);
    setConversacionId(`conv_${Date.now()}`);
    setMensajeError('');
    setTextoMensaje('');
  }, [CLAVE_CONVERSACION, CLAVE_ARTICULO_GENERADO]);

  const handleGuardarArticulo = async () => {
    if (!articulo) {
      setMensajeError('No hay datos del artículo para guardar.');
      return;
    }

    setEstaCargando(true);
    setMensajeError('');

    try {
      const { data: { user } } = await clienteSupabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado.');

      const articuloParaGuardar = {
        ...articulo,
        autor_id: user.id,
        autor: 'JESUS GONZALEZ',
        lectura_min: (articulo.lectura_min && articulo.lectura_min > 0) ? articulo.lectura_min : 1,
      };

      if (articuloParaGuardar.hasOwnProperty('estado')) {
        articuloParaGuardar.estado_publicacion = articuloParaGuardar.estado;
        delete articuloParaGuardar.estado;
      }

      delete articuloParaGuardar.imagenes;

      const { data: dataArticulo, error: errorArticulo } = await clienteSupabase
        .from('articulos_web')
        .upsert(articuloParaGuardar)
        .select()
        .single();

      if (errorArticulo) throw errorArticulo;

      onArticuloCreado(dataArticulo);
      limpiarConversacion();
    } catch (error) {
      setMensajeError(`Error al guardar: ${error.message}`);
    } finally {
      setEstaCargando(false);
    }
  };

  const parsearRespuestaN8N = (data) => {
    const respuesta = Array.isArray(data) ? data[0] : data;

    if (!respuesta || typeof respuesta !== 'object') {
      return { error: 'Respuesta inválida.', articulo: null, respuestaAgente: null };
    }

    const posiblesKeysArticulo = ['articulo_generado', 'json_limpio', 'datos_articulo'];
    for (const key of posiblesKeysArticulo) {
      if (respuesta[key]) {
        try {
          const articulo = typeof respuesta[key] === 'string' ? JSON.parse(respuesta[key]) : respuesta[key];
          return { articulo };
        } catch {
          // continuar buscando
        }
      }
    }

    if (respuesta.titulo && respuesta.slug && respuesta.secciones) {
      return { articulo: respuesta };
    }

    const posiblesKeysRespuesta = ['respuesta_agente', 'respuesta', 'message', 'content'];
    for (const key of posiblesKeysRespuesta) {
      if (respuesta[key] && typeof respuesta[key] === 'string') {
        return { respuestaAgente: respuesta[key] };
      }
    }

    return { error: 'No se pudo interpretar la respuesta del servidor.' };
  };

  const handleEnviarMensaje = async () => {
    if (!textoMensaje.trim() || estaCargando) return;

    setEstaCargando(true);
    setMensajeError('');

    const nuevoMensajeUsuario = {
      id: Date.now(),
      tipo: 'usuario',
      contenido: textoMensaje.trim(),
      marcaTiempo: Date.now()
    };

    const mensajesActualizados = [...listaMensajes, nuevoMensajeUsuario];
    setListaMensajes(mensajesActualizados);
    setTextoMensaje('');

    try {
      const { data: { user } } = await clienteSupabase.auth.getUser();
      if (!user) {
        setMensajeError('Error de autenticación: No se pudo obtener el usuario. Por favor, inicia sesión de nuevo.');
        setEstaCargando(false);
        return;
      }

      const datosParaN8N = {
        topic: nuevoMensajeUsuario.contenido,
        authorId: user.id,
        conversacion_id: conversacionId,
      };

      const response = await fetch('https://velostrategix-n8n.lnrubg.easypanel.host/webhook-test/chat_creador_articulos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosParaN8N),
      });

      if (!response.ok) throw new Error(`Error del servidor: ${response.status}`);

      const data = await response.json();
      const { articulo, respuestaAgente, error: errorParseo } = parsearRespuestaN8N(data);

      if (articulo) {
        const articuloParaFormulario = {
          titulo: articulo.titulo || '',
          slug: articulo.slug || '',
          resumen_breve: articulo.resumen_breve || '',
          resumen_completo: articulo.resumen_completo || '',
          secciones: Array.isArray(articulo.secciones) ? articulo.secciones : [],
          estado_publicacion: 'borrador',
          autor: articulo.autor || 'Equipo VentaDeAcordeones',
          autor_iniciales: articulo.autor_iniciales || 'JG',
          lectura_min: (articulo.lectura_min && parseInt(articulo.lectura_min, 10) > 0) ? parseInt(articulo.lectura_min, 10) : 5,
          calificacion: (articulo.calificacion && parseFloat(articulo.calificacion) > 0) ? parseFloat(articulo.calificacion) : 4.5,
          portada_url: articulo.portada_url || '',
          cta: (articulo.cta && typeof articulo.cta === 'object') ? articulo.cta : { texto_boton: 'Descubre más', url: '/', subtexto: '' },
          meta_titulo: articulo.meta_titulo || '',
          meta_descripcion: articulo.meta_descripcion || '',
          meta_keywords: articulo.meta_keywords || '',
          canonical_url: articulo.canonical_url || '',
          og_titulo: articulo.og_titulo || '',
          og_descripcion: articulo.og_descripcion || '',
          og_imagen_url: articulo.og_imagen_url || '',
          twitter_card: articulo.twitter_card || 'summary_large_image',
        };

        setArticulo(articuloParaFormulario);
        setListaMensajes(prev => [...prev, {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: '¡Artículo generado! Revisa y completa los datos en el formulario.',
          marcaTiempo: Date.now()
        }]);
        setPasoActual(2);

      } else if (respuestaAgente) {
        setListaMensajes(prev => [...prev, {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: respuestaAgente,
          marcaTiempo: Date.now()
        }]);

      } else {
        const msg = errorParseo || 'No se recibió una respuesta válida.';
        setListaMensajes(prev => [...prev, {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: `Lo siento, hubo un problema: ${msg}`,
          marcaTiempo: Date.now()
        }]);
      }

    } catch {
      setMensajeError('Hubo un problema al contactar al asistente de IA. Inténtalo de nuevo.');
    } finally {
      setEstaCargando(false);
    }
  };

  return (
    <div className="chat-ia-blog-creador">
      <div className="chat-ia-blog-header">
        <h3><Sparkles size={20} /> Crear Artículo con IA</h3>
        <button onClick={limpiarConversacion} className="chat-ia-blog-btn-limpiar"><RotateCcw size={16} /></button>
      </div>

      {pasoActual === 1 && (
        <>
          <div className="chat-ia-blog-container" ref={referenciaChat}>
            {listaMensajes.map((mensaje) => (
              <div key={mensaje.id} className={`chat-ia-blog-mensaje ${mensaje.tipo}`}>
                <div className="chat-ia-blog-avatar">
                  {mensaje.tipo === 'agente' ? <Bot size={24} /> : <User size={24} />}
                </div>
                <div className="chat-ia-blog-contenido">{mensaje.contenido}</div>
              </div>
            ))}
            {estaCargando && (
              <div className="chat-ia-blog-mensaje agente">
                <div className="chat-ia-blog-avatar"><Bot size={24} /></div>
                <div className="chat-ia-blog-contenido"><Loader2 className="chat-ia-blog-spinner" size={20} /></div>
              </div>
            )}
          </div>
          <div className="chat-ia-blog-input">
            <input
              type="text"
              value={textoMensaje}
              onChange={(e) => setTextoMensaje(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !estaCargando && handleEnviarMensaje()}
              placeholder="Escribe tu idea para el artículo..."
              disabled={estaCargando}
            />
            <button onClick={handleEnviarMensaje} disabled={estaCargando}>
              <Send size={18} />
            </button>
          </div>
        </>
      )}

      {pasoActual === 2 && articulo && (
        <div className="vista-previa-articulo">
          <FormularioArticulo
            articulo={articulo}
            onArticuloChange={setArticulo}
            onGuardar={handleGuardarArticulo}
            cargando={estaCargando}
          />
          <button onClick={() => setPasoActual(1)} className="btn-volver-chat">
            <MessageCircle size={16} /> Volver al Chat
          </button>
        </div>
      )}

      {mensajeError && <div className="chat-ia-blog-error-mensaje">{mensajeError}</div>}
    </div>
  );
};

CrearArticuloIA.propTypes = {
  onArticuloCreado: PropTypes.func,
  articuloParaEditar: PropTypes.object
};

export default CrearArticuloIA;
