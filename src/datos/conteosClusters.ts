// Cuántos productos tiene realmente cada cluster, para que la portada no invente cifras.
// Antes IconosCategorias anunciaba "24 parrillas" y "38 correas" a pelo en el código: números
// que no salían de ningún lado y enlaces que iban todos a /tienda.
//
// Se resuelve con UNA sola consulta (no 14) y el reparto se hace en memoria, aplicando el mismo
// criterio que usa cada página de cluster en productosDeCluster(): por categoría si la tiene,
// y si no por palabras en el nombre descartando los acordeones enteros.
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import { CLUSTERS, esAccesorio } from '@/datos/clusters'

export type ConteosClusters = Record<string, number>

export async function obtenerConteosClusters(): Promise<ConteosClusters> {
  const vacio: ConteosClusters = {}
  try {
    const { data, error } = await supabaseServidor
      .from('productos')
      .select('nombre, categorias(slug)')
      .eq('activo', true)
      .gt('stock', 0)
    if (error) throw new Error(error.message)

    const filas = (data || []) as { nombre: string; categorias: { slug: string } | { slug: string }[] | null }[]
    // El join llega como objeto o como array de uno según la versión del cliente.
    const productos = filas.map((f) => ({
      nombre: f.nombre || '',
      categoria: (Array.isArray(f.categorias) ? f.categorias[0]?.slug : f.categorias?.slug) || '',
    }))

    const conteos: ConteosClusters = {}
    for (const c of CLUSTERS) {
      conteos[c.slug] = c.categoriaSlug
        ? productos.filter((p) => p.categoria === c.categoriaSlug).length
        : productos.filter(
            (p) => esAccesorio(p.nombre) && c.palabras.some((w) => p.nombre.toLowerCase().includes(w.toLowerCase())),
          ).length
    }
    return conteos
  } catch (e: any) {
    // Sin cifras la portada sigue saliendo: las tarjetas caen a su texto alternativo.
    console.error('[conteos] Supabase:', e?.message)
    return vacio
  }
}

// "12 modelos" / "1 modelo" / undefined si no hay dato, para no escribir "0 modelos".
export function etiquetaConteo(n: number | undefined, singular: string, plural: string): string | undefined {
  if (!n || n < 1) return undefined
  return `${n} ${n === 1 ? singular : plural}`
}
