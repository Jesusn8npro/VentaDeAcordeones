import React from 'react'
import {
  Send,
  Loader2,
  Image,
  MessageCircle,
  Sparkles,
  AlertCircle,
  X,
  User,
  Bot,
  Wand2,
} from 'lucide-react'

interface Mensaje {
  id: number
  tipo: 'usuario' | 'ia' | 'error'
  texto: string
  timestamp: Date
  imagenes?: string[]
}

interface ImagenTemporal {
  base64: string
  url: string
  nombre: string
}

interface ChatImagenesIAInlineUIProps {
  producto: { nombre?: string } | null
  chatIniciado: boolean
  mensajes: Mensaje[]
  mensajeActual: string
  cargando: boolean
  error: string
  imagenTemporal: ImagenTemporal | null
  pieDeFoto: string
  mensajesRef: React.RefObject<HTMLDivElement>
  inputMensajeRef: React.RefObject<HTMLTextAreaElement>
  setMensajeActual: (v: string) => void
  setPieDeFoto: (v: string) => void
  inicializarChat: () => void
  enviarMensaje: () => void
  manejarSubidaImagen: (e: React.ChangeEvent<HTMLInputElement>) => void
  enviarImagenConPie: () => void
  cancelarImagen: () => void
  manejarKeyPress: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void
}

const ChatImagenesIAInlineUI: React.FC<ChatImagenesIAInlineUIProps> = ({
  producto,
  chatIniciado,
  mensajes,
  mensajeActual,
  cargando,
  error,
  imagenTemporal,
  pieDeFoto,
  mensajesRef,
  inputMensajeRef,
  setMensajeActual,
  setPieDeFoto,
  inicializarChat,
  enviarMensaje,
  manejarSubidaImagen,
  enviarImagenConPie,
  cancelarImagen,
  manejarKeyPress,
}) => {
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

                    {mensaje.imagenes && mensaje.imagenes.length > 0 && (
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

export default ChatImagenesIAInlineUI
