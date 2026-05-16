import React from 'react'
import {
  Bot,
  User,
  Send,
  Loader2,
  CheckCircle,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Edit3,
  X,
  RotateCcw
} from 'lucide-react'

interface Mensaje {
  id: number
  tipo: string
  contenido: string
  marcaTiempo: number
  opciones?: any[]
  producto_sugerido?: any
}

interface CrearProductoIAUIProps {
  pasoActual: number
  listaMensajes: Mensaje[]
  textoMensaje: string
  estaCargando: boolean
  mensajeError: string
  productoCreado: Record<string, any> | null
  agenteProcesando: boolean
  campoEnEdicion: string | null
  valorEnEdicion: string
  referenciaChat: React.RefObject<HTMLDivElement>
  referenciaInput: React.RefObject<HTMLTextAreaElement>
  setTextoMensaje: (v: string) => void
  setValorEnEdicion: (v: string) => void
  setCampoEnEdicion: (v: string | null) => void
  setPasoActual: (v: number) => void
  limpiarConversacionCompleta: () => void
  transferirProductoAlFormulario: () => void
  iniciarEdicionDeCampo: (campo: string, valor: any) => void
  guardarCampoEditado: () => void
  enviarMensajeAlAgente: () => void
  manejarEnvioTecla: (e: React.KeyboardEvent) => void
  manejarOpcionSeleccionada: (opcion: any, productoSugerido: any) => void
  renderizarCampoEditable: (nombre: string, valor: any, etiqueta: string) => React.ReactNode
}

const CrearProductoIAUI: React.FC<CrearProductoIAUIProps> = ({
  pasoActual,
  listaMensajes,
  textoMensaje,
  estaCargando,
  mensajeError,
  productoCreado,
  agenteProcesando,
  campoEnEdicion,
  valorEnEdicion,
  referenciaChat,
  referenciaInput,
  setTextoMensaje,
  setValorEnEdicion,
  setCampoEnEdicion,
  setPasoActual,
  limpiarConversacionCompleta,
  transferirProductoAlFormulario,
  iniciarEdicionDeCampo,
  guardarCampoEditado,
  enviarMensajeAlAgente,
  manejarEnvioTecla,
  manejarOpcionSeleccionada,
  renderizarCampoEditable,
}) => {
  return (
    <div className="crear-producto-ia-fijo">
      <div className="crear-producto-ia">
        {/* Header del chat */}
        <div className="chat-header-inline">
          <div className="chat-titulo-inline">
            <div className="chat-titulo-icono">
              <Bot size={24} />
            </div>
            <div className="chat-titulo-texto">
              <h3>Creador de Productos IA</h3>
              <p className="chat-subtitulo">
                {agenteProcesando ? 'Procesando tu solicitud...' : 'Asistente inteligente activo'}
              </p>
            </div>
          </div>

          <button
            className="boton-limpiar-conversacion"
            onClick={limpiarConversacionCompleta}
            title="Nueva conversación"
          >
            <RotateCcw size={16} />
            Limpiar Chat
          </button>
        </div>

        {/* Contenido principal */}
        <div className="contenido-principal-ia">
          {pasoActual === 1 && listaMensajes.length === 1 && !productoCreado && (
            <div className="mensaje-bienvenida-ia">
              <div className="icono-bienvenida-ia">
                <Sparkles />
              </div>
              <h3>¡Bienvenido al Creador de Productos IA!</h3>
              <p>Describe el producto que quieres crear y nuestro asistente inteligente generará toda la información necesaria para tu tienda online.</p>
              <button
                className="boton-iniciar-chat-ia"
                onClick={() => referenciaInput.current?.focus()}
              >
                <MessageCircle size={18} />
                Comenzar Conversación
              </button>
            </div>
          )}

          {/* Área de mensajes */}
          {(pasoActual === 1 || productoCreado) && (
            <div className="area-mensajes-ia" ref={referenciaChat}>
              {listaMensajes.map((mensaje) => (
                <div key={mensaje.id} className={`mensaje-ia ${mensaje.tipo}`}>
                  <div className="contenido-mensaje-ia">
                    {mensaje.contenido}
                  </div>

                  {mensaje.tipo === 'agente_con_opciones' && mensaje.opciones && mensaje.opciones.length > 0 && (
                    <div className="opciones-interactivas-ia">
                      {mensaje.opciones.map((opcion, index) => (
                        <button
                          key={index}
                          className={`boton-opcion-ia ${opcion.tipo}`}
                          onClick={() => manejarOpcionSeleccionada(opcion, mensaje.producto_sugerido)}
                          disabled={estaCargando}
                        >
                          {opcion.icono && <span className="icono-opcion">{opcion.icono}</span>}
                          {opcion.texto}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {agenteProcesando && (
                <div className="indicador-escritura-ia">
                  <div className="puntos-escritura-ia">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span className="texto-escribiendo-ia">El asistente está escribiendo...</span>
                </div>
              )}
            </div>
          )}

          {/* Vista previa del producto */}
          {productoCreado && (
            <div className="vista-previa-producto-ia">
              <div className="titulo-vista-previa-ia">
                <CheckCircle size={20} />
                Producto Generado por IA
              </div>

              <div className="seccion-preview-ia">
                <h4 className="titulo-seccion-ia">📦 Información Básica</h4>
                {productoCreado.nombre && renderizarCampoEditable('nombre', productoCreado.nombre, 'Nombre del Producto')}
                {productoCreado.descripcion && renderizarCampoEditable('descripcion', productoCreado.descripcion, 'Descripción')}
                {productoCreado.precio && renderizarCampoEditable('precio', productoCreado.precio, 'Precio')}
                {productoCreado.categoria && renderizarCampoEditable('categoria', productoCreado.categoria, 'Categoría')}
              </div>

              <div className="seccion-preview-ia">
                <h4 className="titulo-seccion-ia">🎯 Elementos Persuasivos</h4>
                {productoCreado.ganchos && productoCreado.ganchos.length > 0 &&
                  renderizarCampoEditable('ganchos', productoCreado.ganchos, 'Ganchos Persuasivos')
                }
                {productoCreado.beneficios && productoCreado.beneficios.length > 0 &&
                  renderizarCampoEditable('beneficios', productoCreado.beneficios, 'Beneficios')
                }
                {productoCreado.ventajas && productoCreado.ventajas.length > 0 &&
                  renderizarCampoEditable('ventajas', productoCreado.ventajas, 'Ventajas Competitivas')
                }
              </div>

              {productoCreado.palabras_clave && productoCreado.palabras_clave.length > 0 && (
                <div className="seccion-preview-ia">
                  <h4 className="titulo-seccion-ia">🔍 SEO</h4>
                  {renderizarCampoEditable('palabras_clave', productoCreado.palabras_clave, 'Palabras Clave')}
                </div>
              )}

              <div className="seccion-preview-ia">
                <h4 className="titulo-seccion-ia">📊 Resumen de Generación</h4>
                <div className="creador-ia-estadisticas">
                  <div className="creador-ia-estadistica">
                    <span className="creador-ia-numero">{Object.keys(productoCreado).length}</span>
                    <span className="creador-ia-etiqueta">Campos generados</span>
                  </div>
                  <div className="creador-ia-estadistica">
                    <span className="creador-ia-numero">TEMU</span>
                    <span className="creador-ia-etiqueta">Plantilla aplicada</span>
                  </div>
                  <div className="creador-ia-estadistica">
                    <span className="creador-ia-numero">💾</span>
                    <span className="creador-ia-etiqueta">En localStorage</span>
                  </div>
                </div>
              </div>

              <div className="botones-accion-ia">
                <button
                  className="boton-usar-producto-ia"
                  onClick={transferirProductoAlFormulario}
                  disabled={estaCargando}
                >
                  <ArrowRight size={18} />
                  Usar este producto
                </button>

                <button
                  className="boton-continuar-conversacion-ia"
                  onClick={() => setPasoActual(1)}
                  disabled={estaCargando}
                >
                  <MessageCircle size={18} />
                  Continuar conversación
                </button>
              </div>
            </div>
          )}

          {/* Área de entrada */}
          {(pasoActual === 1 || (pasoActual === 3 && productoCreado)) && (
            <div className="area-entrada-ia">
              <form className="formulario-entrada-ia" onSubmit={(e) => e.preventDefault()}>
                <div className="contenedor-input-ia">
                  <textarea
                    ref={referenciaInput}
                    value={campoEnEdicion ? valorEnEdicion : textoMensaje}
                    onChange={(e) => campoEnEdicion ? setValorEnEdicion(e.target.value) : setTextoMensaje(e.target.value)}
                    onKeyPress={manejarEnvioTecla}
                    placeholder={
                      campoEnEdicion
                        ? `Editando ${campoEnEdicion}...`
                        : productoCreado
                          ? 'Continúa la conversación o pide modificaciones...'
                          : 'Describe el producto que quieres crear...'
                    }
                    className="input-mensaje-ia"
                    disabled={estaCargando || agenteProcesando}
                    rows={1}
                  />
                </div>
                <button
                  type="button"
                  onClick={campoEnEdicion ? guardarCampoEditado : enviarMensajeAlAgente}
                  disabled={estaCargando || agenteProcesando || (!textoMensaje.trim() && !campoEnEdicion)}
                  className="boton-enviar-ia"
                >
                  {estaCargando || agenteProcesando ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : campoEnEdicion ? (
                    <CheckCircle size={18} />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>

              {mensajeError && (
                <div className="mensaje-error-ia">
                  <X size={16} />
                  {mensajeError}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CrearProductoIAUI
