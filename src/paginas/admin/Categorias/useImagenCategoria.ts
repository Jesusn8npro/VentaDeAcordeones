import { useState } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'

export function useImagenCategoria(onError: (msg: string) => void) {
  const [archivoImagen, setArchivoImagen] = useState<File | null>(null)
  const [previewImagen, setPreviewImagen] = useState<string | null>(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)

  const procesarArchivo = (archivo: File) => {
    if (!archivo.type.startsWith('image/')) {
      onError('Por favor selecciona un archivo de imagen válido')
      return
    }
    if (archivo.size > 5 * 1024 * 1024) {
      onError('La imagen debe ser menor a 5MB')
      return
    }
    setArchivoImagen(archivo)
    const reader = new FileReader()
    reader.onload = (e) => setPreviewImagen(e.target?.result as string)
    reader.readAsDataURL(archivo)
  }

  const manejarSeleccionArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (archivo) procesarArchivo(archivo)
  }

  const manejarDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const manejarDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const archivo = e.dataTransfer.files[0]
    if (archivo) procesarArchivo(archivo)
  }

  const subirImagen = async (): Promise<string> => {
    if (!archivoImagen) return ''
    try {
      setSubiendoImagen(true)
      const extension = archivoImagen.name.split('.').pop()
      const nombreArchivo = `categoria_${Date.now()}_${Math.random().toString(36).substring(2)}.${extension}`
      const { error } = await clienteSupabase.storage
        .from('imagenes_categorias')
        .upload(nombreArchivo, archivoImagen, { cacheControl: '3600', upsert: false })
      if (error) throw error
      const { data: { publicUrl } } = clienteSupabase.storage
        .from('imagenes_categorias')
        .getPublicUrl(nombreArchivo)
      return publicUrl
    } catch (error: any) {
      throw new Error('Error al subir la imagen: ' + error.message)
    } finally {
      setSubiendoImagen(false)
    }
  }

  const eliminarImagen = () => {
    setArchivoImagen(null)
    setPreviewImagen(null)
  }

  const resetImagen = () => {
    setArchivoImagen(null)
    setPreviewImagen(null)
    setSubiendoImagen(false)
  }

  return {
    archivoImagen,
    previewImagen,
    subiendoImagen,
    setPreviewImagen,
    manejarSeleccionArchivo,
    manejarDragOver,
    manejarDrop,
    subirImagen,
    eliminarImagen,
    resetImagen
  }
}
