import { useState, useEffect } from 'react'
import { clienteSupabase } from '../configuracion/supabase'

export function usarProducto(slug) {
  const [producto, setProducto] = useState(null)
  const [cargando, setCargando] = useState(false) // ⚡ Iniciamos en false para evitar flash de carga
  const [error, setError] = useState(null)

  useEffect(() => {
    if (slug) {
      cargarProducto()
    }
  }, [slug])

  const cargarProducto = async () => {
    setCargando(true)
    setError(null)

    try {
      // ⚡ Consulta optimizada con solo los campos necesarios
      const { data, error: errorConsulta } = await clienteSupabase
        .from('productos')
        .select(`
          *,
          promociones,
          categorias (
            id,
            nombre,
            icono,
            slug
          ),
          producto_imagenes (
            imagen_principal,
            imagen_secundaria_1,
            imagen_secundaria_2,
            imagen_secundaria_3,
            imagen_secundaria_4,
            imagen_punto_dolor_1,
            imagen_punto_dolor_2,
            imagen_solucion_1,
            imagen_solucion_2,
            imagen_testimonio_persona_1,
            imagen_testimonio_persona_2,
            imagen_testimonio_persona_3,
            imagen_testimonio_producto_1,
            imagen_testimonio_producto_2,
            imagen_testimonio_producto_3,
            imagen_caracteristicas,
            imagen_garantias,
            imagen_cta_final,
            estado,
            total_imagenes_generadas
          )
        `)
        .eq('slug', slug)
        .eq('activo', true)
        .single()

      // ⚡ Procesamiento de datos JSONB - IMPORTANTE PARA LA NUEVA ESTRUCTURA
      if (data) {

        // Utilidad: parsear posibles strings JSON a objetos
        const parseMaybeJson = (val, fallback = null) => {
          try {
            if (!val) return fallback
            if (typeof val === 'string') {
              const parsed = JSON.parse(val)
              return parsed
            }
            return val
          } catch (e) {
            return fallback
          }
        }
        
        // 🔄 Mapear las nuevas columnas JSONB a los nombres que espera la aplicación
        if (data.caracteristicas_jsonb) {
          data.caracteristicas = data.caracteristicas_jsonb
        }
        
        if (data.ventajas_jsonb) {
          data.ventajas = data.ventajas_jsonb
        }
        
        if (data.beneficios_jsonb) {
          data.beneficios = data.beneficios_jsonb
        }

        // 🔄 Parsear columnas antiguas que pueden venir como string JSON
        data.banner_animado = parseMaybeJson(data.banner_animado, data.banner_animado)
        data.puntos_dolor = parseMaybeJson(data.puntos_dolor, data.puntos_dolor)
        data.testimonios = parseMaybeJson(data.testimonios, data.testimonios)
        data.faq = parseMaybeJson(data.faq, data.faq)
        data.garantias = parseMaybeJson(data.garantias, data.garantias)
        
        // Procesar imágenes desde producto_imagenes → campos que usan los componentes
        if (data.producto_imagenes && data.producto_imagenes.length > 0) {
          const img = data.producto_imagenes[0]
          data.imagenes = img

          // fotos_principales y fotos_secundarias son los campos que leen las plantillas
          data.fotos_principales = [img.imagen_principal].filter(Boolean)
          data.fotos_secundarias = [
            img.imagen_secundaria_1,
            img.imagen_secundaria_2,
            img.imagen_secundaria_3,
            img.imagen_secundaria_4,
          ].filter(Boolean)
        } else {
          data.imagenes = {}
          data.fotos_principales = []
          data.fotos_secundarias = []
        }
      }

      if (errorConsulta) {
        throw errorConsulta
      }

      // ⚡ Procesamiento optimizado de datos
      if (data) {
      }

      setProducto(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return {
    producto,
    cargando,
    error,
    recargar: cargarProducto
  }
}












