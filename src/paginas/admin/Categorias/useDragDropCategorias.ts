import { useState, useRef, useCallback } from 'react'
import { clienteSupabase } from '../../../configuracion/supabase'

export function useDragDropCategorias() {
  const [dragOverCategoriaId, setDragOverCategoriaId] = useState<string | number | null>(null)
  const [asignando, setAsignando] = useState(false)
  const onActualizarRef = useRef<(() => Promise<void>) | null>(null)

  const registrarActualizacion = useCallback((fn: () => Promise<void>) => {
    onActualizarRef.current = fn
  }, [])

  const manejarDragInicio = (e: React.DragEvent, producto: { id: string | number }) => {
    e.dataTransfer.setData('text/productoId', String(producto.id))
    e.dataTransfer.effectAllowed = 'move'
  }

  const asignarProductoACategoria = async (productoId: string, categoriaId: string | number | null) => {
    if (!productoId || asignando) return

    setAsignando(true)
    try {
      const { data: { session } } = await clienteSupabase.auth.getSession()
      if (!session?.user) {
        alert('Debes iniciar sesión para actualizar productos.')
        return
      }

      const { error } = await clienteSupabase
        .from('productos')
        .update({ categoria_id: categoriaId })
        .eq('id', productoId)

      if (error) throw error

      await onActualizarRef.current?.()
    } catch {
      alert('Error al asignar el producto a la categoría')
    } finally {
      setAsignando(false)
    }
  }

  const manejarDropEnCategoria = async (e: React.DragEvent, categoria: { id: string | number }) => {
    e.preventDefault()
    const productoId = e.dataTransfer.getData('text/productoId')
    if (productoId && categoria?.id) {
      await asignarProductoACategoria(productoId, categoria.id)
    }
  }

  const manejarDropSinCategoria = async (e: React.DragEvent) => {
    e.preventDefault()
    const productoId = e.dataTransfer.getData('text/productoId')
    if (productoId) {
      await asignarProductoACategoria(productoId, null)
    }
  }

  return {
    dragOverCategoriaId,
    setDragOverCategoriaId,
    asignando,
    manejarDragInicio,
    manejarDropEnCategoria,
    manejarDropSinCategoria,
    registrarActualizacion
  }
}
