import { clienteSupabase } from '../../../../configuracion/supabase'
import { comprimirParaEditor, CONFIGURACIONES_PREDEFINIDAS, comprimirImagen } from '../../../../utilidades/compresionImagenes'

export const CATEGORIAS_IMAGENES = {
  principales: {
    titulo: '🖼️ Imágenes Principales',
    descripcion: 'Imágenes principales del producto para mostrar en la landing',
    campos: [
      { key: 'imagen_principal', label: 'Imagen Principal', descripcion: 'Imagen hero principal del producto' },
      { key: 'imagen_secundaria_1', label: 'Imagen Secundaria 1', descripcion: 'Primera imagen secundaria' },
      { key: 'imagen_secundaria_2', label: 'Imagen Secundaria 2', descripcion: 'Segunda imagen secundaria' },
      { key: 'imagen_secundaria_3', label: 'Imagen Secundaria 3', descripcion: 'Tercera imagen secundaria' },
      { key: 'imagen_secundaria_4', label: 'Imagen Secundaria 4', descripcion: 'Cuarta imagen secundaria' }
    ]
  },
  puntos_dolor: {
    titulo: '😰 Puntos de Dolor',
    descripcion: 'Imágenes que muestran problemas que resuelve el producto',
    campos: [
      { key: 'imagen_punto_dolor_1', label: 'Punto de Dolor 1', descripcion: 'Primera imagen de problema' },
      { key: 'imagen_punto_dolor_2', label: 'Punto de Dolor 2', descripcion: 'Segunda imagen de problema' }
    ]
  },
  soluciones: {
    titulo: '💡 Soluciones',
    descripcion: 'Imágenes que muestran cómo el producto resuelve los problemas',
    campos: [
      { key: 'imagen_solucion_1', label: 'Solución 1', descripcion: 'Primera imagen de solución' },
      { key: 'imagen_solucion_2', label: 'Solución 2', descripcion: 'Segunda imagen de solución' }
    ]
  },
  testimonios: {
    titulo: '👥 Testimonios',
    descripcion: 'Fotos de personas y productos para testimonios y reseñas',
    campos: [
      { key: 'imagen_testimonio_persona_1', label: 'Persona 1', descripcion: 'Foto de primera persona' },
      { key: 'imagen_testimonio_persona_2', label: 'Persona 2', descripcion: 'Foto de segunda persona' },
      { key: 'imagen_testimonio_persona_3', label: 'Persona 3', descripcion: 'Foto de tercera persona' },
      { key: 'imagen_testimonio_producto_1', label: 'Producto 1', descripcion: 'Foto de producto en testimonio 1' },
      { key: 'imagen_testimonio_producto_2', label: 'Producto 2', descripcion: 'Foto de producto en testimonio 2' },
      { key: 'imagen_testimonio_producto_3', label: 'Producto 3', descripcion: 'Foto de producto en testimonio 3' }
    ]
  },
  finales: {
    titulo: '🎯 Secciones Finales',
    descripcion: 'Imágenes para las secciones finales de la landing',
    campos: [
      { key: 'imagen_caracteristicas', label: 'Características', descripcion: 'Imagen de características del servicio' },
      { key: 'imagen_garantias', label: 'Garantías', descripcion: 'Imagen de garantías y políticas' },
      { key: 'imagen_cta_final', label: 'CTA Final', descripcion: 'Imagen del llamado a la acción final' }
    ]
  }
}

export const IMAGEN_INICIAL = {
  estado: 'pendiente',
  imagen_principal: null, imagen_secundaria_1: null, imagen_secundaria_2: null,
  imagen_secundaria_3: null, imagen_secundaria_4: null,
  imagen_punto_dolor_1: null, imagen_punto_dolor_2: null,
  imagen_solucion_1: null, imagen_solucion_2: null,
  imagen_testimonio_persona_1: null, imagen_testimonio_persona_2: null, imagen_testimonio_persona_3: null,
  imagen_testimonio_producto_1: null, imagen_testimonio_producto_2: null, imagen_testimonio_producto_3: null,
  imagen_caracteristicas: null, imagen_garantias: null, imagen_cta_final: null
}

const extraerBucketYKeyDeURL = (url: string) => {
  try {
    const u = new URL(url)
    const m = u.pathname.match(/\/object\/public\/([^/]+)\/(.+)/)
    if (m) return { bucket: m[1], key: m[2] }
  } catch {}
  return { bucket: 'imagenes_tienda', key: null }
}

const descargarConTimeout = (url: string, ms = 15000) =>
  Promise.race([
    fetch(url, { mode: 'cors' }),
    new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Tiempo de espera excedido')), ms))
  ])

const verificarDisponible = async (url: string, ms = 8000): Promise<boolean> => {
  try {
    const resp = await Promise.race([
      fetch(url, { method: 'GET' }),
      new Promise<never>((_, rej) => setTimeout(() => rej(new Error('Timeout')), ms))
    ]) as Response
    const blob = await resp.blob()
    return blob.size > 0
  } catch {
    return false
  }
}

export interface SubidaImagenCallbacks {
  setSubiendoImagenLanding: (v: boolean) => void
  setOptimizandoImagen: (v: boolean) => void
  setEstadisticasOptimizacion: (v: any) => void
  setStatsPorImagen: (fn: (prev: any) => any) => void
  setImagenesLanding: (fn: (prev: any) => any) => void
  setArchivoSeleccionadoPorKey: (fn: (prev: any) => any) => void
  setNombreDestinoPorImagen: (fn: (prev: any) => any) => void
  manejarExito: (msg: string) => void
  manejarError: (msg: string) => void
}

export const manejarSubidaImagenAsync = async (
  archivo: File,
  tipoImagen: string,
  productoId: string,
  presetsPorImagen: Record<string, string>,
  presetCompresion: string,
  calidadPorImagen: Record<string, number>,
  conservarOriginalPorImagen: Record<string, boolean>,
  nombreDestinoPorImagen: Record<string, string>,
  imagenesLandingActual: Record<string, any>,
  cb: SubidaImagenCallbacks
) => {
  if (!archivo.type.startsWith('image/')) { cb.manejarError('Por favor selecciona un archivo de imagen válido'); return }
  if (archivo.size > 5 * 1024 * 1024) { cb.manejarError('La imagen es demasiado grande. Máximo 5MB permitido'); return }

  cb.setSubiendoImagenLanding(true)
  cb.setOptimizandoImagen(true)

  let archivoFinal: Blob = archivo
  try {
    const presetElegido = presetsPorImagen[tipoImagen] || presetCompresion
    const calidadElegida = calidadPorImagen[tipoImagen]
    let resultado: any
    if (typeof calidadElegida === 'number') {
      const base = CONFIGURACIONES_PREDEFINIDAS[presetElegido] || CONFIGURACIONES_PREDEFINIDAS.web
      resultado = await comprimirImagen(archivo, { ...base, quality: calidadElegida, convertSize: 0 })
      archivoFinal = resultado.archivoComprimido || archivo
    } else {
      resultado = await comprimirParaEditor(archivo, presetElegido)
      archivoFinal = resultado.archivo || archivo
    }
    cb.setEstadisticasOptimizacion(resultado.estadisticas)
    cb.setStatsPorImagen(prev => ({ ...prev, [tipoImagen]: resultado.estadisticas }))
  } catch {
    // continue with original
  }
  cb.setOptimizandoImagen(false)

  try {
    let extOpt = 'webp'
    const extOrig = ((archivo?.type?.split('/')[1] || 'jpg').toLowerCase() === 'jpeg' ? 'jpg' : (archivo?.type?.split('/')[1] || 'jpg').toLowerCase())
    const conservar = conservarOriginalPorImagen[tipoImagen] ?? true
    const nombreDestino = (nombreDestinoPorImagen[tipoImagen] || '').trim()
    const nombreOriginal = `originales/${productoId}/${tipoImagen}.${extOrig}`
    let nombreOptimizado = `optimizadas/${productoId}/${tipoImagen}.${extOpt}`

    if (!conservar) {
      if (imagenesLandingActual[tipoImagen]) {
        const { bucket, key } = extraerBucketYKeyDeURL(imagenesLandingActual[tipoImagen])
        if (nombreDestino) {
          const tieneExt = /\.[a-zA-Z0-9]+$/.test(nombreDestino)
          const nuevoNombre = tieneExt ? nombreDestino : `${nombreDestino}.${extOpt}`
          const carpeta = key ? key.replace(/[^/]+$/, '') : `optimizadas/${productoId}/`
          nombreOptimizado = `${carpeta}${nuevoNombre}`
          const { error: errUp } = await clienteSupabase.storage.from(bucket).upload(nombreOptimizado, archivoFinal, { cacheControl: '3600', upsert: true })
          if (errUp) throw errUp
          if (key && key !== nombreOptimizado) await clienteSupabase.storage.from(bucket).remove([key])
        } else if (key) {
          const { error: errUp } = await clienteSupabase.storage.from(bucket).upload(key, archivoFinal, { cacheControl: '3600', upsert: true })
          if (errUp) throw errUp
          nombreOptimizado = key
        } else {
          const { error: errUp } = await clienteSupabase.storage.from('imagenes_tienda').upload(nombreOptimizado, archivoFinal, { cacheControl: '3600', upsert: true })
          if (errUp) throw errUp
        }
      } else {
        const { error: errUp } = await clienteSupabase.storage.from('imagenes_tienda').upload(nombreOptimizado, archivoFinal, { cacheControl: '3600', upsert: true })
        if (errUp) throw errUp
      }
    } else {
      await clienteSupabase.storage.from('imagenes_tienda').upload(nombreOriginal, archivo, { cacheControl: '3600', upsert: true })
      const { error: errUp } = await clienteSupabase.storage.from('imagenes_tienda').upload(nombreOptimizado, archivoFinal, { cacheControl: '3600', upsert: true })
      if (errUp) throw errUp
    }

    const { data: { publicUrl } } = clienteSupabase.storage.from('imagenes_tienda').getPublicUrl(nombreOptimizado)
    const okFinal = await verificarDisponible(publicUrl)
    if (!okFinal) throw new Error('Verificación fallida: la imagen optimizada no está disponible')

    cb.setImagenesLanding(prev => ({ ...prev, [tipoImagen]: publicUrl }))
    cb.setArchivoSeleccionadoPorKey(prev => ({ ...prev, [tipoImagen]: archivo }))

    const { error: errorGuardar } = await clienteSupabase
      .from('producto_imagenes')
      .upsert({ ...imagenesLandingActual, [tipoImagen]: publicUrl, producto_id: productoId })
    if (errorGuardar) throw errorGuardar

    cb.manejarExito('Imagen subida y guardada correctamente')
    cb.setNombreDestinoPorImagen(prev => ({ ...prev, [tipoImagen]: '' }))
  } catch (err: any) {
    cb.manejarError(`Error al subir la imagen: ${err.message}`)
  } finally {
    cb.setSubiendoImagenLanding(false)
  }
}

export interface ReoptimizarCallbacks {
  setOptimizandoPorKey: (fn: (prev: any) => any) => void
  setSubiendoImagenLanding: (v: boolean) => void
  setOptimizandoImagen: (v: boolean) => void
  setStatsPorImagen: (fn: (prev: any) => any) => void
  setEstadisticasOptimizacion: (v: any) => void
  setImagenesLanding: (fn: (prev: any) => any) => void
  setNombreDestinoPorImagen: (fn: (prev: any) => any) => void
  manejarExito: (msg: string) => void
  manejarError: (msg: string) => void
}

export const reoptimizarImagenAsync = async (
  tipoImagen: string,
  productoId: string,
  imagenesLandingActual: Record<string, any>,
  optimizandoPorKey: Record<string, boolean>,
  presetsPorImagen: Record<string, string>,
  presetCompresion: string,
  calidadPorImagen: Record<string, number>,
  conservarOriginalPorImagen: Record<string, boolean>,
  nombreDestinoPorImagen: Record<string, string>,
  cb: ReoptimizarCallbacks
) => {
  if (optimizandoPorKey[tipoImagen]) return
  const urlActual = imagenesLandingActual[tipoImagen]
  if (!urlActual) return

  cb.setOptimizandoPorKey(prev => ({ ...prev, [tipoImagen]: true }))
  cb.setSubiendoImagenLanding(true)
  cb.setOptimizandoImagen(true)

  try {
    const respuesta = await descargarConTimeout(urlActual)
    const blobOriginal = await respuesta.blob()

    const presetElegido = presetsPorImagen[tipoImagen] || presetCompresion
    const calidadElegida = calidadPorImagen[tipoImagen]
    let resultado: any
    if (typeof calidadElegida === 'number') {
      const base = CONFIGURACIONES_PREDEFINIDAS[presetElegido] || CONFIGURACIONES_PREDEFINIDAS.web
      resultado = await comprimirImagen(blobOriginal, { ...base, quality: calidadElegida, convertSize: 0 })
    } else {
      resultado = await comprimirParaEditor(blobOriginal, presetElegido)
    }

    const archivoFinal = resultado.archivoComprimido || resultado.archivo || blobOriginal
    cb.setStatsPorImagen(prev => ({ ...prev, [tipoImagen]: resultado.estadisticas }))
    cb.setEstadisticasOptimizacion(resultado.estadisticas)

    const extension = 'webp'
    const conservar = conservarOriginalPorImagen[tipoImagen] ?? true
    const nombreDestino = (nombreDestinoPorImagen[tipoImagen] || '').trim()
    const { bucket, key: originalKey } = extraerBucketYKeyDeURL(urlActual)
    let destinoKey = `optimizadas/${productoId}/${tipoImagen}.${extension}`

    if (!conservar) {
      if (nombreDestino) {
        const tieneExt = /\.[a-zA-Z0-9]+$/.test(nombreDestino)
        const nuevoNombre = tieneExt ? nombreDestino : `${nombreDestino}.${extension}`
        const carpeta = originalKey ? originalKey.replace(/[^/]+$/, '') : `optimizadas/${productoId}/`
        destinoKey = `${carpeta}${nuevoNombre}`
      } else if (originalKey) {
        destinoKey = originalKey
      }
    }

    const { error } = await clienteSupabase.storage.from(bucket).upload(destinoKey, archivoFinal, { cacheControl: '3600', upsert: true })
    if (error) throw error

    const { data: { publicUrl } } = clienteSupabase.storage.from(bucket).getPublicUrl(destinoKey)
    const ok = await verificarDisponible(publicUrl)
    if (!ok) throw new Error('La imagen optimizada no se pudo verificar en Storage')

    cb.setImagenesLanding(prev => ({ ...prev, [tipoImagen]: publicUrl }))

    const { error: errorGuardar } = await clienteSupabase
      .from('producto_imagenes')
      .upsert({ ...imagenesLandingActual, [tipoImagen]: publicUrl, producto_id: productoId })
    if (errorGuardar) throw errorGuardar

    if (!conservar && originalKey && originalKey !== destinoKey) {
      await clienteSupabase.storage.from(bucket).remove([originalKey])
    }

    cb.manejarExito('Imagen reoptimizada y guardada correctamente')
    cb.setNombreDestinoPorImagen(prev => ({ ...prev, [tipoImagen]: '' }))
  } catch (err: any) {
    cb.manejarError('No se pudo reoptimizar la imagen')
  } finally {
    cb.setSubiendoImagenLanding(false)
    cb.setOptimizandoImagen(false)
    cb.setOptimizandoPorKey(prev => ({ ...prev, [tipoImagen]: false }))
  }
}

export interface AplicarCambiosCallbacks {
  setGuardandoCampo: (v: boolean) => void
  setImagenesLanding: (fn: (prev: any) => any) => void
  setNombreDestinoPorImagen: (fn: (prev: any) => any) => void
  cerrarModalCampo: () => void
  manejarError: (msg: string) => void
}

export const aplicarCambiosCampoAsync = async (
  campoModalKey: string,
  imagenModal: string,
  productoId: string,
  presetsPorImagen: Record<string, string>,
  presetCompresion: string,
  calidadPorImagen: Record<string, number>,
  actualizarPorImagen: Record<string, boolean>,
  conservarOriginalPorImagen: Record<string, boolean>,
  nombreDestinoPorImagen: Record<string, string>,
  cb: AplicarCambiosCallbacks
) => {
  if (!campoModalKey || !imagenModal) return
  cb.setGuardandoCampo(true)
  try {
    const resp = await fetch(imagenModal)
    const blobActual = await resp.blob()
    const preset = presetsPorImagen[campoModalKey] || presetCompresion
    const calidad = calidadPorImagen[campoModalKey]
    let archivoFinal: Blob = blobActual

    if (actualizarPorImagen[campoModalKey] ?? true) {
      const base = CONFIGURACIONES_PREDEFINIDAS[preset] || CONFIGURACIONES_PREDEFINIDAS.web
      const config = typeof calidad === 'number' ? { ...base, quality: calidad, convertSize: 0 } : base
      const { archivoComprimido } = await comprimirImagen(blobActual, config)
      archivoFinal = archivoComprimido || blobActual
    }

    const extFinal = (archivoFinal.type.split('/')[1] || 'webp')
    const { bucket, key: originalKey } = extraerBucketYKeyDeURL(imagenModal)
    const nombreBaseDest = (nombreDestinoPorImagen[campoModalKey] || '').trim()
    let destinoKey = `optimizadas/${productoId}/${campoModalKey}.${extFinal}`
    const conservar = conservarOriginalPorImagen[campoModalKey] ?? true

    if (!conservar) {
      if (nombreBaseDest) {
        const tieneExt = /\.[a-zA-Z0-9]+$/.test(nombreBaseDest)
        const nuevoNombre = tieneExt ? nombreBaseDest : `${nombreBaseDest}.${extFinal}`
        const carpeta = originalKey ? originalKey.replace(/[^/]+$/, '') : `optimizadas/${productoId}/`
        destinoKey = `${carpeta}${nuevoNombre}`
      } else if (originalKey) {
        destinoKey = originalKey
      }
    }

    const { error: errUpload } = await clienteSupabase.storage.from(bucket).upload(destinoKey, archivoFinal, { upsert: true, contentType: archivoFinal.type })
    if (errUpload) throw errUpload

    const { data: pub } = clienteSupabase.storage.from(bucket).getPublicUrl(destinoKey)
    if (!pub?.publicUrl) throw new Error('No se pudo obtener URL pública del destino')

    const okFinal = await (async () => { try { const r = await fetch(pub.publicUrl); if (!r.ok) return false; const b = await r.blob(); return b.size > 0 } catch { return false } })()
    if (!okFinal) throw new Error('El archivo optimizado no está disponible aún')

    const { data: row, error: errRow } = await clienteSupabase.from('producto_imagenes').select('producto_id').eq('producto_id', productoId).single()
    if (!errRow && row) {
      await clienteSupabase.from('producto_imagenes').update({ [campoModalKey]: pub.publicUrl, actualizado_el: new Date().toISOString() }).eq('producto_id', productoId)
    } else {
      await clienteSupabase.from('producto_imagenes').insert({ producto_id: productoId, [campoModalKey]: pub.publicUrl, estado: 'pendiente' })
    }

    if (!conservar && originalKey && originalKey !== destinoKey) {
      await clienteSupabase.storage.from(bucket).remove([originalKey])
    }

    cb.setImagenesLanding(prev => ({ ...prev, [campoModalKey]: pub.publicUrl }))
    cb.setNombreDestinoPorImagen(prev => ({ ...prev, [campoModalKey]: '' }))
    cb.cerrarModalCampo()
  } catch (err: any) {
    cb.manejarError(err?.message || 'Error aplicando cambios')
  } finally {
    cb.setGuardandoCampo(false)
  }
}
