import React, { useState, useEffect, useRef } from 'react'
import { Edit3, CheckCircle, X } from 'lucide-react'
import './CreadorProductoIA.css'
import CrearProductoIAUI from './CrearProductoIAUI'

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/crear-producto-ia`

const MENSAJE_INICIAL = '¡Hola! Soy tu asistente IA para crear productos. Cuéntame qué producto quieres crear y te ayudo a generar toda la información necesaria.'
const MENSAJE_EDICION = '¡Hola! Soy tu asistente IA para este producto. Cuéntame qué deseas ajustar y te ayudo a generar o mejorar la información necesaria.'

const CrearProductoIA = ({
  mostrar = false,
  onCerrar = () => {},
  onProductoCreado = () => {},
  categorias = [],
  modo = 'modal',
  productoParaEditar = null
}) => {
  const CLAVE_CONVERSACION = productoParaEditar?.id
    ? `creador_producto_ia_conversacion_editar_${productoParaEditar.id}`
    : 'creador_producto_ia_conversacion_crear'

  const CLAVE_PRODUCTO_GENERADO = productoParaEditar?.id
    ? `creador_producto_ia_producto_editar_${productoParaEditar.id}`
    : 'creador_producto_ia_producto_crear'

  const mensajeInicialTexto = productoParaEditar?.id ? MENSAJE_EDICION : MENSAJE_INICIAL

  const [pasoActual, setPasoActual] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_CONVERSACION)
    return guardado ? JSON.parse(guardado).paso || 1 : 1
  })

  const [listaMensajes, setListaMensajes] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_CONVERSACION)
    if (guardado) {
      const datos = JSON.parse(guardado)
      return datos.mensajes || [{ id: 1, tipo: 'agente', contenido: mensajeInicialTexto, marcaTiempo: Date.now() }]
    }
    return [{ id: 1, tipo: 'agente', contenido: mensajeInicialTexto, marcaTiempo: Date.now() }]
  })

  const [textoMensaje, setTextoMensaje] = useState('')
  const [estaCargando, setEstaCargando] = useState(false)
  const [mensajeError, setMensajeError] = useState('')

  const [productoCreado, setProductoCreado] = useState(() => {
    const guardado = localStorage.getItem(CLAVE_PRODUCTO_GENERADO)
    return guardado ? JSON.parse(guardado) : null
  })

  const [agenteProcesando, setAgenteProcesando] = useState(false)
  const [campoEnEdicion, setCampoEnEdicion] = useState(null)
  const [valorEnEdicion, setValorEnEdicion] = useState('')

  const referenciaChat = useRef(null)
  const referenciaInput = useRef(null)

  // Persistir conversación
  useEffect(() => {
    localStorage.setItem(CLAVE_CONVERSACION, JSON.stringify({ paso: pasoActual, mensajes: listaMensajes, marcaTiempo: Date.now() }))
  }, [pasoActual, listaMensajes])

  // Persistir producto generado
  useEffect(() => {
    if (productoCreado) {
      localStorage.setItem(CLAVE_PRODUCTO_GENERADO, JSON.stringify(productoCreado))
    } else {
      localStorage.removeItem(CLAVE_PRODUCTO_GENERADO)
    }
  }, [productoCreado])

  // Auto-scroll
  useEffect(() => {
    if (referenciaChat.current) {
      referenciaChat.current.scrollTop = referenciaChat.current.scrollHeight
    }
  }, [listaMensajes, agenteProcesando])

  // Focus al cambiar paso
  useEffect(() => {
    if (referenciaInput.current && (pasoActual === 1 || pasoActual === 3)) {
      setTimeout(() => referenciaInput.current?.focus(), 100)
    }
  }, [pasoActual])

  // Inicializar conversación de edición si no hay guardado
  useEffect(() => {
    if (productoParaEditar?.id) {
      const guardado = localStorage.getItem(CLAVE_CONVERSACION)
      if (!guardado) {
        setListaMensajes([{ id: 1, tipo: 'agente', contenido: MENSAJE_EDICION, marcaTiempo: Date.now() }])
        setPasoActual(1)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productoParaEditar?.id])

  const limpiarConversacionCompleta = () => {
    localStorage.removeItem(CLAVE_CONVERSACION)
    localStorage.removeItem(CLAVE_PRODUCTO_GENERADO)
    setListaMensajes([{ id: 1, tipo: 'agente', contenido: mensajeInicialTexto, marcaTiempo: Date.now() }])
    setProductoCreado(null)
    setPasoActual(1)
    setCampoEnEdicion(null)
    setValorEnEdicion('')
    setMensajeError('')
    setTextoMensaje('')
    setEstaCargando(false)
    setAgenteProcesando(false)
  }

  const transferirProductoAlFormulario = () => {
    if (productoCreado && onProductoCreado) {
      onProductoCreado(productoCreado)
    }
  }

  const iniciarEdicionDeCampo = (nombreCampo, valorActual) => {
    setCampoEnEdicion(nombreCampo)
    setValorEnEdicion(Array.isArray(valorActual) ? valorActual.join(', ') : valorActual.toString())
  }

  const construirPayload = (mensaje, mensajes) => ({
    mensaje,
    mensajes: mensajes.map(m => ({ role: m.tipo === 'usuario' ? 'user' : 'assistant', content: m.contenido })),
    modo_edicion: !!(productoParaEditar?.id),
    ...(productoParaEditar?.id ? { producto_actual: productoParaEditar } : {}),
  })

  const extraerProducto = (data: any) => {
    if (data?.producto_generado) return data.producto_generado
    if (Array.isArray(data) && data.length > 0) {
      const p = data[0]
      if (p.producto_generado) return p.producto_generado
      if (p.datos_producto) return p.datos_producto
    }
    return null
  }

  const guardarCampoEditado = () => {
    if (!campoEnEdicion || !valorEnEdicion.trim()) return
    const valorNuevo = valorEnEdicion.trim()
    setProductoCreado(prev => {
      const actualizado = { ...(prev || {}), [campoEnEdicion]: valorNuevo }
      localStorage.setItem(CLAVE_PRODUCTO_GENERADO, JSON.stringify(actualizado))
      return actualizado
    })
    setListaMensajes(prev => [...prev, {
      id: Date.now(), tipo: 'agente',
      contenido: `✅ Campo "${campoEnEdicion}" actualizado a: ${valorNuevo}`,
      marcaTiempo: Date.now()
    }])
    setCampoEnEdicion(null)
    setValorEnEdicion('')
  }

  const enviarMensajeAlAgente = async () => {
    if (!textoMensaje.trim() || estaCargando) return
    setEstaCargando(true)
    setMensajeError('')
    setAgenteProcesando(true)

    try {
      const nuevoMensaje = { id: Date.now(), tipo: 'usuario', contenido: textoMensaje.trim(), marcaTiempo: Date.now() }
      const mensajesActualizados = [...listaMensajes, nuevoMensaje]
      setListaMensajes(mensajesActualizados)
      setTextoMensaje('')

      const payload = construirPayload(nuevoMensaje.contenido, mensajesActualizados)
      const resp = await fetch(EDGE_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (!resp.ok) throw new Error(`Error del servidor: ${resp.status}`)
      const data = await resp.json()

      const productoExtraido = extraerProducto(data)

      const esConOpciones = (Array.isArray(data) && data.length > 0 && data[0].tipo === 'respuesta_con_opciones') || data.tipo === 'respuesta_con_opciones'

      if (esConOpciones) {
        const datosResp = Array.isArray(data) ? data[0] : data
        setListaMensajes(prev => [...prev, {
          id: Date.now() + 1,
          tipo: 'agente_con_opciones',
          contenido: datosResp.respuesta_agente || '¿Qué te gustaría hacer?',
          opciones: datosResp.opciones || [],
          producto_sugerido: datosResp.producto_sugerido,
          marcaTiempo: Date.now()
        }])
      } else if (productoExtraido) {
        setProductoCreado(productoExtraido)
        setPasoActual(3)
        setListaMensajes(prev => [...prev, {
          id: Date.now() + 1,
          tipo: 'agente',
          contenido: '🎉 ¡Producto generado exitosamente! Puedes ver la vista previa abajo y usar el botón "Usar este producto" para pasarlo al formulario.',
          marcaTiempo: Date.now()
        }])
      } else {
        const texto = Array.isArray(data) && data.length > 0
          ? (data[0].respuesta_agente || data[0].mensaje || 'Respuesta recibida')
          : (data.respuesta_agente || data.mensaje || 'Respuesta recibida')
        setListaMensajes(prev => [...prev, { id: Date.now() + 1, tipo: 'agente', contenido: texto, marcaTiempo: Date.now() }])
      }
    } catch {
      setMensajeError('Error al comunicarse con el agente. Por favor intenta de nuevo.')
      setListaMensajes(prev => [...prev, { id: Date.now() + 1, tipo: 'agente', contenido: '❌ Lo siento, hubo un error al procesar tu mensaje. Por favor intenta de nuevo.', marcaTiempo: Date.now() }])
    } finally {
      setEstaCargando(false)
      setAgenteProcesando(false)
    }
  }

  const manejarEnvioTecla = (evento) => {
    if (evento.key === 'Enter' && !evento.shiftKey) {
      evento.preventDefault()
      campoEnEdicion ? guardarCampoEditado() : enviarMensajeAlAgente()
    }
  }

  const reemplazarCampoSimple = (campo, nuevoValor) => {
    const base = productoCreado || { nombre: '', descripcion: '', precio: 0, categoria: '', ganchos: [], beneficios: [], ventajas: [], palabras_clave: [] }
    const actualizado = { ...base, [campo]: nuevoValor }
    setProductoCreado(actualizado)
    localStorage.setItem(CLAVE_PRODUCTO_GENERADO, JSON.stringify(actualizado))
    if (onProductoCreado && typeof onProductoCreado === 'function') {
      onProductoCreado({ [campo]: nuevoValor })
    }
    setMensajeError('')
    setTimeout(() => setProductoCreado(prev => prev ? { ...prev } : prev), 10)
  }

  const manejarOpcionSeleccionada = async (opcion, productoSugerido) => {
    if (!opcion || typeof opcion !== 'object') { setMensajeError('Error: Opción no válida seleccionada.'); return }
    try {
      setEstaCargando(true)
      if (opcion.tipo === 'usar_producto') {
        if (productoSugerido && typeof productoSugerido === 'object') {
          setProductoCreado(productoSugerido)
          setPasoActual(3)
          setListaMensajes(prev => [...prev, { id: Date.now() + 1, tipo: 'agente', contenido: '✅ ¡Perfecto! He aplicado el producto sugerido.', marcaTiempo: Date.now() }])
        } else {
          setMensajeError('Error: No se pudo aplicar el producto sugerido.')
        }
      } else if (opcion.tipo === 'reemplazar_campo') {
        const campo = opcion.campo || opcion.field || opcion.name || opcion.key
        const valor = opcion.valor !== undefined ? opcion.valor : opcion.value !== undefined ? opcion.value : opcion.nuevo_valor !== undefined ? opcion.nuevo_valor : null
        if (!campo || typeof campo !== 'string' || campo.trim() === '') { setMensajeError(`Error: Campo inválido. Campo recibido: "${campo}"`); return }
        if (valor === undefined || valor === null) { setMensajeError(`Error: Valor inválido para el campo "${campo}"`); return }
        reemplazarCampoSimple(campo.trim(), valor)
        const valorMostrar = Array.isArray(valor) ? valor.join(', ') : typeof valor === 'object' ? JSON.stringify(valor, null, 2) : valor
        setListaMensajes(prev => [...prev, { id: Date.now() + 1, tipo: 'agente', contenido: `✅ Campo "${campo}" actualizado a: ${valorMostrar}`, marcaTiempo: Date.now() }])
        setPasoActual(3)
      } else if (opcion.tipo === 'continuar_conversacion') {
        const mensaje = opcion.mensaje || opcion.message || opcion.text || 'Continuar con la conversación'
        setListaMensajes(prev => [...prev, { id: Date.now(), tipo: 'usuario', contenido: mensaje, marcaTiempo: Date.now() }])
      } else {
        setMensajeError(`Tipo de opción no reconocido: "${opcion.tipo}"`)
      }
    } catch {
      setListaMensajes(prev => [...prev, { id: Date.now() + 1, tipo: 'agente', contenido: '❌ Hubo un error al procesar tu selección. Por favor intenta de nuevo.', marcaTiempo: Date.now() }])
      setMensajeError('Error al procesar la opción seleccionada.')
    } finally {
      setEstaCargando(false)
    }
  }

  const renderizarCampoEditable = (nombreCampo, valor, etiqueta) => {
    const estaEditando = campoEnEdicion === nombreCampo
    return (
      <div key={`${nombreCampo}_${JSON.stringify(valor)}`} className="creador-ia-campo-preview">
        <div className="creador-ia-campo-header">
          <strong>{etiqueta}:</strong>
          {!estaEditando && (
            <button className="creador-ia-boton-editar" onClick={() => iniciarEdicionDeCampo(nombreCampo, valor)} title={`Editar ${etiqueta}`}>
              <Edit3 size={14} />
            </button>
          )}
        </div>

        {estaEditando ? (
          <div className="creador-ia-campo-edicion">
            <input type="text" value={valorEnEdicion} onChange={(e) => setValorEnEdicion(e.target.value)} onKeyPress={manejarEnvioTecla} className="creador-ia-input-edicion" autoFocus />
            <div className="creador-ia-botones-edicion">
              <button onClick={guardarCampoEditado} disabled={estaCargando} className="creador-ia-boton-guardar"><CheckCircle size={14} /></button>
              <button onClick={() => { setCampoEnEdicion(null); setValorEnEdicion('') }} className="creador-ia-boton-cancelar"><X size={14} /></button>
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

  return (
    <CrearProductoIAUI
      pasoActual={pasoActual}
      listaMensajes={listaMensajes}
      textoMensaje={textoMensaje}
      estaCargando={estaCargando}
      mensajeError={mensajeError}
      productoCreado={productoCreado}
      agenteProcesando={agenteProcesando}
      campoEnEdicion={campoEnEdicion}
      valorEnEdicion={valorEnEdicion}
      referenciaChat={referenciaChat}
      referenciaInput={referenciaInput}
      setTextoMensaje={setTextoMensaje}
      setValorEnEdicion={setValorEnEdicion}
      setCampoEnEdicion={setCampoEnEdicion}
      setPasoActual={setPasoActual}
      limpiarConversacionCompleta={limpiarConversacionCompleta}
      transferirProductoAlFormulario={transferirProductoAlFormulario}
      iniciarEdicionDeCampo={iniciarEdicionDeCampo}
      guardarCampoEditado={guardarCampoEditado}
      enviarMensajeAlAgente={enviarMensajeAlAgente}
      manejarEnvioTecla={manejarEnvioTecla}
      manejarOpcionSeleccionada={manejarOpcionSeleccionada}
      renderizarCampoEditable={renderizarCampoEditable}
    />
  )
}

export default CrearProductoIA
