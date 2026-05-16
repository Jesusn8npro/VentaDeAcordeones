import { useState, useEffect } from 'react'
import React from 'react'
import {
  Smartphone,
  Laptop,
  Headphones,
  Camera,
  Watch,
  Gamepad2,
  Shirt,
  Home,
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
  const icono = categoria.icono?.toLowerCase() || ''
  if (nombre.includes('electrón') || nombre.includes('tecnolog') || icono.includes('smartphone')) return React.createElement(Smartphone, { size: 20 })
  if (nombre.includes('computador') || nombre.includes('laptop') || icono.includes('laptop')) return React.createElement(Laptop, { size: 20 })
  if (nombre.includes('audio') || nombre.includes('audífono') || icono.includes('headphones')) return React.createElement(Headphones, { size: 20 })
  if (nombre.includes('cámara') || nombre.includes('foto') || icono.includes('camera')) return React.createElement(Camera, { size: 20 })
  if (nombre.includes('reloj') || nombre.includes('watch') || icono.includes('watch')) return React.createElement(Watch, { size: 20 })
  if (nombre.includes('juego') || nombre.includes('gaming') || icono.includes('gamepad')) return React.createElement(Gamepad2, { size: 20 })
  if (nombre.includes('ropa') || nombre.includes('moda') || icono.includes('shirt')) return React.createElement(Shirt, { size: 20 })
  if (nombre.includes('hogar') || nombre.includes('casa') || icono.includes('home')) return React.createElement(Home, { size: 20 })
  return React.createElement(Tag, { size: 20 })
}
