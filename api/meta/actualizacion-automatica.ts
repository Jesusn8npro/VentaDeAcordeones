import { createClient } from '@supabase/supabase-js'
import { generarFeedXML } from './feed-productos'

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

const BUCKET = 'feeds-meta'
const ARCHIVO = 'feed-productos.xml'

export async function actualizarFeed() {
  const inicio = Date.now()
  if (!supabase) return { exito: false, error: 'Supabase no configurado' }

  try {
    const xml = await generarFeedXML()

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(ARCHIVO, xml, { contentType: 'application/rss+xml', upsert: true })

    if (error) {
      // Intentar asegurar que el bucket existe y reintentar
      const bucket = await supabase.storage.createBucket(BUCKET, { public: true })
      if (bucket?.error) throw new Error(`Error al subir feed: ${error.message}`)
      const retry = await supabase.storage.from(BUCKET).upload(ARCHIVO, xml, { contentType: 'application/rss+xml', upsert: true })
      if (retry.error) throw new Error(`Error al subir feed: ${retry.error.message}`)
    }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(ARCHIVO)

    return {
      exito: true,
      url: publicUrl,
      duracion: Date.now() - inicio,
      mensaje: 'Feed actualizado correctamente'
    }
  } catch (err: any) {
    return { exito: false, error: err?.message, mensaje: 'Error al actualizar feed' }
  }
}

export async function obtenerEstadisticasFeed() {
  if (!supabase) return { error: 'Supabase no configurado' }

  try {
    const { data: archivos, error } = await supabase.storage.from(BUCKET).list('', { search: ARCHIVO })
    if (error) throw new Error(error.message)

    const archivo = archivos?.[0]
    if (!archivo) return { existe: false, mensaje: 'El feed aún no ha sido generado' }

    const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(ARCHIVO)
    const { count: totalProductos } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true })
      .eq('activo', true)
      .gt('stock', 0)

    return {
      existe: true,
      ultimaActualizacion: archivo.updated_at,
      tamanio: archivo.metadata?.size || 0,
      url: publicUrl,
      totalProductos: totalProductos || 0
    }
  } catch (err: any) {
    return { error: err?.message, mensaje: 'Error al obtener estadísticas del feed' }
  }
}
