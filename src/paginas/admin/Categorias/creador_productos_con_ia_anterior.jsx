import { useState, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { 
  X, 
  Send, 
  Loader2, 
  Bot,
  User,
  CheckCircle,
  RotateCcw,
  Sparkles,
  MessageCircle,
  ArrowRight,
  Save,
  Edit3
} from 'lucide-react'

import './CrearProductoIA.css'

// Claves para localStorage
const CONVERSACION_KEY = 'creadorIA_conversacion'
const PRODUCTO_GENERADO_KEY = 'creadorIA_producto_generado'

const CrearProductoIA = ({ 
  onProductoCreado,
  categorias = []
}) => {
  // Estados principales
  const [paso, setPaso] = useState(() => {
    // Recuperar estado desde localStorage
    const conversacionGuardada = localStorage.getItem(CONVERSACION_KEY)
    const productoGuardado = localStorage.getItem(PRODUCTO_GENERADO_KEY)
    
    if (productoGuardado) return 3 // Vista previa
    if (conversacionGuardada) return 1 // Chat
    return 1 // Inicial
  })
  
  const [mensajes, setMensajes] = useState(() => {
    // Recuperar conversaciÃ³n desde localStorage
    try {
      const conversacionGuardada = localStorage.getItem(CONVERSACION_KEY)
      if (conversacionGuardada) {
        return JSON.parse(conversacionGuardada)
      }
    } catch (error) {
      console.error('Error al cargar conversaciÃ³n:', error)
    }
    return []
  })
  
  const [mensajeActual, setMensajeActual] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  
  const [productoGenerado, setProductoGenerado] = useState(() => {
    // Recuperar producto desde localStorage
    try {
      const productoGuardado = localStorage.getItem(PRODUCTO_GENERADO_KEY)
      if (productoGuardado) {
        return JSON.parse(productoGuardado)
      }
    } catch (error) {
      console.error('Error al cargar producto:', error)
    }
    return null
  })
  
  const [conversacionId, setConversacionId] = useState(() => {
    // Recuperar o generar ID de conversaciÃ³n
    const idGuardado = localStorage.getItem('creadorIA_conversacion_id')
    return idGuardado || `conv_${Date.now()}`
  })
  
  const [agentePensando, setAgentePensando] = useState(false)
  const [campoEditando, setCampoEditando] = useState(null)
  const [valorEditando, setValorEditando] = useState('')
  
  const chatRef = useRef(null)
  const inputRef = useRef(null)

  // Mensaje inicial del agente optimizado
  const mensajeInicial = useMemo(() => ({
    id: 1,
    tipo: 'agente',
    contenido: `Â¡Hola! ðŸ‘‹ Soy tu asistente especializado en crear productos sÃºper persuasivos.

Voy a hacerte algunas preguntas estratÃ©gicas para crear un producto completo con landing page estilo TEMU que convierta como loco.

**Â¿CuÃ¡l es el nombre de tu producto?** ðŸŽ¯

*Ejemplo: "Auriculares Bluetooth Pro Max"*`,
    timestamp: new Date()
  }), [])

  // Inicializar chat si no hay mensajes
  useEffect(() => {
    if (mensajes.length === 0) {
      const mensajesIniciales = [mensajeInicial]
      setMensajes(mensajesIniciales)
      // Guardar en localStorage
      localStorage.setItem(CONVERSACION_KEY, JSON.stringify(mensajesIniciales))
    }
    
    // Guardar ID de conversaciÃ³n
    localStorage.setItem('creadorIA_conversacion_id', conversacionId)
  }, [mensajes.length, mensajeInicial, conversacionId])

  // Guardar conversaciÃ³n en localStorage cada vez que cambie
  useEffect(() => {
    if (mensajes.length > 0) {
      localStorage.setItem(CONVERSACION_KEY, JSON.stringify(mensajes))
    }
  }, [mensajes])

  // Guardar producto en localStorage cada vez que cambie
  useEffect(() => {
    if (productoGenerado) {
      localStorage.setItem(PRODUCTO_GENERADO_KEY, JSON.stringify(productoGenerado))
    }
  }, [productoGenerado])

  // Auto-scroll del chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [mensajes, agentePensando])

  // Focus en input
  useEffect(() => {
    if (inputRef.current && !cargando) {
      inputRef.current.focus()
    }
  }, [cargando, agentePensando])

  // FunciÃ³n para limpiar localStorage
  const limpiarConversacion = () => {
    localStorage.removeItem(CONVERSACION_KEY)
    localStorage.removeItem(PRODUCTO_GENERADO_KEY)
    localStorage.removeItem('creadorIA_conversacion_id')
    setMensajes([mensajeInicial])
    setProductoGenerado(null)
    setPaso(1)
    setConversacionId(`conv_${Date.now()}`)
  }

  // FunciÃ³n para guardar producto final en Supabase
  const transferirAlFormulario = () => {
    if (productoGenerado && onProductoCreado) {
      console.log('ðŸŽ¯ Transfiriendo producto al formulario para ediciÃ³n:', productoGenerado)
      onProductoCreado(productoGenerado)
      // NO limpiar la conversaciÃ³n para que el usuario pueda seguir editando si quiere
    }
  }

  // FunciÃ³n para editar campo especÃ­fico
  const iniciarEdicionCampo = (campo, valor) => {
    setCampoEditando(campo)
    setValorEditando(Array.isArray(valor) ? valor.join(', ') : valor || '')
  }

  const guardarEdicionCampo = async () => {
    if (!campoEditando || !productoGenerado) return

    try {
      setCargando(true)
      
      // Preparar el mensaje para editar solo este campo
      const mensajeEdicion = `Necesito que modifiques ÃšNICAMENTE el campo "${campoEditando}" del producto. 

Valor actual: ${Array.isArray(productoGenerado[campoEditando]) ? 
  productoGenerado[campoEditando].join(', ') : 
  productoGenerado[campoEditando] || 'No definido'}

Nuevo valor solicitado: ${valorEditando}

IMPORTANTE: Responde SOLO con el JSON del producto completo actualizado, manteniendo todos los demÃ¡s campos exactamente iguales y modificando Ãºnicamente "${campoEditando}". Usa el formato ***PRODUCTO_LISTO*** seguido del JSON.`

      // Agregar mensaje del usuario
      const nuevoMensajeUsuario = {
        id: Date.now(),
        tipo: 'usuario',
        contenido: `Editar ${campoEditando}: ${valorEditando}`,
        timestamp: new Date()
      }

      setMensajes(prev => [...prev, nuevoMensajeUsuario])
      setAgentePensando(true)

      // Preparar contexto de conversaciÃ³n para ediciÃ³n en formato N8N
      const mensajesParaN8N = [...mensajes, nuevoMensajeUsuario].map(m => ({
        role: m.tipo === 'usuario' ? 'user' : 'assistant',
        content: m.contenido
      }))

      // Formato correcto que espera N8N
      const datosParaN8N = {
        conversacion_id: conversacionId,
        mensaje: mensajeEdicion,
        mensajes: mensajesParaN8N,
        categorias_disponibles: categorias || []
      }

      const response = await fetch('https://velostrategix-n8n.lnrubg.easypanel.host/webhook/crear_productos_conversacional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaN8N)
      })

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`)
      }

      const data = await response.json()
      console.log('ðŸ”„ Respuesta de ediciÃ³n:', data)

      if (data.tipo === 'producto_generado' && data.datos_producto) {
        // Actualizar producto con la ediciÃ³n
        setProductoGenerado(data.datos_producto)
        
        // Agregar respuesta del agente
        const mensajeAgente = {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: `âœ… Campo "${campoEditando}" actualizado correctamente.`,
          timestamp: new Date()
        }
        setMensajes(prev => [...prev, mensajeAgente])
        
        setCampoEditando(null)
        setValorEditando('')
      } else {
        // Respuesta conversacional
        const mensajeAgente = {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: data.respuesta_agente || 'Campo actualizado',
          timestamp: new Date()
        }
        setMensajes(prev => [...prev, mensajeAgente])
      }

    } catch (error) {
      console.error('âŒ Error en ediciÃ³n:', error)
      setError('Error al editar el campo. IntÃ©ntalo de nuevo.')
      
      const mensajeError = {
        id: Date.now() + 1,
        tipo: 'agente',
        contenido: 'âŒ Hubo un error al editar el campo. Por favor, intÃ©ntalo de nuevo.',
        timestamp: new Date()
      }
      setMensajes(prev => [...prev, mensajeError])
    } finally {
      setCargando(false)
      setAgentePensando(false)
    }
  }

  const cancelarEdicion = () => {
    setCampoEditando(null)
    setValorEditando('')
  }

  const enviarMensaje = async () => {
    if (!mensajeActual.trim() || cargando || agentePensando) return

    const nuevoMensajeUsuario = {
      id: Date.now(),
      tipo: 'usuario',
      contenido: mensajeActual.trim(),
      timestamp: new Date()
    }

    try {
      setMensajes(prev => [...prev, nuevoMensajeUsuario])
      setMensajeActual('')
      setAgentePensando(true)

      // Preparar contexto de la conversaciÃ³n en el formato correcto para N8N
      const mensajesParaN8N = [...mensajes, nuevoMensajeUsuario].map(m => ({
        role: m.tipo === 'usuario' ? 'user' : 'assistant',
        content: m.contenido
      }))

      // Formato correcto que espera N8N segÃºn el flujo
      const datosParaN8N = {
        conversacion_id: conversacionId,
        mensaje: nuevoMensajeUsuario.contenido,
        mensajes: mensajesParaN8N,
        categorias_disponibles: categorias || []
      }

      console.log('ðŸš€ Enviando mensaje al webhook (formato N8N):', datosParaN8N)

      const response = await fetch('https://velostrategix-n8n.lnrubg.easypanel.host/webhook/crear_productos_conversacional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaN8N)
      })

      console.log('ðŸŒ Status de la respuesta:', response.status)
      console.log('ðŸŒ Headers de la respuesta:', response.headers)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('âŒ Error en la respuesta:', errorText)
        throw new Error(`Error HTTP: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('ðŸ“¨ Respuesta completa del webhook:', JSON.stringify(data, null, 2))
      console.log('ðŸ“¨ Tipo de datos recibidos:', typeof data)
      console.log('ðŸ“¨ Es array?:', Array.isArray(data))
      
      // Log mÃ¡s detallado para debugging
      if (Array.isArray(data)) {
        console.log('ðŸ“¨ Longitud del array:', data.length)
        data.forEach((item, index) => {
          console.log(`ðŸ“¨ Elemento ${index}:`, item)
          if (item && typeof item === 'object') {
            console.log(`ðŸ“¨ Campos del elemento ${index}:`, Object.keys(item))
            if ('json_limpio' in item) {
              console.log(`ðŸ“¨ json_limpio en elemento ${index}:`, item.json_limpio)
              console.log(`ðŸ“¨ Tipo de json_limpio:`, typeof item.json_limpio)
            }
            if ('datos_producto' in item) {
              console.log(`ðŸ“¨ datos_producto en elemento ${index}:`, item.datos_producto)
            }
            if ('respuesta_agente' in item) {
              console.log(`ðŸ“¨ respuesta_agente en elemento ${index}:`, item.respuesta_agente)
            }
          }
        })
      } else if (data && typeof data === 'object') {
        console.log('ðŸ“¨ Campos del objeto:', Object.keys(data))
        if ('json_limpio' in data) {
          console.log('ðŸ“¨ json_limpio directo:', data.json_limpio)
        }
        if ('datos_producto' in data) {
          console.log('ðŸ“¨ datos_producto directo:', data.datos_producto)
        }
      }

      // Manejar respuesta - CORREGIDO para procesar json_limpio y producto_generado
      let productoExtraido = null
      
      console.log('ðŸ” Iniciando procesamiento de respuesta...')
      
      // Verificar si la respuesta es un array (formato del webhook)
      if (Array.isArray(data) && data.length > 0) {
        console.log('âœ… Es array con elementos')
        
        const primerElemento = data[0]
        console.log('ðŸ” Primer elemento:', primerElemento)
        
        // Prioridad 1: Usar producto_generado si existe (ya es un objeto)
        if (primerElemento && primerElemento.producto_generado) {
          console.log('âœ… Usando producto_generado (objeto directo):', primerElemento.producto_generado)
          productoExtraido = primerElemento.producto_generado
        }
        // Prioridad 2: Usar json_limpio si existe (necesita parsing)
        else if (primerElemento && primerElemento.json_limpio) {
          console.log('âœ… Tiene campo json_limpio:', primerElemento.json_limpio)
          try {
            // Limpiar el JSON antes de parsearlo
            let jsonLimpio = primerElemento.json_limpio
            
            // Remover la palabra clave si existe
            jsonLimpio = jsonLimpio.replace(/\*\*\*PRODUCTO_LISTO\*\*\*/g, '').trim()
            
            // Remover caracteres de escape innecesarios
            jsonLimpio = jsonLimpio.replace(/\\"/g, '"')
            
            // Si el JSON estÃ¡ envuelto en comillas, removerlas
            if (jsonLimpio.startsWith('"') && jsonLimpio.endsWith('"')) {
              jsonLimpio = jsonLimpio.slice(1, -1)
            }
            
            // Intentar encontrar el JSON vÃ¡lido si hay texto adicional
            const jsonMatch = jsonLimpio.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              jsonLimpio = jsonMatch[0]
            }
            
            console.log('ðŸ§¹ JSON despuÃ©s de limpieza:', jsonLimpio)
            
            // Extraer y parsear el JSON del campo json_limpio
            productoExtraido = JSON.parse(jsonLimpio)
            console.log('âœ… Producto extraÃ­do de json_limpio:', productoExtraido)
          } catch (parseError) {
            console.error('âŒ Error al parsear json_limpio:', parseError)
            console.error('âŒ Contenido que fallÃ³:', primerElemento.json_limpio)
            
            // Intentar parsear como string si es un JSON stringificado doble
            try {
              const jsonDecodificado = JSON.parse(primerElemento.json_limpio)
              if (typeof jsonDecodificado === 'string') {
                productoExtraido = JSON.parse(jsonDecodificado)
                console.log('âœ… Producto extraÃ­do despuÃ©s de doble parsing:', productoExtraido)
              }
            } catch (secondParseError) {
              console.error('âŒ Error en segundo intento de parsing:', secondParseError)
            }
          }
        }
        // Prioridad 3: Usar datos_producto como alternativa
        else if (primerElemento && primerElemento.datos_producto) {
          console.log('âœ… Usando datos_producto como alternativa')
          productoExtraido = primerElemento.datos_producto
        } else {
          console.log('âŒ No se encontrÃ³ producto_generado, json_limpio ni datos_producto en el primer elemento')
        }
      } 
      // Formato alternativo directo (no array)
      else if (data.tipo === 'producto_generado' && data.datos_producto) {
        console.log('âœ… Formato directo con datos_producto')
        productoExtraido = data.datos_producto
      } else {
        console.log('âŒ No se pudo identificar el formato de la respuesta')
      }

      console.log('ðŸŽ¯ Verificando si hay producto extraÃ­do:', !!productoExtraido)
      
      if (productoExtraido) {
        // Producto generado - guardar en localStorage, NO en Supabase
        console.log('ðŸŽ¯ Producto generado, guardando en localStorage...')
        console.log('ðŸŽ¯ Producto a guardar:', productoExtraido)
        
        setProductoGenerado(productoExtraido)
        console.log('ðŸŽ¯ Estado actualizado con setProductoGenerado')
        
        const mensajeExito = {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: 'ðŸŽ‰ Â¡Producto generado exitosamente! Puedes ver la vista previa abajo y usar el botÃ³n "Usar este producto" para pasarlo al formulario.',
          timestamp: new Date()
        }
        setMensajes(prev => [...prev, mensajeExito])
        console.log('ðŸŽ¯ Mensaje de Ã©xito agregado')
        
      } else {
        console.log('ðŸ”„ No hay producto, procesando como respuesta conversacional')
        // Respuesta conversacional normal
        const respuestaTexto = Array.isArray(data) && data.length > 0 ? 
          (data[0].respuesta_agente || data[0].mensaje || 'Respuesta recibida') :
          (data.respuesta_agente || data.mensaje || 'Respuesta recibida')
          
        console.log('ðŸ”„ Texto de respuesta:', respuestaTexto)
        
        const mensajeAgente = {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: respuestaTexto,
          timestamp: new Date()
        }
        setMensajes(prev => [...prev, mensajeAgente])
        console.log('ðŸ”„ Mensaje conversacional agregado')
      }

    } catch (error) {
      console.error('âŒ Error al enviar mensaje:', error)
      console.error('âŒ Tipo de error:', error.name)
      console.error('âŒ Mensaje de error:', error.message)
      console.error('âŒ Stack trace:', error.stack)
      
      // InformaciÃ³n adicional sobre el error de red
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('ðŸŒ Error de red - posible problema de conectividad con N8N')
        console.error('ðŸŒ URL del webhook:', 'https://velostrategix-n8n.lnrubg.easypanel.host/webhook-test/crear_productos_conversacional')
      }
      
      setError(`Error al comunicarse con el servidor: ${error.message}`)
      
      const mensajeError = {
        id: Date.now() + 1,
        tipo: 'agente',
        contenido: `âŒ Error de comunicaciÃ³n: ${error.message}. Verifica la conexiÃ³n a internet y que N8N estÃ© funcionando.`,
        timestamp: new Date()
      }
      setMensajes(prev => [...prev, mensajeError])
    } finally {
      setAgentePensando(false)
    }
  }

  const manejarKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (campoEditando) {
        guardarEdicionCampo()
      } else {
        enviarMensaje()
      }
    }
    if (e.key === 'Escape') {
      cancelarEdicion()
    }
  }

  // FunciÃ³n para renderizar campo editable
  const renderizarCampoEditable = (campo, valor, etiqueta) => {
    const esArray = Array.isArray(valor)
    const valorMostrar = esArray ? valor.join(', ') : valor || 'No definido'
    
    return (
      <div className="preview-campo editable" key={campo}>
        <div className="campo-header">
          <strong>{etiqueta}:</strong>
          <button 
            className="boton-editar-campo"
            onClick={() => iniciarEdicionCampo(campo, valor)}
            disabled={cargando}
          >
            <Edit3 size={14} />
            Editar
          </button>
        </div>
        
        {campoEditando === campo ? (
          <div className="campo-editando">
            <input
              type="text"
              value={valorEditando}
              onChange={(e) => setValorEditando(e.target.value)}
              onKeyPress={manejarKeyPress}
              placeholder={`Nuevo valor para ${etiqueta.toLowerCase()}`}
              className="input-edicion"
              autoFocus
            />
            <div className="botones-edicion">
              <button 
                className="boton-guardar-edicion"
                onClick={guardarEdicionCampo}
                disabled={cargando}
              >
                <CheckCircle size={14} />
                Guardar
              </button>
              <button 
                className="boton-cancelar-edicion"
                onClick={cancelarEdicion}
              >
                <X size={14} />
                Cancelar
              </button>
            </div>
          </div>
        ) : (
          <span className="campo-valor">{valorMostrar}</span>
        )}
      </div>
    )
  }

  return (
    <div className="crear-producto-ia-fijo">
      <div className="crear-producto-ia">
        {/* Header */}
        <div className="chat-header-inline">
          <div className="chat-titulo-inline">
            <div className="chat-titulo-icono">
              <Sparkles size={20} />
            </div>
            <div className="chat-titulo-texto">
              <h3>Creador de Productos IA Conversacional</h3>
              <p className="chat-subtitulo">
                {productoGenerado ? 
                  'Producto generado - Revisa, edita y guarda cuando estÃ©s listo' : 
                  'Genera productos completos con solo una conversaciÃ³n'
                }
              </p>
            </div>
          </div>
          <div className="chat-header-actions">
            {productoGenerado && (
              <button 
                className="boton-transferir-formulario"
                onClick={transferirAlFormulario}
                disabled={cargando}
              >
                <ArrowRight size={16} />
                Usar este producto
              </button>
            )}
            <button 
              className="boton-limpiar-conversacion"
              onClick={limpiarConversacion}
              disabled={cargando}
            >
              <RotateCcw size={16} />
              Nueva conversaciÃ³n
            </button>
          </div>
        </div>

        {/* Contenido */}
        <div className="chat-contenido-inline">
          {paso === 1 && mensajes.length === 1 && !productoGenerado && (
            <div className="chat-welcome-inline">
              <div className="welcome-icon">
                <Sparkles size={32} />
              </div>
              <h3>Â¡Hola! Soy tu asistente de productos IA</h3>
              <p>CuÃ©ntame quÃ© producto quieres crear y te ayudo a generar toda la informaciÃ³n necesaria para tu tienda.</p>
              <button 
                className="start-chat-btn"
                onClick={() => inputRef.current?.focus()}
              >
                <MessageCircle size={16} />
                Comenzar conversaciÃ³n
              </button>
            </div>
          )}

          {/* Chat de mensajes */}
          {(paso === 1 || productoGenerado) && (
            <div className="chat-mensajes-inline" ref={chatRef}>
              {mensajes.map((mensaje) => (
                <div key={mensaje.id} className={`mensaje ${mensaje.tipo}`}>
                  <div className="mensaje-avatar">
                    {mensaje.tipo === 'usuario' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="mensaje-contenido">
                    <div className="mensaje-texto">
                      {mensaje.contenido}
                    </div>
                    <div className="mensaje-timestamp">
                      {new Date(mensaje.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}

              {agentePensando && (
                <div className="mensaje agente pensando">
                  <div className="mensaje-avatar">
                    <Bot size={16} />
                  </div>
                  <div className="mensaje-contenido">
                    <div className="mensaje-texto">
                      <div className="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                      El agente estÃ¡ pensando...
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Vista previa del producto */}
          {paso === 3 && productoGenerado && (
            <div className="vista-previa-container">
              <div className="vista-previa-header">
                <CheckCircle className="icono-exito" size={32} />
                <h3>ðŸŽ‰ Â¡Producto generado exitosamente!</h3>
                <p>Revisa la informaciÃ³n, edita lo que necesites y guarda cuando estÃ©s listo</p>
              </div>

              <div className="preview-producto">
                <div className="preview-basico">
                  <h4>ðŸ“‹ InformaciÃ³n BÃ¡sica</h4>
                  {renderizarCampoEditable('nombre', productoGenerado.nombre, 'Nombre')}
                  {renderizarCampoEditable('descripcion', productoGenerado.descripcion, 'DescripciÃ³n')}
                  {renderizarCampoEditable('precio', productoGenerado.precio, 'Precio')}
                  {productoGenerado.categoria && (
                    <div className="preview-campo">
                      <strong>CategorÃ­a:</strong> {productoGenerado.categoria}
                    </div>
                  )}
                </div>

                <div className="preview-persuasion">
                  <h4>ðŸŽ¯ Elementos Persuasivos</h4>
                  {productoGenerado.ganchos && productoGenerado.ganchos.length > 0 && 
                    renderizarCampoEditable('ganchos', productoGenerado.ganchos, 'Ganchos Persuasivos')
                  }
                  {productoGenerado.beneficios && productoGenerado.beneficios.length > 0 && 
                    renderizarCampoEditable('beneficios', productoGenerado.beneficios, 'Beneficios')
                  }
                  {productoGenerado.ventajas && productoGenerado.ventajas.length > 0 && 
                    renderizarCampoEditable('ventajas', productoGenerado.ventajas, 'Ventajas Competitivas')
                  }
                </div>

                {productoGenerado.palabras_clave && productoGenerado.palabras_clave.length > 0 && (
                  <div className="preview-seo">
                    <h4>ðŸ” SEO</h4>
                    {renderizarCampoEditable('palabras_clave', productoGenerado.palabras_clave, 'Palabras Clave')}
                  </div>
                )}

                {/* Resumen de campos generados */}
                <div className="preview-resumen">
                  <h4>ðŸ“Š Resumen de GeneraciÃ³n</h4>
                  <div className="resumen-stats">
                    <div className="stat-item">
                      <span className="stat-numero">{Object.keys(productoGenerado).length}</span>
                      <span className="stat-label">Campos generados</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-numero">TEMU</span>
                      <span className="stat-label">Plantilla aplicada</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-numero">ðŸ’¾</span>
                      <span className="stat-label">En localStorage</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acciones */}
              <div className="acciones-vista-previa">
                <button 
                  className="boton-usar-producto"
                  onClick={transferirAlFormulario}
                  disabled={cargando}
                >
                  <ArrowRight size={16} />
                  Usar este producto
                </button>
                
                <button 
                  className="boton-continuar-chat"
                  onClick={() => setPaso(1)}
                  disabled={cargando}
                >
                  <MessageCircle size={16} />
                  Continuar conversaciÃ³n
                </button>
              </div>
            </div>
          )}

          {/* Input de chat */}
          {(paso === 1 || (paso === 3 && productoGenerado)) && (
            <div className="chat-input-area">
              <div className="chat-input-container">
                <input
                  ref={inputRef}
                  type="text"
                  value={campoEditando ? valorEditando : mensajeActual}
                  onChange={(e) => campoEditando ? setValorEditando(e.target.value) : setMensajeActual(e.target.value)}
                  onKeyPress={manejarKeyPress}
                  placeholder={
                    campoEditando ? 
                    `Editando ${campoEditando}...` : 
                    productoGenerado ? 
                    "ContinÃºa la conversaciÃ³n o pide modificaciones..." : 
                    "Escribe tu mensaje aquÃ­..."
                  }
                  className="chat-input-texto"
                  disabled={cargando || agentePensando}
                  rows={1}
                />
                <button
                  onClick={campoEditando ? guardarEdicionCampo : enviarMensaje}
                  disabled={cargando || agentePensando || (!mensajeActual.trim() && !campoEditando)}
                  className="boton-enviar-mensaje"
                >
                  {cargando || agentePensando ? (
                    <Loader2 size={16} className="icono-cargando" />
                  ) : campoEditando ? (
                    <CheckCircle size={16} />
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
              
              {error && (
                <div className="mensaje-error">
                  {error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ValidaciÃ³n de props
CrearProductoIA.propTypes = {
  onProductoCreado: PropTypes.func.isRequired,
  categorias: PropTypes.array.isRequired
}

export default CrearProductoIA