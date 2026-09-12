/**
 * Consulta de una ficha de producto, compartida por el SERVIDOR y el navegador.
 *
 * Antes esta consulta vivía solo dentro de `usarProducto` (un hook de cliente): el
 * servidor mandaba una página con un "Cargando…" y Google indexaba fichas vacías,
 * sin H1, sin texto y sin enlaces. Ahora `app/(sitio)/producto/[slug]/page.tsx`
 * ejecuta exactamente la misma consulta con el cliente de servidor y le pasa el
 * resultado ya normalizado a la plantilla, así que el HTML sale completo.
 */

// Campos que necesitan las plantillas de ficha (PlantillaCinema y compañía).
export const SELECT_PRODUCTO = `
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
`

const parsearJson = (valor: any, porDefecto: any = null) => {
  try {
    if (!valor) return porDefecto
    if (typeof valor === 'string') return JSON.parse(valor)
    return valor
  } catch {
    return porDefecto
  }
}

/**
 * Deja el registro tal y como lo esperan los componentes: columnas JSONB nuevas
 * mapeadas a sus nombres antiguos e imágenes aplanadas en fotos_principales /
 * fotos_secundarias.
 */
export function normalizarProducto(data: any) {
  if (!data) return data

  if (data.caracteristicas_jsonb) data.caracteristicas = data.caracteristicas_jsonb
  if (data.ventajas_jsonb) data.ventajas = data.ventajas_jsonb
  if (data.beneficios_jsonb) data.beneficios = data.beneficios_jsonb

  data.banner_animado = parsearJson(data.banner_animado, data.banner_animado)
  data.puntos_dolor = parsearJson(data.puntos_dolor, data.puntos_dolor)
  data.testimonios = parsearJson(data.testimonios, data.testimonios)
  data.faq = parsearJson(data.faq, data.faq)
  data.garantias = parsearJson(data.garantias, data.garantias)

  if (data.producto_imagenes && data.producto_imagenes.length > 0) {
    const img = data.producto_imagenes[0]
    data.imagenes = img
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

  return data
}

/** Trae la ficha completa por slug con el cliente Supabase que se le pase. */
export async function consultarProductoPorSlug(cliente: any, slug: string) {
  const { data, error } = await cliente
    .from('productos')
    .select(SELECT_PRODUCTO)
    .eq('slug', slug)
    .eq('activo', true)
    .maybeSingle()

  if (error) throw error
  return normalizarProducto(data)
}
