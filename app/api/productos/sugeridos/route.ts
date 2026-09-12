import { NextResponse } from 'next/server'
import { obtenerSupabaseAdmin } from '../../_lib/supabaseAdmin'
import { leerBody } from '../../_lib/parseBody'
import { ipDe, permitir } from '../../_lib/rateLimit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/productos/sugeridos
 *
 * Recibe los ids de producto que hay en el carrito y devuelve 3–4 accesorios REALES
 * que lo complementan. Se resuelve en el servidor y no en el navegador porque:
 *   1. el precio y el stock con los que se decide salen de la BD, no de lo que el
 *      cliente tenga en memoria (nunca se sugiere algo agotado);
 *   2. evita traerse el catálogo entero al navegador solo para filtrarlo.
 *
 * Body: { ids: string[] }   Respuesta: { sugeridos: Sugerido[] }
 */

/** Tope de ids que se aceptan: el carrito ya limita a 50 unidades. */
const MAX_IDS = 50
const MAX_SUGERIDOS = 4
const MIN_SUGERIDOS = 3
/** Tope por categoría: tres audífonos casi iguales no son tres sugerencias. */
const MAX_POR_CATEGORIA = 2

/** Accesorios de acordeón: correa, estuche, fuelles, parrilla, broches. */
const ACCESORIOS_ACORDEON = {
  categorias: ['accesorios-acordeon', 'accesorios'],
  palabras: ['correa', 'estuche', 'fuelle', 'parrilla', 'broche', 'cinta', 'rejilla'],
}

/**
 * Qué complementa a qué, por slug de categoría.
 *
 * La regla es "lo que el cliente va a necesitar igual": quien se lleva un acordeón
 * necesita con qué colgarlo (correa), protegerlo (estuche) y repararlo (fuelles,
 * parrilla). Quien se lleva un micrófono necesita con qué escucharse (audífonos),
 * filtrarlo y por dónde entrarlo (interfaz). Nada de "también te puede gustar".
 */
const COMPLEMENTOS: Record<string, { categorias: string[]; palabras: string[] }> = {
  'acordeones-hohner-premium': ACCESORIOS_ACORDEON,
  'acordeones-hohner-personalizados': ACCESORIOS_ACORDEON,
  'acordeones-personalizados': ACCESORIOS_ACORDEON,
  'acordeones-rey-vallenato': ACCESORIOS_ACORDEON,
  'acordeones-nuevos': ACCESORIOS_ACORDEON,
  'acordeones-para-ninos': ACCESORIOS_ACORDEON,
  'armonicas': ACCESORIOS_ACORDEON,

  // Ya tiene accesorios: se le ofrecen los otros accesorios de la familia.
  'accesorios-acordeon': ACCESORIOS_ACORDEON,
  'accesorios': ACCESORIOS_ACORDEON,

  'microfonos-y-audio': {
    categorias: ['audifonos', 'microfonos-y-audio', 'equipos-de-grabacion'],
    palabras: ['filtro', 'antipop', 'soporte', 'pedestal', 'base', 'cable', 'adaptador', 'auricular', 'audifono', 'audífono', 'interfaz'],
  },
  'equipos-de-grabacion': {
    categorias: ['audifonos', 'microfonos-y-audio'],
    palabras: ['auricular', 'audifono', 'audífono', 'microfono', 'micrófono', 'filtro', 'cable', 'adaptador'],
  },
  // Ojo: aquí NO se listan 'cable' ni 'microfono' a propósito. Medio catálogo de
  // audífonos se llama "... Cable Ofc ... Sin Microfono", así que esas palabras
  // colaban otros audífonos como si fueran accesorios. Un audífono no complementa
  // a otro audífono: lo sustituye.
  'audifonos': {
    categorias: ['audifonos', 'microfonos-y-audio'],
    palabras: ['adaptador', 'filtro', 'antipop', 'soporte', 'pedestal'],
  },
  'amplificadores': {
    categorias: ['microfonos-y-audio', 'audifonos'],
    palabras: ['cable', 'soporte', 'microfono', 'micrófono', 'auricular'],
  },
  'cajas-vallenatas': {
    categorias: ['cajas-vallenatas', 'percusion', 'accesorios-acordeon'],
    palabras: ['estuche', 'funda', 'baqueta', 'llave', 'parche', 'correa'],
  },
  'baterias': {
    categorias: ['percusion', 'audifonos'],
    palabras: ['baqueta', 'banco', 'pad', 'parche', 'auricular', 'audifono', 'audífono'],
  },
  'percusion': {
    categorias: ['percusion', 'accesorios-acordeon'],
    palabras: ['baqueta', 'estuche', 'funda'],
  },
  'guitarras': {
    categorias: ['amplificadores', 'microfonos-y-audio'],
    palabras: ['cable', 'correa', 'estuche', 'afinador'],
  },
  'bajos-electricos': {
    categorias: ['amplificadores', 'microfonos-y-audio'],
    palabras: ['cable', 'correa', 'estuche', 'afinador'],
  },
  'pianos-y-teclados': {
    categorias: ['audifonos', 'microfonos-y-audio'],
    palabras: ['auricular', 'audifono', 'audífono', 'soporte', 'base', 'cable', 'pedal'],
  },
}

/** Si la categoría del carrito no está mapeada, se cae a lo más transversal. */
const COMPLEMENTO_POR_DEFECTO = {
  categorias: ['accesorios-acordeon', 'audifonos'],
  palabras: ACCESORIOS_ACORDEON.palabras,
}

const SELECT_SUGERIDO =
  'id, nombre, slug, precio, precio_original, stock, categoria_id, categorias(slug, nombre), producto_imagenes(imagen_principal, imagen_secundaria_1)'

function sinTildes(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

function primeraImagen(producto: any): string | null {
  const imgs = producto?.producto_imagenes
  const fila = Array.isArray(imgs) ? imgs[0] : imgs
  return fila?.imagen_principal || fila?.imagen_secundaria_1 || null
}

export async function POST(req: Request) {
  if (!permitir(ipDe(req), 60)) {
    return NextResponse.json({ error: 'Demasiadas solicitudes. Intenta en un minuto.' }, { status: 429 })
  }

  const supabase = obtenerSupabaseAdmin()
  if (!supabase) {
    // Sin credenciales el bloque simplemente no se pinta: mejor un carrito limpio
    // que una sección rota. No es un error del cliente.
    return NextResponse.json({ sugeridos: [] })
  }

  try {
    const body = await leerBody(req)
    const crudos = Array.isArray(body?.ids) ? body.ids : []
    // Saneo: solo strings con pinta de id, sin duplicados y con tope. Van a una
    // cláusula `.in()` parametrizada de postgrest, no a SQL concatenado.
    const idsCarrito = Array.from(
      new Set(
        crudos
          .filter((v: any) => typeof v === 'string')
          .map((v: string) => v.trim())
          .filter((v: string) => /^[0-9a-zA-Z-]{8,64}$/.test(v))
      )
    ).slice(0, MAX_IDS) as string[]

    if (idsCarrito.length === 0) return NextResponse.json({ sugeridos: [] })

    // 1) Qué hay realmente en el carrito (precio y categoría desde la BD).
    const { data: enCarrito, error: errorCarrito } = await supabase
      .from('productos')
      .select('id, nombre, precio, categoria_id, categorias(slug)')
      .in('id', idsCarrito)
    if (errorCarrito) throw errorCarrito
    if (!enCarrito?.length) return NextResponse.json({ sugeridos: [] })

    // 2) El "principal" es el más caro: es el que define qué accesorios tienen
    //    sentido y marca el techo de precio de las sugerencias.
    const principal = enCarrito.reduce((a: any, b: any) => (Number(b.precio) > Number(a.precio) ? b : a))
    const slugPrincipal = (principal as any)?.categorias?.slug || ''
    const slugsEnCarrito = new Set(
      enCarrito.map((p: any) => p?.categorias?.slug).filter(Boolean)
    )

    const regla = COMPLEMENTOS[slugPrincipal] || COMPLEMENTO_POR_DEFECTO

    // 3) Ids de las categorías complementarias.
    const { data: cats, error: errorCats } = await supabase
      .from('categorias')
      .select('id, slug')
      .in('slug', regla.categorias)
    if (errorCats) throw errorCats
    if (!cats?.length) return NextResponse.json({ sugeridos: [] })

    // 4) Techo de precio: un accesorio se añade sin pensarlo cuando cuesta una
    //    fracción del producto principal. El suelo de $120.000 evita que un carrito
    //    barato (un micrófono de $25.000) se quede sin nada que sugerir.
    const precioPrincipal = Number((principal as any).precio) || 0
    const techo = Math.max(precioPrincipal * 0.6, 120_000)

    const { data: candidatos, error: errorProd } = await supabase
      .from('productos')
      .select(SELECT_SUGERIDO)
      .eq('activo', true)
      .gt('stock', 0)
      .lte('precio', techo)
      .in('categoria_id', cats.map((c: any) => c.id))
      // Los ids van entrecomillados porque PostgREST parte la lista por comas; el
      // saneo previo (solo [0-9a-zA-Z-]) garantiza que no pueden cerrar la comilla.
      .not('id', 'in', `(${idsCarrito.map((id) => `"${id}"`).join(',')})`)
      .order('precio', { ascending: true })
      .limit(60)
    if (errorProd) throw errorProd

    const palabras = regla.palabras.map(sinTildes)

    const puntuados = (candidatos || [])
      .map((p: any) => {
        const nombre = sinTildes(p.nombre || '')
        const coincide = palabras.some((k) => nombre.includes(k))
        const slug = p?.categorias?.slug || ''
        // Si la sugerencia sale de una categoría que el cliente YA lleva, solo vale
        // si el nombre dice que es un accesorio: así no se le ofrece otro acordeón
        // a quien acaba de comprar un acordeón.
        const mismaFamilia = slugsEnCarrito.has(slug)
        if (mismaFamilia && !coincide) return null
        return {
          producto: p,
          // Relevancia primero (una sugerencia clara vale más que cuatro flojas).
          puntos: (coincide ? 2 : 0) + (slug === regla.categorias[0] ? 1 : 0),
        }
      })
      .filter(Boolean) as { producto: any; puntos: number }[]

    puntuados.sort((a, b) => b.puntos - a.puntos || Number(a.producto.precio) - Number(b.producto.precio))

    // Reparto por turnos entre categorías: se coge el mejor de cada una, luego el
    // segundo de cada una, etc. Sin esto salían cuatro audífonos casi idénticos y
    // el bloque deja de parecer una recomendación para parecer relleno.
    const porCategoria = new Map<string, any[]>()
    for (const { producto } of puntuados) {
      const slug = producto?.categorias?.slug || ''
      if (!porCategoria.has(slug)) porCategoria.set(slug, [])
      porCategoria.get(slug)!.push(producto)
    }
    const colas = [...porCategoria.values()]
    const elegidos: any[] = []
    for (let vuelta = 0; vuelta < MAX_POR_CATEGORIA && elegidos.length < MAX_SUGERIDOS; vuelta++) {
      for (const cola of colas) {
        if (elegidos.length >= MAX_SUGERIDOS) break
        if (cola[vuelta]) elegidos.push(cola[vuelta])
      }
    }
    // Si el catálogo solo tiene una familia complementaria (p. ej. accesorios de
    // acordeón) el tope por categoría dejaría 2 tarjetas; se rellena hasta 3–4,
    // que es lo que hace que el bloque merezca el espacio que ocupa.
    if (elegidos.length < MIN_SUGERIDOS) {
      for (const { producto } of puntuados) {
        if (elegidos.length >= MAX_SUGERIDOS) break
        if (!elegidos.some((e) => e.id === producto.id)) elegidos.push(producto)
      }
    }

    const sugeridos = elegidos.map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      slug: p.slug,
      precio: Number(p.precio) || 0,
      precio_original: p.precio_original ? Number(p.precio_original) : null,
      stock: Number(p.stock) || 0,
      // `activo` viaja porque CarritoContext lo exige antes de insertar en el carrito.
      activo: true,
      categoria: p?.categorias?.nombre || null,
      imagen: primeraImagen(p),
    }))

    return NextResponse.json({ sugeridos })
  } catch (error: any) {
    return NextResponse.json(
      { error: 'No se pudieron calcular las sugerencias', mensaje: error?.message },
      { status: 500 }
    )
  }
}
