import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Bot, User, Send, Loader2, Sparkles, RotateCcw, ArrowRight, MessageCircle } from 'lucide-react';
import './CrearArticuloIA.css';
import FormularioArticulo from '../FormularioArticulo'; // Importamos el formulario
import { clienteSupabase } from '../../../../configuracion/supabase'; // Importamos el cliente de Supabase

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

  // El estado del artículo ahora se gestiona aquí centralmente
  const [articulo, setArticulo] = useState(() => {
    const datosGuardados = localStorage.getItem(CLAVE_ARTICULO_GENERADO);
    try {
      return datosGuardados ? JSON.parse(datosGuardados) : (articuloParaEditar || null);
    } catch (error) {
      console.error('Error al parsear artículo guardado:', error);
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
    setArticulo(null); // Limpiamos el artículo del estado
    setPasoActual(1);
    setConversacionId(`conv_${Date.now()}`);
    setMensajeError('');
    setTextoMensaje('');
  }, [CLAVE_CONVERSACION, CLAVE_ARTICULO_GENERADO]);

  // La función de guardado ahora usa el estado local 'articulo'
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

      // Preparamos el objeto final para guardar con el autor fijo
      const articuloParaGuardar = {
        ...articulo,
        autor_id: user.id,
        autor: 'JESUS GONZALEZ', // Nombre de autor fijo como solicitaste
        // Aseguramos que 'lectura_min' tenga un valor válido para cumplir con la restricción NOT NULL
        lectura_min: (articulo.lectura_min && articulo.lectura_min > 0) ? articulo.lectura_min : 1,
      };

      // Corregir el nombre de la columna de 'estado' a 'estado_publicacion'
      if (articuloParaGuardar.hasOwnProperty('estado')) {
        articuloParaGuardar.estado_publicacion = articuloParaGuardar.estado;
        delete articuloParaGuardar.estado;
      }

      // Las imágenes se gestionan en su propio componente, las excluimos del objeto principal
      delete articuloParaGuardar.imagenes;

      const { data: dataArticulo, error: errorArticulo } = await clienteSupabase
        .from('articulos_web') // Corregido: Nombre de la tabla en singular y mayúsculas
        .upsert(articuloParaGuardar)
        .select()
        .single();

      if (errorArticulo) throw errorArticulo;

      console.log('Artículo guardado con éxito:', dataArticulo);
      
      // Llamamos a la función onArticuloCreado si existe
      onArticuloCreado(dataArticulo);

      limpiarConversacion();
      
    } catch (error) {
      setMensajeError(`Error al guardar: ${error.message}`);
      console.error('Error en Supabase:', error);
    } finally {
      setEstaCargando(false);
    }
  };

  const parsearRespuestaN8N = (data) => {
    console.log('Datos recibidos de N8N para parsear:', data);
    const respuesta = Array.isArray(data) ? data[0] : data;

    if (!respuesta || typeof respuesta !== 'object') {
      console.error('La respuesta de N8N no es un objeto válido.');
      return { error: 'Respuesta inválida.', articulo: null, respuestaAgente: null };
    }

    // Prioridad 1: Buscar un objeto JSON dentro de una propiedad conocida
    const posiblesKeysArticulo = ['articulo_generado', 'json_limpio', 'datos_articulo'];
    for (const key of posiblesKeysArticulo) {
      if (respuesta[key]) {
        try {
          const articulo = typeof respuesta[key] === 'string' ? JSON.parse(respuesta[key]) : respuesta[key];
          console.log(`Artículo extraído de la propiedad '${key}'.`);
          return { articulo };
        } catch (e) {
          console.warn(`Error al parsear JSON de la propiedad '${key}'. Se continuará buscando.`);
        }
      }
    }

    // Prioridad 2: La respuesta misma es el artículo
    if (respuesta.titulo && respuesta.slug && respuesta.secciones) {
      console.log('La respuesta de N8N parece ser directamente el objeto del artículo.');
      return { articulo: respuesta };
    }

    // Prioridad 3: Es una respuesta conversacional del agente
    const posiblesKeysRespuesta = ['respuesta_agente', 'respuesta', 'message', 'content'];
    for (const key of posiblesKeysRespuesta) {
      if (respuesta[key] && typeof respuesta[key] === 'string') {
        console.log(`Respuesta de agente encontrada en la propiedad '${key}'.`);
        return { respuestaAgente: respuesta[key] };
      }
    }
    
    console.error('No se pudo extraer ni un artículo ni una respuesta de agente válida.');
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
      const mensajesParaN8N = mensajesActualizados.map(m => ({
        role: m.tipo === 'usuario' ? 'user' : 'assistant',
        content: m.contenido
      }));

      const { data: { user } } = await clienteSupabase.auth.getUser();
      if (!user) {
        setMensajeError("Error de autenticación: No se pudo obtener el usuario. Por favor, inicia sesión de nuevo.");
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaN8N),
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta completa de n8n:', JSON.stringify(data, null, 2));
      
      const { articulo, respuestaAgente, error: errorParseo } = parsearRespuestaN8N(data);

      if (articulo) {
        const articuloParaFormulario = {
          // Campos existentes
          titulo: articulo.titulo || '',
          slug: articulo.slug || '',
          resumen_breve: articulo.resumen_breve || '',
          resumen_completo: articulo.resumen_completo || '',
          secciones: Array.isArray(articulo.secciones) ? articulo.secciones : [],
          estado_publicacion: 'borrador',

          // --- CAMPOS CORREGIDOS Y AÑADIDOS ---
          autor: articulo.autor || 'Equipo MeLlevoEsto',
          autor_iniciales: articulo.autor_iniciales || 'JG',
          lectura_min: (articulo.lectura_min && parseInt(articulo.lectura_min, 10) > 0) ? parseInt(articulo.lectura_min, 10) : 5,
          calificacion: (articulo.calificacion && parseFloat(articulo.calificacion) > 0) ? parseFloat(articulo.calificacion) : 4.5,
          portada_url: articulo.portada_url || '',
          cta: (articulo.cta && typeof articulo.cta === 'object') ? articulo.cta : { texto_boton: 'Descubre más', url: '/', subtexto: '' },
          
          // Campos Meta
          meta_titulo: articulo.meta_titulo || '',
          meta_descripcion: articulo.meta_descripcion || '',
          meta_keywords: articulo.meta_keywords || '',
          canonical_url: articulo.canonical_url || '',
          og_titulo: articulo.og_titulo || '',
          og_descripcion: articulo.og_descripcion || '',
          og_imagen_url: articulo.og_imagen_url || '',
          twitter_card: articulo.twitter_card || 'summary_large_image',

          // No incluimos autor_id aquí, se asigna al guardar
        };

        setArticulo(articuloParaFormulario); // Actualizamos el estado centralizado
        
        const nuevoMensaje = {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: "¡Artículo generado! Revisa y completa los datos en el formulario.",
          marcaTiempo: Date.now()
        };

        setListaMensajes(prev => [...prev, nuevoMensaje]);
        setPasoActual(2);

      } else if (respuestaAgente) {
        const nuevoMensajeAgente = {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: respuestaAgente,
          marcaTiempo: Date.now()
        };
        setListaMensajes(prev => [...prev, nuevoMensajeAgente]);

      } else {
        const mensajeError = errorParseo || 'No se recibió una respuesta válida.';
        const nuevoMensajeAgente = {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: `Lo siento, hubo un problema: ${mensajeError}`,
          marcaTiempo: Date.now()
        };
        setListaMensajes(prev => [...prev, nuevoMensajeAgente]);
        console.error(mensajeError, data);
      }

    } catch (error) {
      setMensajeError('Hubo un problema al contactar al asistente de IA. Inténtalo de nuevo.');
      console.error('Error al enviar mensaje a N8N:', error);
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
            articulo={articulo} // Pasamos el artículo del estado
            onArticuloChange={setArticulo} // Pasamos la función para actualizar el estado
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
  onArticuloGenerado: PropTypes.func,
  articuloParaEditar: PropTypes.object
};

export default CrearArticuloIA;