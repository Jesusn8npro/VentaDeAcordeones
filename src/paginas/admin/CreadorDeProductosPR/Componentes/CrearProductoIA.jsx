import React, { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
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
import './CreadorProductoIA.css';

const CrearProductoIA = ({ 
  mostrar = false, 
  onCerrar = () => {}, 
  onProductoCreado = () => {}, 
  categorias = [],
  modo = 'modal', // 'modal' o 'embed'
  productoParaEditar = null // Producto existente para editar
}) => {
  // Claves de almacenamiento según contexto (crear vs editar por producto)
  const CLAVE_CONVERSACION = productoParaEditar?.id
    ? `creador_producto_ia_conversacion_editar_${productoParaEditar.id}`
    : 'creador_producto_ia_conversacion_crear'

  const CLAVE_PRODUCTO_GENERADO = productoParaEditar?.id
    ? `creador_producto_ia_producto_editar_${productoParaEditar.id}`
    : 'creador_producto_ia_producto_crear'

  // Estados principales
  const [pasoActual, setPasoActual] = useState(() => {
    const datosGuardados = localStorage.getItem(CLAVE_CONVERSACION)
    return datosGuardados ? JSON.parse(datosGuardados).paso || 1 : 1
  })
  
  const [listaMensajes, setListaMensajes] = useState(() => {
    const datosGuardados = localStorage.getItem(CLAVE_CONVERSACION)
    if (datosGuardados) {
      const datos = JSON.parse(datosGuardados)
      return datos.mensajes || [{
        id: 1,
        tipo: 'agente',
        contenido: '¡Hola! Soy tu asistente IA para crear productos. Cuéntame qué producto quieres crear y te ayudo a generar toda la información necesaria.',
        marcaTiempo: Date.now()
      }]
    }
    return [{
      id: 1,
      tipo: 'agente',
      contenido: '¡Hola! Soy tu asistente IA para crear productos. Cuéntame qué producto quieres crear y te ayudo a generar toda la información necesaria.',
      marcaTiempo: Date.now()
    }]
  })
  
  const [textoMensaje, setTextoMensaje] = useState('')
  const [estaCargando, setEstaCargando] = useState(false)
  const [mensajeError, setMensajeError] = useState('')
  
  const [productoCreado, setProductoCreado] = useState(() => {
    const datosGuardados = localStorage.getItem(CLAVE_PRODUCTO_GENERADO)
    const producto = datosGuardados ? JSON.parse(datosGuardados) : null
    console.log('🔍 INIT - Producto cargado desde localStorage:', producto)
    return producto
  })
  
  const [conversacionId, setConversacionId] = useState(() => {
    // Recuperar o generar ID de conversación
    const idGuardado = localStorage.getItem('creadorIA_conversacion_id')
    return idGuardado || `conv_${Date.now()}`
  })
  
  const [agenteProcesando, setAgenteProcesando] = useState(false)
  const [campoEnEdicion, setCampoEnEdicion] = useState(null)
  const [valorEnEdicion, setValorEnEdicion] = useState('')
  
  // Referencias
  const referenciaChat = useRef(null)
  const referenciaInput = useRef(null)
  
  // Efectos
  useEffect(() => {
    if (listaMensajes.length === 0) {
      setListaMensajes([{
        id: 1,
        tipo: 'agente',
        contenido: '¡Hola! Soy tu asistente IA para crear productos. Cuéntame qué producto quieres crear y te ayudo a generar toda la información necesaria.',
        marcaTiempo: Date.now()
      }])
    }
    
    // Guardar ID de conversación
    localStorage.setItem('creadorIA_conversacion_id', conversacionId)
  }, [listaMensajes.length, conversacionId])
  
  // Guardar conversación en localStorage
  useEffect(() => {
    const datosConversacion = {
      paso: pasoActual,
      mensajes: listaMensajes,
      marcaTiempo: Date.now()
    }
    localStorage.setItem(CLAVE_CONVERSACION, JSON.stringify(datosConversacion))
  }, [pasoActual, listaMensajes])
  
  // Guardar producto generado en localStorage
  useEffect(() => {
    if (productoCreado) {
      console.log('💾 Guardando producto en localStorage:', productoCreado)
      localStorage.setItem(CLAVE_PRODUCTO_GENERADO, JSON.stringify(productoCreado))
    } else {
      console.log('🗑️ Producto es null, removiendo de localStorage')
      localStorage.removeItem(CLAVE_PRODUCTO_GENERADO)
    }
  }, [productoCreado])
  
  // Auto-scroll del chat
  useEffect(() => {
    if (referenciaChat.current) {
      referenciaChat.current.scrollTop = referenciaChat.current.scrollHeight
    }
  }, [listaMensajes, agenteProcesando])
  
  // Focus en input cuando cambia el paso
  useEffect(() => {
    if (referenciaInput.current && (pasoActual === 1 || pasoActual === 3)) {
      setTimeout(() => referenciaInput.current?.focus(), 100)
    }
  }, [pasoActual])

  // Funciones auxiliares
  const limpiarConversacionCompleta = () => {
    console.log('🧹 LIMPIEZA COMPLETA - Iniciando...')
    
    // Limpiar localStorage completamente
    localStorage.removeItem(CLAVE_CONVERSACION)
    localStorage.removeItem(CLAVE_PRODUCTO_GENERADO)
    localStorage.removeItem('creadorIA_conversacion_id')
    
    // Resetear todos los estados
    setListaMensajes([{
      id: 1,
      tipo: 'agente',
      contenido: '¡Hola! Soy tu asistente IA para crear productos. Cuéntame qué producto quieres crear y te ayudo a generar toda la información necesaria.',
      marcaTiempo: Date.now()
    }])
    setProductoCreado(null)
    setPasoActual(1)
    setConversacionId(`conv_${Date.now()}`)
    setCampoEnEdicion(null)
    setValorEnEdicion('')
    setMensajeError('')
    setTextoMensaje('')
    setEstaCargando(false)
    setAgenteProcesando(false)
    
    console.log('✅ LIMPIEZA COMPLETA - Terminada')
    console.log('🔄 Estado resetado completamente')
  }

  // Al entrar a modo edición de un producto, iniciar conversación limpia por ese contexto
  useEffect(() => {
    if (productoParaEditar?.id) {
      const datosGuardados = localStorage.getItem(CLAVE_CONVERSACION)
      if (!datosGuardados) {
        // No hay conversación previa para este producto, asegurar mensaje inicial
        setListaMensajes([{
          id: 1,
          tipo: 'agente',
          contenido: '¡Hola! Soy tu asistente IA para este producto. Cuéntame qué deseas ajustar y te ayudo a generar o mejorar la información necesaria.',
          marcaTiempo: Date.now()
        }])
        setPasoActual(1)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productoParaEditar?.id])
  
  const transferirProductoAlFormulario = () => {
    if (productoCreado && onProductoCreado) {
      onProductoCreado(productoCreado)
    }
  }
  
  const iniciarEdicionDeCampo = (nombreCampo, valorActual) => {
    setCampoEnEdicion(nombreCampo)
    setValorEnEdicion(Array.isArray(valorActual) ? valorActual.join(', ') : valorActual.toString())
  }
  
  const guardarCampoEditado = async () => {
    if (!campoEnEdicion || !valorEnEdicion.trim()) return
    
    setEstaCargando(true)
    setMensajeError('')
    
    try {
      const valorActual = productoCreado[campoEnEdicion]
      const valorNuevo = valorEnEdicion.trim()
      
      // Crear mensaje específico para modificación
      const mensajeModificacion = `Necesito modificar el campo "${campoEnEdicion}" del producto. 
      
Valor actual: ${Array.isArray(valorActual) ? valorActual.join(', ') : valorActual}
Nuevo valor solicitado: ${valorNuevo}

Por favor actualiza solo este campo manteniendo toda la demás información del producto igual. Responde con el producto completo actualizado.`
      
      // Preparar contexto de conversación optimizado para edición
      const mensajesParaN8N = listaMensajes.slice(-5).map(m => ({
        role: m.tipo === 'usuario' ? 'user' : 'assistant',
        content: m.contenido
      }))

      // Formato optimizado que espera N8N según el flujo
      const datosParaN8N = {
        conversacion_id: conversacionId,
        mensaje: mensajeModificacion,
        mensajes: mensajesParaN8N,
        accion: 'modificar_campo',
        campo_modificar: campoEnEdicion,
        valor_nuevo: valorNuevo,
        producto_actual: productoCreado,
        // Solo enviar datos esenciales según el modo
        ...(productoParaEditar ? {
          // MODO EDICIÓN: Enviar datos directos del producto sin categorías
          producto_id: productoParaEditar.id,
          producto_nombre: productoParaEditar.nombre,
          producto_actual: {
            id: productoParaEditar.id,
            nombre: productoParaEditar.nombre,
            descripcion: productoParaEditar.descripcion,
            precio: productoParaEditar.precio,
            categoria_id: productoParaEditar.categoria_id,
            stock: productoParaEditar.stock,
            estado: productoParaEditar.estado
          },
          modo_edicion: true
        } : {
          // MODO CREACIÓN: Solo información básica para búsqueda
          modo_edicion: false,
          contexto_creacion: true
        })
      }
      
      const respuesta = await fetch('https://velostrategix-n8n.lnrubg.easypanel.host/webhook/crear_productos_conversacional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaN8N)
      })
      
      if (!respuesta.ok) {
        throw new Error(`Error del servidor: ${respuesta.status}`)
      }
      
      const datos = await respuesta.json()
      
      // DEBUG: Ver qué está devolviendo el webhook
      console.log('🔍 Respuesta completa del webhook (guardarCampoEditado):', datos)
      console.log('🔍 Tipo de datos:', typeof datos)
      console.log('🔍 Claves disponibles:', Object.keys(datos))
      
      // Agregar mensaje del usuario
      const nuevoMensajeUsuario = {
        id: Date.now(),
        tipo: 'usuario',
        contenido: `Modificar ${campoEnEdicion}: ${valorNuevo}`,
        marcaTiempo: Date.now()
      }
      
      setListaMensajes(prev => [...prev, nuevoMensajeUsuario])
      
      // Procesar respuesta
      if (datos.producto_generado) {
        setProductoCreado(datos.producto_generado)
        
        const mensajeRespuesta = {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: `✅ Campo "${campoEnEdicion}" actualizado correctamente.`,
          marcaTiempo: Date.now()
        }
        
        setListaMensajes(prev => [...prev, mensajeRespuesta])
        setPasoActual(3)
      } else if (datos.respuesta) {
        const mensajeRespuesta = {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: datos.respuesta,
          marcaTiempo: Date.now()
        }
        
        setListaMensajes(prev => [...prev, mensajeRespuesta])
      }
      
      // Limpiar edición
      setCampoEnEdicion(null)
      setValorEnEdicion('')
      
    } catch (error) {
      console.error('Error al modificar campo:', error)
      setMensajeError('Error al modificar el campo. Por favor intenta de nuevo.')
    } finally {
      setEstaCargando(false)
    }
  }
  
  const enviarMensajeAlAgente = async () => {
    if (!textoMensaje.trim() || estaCargando) return
    
    setEstaCargando(true)
    setMensajeError('')
    setAgenteProcesando(true)
    
    try {
      // Agregar mensaje del usuario
      const nuevoMensajeUsuario = {
        id: Date.now(),
        tipo: 'usuario',
        contenido: textoMensaje.trim(),
        marcaTiempo: Date.now()
      }
      
      const mensajesActualizados = [...listaMensajes, nuevoMensajeUsuario]
      setListaMensajes(mensajesActualizados)
      setTextoMensaje('')
      
      // Preparar contexto de la conversación en el formato correcto para N8N
      const mensajesParaN8N = mensajesActualizados.map(m => ({
        role: m.tipo === 'usuario' ? 'user' : 'assistant',
        content: m.contenido
      }))

      // Formato optimizado que espera N8N según el flujo
      const datosParaN8N = {
        conversacion_id: conversacionId,
        mensaje: nuevoMensajeUsuario.contenido,
        mensajes: mensajesParaN8N,
        // Solo enviar datos esenciales según el modo
        ...(productoParaEditar ? {
          // MODO EDICIÓN: Enviar datos directos del producto sin categorías
          producto_id: productoParaEditar.id,
          producto_nombre: productoParaEditar.nombre,
          producto_actual: {
            id: productoParaEditar.id,
            nombre: productoParaEditar.nombre,
            descripcion: productoParaEditar.descripcion,
            precio: productoParaEditar.precio,
            categoria_id: productoParaEditar.categoria_id,
            stock: productoParaEditar.stock,
            estado: productoParaEditar.estado
          },
          modo_edicion: true
        } : {
          // MODO CREACIÓN: Solo información básica para búsqueda
          modo_edicion: false,
          // No enviar categorías completas, solo el contexto necesario
          contexto_creacion: true
        })
      }

      // 🔍 LOGS DE DEBUGGING PARA RASTREAR FLUJO DE DATOS
      console.log('🔍 DEBUG - productoParaEditar:', productoParaEditar)
      console.log('🔍 DEBUG - producto_id que se enviará:', productoParaEditar?.id)
      console.log('🚀 Enviando mensaje al webhook (formato N8N):', datosParaN8N)
      
      const respuesta = await fetch('https://velostrategix-n8n.lnrubg.easypanel.host/webhook/crear_productos_conversacional', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosParaN8N)
      })
      
      if (!respuesta.ok) {
        throw new Error(`Error del servidor: ${respuesta.status}`)
      }
      
      const data = await respuesta.json()
      
      console.log('🔨 Respuesta completa del webhook:', JSON.stringify(data, null, 2))
      console.log('🔨 Tipo de datos recibidos:', typeof data)
      console.log('🔨 Es array?:', Array.isArray(data))
      
      // 🚨 DEBUGGING ESPECÍFICO PARA OPCIONES INTERACTIVAS
      console.log('🎯 DEBUGGING OPCIONES INTERACTIVAS:')
      if (Array.isArray(data) && data.length > 0) {
        console.log('🎯 Verificando primer elemento para opciones:', data[0])
        console.log('🎯 ¿Tiene tipo respuesta_con_opciones?:', data[0].tipo === 'respuesta_con_opciones')
        console.log('🎯 ¿Tiene opciones?:', !!data[0].opciones)
        console.log('🎯 Opciones encontradas:', data[0].opciones)
        console.log('🎯 ¿Tiene producto_sugerido?:', !!data[0].producto_sugerido)
      } else if (data && typeof data === 'object') {
        console.log('🎯 Verificando objeto directo para opciones:', data)
        console.log('🎯 ¿Tiene tipo respuesta_con_opciones?:', data.tipo === 'respuesta_con_opciones')
        console.log('🎯 ¿Tiene opciones?:', !!data.opciones)
        console.log('🎯 Opciones encontradas:', data.opciones)
        console.log('🎯 ¿Tiene producto_sugerido?:', !!data.producto_sugerido)
      }
      
      // Log más detallado para debugging
      if (Array.isArray(data)) {
        console.log('🔨 Longitud del array:', data.length)
        data.forEach((item, index) => {
          console.log(`🔨 Elemento ${index}:`, item)
          if (item && typeof item === 'object') {
            console.log(`🔨 Campos del elemento ${index}:`, Object.keys(item))
            if ('json_limpio' in item) {
              console.log(`🔨 json_limpio en elemento ${index}:`, item.json_limpio)
              console.log(`🔨 Tipo de json_limpio:`, typeof item.json_limpio)
            }
            if ('datos_producto' in item) {
              console.log(`🔨 datos_producto en elemento ${index}:`, item.datos_producto)
            }
            if ('respuesta_agente' in item) {
              console.log(`🔨 respuesta_agente en elemento ${index}:`, item.respuesta_agente)
            }
          }
        })
      } else if (data && typeof data === 'object') {
        console.log('🔨 Campos del objeto:', Object.keys(data))
        if ('json_limpio' in data) {
          console.log('🔨 json_limpio directo:', data.json_limpio)
        }
        if ('datos_producto' in data) {
          console.log('🔨 datos_producto directo:', data.datos_producto)
        }
      }

      // Manejar respuesta - CORREGIDO para procesar json_limpio y producto_generado
      let productoExtraido = null
      
      console.log('🔍 Iniciando procesamiento de respuesta...')
      
      // Verificar si la respuesta es un array (formato del webhook)
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Es array con elementos')
        
        const primerElemento = data[0]
        console.log('🔍 Primer elemento:', primerElemento)
        
        // Prioridad 1: Usar producto_generado si existe (ya es un objeto)
        if (primerElemento && primerElemento.producto_generado) {
          console.log('✅ Usando producto_generado (objeto directo):', primerElemento.producto_generado)
          productoExtraido = primerElemento.producto_generado
        }
        // Prioridad 2: Usar json_limpio si existe (necesita parsing)
        else if (primerElemento && primerElemento.json_limpio) {
          console.log('✅ Tiene campo json_limpio:', primerElemento.json_limpio)
          try {
            // Limpiar el JSON antes de parsearlo
            let jsonLimpio = primerElemento.json_limpio
            
            // Remover la palabra clave si existe
            jsonLimpio = jsonLimpio.replace(/\*\*\*PRODUCTO_LISTO\*\*\*/g, '').trim()
            
            // Remover caracteres de escape innecesarios
            jsonLimpio = jsonLimpio.replace(/\\"/g, '"')
            
            // Si el JSON está envuelto en comillas, removerlas
            if (jsonLimpio.startsWith('"') && jsonLimpio.endsWith('"')) {
              jsonLimpio = jsonLimpio.slice(1, -1)
            }
            
            // Intentar encontrar el JSON válido si hay texto adicional
            const jsonMatch = jsonLimpio.match(/\{[\s\S]*\}/)
            if (jsonMatch) {
              jsonLimpio = jsonMatch[0]
            }
            
            console.log('🧹 JSON después de limpieza:', jsonLimpio)
            
            // Extraer y parsear el JSON del campo json_limpio
            productoExtraido = JSON.parse(jsonLimpio)
            console.log('✅ Producto extraído de json_limpio:', productoExtraido)
          } catch (parseError) {
            console.error('❌ Error al parsear json_limpio:', parseError)
            console.error('❌ Contenido que falló:', primerElemento.json_limpio)
            
            // Intentar parsear como string si es un JSON stringificado doble
            try {
              const jsonDecodificado = JSON.parse(primerElemento.json_limpio)
              if (typeof jsonDecodificado === 'string') {
                productoExtraido = JSON.parse(jsonDecodificado)
                console.log('✅ Producto extraído después de doble parsing:', productoExtraido)
              }
            } catch (secondParseError) {
              console.error('❌ Error en segundo intento de parsing:', secondParseError)
            }
          }
        }
        // Prioridad 3: Usar datos_producto como alternativa
        else if (primerElemento && primerElemento.datos_producto) {
          console.log('✅ Usando datos_producto como alternativa')
          productoExtraido = primerElemento.datos_producto
        } else {
          console.log('❌ No se encontró producto_generado, json_limpio ni datos_producto en el primer elemento')
        }
      } 
      // Formato alternativo directo (no array)
      else if (data.tipo === 'producto_generado' && data.datos_producto) {
        console.log('✅ Formato directo con datos_producto')
        productoExtraido = data.datos_producto
      } else {
        console.log('❌ No se pudo identificar el formato de la respuesta')
      }

      console.log('🎯 Verificando si hay producto extraído:', !!productoExtraido)
      
      // Verificar si es una respuesta con opciones interactivas
      const esRespuestaConOpciones = (Array.isArray(data) && data.length > 0 && data[0].tipo === 'respuesta_con_opciones') ||
                                     (data.tipo === 'respuesta_con_opciones')
      
      console.log('🎯 Es respuesta con opciones:', esRespuestaConOpciones)
      
      if (esRespuestaConOpciones) {
        // Respuesta con opciones interactivas
        const datosRespuesta = Array.isArray(data) ? data[0] : data
        console.log('🎯 Procesando respuesta con opciones:', datosRespuesta)
        
        // Agregar logs específicos para debugging de opciones
        console.log('🔍 DEBUGGING OPCIONES DETALLADO:')
        if (datosRespuesta.opciones && Array.isArray(datosRespuesta.opciones)) {
          datosRespuesta.opciones.forEach((opcion, index) => {
            console.log(`🔍 Opción ${index}:`, opcion)
            console.log(`🔍 - Tipo: ${opcion.tipo}`)
            console.log(`🔍 - Texto: ${opcion.texto}`)
            console.log(`🔍 - Campo: ${opcion.campo}`)
            console.log(`🔍 - Valor: ${opcion.valor}`)
          })
        }
        
        const mensajeConOpciones = {
          id: Date.now() + 1,
          tipo: 'agente_con_opciones',
          contenido: datosRespuesta.respuesta_agente || 'He procesado tu solicitud. ¿Qué te gustaría hacer?',
          opciones: datosRespuesta.opciones || [],
          producto_sugerido: datosRespuesta.producto_sugerido,
          marcaTiempo: Date.now()
        }
        
        setListaMensajes(prev => [...prev, mensajeConOpciones])
        console.log('🎯 Mensaje con opciones agregado')
        
      } else if (productoExtraido) {
        // Producto generado - guardar en localStorage, NO en Supabase
        console.log('🎯 Producto generado, guardando en localStorage...')
        console.log('🎯 Producto a guardar:', productoExtraido)
        
        setProductoCreado(productoExtraido)
        setPasoActual(3) // Ir a vista previa
        console.log('🎯 Estado actualizado con setProductoCreado')
        
        const mensajeExito = {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: '🎉 ¡Producto generado exitosamente! Puedes ver la vista previa abajo y usar el botón "Usar este producto" para pasarlo al formulario.',
          marcaTiempo: Date.now()
        }
        setListaMensajes(prev => [...prev, mensajeExito])
        console.log('🎯 Mensaje de éxito agregado')
        
      } else {
        console.log('📄 No hay producto, procesando como respuesta conversacional')
        // Respuesta conversacional normal
        const respuestaTexto = Array.isArray(data) && data.length > 0 ? 
          (data[0].respuesta_agente || data[0].mensaje || 'Respuesta recibida') :
          (data.respuesta_agente || data.mensaje || 'Respuesta recibida')
          
        console.log('📄 Texto de respuesta:', respuestaTexto)
        
        const mensajeAgente = {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: respuestaTexto,
          marcaTiempo: Date.now()
        }
        setListaMensajes(prev => [...prev, mensajeAgente])
        console.log('📄 Mensaje conversacional agregado')
      }
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      setMensajeError('Error al comunicarse con el agente. Por favor intenta de nuevo.')
      
      // Agregar mensaje de error del agente
      const mensajeError = {
        id: Date.now() + 1,
        tipo: 'agente',
        contenido: '❌ Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.',
        marcaTiempo: Date.now()
      }
      
      setListaMensajes(prev => [...prev, mensajeError])
    } finally {
      setEstaCargando(false)
      setAgenteProcesando(false)
    }
  }
  
  const manejarEnvioTecla = (evento) => {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault()
      if (campoEnEdicion) {
        guardarCampoEditado()
      } else {
        enviarMensajeAlAgente()
      }
    }
  }
  
  // Función SIMPLE para reemplazar campos - CON TRANSFERENCIA AL FORMULARIO
  const reemplazarCampoSimple = (campo, nuevoValor) => {
    console.log(`🔥 REEMPLAZO SIMPLE - Campo: ${campo}, Valor:`, nuevoValor)
    console.log('🔍 Estado actual productoCreado:', productoCreado)
    console.log('🔍 Tipo de productoCreado:', typeof productoCreado)
    console.log('🔍 Es null?:', productoCreado === null)
    console.log('🔍 Es undefined?:', productoCreado === undefined)
    
    // Intentar recuperar producto del localStorage si no está en estado
    let productoParaModificar = productoCreado
    
    if (!productoParaModificar) {
      console.log('⚠️ Producto no encontrado en estado, intentando recuperar de localStorage...')
      
      // Intentar múltiples claves de localStorage
      const clavesAIntentar = [
        CLAVE_PRODUCTO_GENERADO,
        'creador_producto_ia_producto',
        'creadorIA_producto_generado',
        'producto_generado_ia'
      ]
      
      for (const clave of clavesAIntentar) {
        const datosGuardados = localStorage.getItem(clave)
        console.log(`🔍 Intentando clave "${clave}":`, datosGuardados ? 'ENCONTRADO' : 'NO ENCONTRADO')
        
        if (datosGuardados) {
          try {
            productoParaModificar = JSON.parse(datosGuardados)
            console.log('✅ Producto recuperado de localStorage con clave:', clave, productoParaModificar)
            // Restaurar el estado
            setProductoCreado(productoParaModificar)
            break
          } catch (error) {
            console.error(`❌ Error al parsear producto de localStorage (${clave}):`, error)
          }
        }
      }
    }
    
    // Si aún no hay producto, usar el producto actual del estado o crear uno básico
    if (!productoParaModificar) {
      console.log('⚠️ No hay producto disponible, usando producto actual del estado...')
      // Usar el producto actual del estado si existe, sino crear estructura básica
      productoParaModificar = productoCreado || {
        nombre: '',
        descripcion: '',
        precio: 0,
        categoria: '',
        ganchos: [],
        beneficios: [],
        ventajas: [],
        palabras_clave: []
      }
      console.log('✅ Producto base obtenido:', productoParaModificar)
    }
    
    // Crear nuevo producto PRESERVANDO todos los campos existentes y solo actualizando el campo específico
    const productoActualizado = {
      ...productoParaModificar, // Mantener todos los campos existentes
      [campo]: nuevoValor       // Solo actualizar el campo específico
    }
    
    console.log('🔥 Producto actualizado (PRESERVANDO CAMPOS EXISTENTES):', productoActualizado)
    console.log('🔍 Campos preservados del producto original:', Object.keys(productoParaModificar))
    console.log(`🎯 Campo actualizado: ${campo} = `, nuevoValor)
    
    // Actualizar el estado INMEDIATAMENTE
    setProductoCreado(productoActualizado)
    
    // Guardar en localStorage para persistencia
    localStorage.setItem(CLAVE_PRODUCTO_GENERADO, JSON.stringify(productoActualizado))
    
    // 🎯 TRANSFERIR AUTOMÁTICAMENTE AL FORMULARIO (SOLO SI EXISTE LA FUNCIÓN)
    if (onProductoCreado && typeof onProductoCreado === 'function') {
      console.log('📋 Transfiriendo producto actualizado al formulario...')
      console.log('🔍 DEBUGGING: Producto que se va a transferir:', productoActualizado)
      console.log('🔍 DEBUGGING: Campos del producto:', Object.keys(productoActualizado))
      
      // Crear un objeto que SOLO contenga el campo actualizado para evitar borrar otros campos
      const soloElCampoActualizado = {
        [campo]: nuevoValor
      }
      
      console.log('🎯 ENVIANDO SOLO EL CAMPO ACTUALIZADO:', soloElCampoActualizado)
      onProductoCreado(soloElCampoActualizado)
    }
    
    // Limpiar cualquier mensaje de error
    setMensajeError('')
    
    // Forzar re-render
    setTimeout(() => {
      setProductoCreado(prev => ({ ...prev }))
    }, 10)
    
    console.log('✅ Campo reemplazado y transferido al formulario exitosamente')
  }

  // Función para manejar las opciones seleccionadas - VERSIÓN MEJORADA
  const manejarOpcionSeleccionada = async (opcion, productoSugerido) => {
    console.log('🎯 Opción seleccionada:', opcion)
    console.log('🎯 Producto sugerido:', productoSugerido)
    console.log('🎯 Tipo de opción:', opcion?.tipo)
    
    // Validación inicial de la opción
    if (!opcion || typeof opcion !== 'object') {
      console.error('❌ Opción inválida o undefined:', opcion)
      setMensajeError('Error: Opción no válida seleccionada.')
      return
    }
    
    try {
      setEstaCargando(true)
      
      if (opcion.tipo === 'usar_producto') {
        if (productoSugerido && typeof productoSugerido === 'object') {
          console.log('🎯 Usando producto completo')
          setProductoCreado(productoSugerido)
          setPasoActual(3)
          
          const mensajeConfirmacion = {
            id: Date.now() + 1,
            tipo: 'agente',
            contenido: '✅ ¡Perfecto! He aplicado el producto sugerido.',
            marcaTiempo: Date.now()
          }
          setListaMensajes(prev => [...prev, mensajeConfirmacion])
        } else {
          console.error('❌ Producto sugerido no válido:', productoSugerido)
          setMensajeError('Error: No se pudo aplicar el producto sugerido.')
        }
      } else if (opcion.tipo === 'reemplazar_campo') {
        // Múltiples formas de obtener el campo y valor para mayor compatibilidad
        const campo = opcion.campo || opcion.field || opcion.name || opcion.key
        const valor = opcion.valor !== undefined ? opcion.valor : 
                     opcion.value !== undefined ? opcion.value :
                     opcion.nuevo_valor !== undefined ? opcion.nuevo_valor :
                     opcion.newValue !== undefined ? opcion.newValue : null
        
        console.log(`🔥 DEBUGGING REEMPLAZO MEJORADO:`)
        console.log(`   - Campo: ${campo}`)
        console.log(`   - Valor: ${valor}`)
        console.log(`   - Tipo de valor: ${typeof valor}`)
        console.log(`   - Opción completa:`, opcion)
        
        // Validación más estricta
        if (!campo || typeof campo !== 'string' || campo.trim() === '') {
          console.error('❌ Campo inválido para reemplazo:', { campo, tipo: typeof campo })
          setMensajeError(`Error: Campo inválido. Campo recibido: "${campo}"`)
          setEstaCargando(false)
          return
        }
        
        if (valor === undefined || valor === null) {
          console.error('❌ Valor inválido para reemplazo:', { valor, tipo: typeof valor })
          setMensajeError(`Error: Valor inválido para el campo "${campo}". Valor recibido: ${valor}`)
          setEstaCargando(false)
          return
        }
        
        // REEMPLAZO SIMPLE Y DIRECTO
        console.log('🚀 Llamando a reemplazarCampoSimple...')
        reemplazarCampoSimple(campo.trim(), valor)
        
        // Mensaje de confirmación con formato correcto para arrays y objetos
        let valorMostrar = valor
        if (Array.isArray(valor)) {
          valorMostrar = valor.join(', ')
        } else if (typeof valor === 'object' && valor !== null) {
          valorMostrar = JSON.stringify(valor, null, 2)
        }
        
        const mensajeConfirmacion = {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: `✅ Campo "${campo}" actualizado a: ${valorMostrar}`,
          marcaTiempo: Date.now()
        }
        setListaMensajes(prev => [...prev, mensajeConfirmacion])
        
        setPasoActual(3) // Ir a vista previa
      } else if (opcion.tipo === 'continuar_conversacion') {
        // Continuar la conversación con el agente
        const mensaje = opcion.mensaje || opcion.message || opcion.text || 'Continuar con la conversación'
        
        const mensajeUsuario = {
          id: Date.now(),
          tipo: 'usuario',
          contenido: mensaje,
          marcaTiempo: Date.now()
        }
        
        setListaMensajes(prev => [...prev, mensajeUsuario])
        
        // Enviar mensaje al webhook si es necesario
        if (mensaje && mensaje !== 'Continuar con la conversación') {
          await enviarMensajeAlAgente(mensaje)
        }
      } else {
        console.warn('⚠️ Tipo de opción no reconocido:', opcion.tipo)
        setMensajeError(`Tipo de opción no reconocido: "${opcion.tipo}"`)
      }
      
    } catch (error) {
      console.error('❌ Error al procesar opción seleccionada:', error)
      
      const mensajeError = {
        id: Date.now() + 1,
        tipo: 'agente',
        contenido: '❌ Hubo un error al procesar tu selección. Por favor intenta de nuevo.',
        marcaTiempo: Date.now()
      }
      setListaMensajes(prev => [...prev, mensajeError])
      setMensajeError('Error al procesar la opción seleccionada.')
    } finally {
      setEstaCargando(false)
    }
  }
  
  const renderizarCampoEditable = (nombreCampo, valor, etiqueta) => {
    const estaEditando = campoEnEdicion === nombreCampo
    
    // Key único que incluye el valor actual para forzar re-render
    const keyUnico = `${nombreCampo}_${JSON.stringify(valor)}_${Date.now()}`
    
    console.log(`🎨 Renderizando campo: ${nombreCampo} = ${JSON.stringify(valor)}`)
    
    return (
      <div key={keyUnico} className="creador-ia-campo-preview">
        <div className="creador-ia-campo-header">
          <strong>{etiqueta}:</strong>
          {!estaEditando && (
            <button
              className="creador-ia-boton-editar"
              onClick={() => iniciarEdicionDeCampo(nombreCampo, valor)}
              title={`Editar ${etiqueta}`}
            >
              <Edit3 size={14} />
            </button>
          )}
        </div>
        
        {estaEditando ? (
          <div className="creador-ia-campo-edicion">
            <input
              type="text"
              value={valorEnEdicion}
              onChange={(e) => setValorEnEdicion(e.target.value)}
              onKeyPress={manejarEnvioTecla}
              className="creador-ia-input-edicion"
              autoFocus
            />
            <div className="creador-ia-botones-edicion">
              <button
                onClick={guardarCampoEditado}
                disabled={estaCargando}
                className="creador-ia-boton-guardar"
              >
                <CheckCircle size={14} />
              </button>
              <button
                onClick={() => {
                  setCampoEnEdicion(null)
                  setValorEnEdicion('')
                }}
                className="creador-ia-boton-cancelar"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="creador-ia-campo-valor">
            {Array.isArray(valor) ? valor.join(', ') : valor}
          </div>
        )}
      </div>
    )
  }
  
  // Renderizado principal
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
                  
                  {/* Botones de opciones interactivas */}
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

              {/* Resumen de campos generados */}
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

              {/* Botones de acción */}
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
                      campoEnEdicion ? 
                      `Editando ${campoEnEdicion}...` : 
                      productoCreado ? 
                      "Continúa la conversación o pide modificaciones..." : 
                      "Describe el producto que quieres crear..."
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

// Validación de props
CrearProductoIA.propTypes = {
  mostrar: PropTypes.bool,
  onCerrar: PropTypes.func,
  onProductoCreado: PropTypes.func.isRequired,
  categorias: PropTypes.array.isRequired,
  modo: PropTypes.string,
  productoParaEditar: PropTypes.object // Producto existente para editar
}

export default CrearProductoIA
