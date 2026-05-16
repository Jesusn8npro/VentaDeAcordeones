import { useState, useCallback, useEffect } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'
import { comprimirImagen, CONFIGURACIONES_PREDEFINIDAS } from '../../../utilidades/compresionImagenes'

export function useSubirImagen(
  bucketDestino: string,
  listarArchivos: () => Promise<void>,
  setMensajeOk: (v: string) => void,
  setError: (v: string) => void
) {
  const [archivoNuevo, setArchivoNuevo] = useState<File | null>(null)
  const [nombreNuevo, setNombreNuevo] = useState('')
  const [optimizarNuevo, setOptimizarNuevo] = useState(true)
  const [presetNuevo, setPresetNuevo] = useState('web')
  const [calidadNueva, setCalidadNueva] = useState<number | null>(null)
  const [conservarOriginalNuevo, setConservarOriginalNuevo] = useState(true)
  const [subiendoNuevo, setSubiendoNuevo] = useState(false)
  const [urlPreviewNuevo, setUrlPreviewNuevo] = useState<string | null>(null)
  const [tamOriginalNuevoKB, setTamOriginalNuevoKB] = useState<number | null>(null)
  const [tamEstimadoNuevoKB, setTamEstimadoNuevoKB] = useState<number | null>(null)
  const [calculandoTamanoNuevo, setCalculandoTamanoNuevo] = useState(false)

  const subirNuevaImagen = useCallback(async () => {
    try {
      if (!archivoNuevo) return
      setSubiendoNuevo(true)
      const nombreBase = (nombreNuevo || archivoNuevo.name).trim()
      const tieneExt = /\.[a-zA-Z0-9]+$/.test(nombreBase)
      const extOrig = (archivoNuevo.type.split('/')[1] || (tieneExt ? nombreBase.split('.').pop() : 'jpg'))
      const baseName = tieneExt ? nombreBase.replace(/\.[a-zA-Z0-9]+$/, '') : nombreBase

      if (conservarOriginalNuevo) {
        const nombreOriginal = `${baseName}.original.${extOrig}`
        await clienteSupabase.storage.from(bucketDestino).upload(nombreOriginal, archivoNuevo, { upsert: true, contentType: archivoNuevo.type })
      }

      let archivoFinal: File | Blob = archivoNuevo
      if (optimizarNuevo) {
        const base = CONFIGURACIONES_PREDEFINIDAS[presetNuevo] || CONFIGURACIONES_PREDEFINIDAS.web
        const config = typeof calidadNueva === 'number' ? { ...base, quality: calidadNueva, convertSize: 0 } : base
        const { archivoComprimido } = await comprimirImagen(archivoNuevo, config)
        archivoFinal = archivoComprimido || archivoNuevo
      }
      const extFinal = (archivoFinal.type.split('/')[1] || extOrig || 'webp')
      const nombreFinal = `${baseName}.${extFinal}`

      await clienteSupabase.storage.from(bucketDestino).upload(nombreFinal, archivoFinal, { upsert: true, contentType: archivoFinal.type })
      await listarArchivos()
      setArchivoNuevo(null); setNombreNuevo(''); setCalidadNueva(null)
      if (urlPreviewNuevo) { URL.revokeObjectURL(urlPreviewNuevo); setUrlPreviewNuevo(null) }
      setMensajeOk('Imagen subida correctamente')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSubiendoNuevo(false)
    }
  }, [archivoNuevo, nombreNuevo, conservarOriginalNuevo, optimizarNuevo, presetNuevo, calidadNueva, bucketDestino, listarArchivos, urlPreviewNuevo, setMensajeOk, setError])

  useEffect(() => {
    const prepararPreview = async () => {
      try {
        setTamOriginalNuevoKB(null)
        setTamEstimadoNuevoKB(null)
        if (!archivoNuevo) return
        const url = URL.createObjectURL(archivoNuevo)
        setUrlPreviewNuevo(url)
        setTamOriginalNuevoKB(Math.round(archivoNuevo.size / 1024))
        if (optimizarNuevo) {
          setCalculandoTamanoNuevo(true)
          const base = CONFIGURACIONES_PREDEFINIDAS[presetNuevo] || CONFIGURACIONES_PREDEFINIDAS.web
          const config = typeof calidadNueva === 'number' ? { ...base, quality: calidadNueva, convertSize: 0 } : base
          try {
            const { archivoComprimido } = await comprimirImagen(archivoNuevo, config)
            setTamEstimadoNuevoKB(Math.round(archivoComprimido.size / 1024))
          } catch {
            setTamEstimadoNuevoKB(null)
          } finally {
            setCalculandoTamanoNuevo(false)
          }
        }
      } catch {}
    }
    prepararPreview()
    return () => { if (urlPreviewNuevo) { URL.revokeObjectURL(urlPreviewNuevo); setUrlPreviewNuevo(null) } }
  }, [archivoNuevo, optimizarNuevo, presetNuevo, calidadNueva])

  return {
    archivoNuevo, setArchivoNuevo,
    nombreNuevo, setNombreNuevo,
    optimizarNuevo, setOptimizarNuevo,
    presetNuevo, setPresetNuevo,
    calidadNueva, setCalidadNueva,
    conservarOriginalNuevo, setConservarOriginalNuevo,
    subiendoNuevo, urlPreviewNuevo,
    tamOriginalNuevoKB, tamEstimadoNuevoKB, calculandoTamanoNuevo,
    subirNuevaImagen
  }
}
