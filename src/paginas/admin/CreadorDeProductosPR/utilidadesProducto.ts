export const toNum = (value: any): number | null => {
  if (!value || value === '') return null
  const num = parseFloat(String(value).replace(',', '.'))
  return isNaN(num) ? null : num
}

export const toInt = (value: any): number | null => {
  if (!value || value === '') return null
  const num = parseInt(String(value).replace(',', '.'), 10)
  return isNaN(num) ? null : num
}

export const procesarDimensiones = (dimensiones: any): any => {
  if (!dimensiones) return null
  if (typeof dimensiones === 'object') {
    if (dimensiones.alto !== undefined || dimensiones.ancho !== undefined || dimensiones.profundidad !== undefined) {
      return dimensiones
    }
    return JSON.stringify(dimensiones)
  }
  if (typeof dimensiones === 'string') return dimensiones.trim() || null
  return null
}

export const toJsonb = (val: any, fallback: any = null): any => {
  if (val === null || val === undefined) return fallback
  if (typeof val === 'string') {
    try { return JSON.parse(val) } catch { return fallback }
  }
  if (typeof val === 'object') return val
  return fallback
}

export const construirDatosParaGuardar = (datosProducto: Record<string, any>, modo: string) => ({
  nombre: datosProducto.nombre ? datosProducto.nombre.trim() : null,
  slug: datosProducto.slug || datosProducto.nombre.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-'),
  descripcion: (datosProducto.descripcion_titulo || datosProducto.descripcion_contenido)
    ? {
        titulo: (datosProducto.descripcion_titulo || '🚀 Descubre Todo lo que Necesitas Saber').trim(),
        contenido: (datosProducto.descripcion_contenido || '').trim()
      }
    : (datosProducto.descripcion ? datosProducto.descripcion.trim() : null),
  precio: toNum(datosProducto.precio),
  precio_original: toNum(datosProducto.precio_original),
  descuento: toInt(datosProducto.descuento),
  categoria_id: datosProducto.categoria_id || null,
  stock: toInt(datosProducto.stock),
  stock_minimo: toInt(datosProducto.stock_minimo),
  estado: datosProducto.estado || 'borrador',
  destacado: datosProducto.destacado || false,
  activo: datosProducto.activo !== false,
  ganchos: datosProducto.ganchos || [],
  palabras_clave: datosProducto.palabras_clave || [],
  ventajas_jsonb: toJsonb(datosProducto.ventajas),
  beneficios_jsonb: toJsonb(datosProducto.beneficios),
  caracteristicas_jsonb: toJsonb(datosProducto.caracteristicas),
  peso: toNum(datosProducto.peso),
  dimensiones: procesarDimensiones(datosProducto.dimensiones),
  marca: datosProducto.marca ? datosProducto.marca.trim() : null,
  modelo: datosProducto.modelo ? datosProducto.modelo.trim() : null,
  color: datosProducto.color ? datosProducto.color.trim() : null,
  talla: datosProducto.talla ? datosProducto.talla.trim() : null,
  material: datosProducto.material ? datosProducto.material.trim() : null,
  origen_pais: datosProducto.origen_pais ? datosProducto.origen_pais.trim() : null,
  numero_de_ventas: toInt(datosProducto.numero_de_ventas),
  calificacion_promedio: toNum(datosProducto.calificacion_promedio),
  total_resenas: toInt(datosProducto.total_resenas),
  banner_animado: toJsonb(datosProducto.banner_animado),
  puntos_dolor: toJsonb(datosProducto.puntos_dolor),
  testimonios: toJsonb(datosProducto.testimonios),
  faq: toJsonb(datosProducto.faq),
  garantias: toJsonb(datosProducto.garantias),
  cta_final: toJsonb(datosProducto.cta_final),
  promociones: toJsonb(datosProducto.promociones),
  meta_title: datosProducto.meta_title ? datosProducto.meta_title.trim() : null,
  meta_description: datosProducto.meta_description ? datosProducto.meta_description.trim() : null,
  landing_tipo: datosProducto.landing_tipo ? datosProducto.landing_tipo.trim() : 'basico',
  garantia_meses: toInt(datosProducto.garantia_meses),
  ...(modo === 'editar' && { actualizado_el: new Date().toISOString() })
})
