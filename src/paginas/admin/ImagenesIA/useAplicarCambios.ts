import { useState, useCallback, useEffect } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'
import { comprimirImagen, CONFIGURACIONES_PREDEFINIDAS } from '../../../utilidades/compresionImagenes'

interface ArchivoSeleccionado {
  key?: string
  path: string
  name: string
}

export function useAplicarCambios(
  imagenModal: string | null,
  archivoSeleccionado: ArchivoSeleccionado | null,
  bucketSeleccionado: string,
  obtenerUrlPublica: (key: string) => string,
  listarArchivos: () => Promise<void>,
  setImagenModal: (v: string) => void,
  setModalAbierto: (v: boolean) => void,
  setMensajeOk: (v: string) => void,
  setError: (v: string) => void
) {
  const [guardandoCampo, setGuardandoCampo] = useState(false)
  const [blobOriginalModal, setBlobOriginalModal] = useState<Blob | null>(null)
  const [tamOriginalKB, setTamOriginalKB] = useState<number | null>(null)
  const [tamEstimadoKB, setTamEstimadoKB] = useState<number | null>(null)
  const [calculandoTamano, setCalculandoTamano] = useState(false)
  const [presetCompresion, setPresetCompresion] = useState('web')
  const [calidadManual, setCalidadManual] = useState<number | null>(null)
  const [actualizarActiva, setActualizarActiva] = useState(true)
  const [conservarOriginal, setConservarOriginal] = useState(true)
  const [productoSeleccionadoId, setProductoSeleccionadoId] = useState<string | null>(null)
  const [campoSeleccionado, setCampoSeleccionado] = useState('imagen_principal')
  const [nombreDestino, setNombreDestino] = useState('')

  useEffect(() => {
    const cargarBlob = async () => {
      try {
        if (!archivoSeleccionado) return
        const key = archivoSeleccionado.key || `${archivoSeleccionado.path}${archivoSeleccionado.name}`
        const url = obtenerUrlPublica(key)
        const resp = await fetch(url)
        const blob = await resp.blob()
        setBlobOriginalModal(blob)
        setTamOriginalKB(Math.round(blob.size / 1024))
      } catch {
        setBlobOriginalModal(null)
        setTamOriginalKB(null)
      }
    }
    cargarBlob()
  }, [archivoSeleccionado, obtenerUrlPublica])

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>
    const estimar = async () => {
      try {
        if (!blobOriginalModal) return
        setCalculandoTamano(true)
        const base = CONFIGURACIONES_PREDEFINIDAS[presetCompresion] || CONFIGURACIONES_PREDEFINIDAS.web
        const config = typeof calidadManual === 'number' ? { ...base, quality: calidadManual, convertSize: 0 } : base
        const { archivoComprimido } = await comprimirImagen(blobOriginalModal, config)
        setTamEstimadoKB(Math.round(archivoComprimido.size / 1024))
      } catch {
        setTamEstimadoKB(null)
      } finally {
        setCalculandoTamano(false)
      }
    }
    t = setTimeout(estimar, 250)
    return () => clearTimeout(t)
  }, [blobOriginalModal, presetCompresion, calidadManual])

  const aplicarCambios = useCallback(async () => {
    try {
      setGuardandoCampo(true)
      const urlActual = imagenModal || obtenerUrlPublica(`${archivoSeleccionado!.path}${archivoSeleccionado!.name}`)
      const respActual = await fetch(urlActual)
      const blobActual = await respActual.blob()

      if (conservarOriginal) {
        const extOrig = (blobActual.type.split('/')[1] || 'jpg')
        const pathBackup = `productos/${productoSeleccionadoId}/originales/${campoSeleccionado}.original.${extOrig}`
        const { data: pubBackup } = clienteSupabase.storage.from(bucketSeleccionado).getPublicUrl(pathBackup)
        const hayBackup = pubBackup?.publicUrl ? await (async () => {
          try { const r = await fetch(pubBackup.publicUrl); return r.ok } catch { return false }
        })() : false
        if (!hayBackup) {
          const { error: errBackup } = await clienteSupabase.storage
            .from(bucketSeleccionado)
            .upload(pathBackup, blobActual, { upsert: false, contentType: blobActual.type })
          if (errBackup && errBackup.message?.includes('already exists') === false) throw errBackup
        }
      }

      const base = CONFIGURACIONES_PREDEFINIDAS[presetCompresion] || CONFIGURACIONES_PREDEFINIDAS.web
      const config = typeof calidadManual === 'number' ? { ...base, quality: calidadManual, convertSize: 0 } : base
      let archivoFinal: Blob = blobActual
      if (actualizarActiva) {
        const { archivoComprimido } = await comprimirImagen(blobActual, config)
        archivoFinal = archivoComprimido || blobActual
      }
      const extFinal = (archivoFinal.type.split('/')[1] || 'webp')
      const originalKey = archivoSeleccionado!.key || `${archivoSeleccionado!.path}${archivoSeleccionado!.name}`
      const pathFinal = (() => {
        const nombreBaseDest = nombreDestino?.trim()
        if (!conservarOriginal) {
          if (nombreBaseDest) {
            const tieneExt = /\.[a-zA-Z0-9]+$/.test(nombreBaseDest)
            const nuevoNombre = tieneExt ? nombreBaseDest : `${nombreBaseDest}.${extFinal}`
            return `${archivoSeleccionado!.path}${nuevoNombre}`
          }
          return originalKey
        }
        const nombreBase = (nombreBaseDest || `${campoSeleccionado}`)
        if (nombreBaseDest) {
          const tieneExt = /\.[a-zA-Z0-9]+$/.test(nombreBase)
          const nombreConExt = tieneExt ? nombreBase : `${nombreBase}.${extFinal}`
          return `productos/${productoSeleccionadoId}/${campoSeleccionado}/${nombreConExt}`
        }
        return `productos/${productoSeleccionadoId}/${campoSeleccionado}.${extFinal}`
      })()

      const { error: errUpload } = await clienteSupabase.storage
        .from(bucketSeleccionado)
        .upload(pathFinal, archivoFinal, { upsert: true, contentType: archivoFinal.type })
      if (errUpload) throw errUpload

      const { data: pubFinal } = clienteSupabase.storage.from(bucketSeleccionado).getPublicUrl(pathFinal)
      if (!pubFinal?.publicUrl) throw new Error('No se pudo obtener URL pública del destino')
      const okFinal = await (async () => { try { const r = await fetch(pubFinal.publicUrl); if (!r.ok) return false; const b = await r.blob(); return b.size > 0 } catch { return false } })()
      if (!okFinal) throw new Error('El archivo optimizado no está disponible aún')

      const { data: row, error: errRow } = await clienteSupabase
        .from('producto_imagenes')
        .select('producto_id')
        .eq('producto_id', productoSeleccionadoId)
        .single()
      if (!errRow && row) {
        await clienteSupabase
          .from('producto_imagenes')
          .update({ [campoSeleccionado]: pubFinal.publicUrl, actualizado_el: new Date().toISOString() })
          .eq('producto_id', productoSeleccionadoId)
      } else {
        await clienteSupabase
          .from('producto_imagenes')
          .insert({ producto_id: productoSeleccionadoId, [campoSeleccionado]: pubFinal.publicUrl, estado: 'pendiente' })
      }

      if (!conservarOriginal && originalKey && originalKey !== pathFinal) {
        await clienteSupabase.storage.from(bucketSeleccionado).remove([originalKey])
      }

      setImagenModal(`${pubFinal.publicUrl}?v=${Date.now()}`)
      await listarArchivos()
      setModalAbierto(false)
      setMensajeOk('Cambios aplicados correctamente')
      setProductoSeleccionadoId(null)
      setCampoSeleccionado('')
      setNombreDestino('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setGuardandoCampo(false)
    }
  }, [imagenModal, archivoSeleccionado, conservarOriginal, actualizarActiva, presetCompresion,
    calidadManual, bucketSeleccionado, productoSeleccionadoId, campoSeleccionado, nombreDestino,
    obtenerUrlPublica, listarArchivos, setImagenModal, setModalAbierto, setMensajeOk, setError])

  return {
    guardandoCampo, tamOriginalKB, tamEstimadoKB, calculandoTamano,
    presetCompresion, setPresetCompresion,
    calidadManual, setCalidadManual,
    actualizarActiva, setActualizarActiva,
    conservarOriginal, setConservarOriginal,
    productoSeleccionadoId, setProductoSeleccionadoId,
    campoSeleccionado, setCampoSeleccionado,
    nombreDestino, setNombreDestino,
    aplicarCambios
  }
}
