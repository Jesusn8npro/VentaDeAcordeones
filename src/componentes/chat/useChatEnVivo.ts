import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../../contextos/ContextoAutenticacion'
import { useCarrito } from '../../contextos/CarritoContext'
import { clienteSupabase } from '../../configuracion/supabase'

const obtenerSessionId = (): string => {
  let id = localStorage.getItem('vda_chat_session_id')
  if (!id) {
    id = 'vda_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
    localStorage.setItem('vda_chat_session_id', id)
  }
  return id
}

function playRingSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    const beep = (t: number, freq: number, dur: number, vol = 0.12) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, t)
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(vol, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur)
      osc.start(t)
      osc.stop(t + dur)
    }
    const n = ctx.currentTime
    beep(n,        880, 0.18)
    beep(n + 0.05, 1100, 0.18)
    beep(n + 0.5,  880, 0.18)
    beep(n + 0.55, 1100, 0.18)
  } catch { /* bloqueado por el browser */ }
}

export function useChatEnVivo() {
  const { usuario } = useAuth()
  const { agregarAlCarrito } = useCarrito()

  const [chatAbierto, setChatAbierto] = useState(false)
  const [mensajes, setMensajes] = useState<any[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [escribiendo, setEscribiendo] = useState(false)
  const [chatId, setChatId] = useState<string>('')
  const [montado, setMontado] = useState(false)
  const [contadorNoLeidos, setContadorNoLeidos] = useState(0)
  const [imagenPopup, setImagenPopup] = useState<string | null>(null)
  const [datosUsuario, setDatosUsuario] = useState({ nombre: '', email: '', whatsapp: '', tipoConsulta: 'general' })
  const [mostrarModalDatos, setMostrarModalDatos] = useState(false)
  const [ringActivo, setRingActivo] = useState(false)

  const contenedorMensajesRef = useRef<HTMLDivElement>(null)
  const inputMensajeRef = useRef<HTMLInputElement>(null)
  const historialCargadoRef = useRef(false)
  const usuarioInteractuoRef = useRef(false)

  // Inicialización desde localStorage (solo en cliente, tras primer render)
  useEffect(() => {
    setChatAbierto(localStorage.getItem('vda_chat_abierto') === 'true')
    try {
      const saved = localStorage.getItem('vda_chat_historial')
      if (saved) setMensajes(JSON.parse(saved))
    } catch {}
    setChatId(obtenerSessionId())
    setMontado(true)
  }, [])

  // Persistencia local (solo tras inicialización para no sobrescribir datos reales)
  useEffect(() => {
    if (!montado) return
    localStorage.setItem('vda_chat_historial', JSON.stringify(mensajes))
  }, [mensajes, montado])

  useEffect(() => {
    if (!montado) return
    localStorage.setItem('vda_chat_abierto', chatAbierto.toString())
  }, [chatAbierto, montado])

  // Detectar primera interacción del usuario (necesaria para AudioContext)
  useEffect(() => {
    const marcar = () => { usuarioInteractuoRef.current = true }
    document.addEventListener('click', marcar, { once: true })
    document.addEventListener('scroll', marcar, { once: true })
    document.addEventListener('keydown', marcar, { once: true })
    return () => {
      document.removeEventListener('click', marcar)
      document.removeEventListener('scroll', marcar)
      document.removeEventListener('keydown', marcar)
    }
  }, [])

  // Ring automático: 8 segundos después de cargar, una sola vez por sesión
  useEffect(() => {
    if (chatAbierto || sessionStorage.getItem('vda_chat_ring_hecho')) return
    const timer = setTimeout(() => {
      if (chatAbierto) return
      sessionStorage.setItem('vda_chat_ring_hecho', '1')
      setRingActivo(true)
      if (usuarioInteractuoRef.current) playRingSound()
      setTimeout(() => setRingActivo(false), 2000)
    }, 8000)
    return () => clearTimeout(timer)
  }, [])

  const agregarMensaje = useCallback((mensaje: any) => {
    setMensajes(prev => prev.some(m => m.id === mensaje.id) ? prev : [...prev, mensaje])
  }, [])

  const scrollAlFinal = useCallback(() => {
    requestAnimationFrame(() => {
      const el = contenedorMensajesRef.current
      if (el) el.scrollTop = el.scrollHeight
    })
  }, [])

  const cargarHistorial = async (sessionId: string) => {
    try {
      const { data, error } = await clienteSupabase
        .from('chats_web')
        .select('id, message, created_at')
        .eq('session_id', sessionId)
        .order('id', { ascending: true })
        .limit(50)
      if (error || !data) return []
      return data.map((r: any) => {
        const m = r.message
        if (!m?.content) return null
        return {
          id: `db_${r.id}`,
          texto: m.content,
          esUsuario: m.role === 'user' || m.type === 'human',
          timestamp: new Date(m.timestamp || r.created_at),
          tipo: 'texto'
        }
      }).filter(Boolean)
    } catch { return [] }
  }

  // Inicialización cuando el chat se abre
  useEffect(() => {
    if (!chatAbierto) return

    if (usuario?.email) {
      setDatosUsuario(prev => ({
        ...prev,
        email: prev.email || usuario.email || '',
        nombre: prev.nombre || usuario.user_metadata?.full_name || ''
      }))
    }

    if (historialCargadoRef.current) return
    historialCargadoRef.current = true

    cargarHistorial(chatId).then(historial => {
      if (historial.length > 0) {
        setMensajes(historial)
      } else {
        setMensajes(prev => {
          if (prev.length > 0) return prev
          const saludo = usuario?.user_metadata?.full_name
            ? `¡Hola, ${usuario.user_metadata.full_name}! Soy Melodía, tu asistente de VentaDeAcordeones.Com. ¿Qué tipo de acordeón estás buscando?`
            : '¡Hola! Soy Melodía, tu asistente de VentaDeAcordeones.Com. ¿Qué tipo de acordeón estás buscando hoy?'
          return [{ id: 'bienvenida', texto: saludo, esUsuario: false, timestamp: new Date(), tipo: 'sistema' }]
        })
      }
    })
  }, [chatAbierto, chatId, usuario?.email])

  useEffect(() => { scrollAlFinal() }, [mensajes, escribiendo, scrollAlFinal])

  useEffect(() => {
    if (chatAbierto && inputMensajeRef.current) {
      setTimeout(() => inputMensajeRef.current?.focus(), 100)
    }
  }, [chatAbierto])

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!nuevoMensaje.trim()) return

    const textoEnviado = nuevoMensaje.trim()
    agregarMensaje({ id: `user_${Date.now()}`, texto: textoEnviado, esUsuario: true, timestamp: new Date(), tipo: 'texto' })
    setNuevoMensaje('')
    setEscribiendo(true)

    try {
      const { data, error } = await clienteSupabase.functions.invoke('chat-acordeones', {
        body: {
          chat_id: chatId,
          mensaje: textoEnviado,
          usuario_id: usuario?.id || null,
          pagina_origen: window.location.pathname
        }
      })

      if (error) throw error

      // Si el agente solicitó agregar al carrito, ejecutarlo en el frontend
      if (data?.accion?.tipo === 'agregar_carrito' && data.accion.producto) {
        try {
          await agregarAlCarrito(data.accion.producto, data.accion.cantidad ?? 1)
        } catch { /* el agente ya informa del error en su texto */ }
      }

      agregarMensaje({
        id: `bot_${Date.now()}`,
        texto: data?.respuesta || 'Disculpa, no pude procesar tu mensaje. ¿Puedes intentarlo de nuevo?',
        esUsuario: false,
        timestamp: new Date(),
        tipo: 'texto'
      })
    } catch {
      agregarMensaje({
        id: `bot_${Date.now()}`,
        texto: 'Lo siento, no pude procesar tu mensaje en este momento. Por favor intenta de nuevo.',
        esUsuario: false,
        timestamp: new Date(),
        tipo: 'texto'
      })
    } finally {
      setEscribiendo(false)
    }
  }

  const manejarDatosModal = (datos: any) => {
    setDatosUsuario(datos)
    try { localStorage.setItem('vda_chat_datos', JSON.stringify(datos)) } catch { /* ignore */ }
    setMostrarModalDatos(false)
    agregarMensaje({
      id: `confirm_${Date.now()}`,
      texto: `¡Perfecto, ${datos.nombre || 'amigo'}! Ya tengo tus datos guardados. ¿En qué más puedo ayudarte?`,
      esUsuario: false,
      timestamp: new Date(),
      tipo: 'sistema'
    })
  }

  const toggleChat = () => {
    setChatAbierto(prev => {
      if (prev) return false
      setContadorNoLeidos(0)
      return true
    })
  }

  return {
    chatAbierto, mensajes, nuevoMensaje, setNuevoMensaje,
    escribiendo, contadorNoLeidos, imagenPopup, setImagenPopup,
    datosUsuario, setDatosUsuario, mostrarModalDatos, setMostrarModalDatos,
    ringActivo,
    contenedorMensajesRef, inputMensajeRef,
    manejarEnvio, manejarDatosModal, toggleChat, scrollAlFinal
  }
}
