import { clienteSupabase } from '../configuracion/supabase'

const TABLA = 'tareas_calendario'

// Utilidad: limpia entradas y asegura campos requeridos
const normalizarTarea = (t) => ({
  titulo: t.titulo?.trim() || '',
  descripcion: t.descripcion?.trim() || '',
  tipo: t.tipo || 'otro',
  estado: t.estado || 'pendiente',
  prioridad: t.prioridad || 'media',
  fecha_inicio: t.fecha_inicio || null,
  fecha_fin: t.fecha_fin || null,
  responsable_id: t.responsable_id || null,
  etiquetas: Array.isArray(t.etiquetas) ? t.etiquetas : [],
  dependencias: Array.isArray(t.dependencias) ? t.dependencias : [],
  producto_id: t.producto_id || null,
  categoria_id: t.categoria_id || null,
})

export async function listarTareas(filtros = {}) {
  let q = clienteSupabase.from(TABLA).select('*')

  if (filtros.desde && filtros.hasta) {
    q = q.gte('fecha_inicio', filtros.desde).lte('fecha_fin', filtros.hasta)
  }
  if (filtros.estado) q = q.eq('estado', filtros.estado)
  if (filtros.prioridad) q = q.eq('prioridad', filtros.prioridad)
  if (filtros.tipo) q = q.eq('tipo', filtros.tipo)
  if (filtros.producto_id) q = q.eq('producto_id', filtros.producto_id)
  if (filtros.categoria_id) q = q.eq('categoria_id', filtros.categoria_id)
  if (filtros.texto) q = q.ilike('titulo', `%${filtros.texto}%`)

  q = q.order('fecha_inicio', { ascending: true })
  const { data, error } = await q
  if (error) throw error
  return data || []
}

export async function obtenerTarea(id) {
  const { data, error } = await clienteSupabase.from(TABLA).select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function crearTarea(tarea) {
  const payload = normalizarTarea(tarea)
  const { data, error } = await clienteSupabase.from(TABLA).insert(payload).select().single()
  if (error) throw error
  return data
}

export async function actualizarTarea(id, cambios) {
  const payload = normalizarTarea(cambios)
  const { data, error } = await clienteSupabase.from(TABLA).update(payload).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function borrarTarea(id) {
  const { error } = await clienteSupabase.from(TABLA).delete().eq('id', id)
  if (error) throw error
  return true
}

export async function cambiarEstado(id, estado) {
  const { data, error } = await clienteSupabase.from(TABLA).update({ estado }).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function moverTareaFechas(id, fecha_inicio, fecha_fin) {
  const { data, error } = await clienteSupabase.from(TABLA)
    .update({ fecha_inicio, fecha_fin })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// Mapeo de colores por estado/prioridad para reutilizar
export const colorPorEstado = (estado) => {
  switch (estado) {
    case 'pendiente': return '#94a3b8' // slate
    case 'en_progreso': return '#3b82f6' // blue
    case 'bloqueado': return '#ef4444' // red
    case 'completada': return '#10b981' // green
    default: return '#64748b'
  }
}

export const bordePorPrioridad = (prioridad) => {
  switch (prioridad) {
    case 'alta': return '#ef4444'
    case 'media': return '#f59e0b'
    case 'baja': return '#22c55e'
    default: return '#cbd5e1'
  }
}