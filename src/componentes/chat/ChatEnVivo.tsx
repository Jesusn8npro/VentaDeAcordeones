import React, { useState, useEffect, useRef, useCallback, useContext } from 'react'
import { X, Send, MessageCircle, Bot } from 'lucide-react'
import { useAuth } from '../../contextos/ContextoAutenticacion'
import './ChatEnVivo.css'
import { clienteSupabase, obtenerSessionId } from '../../configuracion/supabase'
import { useCarrito } from '../../contextos/CarritoContext';

const WEBHOOK_URL = 'https://velostrategix-n8n.lnrubg.easypanel.host/webhook/chat_en_vivo'

const tiposConsulta = [
  { valor: 'general', texto: 'Consulta general' },
  { valor: 'productos', texto: 'Información sobre productos' },
  { valor: 'precios', texto: 'Precios y ofertas' },
  { valor: 'envios', texto: 'Envíos y entregas' },
  { valor: 'devolucion', texto: 'Devoluciones' },
  { valor: 'tecnico', texto: 'Soporte técnico' },
  { valor: 'otro', texto: 'Otro tema' }
]

export default function ChatEnVivo() {
  const { usuario } = useAuth()
  const { modalAbierto } = useCarrito();
  
  // Estados principales
  const [chatAbierto, setChatAbierto] = useState(false)
  const [mensajes, setMensajes] = useState([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [chatId, setChatId] = useState('')
  const [contadorNoLeidos, setContadorNoLeidos] = useState(0)
  const [imagenPopup, setImagenPopup] = useState(null)
  
  // Datos usuario
  const [datosUsuario, setDatosUsuario] = useState({
    nombre: '',
    email: '',
    whatsapp: '',
    tipoConsulta: 'general'
  })
  const [mostrarModalDatos, setMostrarModalDatos] = useState(false)
  const [perfilCompleto, setPerfilCompleto] = useState(false)
  
  const contenedorMensajesRef = useRef(null)
  const inputMensajeRef = useRef(null)

  // Utilidades
  const esUrlImagen = (url) => {
    if (!url || typeof url !== 'string') return false
    const patronesImagen = [
      /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i,
      /\/image\//i,
      /cloudinary\.com/i,
      /imgur\.com/i,
      /unsplash\.com/i,
      /supabase\.co.*storage/i
    ]
    return patronesImagen.some(patron => patron.test(url))
  }

  const extraerUrls = (texto) => {
    if (!texto) return []
    const urls = texto.match(/(https?:\/\/[^\s]+)/g) || []
    return urls.map(url => ({
      url: url.replace(/[.,;!?)\]}]+$/, ''),
      esImagen: esUrlImagen(url)
    }))
  }

  const limpiarTextoDescriptivo = (texto) => {
    if (!texto) return texto
    const patronesDescriptivos = [
      /\*\*Imagen Principal\*\*:?\s*/gi,
      /\*\*Imagen Secundaria \d+\*\*:?\s*/gi,
      /\d+\.\s*\*\*Imagen Secundaria \d+\*\*:?\s*/gi,
      /¡Detalle\s*/gi,
      /Te muestro las fotos:?\s*/gi,
      /Aquí tienes las imágenes:?\s*/gi,
      /\)\s*$/g
    ]
    
    let textoLimpio = texto
    patronesDescriptivos.forEach(patron => {
      textoLimpio = textoLimpio.replace(patron, '')
    })
    return textoLimpio.trim()
  }

  // Renderizado de contenido con imágenes
  const renderizarContenidoMensaje = (texto) => {
    if (!texto) return null
    
    const textoLimpio = limpiarTextoDescriptivo(texto)
    const urls = extraerUrls(textoLimpio)
    const urlsImagen = urls.filter(u => u.esImagen)
    
    if (urlsImagen.length === 0) {
      return <span>{textoLimpio}</span>
    }
    
    const soloImagenes = urlsImagen.length > 0 && 
                        textoLimpio.split(/\s+/).every(palabra => 
                          urlsImagen.some(u => palabra.includes(u.url)) || palabra.trim() === ''
                        )

    if (soloImagenes) {
      return (
        <div>
          {urlsImagen.map((urlInfo, index) => (
            <div key={index} className="contenedor-imagen-chat">
              <img 
                src={urlInfo.url}
                alt=""
                className="imagen-chat"
                onClick={() => setImagenPopup(urlInfo.url)}
                onError={(e) => e.target.style.display = 'none'}
                onLoad={() => {
                  setTimeout(() => {
                    if (contenedorMensajesRef.current) {
                      contenedorMensajesRef.current.scrollTop = contenedorMensajesRef.current.scrollHeight
                    }
                  }, 100)
                }}
              />
            </div>
          ))}
        </div>
      )
    }
    
    let contenido = textoLimpio
    const elementos = []
    
    urlsImagen.forEach((urlInfo, index) => {
      const placeholder = `__IMAGEN_${index}__`
      contenido = contenido.replace(urlInfo.url, placeholder)
    })
    
    const partes = contenido.split(/(__IMAGEN_\d+__)/g)
    
    partes.forEach((parte, index) => {
      const matchImagen = parte.match(/^__IMAGEN_(\d+)__$/)
      
      if (matchImagen) {
        const indiceImagen = parseInt(matchImagen[1])
        const urlImagen = urlsImagen[indiceImagen]?.url
        
        if (urlImagen) {
          elementos.push(
            <div key={index} className="contenedor-imagen-chat">
              <img 
                src={urlImagen}
                alt=""
                className="imagen-chat"
                onClick={() => setImagenPopup(urlImagen)}
                onError={(e) => e.target.style.display = 'none'}
                onLoad={() => {
                  setTimeout(() => {
                    if (contenedorMensajesRef.current) {
                      contenedorMensajesRef.current.scrollTop = contenedorMensajesRef.current.scrollHeight
                    }
                  }, 100)
                }}
              />
            </div>
          )
        }
      } else if (parte.trim() && !urlsImagen.some(u => parte.includes(u.url))) {
        elementos.push(<span key={index}>{parte}</span>)
      }
    })
    
    return elementos.length > 0 ? elementos : <span>{textoLimpio}</span>
  }

  // Persistencia local
  const guardarDatosLocal = useCallback((datos) => {
    try {
      localStorage.setItem('mellevesto_chat_datos', JSON.stringify(datos))
    } catch (error) {
      console.warn('Error guardando datos:', error)
    }
  }, [])

  const cargarDatosLocal = useCallback(() => {
    try {
      const datos = localStorage.getItem('mellevesto_chat_datos')
      return datos ? JSON.parse(datos) : null
    } catch (error) {
      return null
    }
  }, [])

  // Mapeo de datos
  const mapRegistroAMensaje = (registro) => {
    try {
      const raw = registro?.message ?? registro?.message_json
      const msg = typeof raw === 'string' ? JSON.parse(raw) : raw
      if (!msg) return null
      
      const esUsuario = msg.type === 'human' || msg.type === 'user'
      const texto = msg.content ?? msg.text ?? ''
      const ts = msg.timestamp ?? registro.created_at ?? new Date().toISOString()
      
      return {
        id: `sb_${registro.id}`,
        texto,
        esUsuario,
        timestamp: new Date(ts),
        tipo: msg.tipo || 'texto'
      }
    } catch {
      return null
    }
  }

  // Carga de datos
  const cargarHistorial = async (sessionId) => {
    try {
      if (!sessionId) return []
      
      const { data, error } = await clienteSupabase
        .from('chats_de_la_web')
        .select('id, session_id, message, message_json, created_at')
        .eq('session_id', sessionId)
        .order('id', { ascending: true })
        .limit(100)
        
      if (error || !data) return []
      
      return data.map(mapRegistroAMensaje).filter(Boolean)
    } catch {
      return []
    }
  }

  const registrarLead = async (datos, sessionId) => {
    try {
      await clienteSupabase
        .from('leadschat')
        .upsert({
          chat_id: sessionId,
          nombre: datos.nombre,
          email: datos.email,
          whatsapp: datos.whatsapp,
          tipo_consulta: datos.tipoConsulta,
          updated_at: new Date().toISOString()
        }, { onConflict: 'email' })
    } catch (error) {
      console.warn('Error registrando lead:', error)
    }
  }

  // Webhook
  const enviarMensajeWebhook = async (mensaje, sessionId, datos) => {
    try {
      const datosCompletos = datos || datosUsuario
      
      const payload = {
        chat_id: sessionId,
        mensaje_del_usuario: mensaje,
        email_usuario: datosCompletos.email || usuario?.email || '',
        nombre: datosCompletos.nombre || usuario?.user_metadata?.full_name || '',
        apellido: '',
        whatsapp: datosCompletos.whatsapp || '',
        ciudad: '',
        direccion: '',
        pagina_origen: window.location.href,
        timestamp: new Date().toISOString(),
        autenticado: !!usuario
      }

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Error enviando mensaje al webhook:', error)
      throw error
    }
  }

  // Manejo de mensajes
  const agregarMensaje = useCallback((mensaje) => {
    setMensajes(prev => {
      const existe = prev.some(m => m.id === mensaje.id)
      if (existe) return prev
      return [...prev, mensaje]
    })
  }, [])

  const manejarEnvio = async (e) => {
    e.preventDefault()
    
    if (!nuevoMensaje.trim()) return

    const mensaje = {
      id: `user_${Date.now()}`,
      texto: nuevoMensaje.trim(),
      esUsuario: true,
      timestamp: new Date(),
      tipo: 'texto'
    }

    agregarMensaje(mensaje)
    setNuevoMensaje('')
    setEscribiendo(true)

    try {
      const respuestaWebhook = await enviarMensajeWebhook(mensaje.texto, chatId, datosUsuario)
      
      // Extraer respuesta del bot
      let textoRespuesta = null
      
      if (respuestaWebhook) {
        if (respuestaWebhook.respuesta_final) {
          textoRespuesta = respuestaWebhook.respuesta_final
        } else if (respuestaWebhook.response) {
          textoRespuesta = respuestaWebhook.response
        } else if (respuestaWebhook.message) {
          textoRespuesta = respuestaWebhook.message
        } else if (respuestaWebhook.texto) {
          textoRespuesta = respuestaWebhook.texto
        } else if (typeof respuestaWebhook === 'string') {
          textoRespuesta = respuestaWebhook
        } else if (respuestaWebhook.data) {
          textoRespuesta = respuestaWebhook.data.respuesta_final || 
                          respuestaWebhook.data.response || 
                          respuestaWebhook.data.message
        } else {
          // Buscar en todas las propiedades
          const keys = Object.keys(respuestaWebhook)
          for (const key of keys) {
            const value = respuestaWebhook[key]
            if (typeof value === 'string' && value.trim().length > 0) {
              textoRespuesta = value
              break
            }
          }
        }
      }
      
      if (textoRespuesta && textoRespuesta.trim()) {
        const mensajeBot = {
          id: `bot_${Date.now()}`,
          texto: textoRespuesta.trim(),
          esUsuario: false,
          timestamp: new Date(),
          tipo: 'texto'
        }
        agregarMensaje(mensajeBot)
      } else {
        const mensajeFallback = {
          id: `bot_${Date.now()}`,
          texto: 'Disculpa, hubo un problema procesando tu mensaje. ¿Podrías intentar de nuevo?',
          esUsuario: false,
          timestamp: new Date(),
          tipo: 'texto'
        }
        agregarMensaje(mensajeFallback)
      }
    } catch (error) {
      console.error('Error procesando respuesta del webhook:', error)
      
      const mensajeError = {
        id: `bot_${Date.now()}`,
        texto: 'Lo siento, no pude procesar tu mensaje en este momento. Por favor, inténtalo de nuevo.',
        esUsuario: false,
        timestamp: new Date(),
        tipo: 'texto'
      }
      agregarMensaje(mensajeError)
    } finally {
      setEscribiendo(false)
    }
  }

  // Inicialización
  const inicializarChat = useCallback(async () => {
    try {
      const sessionId = await obtenerSessionId()
      setChatId(sessionId)

      const datosGuardados = cargarDatosLocal()
      if (datosGuardados) {
        setDatosUsuario(datosGuardados)
        setPerfilCompleto(true)
      } else if (usuario?.email) {
        setDatosUsuario(prev => ({
          ...prev,
          email: usuario.email || '',
          nombre: usuario.user_metadata?.full_name || ''
        }))
      }

      const historial = await cargarHistorial(sessionId)
      if (historial.length > 0) {
        setMensajes(historial)
      } else {
        const bienvenida = {
          id: 'bienvenida',
          texto: '¡Hola! 👋 Soy tu asistente virtual de ME LLEVO ESTO. ¿En qué puedo ayudarte hoy?',
          esUsuario: false,
          timestamp: new Date(),
          tipo: 'sistema'
        }
        setMensajes([bienvenida])
      }
    } catch (error) {
      console.warn('Error inicializando chat:', error)
    }
  }, [usuario, cargarDatosLocal])

  // Scroll automático
  const scrollAlFinal = useCallback(() => {
    if (contenedorMensajesRef.current) {
      contenedorMensajesRef.current.scrollTop = contenedorMensajesRef.current.scrollHeight
    }
  }, [])

  // Efectos
  useEffect(() => {
    if (chatAbierto) {
      inicializarChat()
    }
  }, [chatAbierto, inicializarChat])

  useEffect(() => {
    scrollAlFinal()
  }, [mensajes, scrollAlFinal])

  useEffect(() => {
    if (chatAbierto && inputMensajeRef.current) {
      inputMensajeRef.current.focus()
    }
  }, [chatAbierto])

  // Manejo de modal
  const manejarDatosModal = async (datos) => {
    setDatosUsuario(datos)
    setPerfilCompleto(true)
    guardarDatosLocal(datos)
    setMostrarModalDatos(false)
    
    await registrarLead(datos, chatId)
    
    const confirmacion = {
      id: `confirmacion_${Date.now()}`,
      texto: `¡Perfecto, ${datos.nombre}! 🎉 Ya tengo tus datos. ¿En qué más puedo ayudarte?`,
      esUsuario: false,
      timestamp: new Date(),
      tipo: 'sistema'
    }
    agregarMensaje(confirmacion)
  }

  const toggleChat = () => {
    setChatAbierto(!chatAbierto)
    if (!chatAbierto) {
      setContadorNoLeidos(0)
    }
  }

  if (modalAbierto) {
    return null;
  }

  return (
    <>
      <div className={`contenedor-widget-chat ${chatAbierto ? 'chat-abierto' : ''}`}>
        {!chatAbierto && (
          <button
            onClick={toggleChat}
            className="boton-toggle-chat"
            aria-label="Abrir chat"
          >
            <MessageCircle size={28} />
            {contadorNoLeidos > 0 && (
              <span className="badge-notificacion-chat">
                {contadorNoLeidos > 9 ? '9+' : contadorNoLeidos}
              </span>
            )}
          </button>
        )}

        {chatAbierto && (
          <div className="ventana-chat">
            <div className="header-chat">
              <div className="avatar-chat">
                <Bot size={24} />
              </div>
              <div className="info-chat">
                <h3>ME LLEVO ESTO</h3>
                <p>Asistente Virtual</p>
              </div>
              <button
                onClick={toggleChat}
                className="boton-cerrar-chat"
                aria-label="Cerrar chat"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mensajes-chat" ref={contenedorMensajesRef}>
              {mensajes.length === 0 ? (
                <div className="pantalla-bienvenida">
                  <h3>¡Hola! 👋</h3>
                  <p>Soy tu asistente virtual. ¿En qué puedo ayudarte?</p>
                </div>
              ) : (
                mensajes.map((mensaje) => (
                  <div 
                    key={mensaje.id} 
                    className={`mensaje ${mensaje.esUsuario ? 'usuario' : 'bot'}`}
                  >
                    <div className="contenido-mensaje">
                      {renderizarContenidoMensaje(mensaje.texto)}
                    </div>
                  </div>
                ))
              )}

              {escribiendo && (
                <div className="mensaje bot">
                  <div className="escribiendo">
                    <div className="puntos-escribiendo">
                      <div className="punto"></div>
                      <div className="punto"></div>
                      <div className="punto"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={manejarEnvio} className="formulario-entrada-chat">
              <input
                ref={inputMensajeRef}
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="entrada-chat"
                disabled={escribiendo}
              />
              <button
                type="submit"
                className="boton-enviar-chat"
                disabled={!nuevoMensaje.trim() || escribiendo}
                aria-label="Enviar mensaje"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Popup de imagen */}
      {imagenPopup && (
        <div className="popup-imagen-overlay" onClick={() => setImagenPopup(null)}>
          <div className="popup-imagen-contenido" onClick={(e) => e.stopPropagation()}>
            <button 
              className="boton-cerrar-popup"
              onClick={() => setImagenPopup(null)}
              aria-label="Cerrar imagen"
            >
              <X size={24} />
            </button>
            <img 
              src={imagenPopup} 
              alt="Imagen ampliada" 
              className="imagen-popup"
            />
          </div>
        </div>
      )}

      {/* Modal de datos de usuario */}
      {mostrarModalDatos && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <h3>Cuéntanos sobre ti</h3>
            <form onSubmit={(e) => {
              e.preventDefault()
              manejarDatosModal(datosUsuario)
            }}>
              <div className="grupo-input">
                <label>Nombre completo</label>
                <input
                  type="text"
                  value={datosUsuario.nombre}
                  onChange={(e) => setDatosUsuario(prev => ({ ...prev, nombre: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grupo-input">
                <label>Email</label>
                <input
                  type="email"
                  value={datosUsuario.email}
                  onChange={(e) => setDatosUsuario(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
              
              <div className="grupo-input">
                <label>WhatsApp</label>
                <input
                  type="tel"
                  value={datosUsuario.whatsapp}
                  onChange={(e) => setDatosUsuario(prev => ({ ...prev, whatsapp: e.target.value }))}
                  placeholder="3001234567"
                  required
                />
              </div>
              
              <div className="grupo-input">
                <label>Tipo de consulta</label>
                <select
                  value={datosUsuario.tipoConsulta}
                  onChange={(e) => setDatosUsuario(prev => ({ ...prev, tipoConsulta: e.target.value }))}
                  required
                >
                  {tiposConsulta.map(tipo => (
                    <option key={tipo.valor} value={tipo.valor}>
                      {tipo.texto}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="botones-modal">
                <button
                  type="button"
                  onClick={() => setMostrarModalDatos(false)}
                  className="boton-modal boton-secundario"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="boton-modal boton-primario"
                >
                  Continuar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}