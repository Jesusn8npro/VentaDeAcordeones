import React, { useState, useEffect, useRef } from 'react'
import { clienteSupabase } from '../../../../configuracion/supabase'
import './ChatImagenesIAInline.css'
import ChatImagenesIAInlineUI from './ChatImagenesIAInlineUI'

const STORAGE_PREFIX = 'mllevo:chat-ia:'
const CHANNEL_NAME = 'mllevo_chat_ia'
const WEBHOOK_TEST = 'https://velostrategix-n8n.lnrubg.easypanel.host/webhook-test/generar-imagenes-ia'
const WEBHOOK_PROD = 'https://velostrategix-n8n.lnrubg.easypanel.host/webhook/generar-imagenes-ia'

const ChatImagenesIAInline = ({
  producto,
  onImagenesGeneradas
}) => {
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

  const [mensajes, setMensajes] = useState([])
  const [mensajeActual, setMensajeActual] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [imagenTemporal, setImagenTemporal] = useState(null)
  const [pieDeFoto, setPieDeFoto] = useState('')
  const [chatIniciado, setChatIniciado] = useState(false)

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
    } catch {
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
        canalRef.current.postMessage({ type: 'sync', sessionId, origin: clientIdRef.current, payload: snapshot })
      }
    } catch {}
  }

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
    } catch {}

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

  const inicializarChat = () => {
    setChatIniciado(true)
    const nombreProducto = producto?.nombre === 'Producto sin nombre' ? 'tu producto' : producto?.nombre
    const mensajeBienvenida = {
      id: Date.now(),
      tipo: 'ia',
      texto: `¡Hola! 👋 Soy tu asistente de imágenes con IA.\n\nVoy a ayudarte a generar imágenes increíbles para **${nombreProducto}**.\n\n**¿Qué puedo hacer?**\n🎨 Generar imágenes profesionales\n📸 Crear variaciones de estilo\n🖼️ Combinar imágenes\n✨ Editar imágenes\n\n**¿Qué tipo de imagen quieres crear?**`,
      timestamp: new Date(),
      imagenes: []
    }
    setMensajes([mensajeBienvenida])
    guardarPersistencia({ mensajes: [{ ...mensajeBienvenida, timestamp: mensajeBienvenida.timestamp.toISOString() }] })
  }

  const enviarMensaje = async () => {
    if (!mensajeActual.trim() || cargando) return

    try {
      setCargando(true)
      setError('')

      const mensajeUsuario = { id: Date.now(), tipo: 'usuario', texto: mensajeActual, timestamp: new Date() }
      setMensajes(prev => [...prev, mensajeUsuario])
      const textoMensaje = mensajeActual
      setMensajeActual('')
      guardarPersistencia()

      const respuesta = await fetch(WEBHOOK_TEST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
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
        })
      })

      if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`)

      const resultado = await respuesta.json()
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
    } catch (err) {
      setError(err.message)
      setMensajes(prev => [...prev, { id: Date.now() + 1, tipo: 'error', texto: `Error: ${err.message}`, timestamp: new Date() }])
    } finally {
      setCargando(false)
    }
  }

  const subirImagenASupabase = async (archivo) => {
    const nombreArchivo = `chat-imagenes/${Date.now()}-${archivo.name}`
    const { error } = await clienteSupabase.storage.from('imagenes').upload(nombreArchivo, archivo)
    if (error) throw error
    const { data: urlData } = clienteSupabase.storage.from('imagenes').getPublicUrl(nombreArchivo)
    return urlData.publicUrl
  }

  const manejarSubidaImagen = async (evento) => {
    const archivo = evento.target.files[0]
    if (!archivo) return

    setCargando(true)
    try {
      let url: string
      try {
        url = await subirImagenASupabase(archivo)
      } catch {
        url = ''
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagenTemporal({
          base64: e.target.result as string,
          url: url || (e.target.result as string),
          nombre: archivo.name
        })
        setPieDeFoto('')
        setCargando(false)
      }
      reader.readAsDataURL(archivo)
    } catch (err) {
      setError('Error procesando imagen: ' + err.message)
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

      const respuesta = await fetch(WEBHOOK_PROD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          message: pieDeFoto.trim() || 'Imagen enviada',
          ...(esUrlSupabase ? { image_url: imagenTemporal.url } : { image: imagenTemporal.url }),
          producto_info: { id: producto?.id, nombre: producto?.nombre, descripcion: producto?.descripcion },
          timestamp: new Date().toISOString()
        })
      })

      if (!respuesta.ok) throw new Error(`Error: ${respuesta.status}`)

      const resultado = await respuesta.json()
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
    } catch (err) {
      setError(err.message)
      setMensajes(prev => [...prev, { id: Date.now() + 1, tipo: 'error', texto: `Error: ${err.message}`, timestamp: new Date() }])
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
    <ChatImagenesIAInlineUI
      producto={producto}
      chatIniciado={chatIniciado}
      mensajes={mensajes}
      mensajeActual={mensajeActual}
      cargando={cargando}
      error={error}
      imagenTemporal={imagenTemporal}
      pieDeFoto={pieDeFoto}
      mensajesRef={mensajesRef}
      inputMensajeRef={inputMensajeRef}
      setMensajeActual={setMensajeActual}
      setPieDeFoto={setPieDeFoto}
      inicializarChat={inicializarChat}
      enviarMensaje={enviarMensaje}
      manejarSubidaImagen={manejarSubidaImagen}
      enviarImagenConPie={enviarImagenConPie}
      cancelarImagen={cancelarImagen}
      manejarKeyPress={manejarKeyPress}
    />
  )
}

export default ChatImagenesIAInline
