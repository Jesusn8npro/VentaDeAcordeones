import React, { useState, useEffect, useRef } from 'react'
import { 
  Send, 
  Loader2, 
  Camera, 
  Upload,
  MessageCircle,
  Sparkles,
  AlertCircle,
  X,
  User,
  Bot,
  Zap,
  Wand2,
  Image
} from 'lucide-react'
import { clienteSupabase } from '../../../../configuracion/supabase'
import './ChatImagenesIAInline.css'

const ChatImagenesIAInline = ({ 
  producto,
  onImagenesGeneradas 
}) => {
  // Configuración y refs
  const STORAGE_PREFIX = 'mllevo:chat-ia:'
  const CHANNEL_NAME = 'mllevo_chat_ia'
  const clientIdRef = useRef('tab-' + Math.random().toString(36).slice(2))
  
  const [sessionId] = useState(() => {
    const productoId = producto?.id ? String(producto.id) : 'sin-producto'
    const path = typeof window !== 'undefined' ? window.location.pathname : 'root'
    return `img:${productoId}:${path}`
  })

  const canalRef = useRef(null)
  const mensajesRef = useRef(null)
  const inputMensajeRef = useRef(null)
  const storageKey = `${STORAGE_PREFIX}${sessionId}`

  // Estados
  const [mensajes, setMensajes] = useState([])
  const [mensajeActual, setMensajeActual] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [imagenTemporal, setImagenTemporal] = useState(null)
  const [pieDeFoto, setPieDeFoto] = useState('')
  const [chatIniciado, setChatIniciado] = useState(false)

  // Persistencia
  const cargarPersistencia = () => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (!raw) return null
      const data = JSON.parse(raw)
      const mensajesRec = Array.isArray(data.mensajes)
        ? data.mensajes.map(m => ({ ...m, timestamp: m.timestamp ? new Date(m.timestamp) : new Date() }))
        : []
      return {
        mensajes: mensajesRec,
        mensajeActual: data.mensajeActual || '',
        chatIniciado: !!data.chatIniciado,
        imagenTemporal: data.imagenTemporal || null,
        pieDeFoto: data.pieDeFoto || ''
      }
    } catch (e) {
      return null
    }
  }

  const guardarPersistencia = (estadoParcial = {}) => {
    try {
      const snapshot = {
        mensajes: mensajes.map(m => ({ ...m, timestamp: m.timestamp ? m.timestamp.toISOString() : new Date().toISOString() })),
        mensajeActual,
        chatIniciado,
        imagenTemporal,
        pieDeFoto,
        ...estadoParcial
      }
      localStorage.setItem(storageKey, JSON.stringify(snapshot))
      if (canalRef.current) {
        canalRef.current.postMessage({
          type: 'sync',
          sessionId,
          origin: clientIdRef.current,
          payload: snapshot
        })
      }
    } catch (e) {}
  }

  // Effects
  useEffect(() => {
    const datos = cargarPersistencia()
    if (datos) {
      setMensajes(datos.mensajes || [])
      setMensajeActual(datos.mensajeActual || '')
      setChatIniciado(!!datos.chatIniciado)
      setImagenTemporal(datos.imagenTemporal || null)
      setPieDeFoto(datos.pieDeFoto || '')
    }

    try {
      canalRef.current = new BroadcastChannel(CHANNEL_NAME)
      canalRef.current.onmessage = (evt) => {
        const { type, sessionId: s, origin, payload } = evt.data || {}
        if (type === 'sync' && s === sessionId && origin !== clientIdRef.current && payload) {
          setMensajes((payload.mensajes || []).map(m => ({ ...m, timestamp: m.timestamp ? new Date(m.timestamp) : new Date() })))
          setMensajeActual(payload.mensajeActual || '')
          setChatIniciado(!!payload.chatIniciado)
          setImagenTemporal(payload.imagenTemporal || null)
          setPieDeFoto(payload.pieDeFoto || '')
        }
      }
    } catch (e) {}

    const onStorage = (e) => {
      if (e.key === storageKey && e.newValue) {
        try {
          const data = JSON.parse(e.newValue)
          setMensajes((data.mensajes || []).map(m => ({ ...m, timestamp: m.timestamp ? new Date(m.timestamp) : new Date() })))
          setMensajeActual(data.mensajeActual || '')
          setChatIniciado(!!data.chatIniciado)
          setImagenTemporal(data.imagenTemporal || null)
          setPieDeFoto(data.pieDeFoto || '')
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    
    return () => {
      window.removeEventListener('storage', onStorage)
      if (canalRef.current) canalRef.current.close()
    }
  }, [sessionId, storageKey])

  useEffect(() => {
    const t = setTimeout(() => guardarPersistencia(), 250)
    return () => clearTimeout(t)
  }, [mensajes, mensajeActual, chatIniciado, imagenTemporal, pieDeFoto])

  useEffect(() => {
    if (mensajesRef.current) {
      mensajesRef.current.scrollTop = mensajesRef.current.scrollHeight
    }
  }, [mensajes])

  // Funciones
  const inicializarChat = () => {
    setChatIniciado(true)
    
    const nombreProducto = producto?.nombre === 'Producto sin nombre' ? 'tu producto' : producto?.nombre
    
    const mensajeBienvenida = {
      id: Date.now(),
      tipo: 'ia',
      texto: `¡Hola! 👋 Soy tu asistente de imágenes con IA.

Voy a ayudarte a generar imágenes increíbles para **${nombreProducto}**.

**¿Qué puedo hacer?**
🎨 Generar imágenes profesionales
📸 Crear variaciones de estilo
🖼️ Combinar imágenes
✨ Editar imágenes

**¿Qué tipo de imagen quieres crear?**`,
      timestamp: new Date(),
      imagenes: []
    }
    
    setMensajes([mensajeBienvenida])
    guardarPersistencia({ mensajes: [ { ...mensajeBienvenida, timestamp: mensajeBienvenida.timestamp.toISOString() } ] })
  }

  const enviarMensaje = async () => {
    if (!mensajeActual.trim() || cargando) return

    try {
      setCargando(true)
      setError('')

      const mensajeUsuario = {
        id: Date.now(),
        tipo: 'usuario',
        texto: mensajeActual,
        timestamp: new Date()
      }
      
      setMensajes(prev => [...prev, mensajeUsuario])
      const textoMensaje = mensajeActual
      setMensajeActual('')
      guardarPersistencia()

      const datosWebhook = {
        session_id: sessionId,
        message: textoMensaje,
        producto_info: {
          id: producto?.id,
          nombre: producto?.nombre,
          descripcion: producto?.descripcion,
          categoria_id: producto?.categoria_id,
          fotos_principales: producto?.fotos_principales || [],
          fotos_secundarias: producto?.fotos_secundarias || []
        },
        timestamp: new Date().toISOString()
      }

      console.log('🚀 Enviando a N8N:', datosWebhook)

      const webhookUrl = 'https://velostrategix-n8n.lnrubg.easypanel.host/webhook-test/generar-imagenes-ia'
      
      const respuesta = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosWebhook)
      })

      if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`)

      const resultado = await respuesta.json()
      console.log('📥 Respuesta de N8N:', resultado)

      const mensajeIA = {
        id: Date.now() + 1,
        tipo: 'ia',
        texto: resultado.output || resultado.message || 'Procesado exitosamente',
        timestamp: new Date(),
        imagenes: resultado.imagenes || []
      }

      setMensajes(prev => [...prev, mensajeIA])
      guardarPersistencia()

      if (resultado.imagenes?.length > 0) {
        onImagenesGeneradas?.(resultado.imagenes)
      }

    } catch (error) {
      console.error('❌ Error:', error)
      setError(error.message)
      
      const mensajeError = {
        id: Date.now() + 1,
        tipo: 'error',
        texto: `Error: ${error.message}`,
        timestamp: new Date()
      }
      setMensajes(prev => [...prev, mensajeError])
    } finally {
      setCargando(false)
    }
  }

  const subirImagenASupabase = async (archivo) => {
    try {
      const nombreArchivo = `chat-imagenes/${Date.now()}-${archivo.name}`
      
      const { data, error } = await clienteSupabase.storage
        .from('imagenes')
        .upload(nombreArchivo, archivo)
      
      if (error) throw error
      
      const { data: urlData } = clienteSupabase.storage
        .from('imagenes')
        .getPublicUrl(nombreArchivo)
      
      return urlData.publicUrl
    } catch (error) {
      console.error('Error subiendo a Supabase:', error)
      throw error
    }
  }

  const manejarSubidaImagen = async (evento) => {
    const archivo = evento.target.files[0]
    if (!archivo) return

    try {
      setCargando(true)
      
      try {
        const urlSupabase = await subirImagenASupabase(archivo)
        console.log('✅ Imagen en Supabase:', urlSupabase)
        
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagenTemporal({
            base64: e.target.result,
            url: urlSupabase,
            nombre: archivo.name
          })
          setPieDeFoto('')
          setCargando(false)
        }
        reader.readAsDataURL(archivo)
        
      } catch (supabaseError) {
        console.warn('⚠️ Fallback a base64:', supabaseError.message)
        
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagenTemporal({
            base64: e.target.result,
            url: e.target.result,
            nombre: archivo.name
          })
          setPieDeFoto('')
          setCargando(false)
        }
        reader.readAsDataURL(archivo)
      }
      
    } catch (error) {
      setError('Error procesando imagen: ' + error.message)
      setCargando(false)
    }
  }

  const enviarImagenConPie = async () => {
    if (!imagenTemporal) return

    try {
      setCargando(true)
      setError('')

      const mensajeImagen = {
        id: Date.now(),
        tipo: 'usuario',
        texto: pieDeFoto.trim() || 'Imagen enviada',
        timestamp: new Date(),
        imagenes: [imagenTemporal.url]
      }
      
      setMensajes(prev => [...prev, mensajeImagen])

      const esUrlSupabase = imagenTemporal.url.startsWith('http')
      
      const datosWebhook = {
        session_id: sessionId,
        message: pieDeFoto.trim() || 'Imagen enviada',
        ...(esUrlSupabase ? 
          { image_url: imagenTemporal.url } : 
          { image: imagenTemporal.url }
        ),
        producto_info: {
          id: producto?.id,
          nombre: producto?.nombre,
          descripcion: producto?.descripcion
        },
        timestamp: new Date().toISOString()
      }

      console.log('🖼️ Enviando imagen:', datosWebhook)

      const webhookUrl = 'https://velostrategix-n8n.lnrubg.easypanel.host/webhook/generar-imagenes-ia'
      
      const respuesta = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosWebhook)
      })

      if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`)

      const resultado = await respuesta.json()
      console.log('📥 Respuesta:', resultado)

      const respuestaIA = {
        id: Date.now() + 1,
        tipo: 'ia',
        texto: resultado.output || resultado.message || 'Imagen procesada',
        timestamp: new Date(),
        imagenes: resultado.imagenes || []
      }
      
      setMensajes(prev => [...prev, respuestaIA])
      
      if (resultado.imagenes?.length > 0) {
        onImagenesGeneradas?.(resultado.imagenes)
      }

    } catch (error) {
      console.error('❌ Error:', error)
      setError(error.message)
      
      const mensajeError = {
        id: Date.now() + 1,
        tipo: 'error',
        texto: `Error: ${error.message}`,
        timestamp: new Date()
      }
      setMensajes(prev => [...prev, mensajeError])
    } finally {
      setCargando(false)
      setImagenTemporal(null)
      setPieDeFoto('')
    }
  }

  const cancelarImagen = () => {
    setImagenTemporal(null)
    setPieDeFoto('')
  }

  const manejarKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  return (
    <div className="chat-imagenes-ia-inline">
      {/* Header */}
      <div className="chat-header-inline">
        <div className="chat-titulo-inline">
          <div className="chat-titulo-icono">
            <Wand2 size={24} />
          </div>
          <div className="chat-titulo-texto">
            <h3>Chat de Imágenes IA</h3>
            <div className="chat-subtitulo">
              {producto?.nombre || 'Producto sin nombre'}
            </div>
          </div>
        </div>
        <div className="chat-header-badge">
          <div className="badge-dot"></div>
          <span>Activo</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="chat-contenido-inline">
        {!chatIniciado ? (
          <div className="chat-welcome-inline">
            <div className="welcome-icon">
              <Sparkles size={48} />
            </div>
            <h3>¡Genera Imágenes Increíbles!</h3>
            <p>
              Usa IA para crear imágenes profesionales para tu producto en segundos
            </p>
            <button className="start-chat-btn" onClick={inicializarChat}>
              <Wand2 size={20} />
              Comenzar Ahora
            </button>
          </div>
        ) : (
          <>
            {/* Mensajes */}
            <div className="chat-mensajes-inline" ref={mensajesRef}>
              {mensajes.map((mensaje) => (
                <div key={mensaje.id} className={`mensaje ${mensaje.tipo}`}>
                  <div className="mensaje-avatar">
                    {mensaje.tipo === 'usuario' ? (
                      <User size={18} />
                    ) : mensaje.tipo === 'error' ? (
                      <AlertCircle size={18} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>
                  
                  <div className="mensaje-contenido">
                    <div className="mensaje-texto">{mensaje.texto}</div>
                    
                    {mensaje.imagenes?.length > 0 && (
                      <div className="mensaje-imagenes">
                        {mensaje.imagenes.map((img, i) => (
                          <div key={`${mensaje.id}-img-${i}`} className="imagen-generada">
                            <img src={img} alt={`Generada ${i + 1}`} />
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mensaje-tiempo">
                      {mensaje.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                </div>
              ))}
              
              {cargando && (
                <div className="mensaje ia">
                  <div className="mensaje-avatar">
                    <Bot size={18} />
                  </div>
                  <div className="mensaje-contenido">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="chat-error">
                <AlertCircle size={20} />
                <span>{error}</span>
              </div>
            )}

            {/* Preview */}
            {imagenTemporal && (
              <div className="preview-imagen-pie">
                <div className="preview-header">
                  <span>Vista Previa</span>
                  <button className="preview-close" onClick={cancelarImagen}>
                    <X size={20} />
                  </button>
                </div>
                <div className="preview-contenido">
                  <div className="imagen-preview">
                    <img src={imagenTemporal.base64} alt="Preview" />
                  </div>
                  <div className="pie-foto-contenedor">
                    <label>Descripción:</label>
                    <textarea
                      value={pieDeFoto}
                      onChange={(e) => setPieDeFoto(e.target.value)}
                      placeholder="Describe qué quieres hacer con esta imagen..."
                    />
                  </div>
                </div>
                <button 
                  className="preview-send-button"
                  onClick={enviarImagenConPie}
                  disabled={cargando}
                >
                  <Send size={18} />
                  Enviar Imagen
                </button>
              </div>
            )}

            {/* Input */}
            <div className="chat-input-area">
              <div className="chat-input-container">
                <input
                  type="file"
                  accept="image/*"
                  onChange={manejarSubidaImagen}
                  style={{ display: 'none' }}
                  id="upload-imagen"
                />
                <label htmlFor="upload-imagen" className="boton-subir-imagen">
                  <Image size={20} />
                </label>
                
                <textarea
                  ref={inputMensajeRef}
                  value={mensajeActual}
                  onChange={(e) => setMensajeActual(e.target.value)}
                  onKeyPress={manejarKeyPress}
                  placeholder="Describe la imagen que quieres generar..."
                  className="chat-input-texto"
                  rows={1}
                  disabled={cargando}
                />
                
                <button
                  onClick={enviarMensaje}
                  disabled={!mensajeActual.trim() || cargando}
                  className="boton-enviar-mensaje"
                >
                  {cargando ? (
                    <Loader2 size={20} className="icono-girando" />
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChatImagenesIAInline