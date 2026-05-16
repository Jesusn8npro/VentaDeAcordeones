import { useState, useEffect } from 'react'
import React from 'react'
import {
  Music,
  Music2,
  Music3,
  Mic,
  Speaker,
  Radio,
  Tag
} from 'lucide-react'
import { clienteSupabase } from '../../configuracion/supabase'

export interface CategoriaMenu {
  id: string
  nombre: string
  slug: string
  icono: string
  descripcion: string
  orden: number
  cantidad: number
}

export const useCategoriasMenu = () => {
  const [categorias, setCategorias] = useState<CategoriaMenu[]>([])
  const [cargandoCategorias, setCargandoCategorias] = useState(false)

  useEffect(() => {
    cargarCategorias()
  }, [])

  const cargarCategorias = async () => {
    setCargandoCategorias(true)
    try {
      const { data: categoriasData, error: categoriasError } = await clienteSupabase
        .from('categorias')
        .select('id, nombre, slug, icono, descripcion, orden')
        .eq('activo', true)
        .order('orden', { ascending: true })
        .order('nombre', { ascending: true })

      if (categoriasError) throw categoriasError

      const categoriasConConteo = await Promise.all(
        (categoriasData || []).map(async (categoria) => {
          const { count, error: countError } = await clienteSupabase
            .from('productos')
            .select('*', { count: 'exact', head: true })
            .eq('categoria_id', categoria.id)
            .eq('activo', true)

          if (countError) return { ...categoria, cantidad: 0 }

          const slugFinal = categoria.slug || categoria.nombre
            .toLowerCase()
            .normalize('NFD')
            .replace(/[̀-ͯ]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .trim()
            .replace(/\s+/g, '-')

          return { ...categoria, slug: slugFinal, cantidad: count || 0 }
        })
      )
      setCategorias(categoriasConConteo as CategoriaMenu[])
    } catch (error) {
      setCategorias([])
    } finally {
      setCargandoCategorias(false)
    }
  }

  return { categorias, cargandoCategorias }
}

export const obtenerIconoCategoria = (categoria: CategoriaMenu): React.ReactNode => {
  const nombre = categoria.nombre?.toLowerCase() || ''
  if (nombre.includes('acordeon') || nombre.includes('acordeón')) return React.createElement(Music2, { size: 20 })
  if (nombre.includes('guitarra')) return React.createElement(Music3, { size: 20 })
  if (nombre.includes('bajo')) return React.createElement(Music3, { size: 20 })
  if (nombre.includes('armónica') || nombre.includes('armonica')) return React.createElement(Music, { size: 20 })
  if (nombre.includes('micro')) return React.createElement(Mic, { size: 20 })
  if (nombre.includes('amplif')) return React.createElement(Speaker, { size: 20 })
  if (nombre.includes('audio')) return React.createElement(Speaker, { size: 20 })
  if (nombre.includes('piano') || nombre.includes('teclado')) return React.createElement(Radio, { size: 20 })
  return React.createElement(Tag, { size: 20 })
}
