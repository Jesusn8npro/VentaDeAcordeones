import { clienteSupabase } from '../../configuracion/supabase'
import { mapRegistroAMensaje } from './chatUtils'

export const cargarHistorial = async (sessionId: string) => {
  if (!sessionId) return []
  try {
    const { data, error } = await clienteSupabase
      .from('chats_web')
      .select('id, session_id, message, created_at')
      .eq('session_id', sessionId)
      .order('id', { ascending: true })
      .limit(100)
    if (error || !data) return []
    return data.map(mapRegistroAMensaje).filter(Boolean)
  } catch { return [] }
}

export const registrarLead = async (datos: any, sessionId: string) => {
  try {
    await clienteSupabase.from('leadschat').upsert({
      chat_id: sessionId,
      nombre: datos.nombre,
      email: datos.email,
      whatsapp: datos.whatsapp,
      tipo_consulta: datos.tipoConsulta,
      updated_at: new Date().toISOString()
    }, { onConflict: 'email' })
  } catch { /* no-op */ }
}

export const enviarMensajeEdgeFunction = async (mensaje: string, chat_id: string, usuario_id: string | null, pagina_origen: string) => {
  const { data } = await clienteSupabase.functions.invoke('chat-acordeones', {
    body: { chat_id, mensaje, usuario_id, pagina_origen }
  })
  return data?.respuesta || null
}
