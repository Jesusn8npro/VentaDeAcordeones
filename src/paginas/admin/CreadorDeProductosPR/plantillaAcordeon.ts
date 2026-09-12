/**
 * plantillaAcordeon.ts — el "esquema de siempre" de un acordeón personalizado.
 *
 * POR QUÉ EXISTE: casi todo lo que sube Jesús son acordeones y cada ficha se escribía
 * desde cero, así que unas salían completas y otras a medias. Aquí vive la ESTRUCTURA
 * (qué campos lleva un acordeón y qué características se pueden marcar); el CONTENIDO
 * lo sigue escribiendo él. Este archivo no inventa descripciones de producto: deja el
 * hueco marcado con [corchetes] y `validarAcordeon` avisa si alguno se queda sin rellenar.
 *
 * DÓNDE SE GUARDA: en las columnas que la ficha ya lee. Las características van a
 * `caracteristicas_jsonb` con el MISMO formato que ya usa el editor del admin
 * (ConvertidorAJson tipo 'caracteristicas'):
 *   { titulo, subtitulo, detalles: [{ id, icono, titulo, descripcion }], beneficios: [], cta: {} }
 * No se inventa formato nuevo: los chips son otra vista de ese mismo array `detalles`.
 */

// ─── Tipos ─────────────────────────────────────────────────────────────────────

export interface DetalleCaracteristica {
  id?: number | string
  icono: string
  titulo: string
  descripcion: string
}

export interface CaracteristicasProducto {
  titulo: string
  subtitulo: string
  detalles: DetalleCaracteristica[]
  beneficios: DetalleCaracteristica[]
  cta: { texto: string; subtexto: string }
  [extra: string]: any
}

export interface ChipCaracteristica {
  /** Texto exacto que se guarda como `titulo` del detalle. Es la clave de emparejado. */
  titulo: string
  icono: string
  /** Pide un valor (tonalidad, número de bajos, qué dice el grabado). */
  conValor?: boolean
  /** Sugerencias de valor; se pueden usar o escribir otro a mano. */
  opciones?: string[]
  /** Texto de ayuda del input cuando `conValor`. */
  pista?: string
}

export interface GrupoCaracteristicas {
  nombre: string
  chips: ChipCaracteristica[]
}

export interface AvisoFicha {
  nivel: 'bloqueo' | 'aviso'
  texto: string
}

// ─── Catálogo de características reales del negocio ────────────────────────────

/**
 * Las que Jesús pidió, tal cual las nombra él. Los `titulo` son la clave de
 * emparejado con `caracteristicas_jsonb.detalles`, así que no se cambian a la ligera:
 * si se renombra uno, los productos ya guardados dejan de aparecer marcados.
 */
export const GRUPOS_CARACTERISTICAS: GrupoCaracteristicas[] = [
  {
    nombre: 'Acabados y personalización',
    chips: [
      { titulo: 'Diapasón nacarado', icono: '🎹' },
      { titulo: 'Botones nacarados', icono: '⚪' },
      { titulo: 'Nácar en los costados', icono: '🐚' },
      { titulo: 'Fuelle personalizado', icono: '🪗' },
      { titulo: 'Parrilla personalizada', icono: '🎼' },
      {
        titulo: 'Grabado láser',
        icono: '✒️',
        conValor: true,
        pista: 'Qué dice el grabado (nombre, agrupación, logo)',
      },
      { titulo: 'Correas bordadas', icono: '🧵' },
    ],
  },
  {
    nombre: 'Sonido y configuración',
    chips: [
      {
        titulo: 'Tonalidad',
        icono: '🎵',
        conValor: true,
        pista: 'Tonalidad del instrumento',
        opciones: [
          'GCF (de fábrica)',
          'ADG (de fábrica)',
          'FBbEb (por encargo)',
          'Do / Fa / Sib (por encargo)',
        ],
      },
      { titulo: 'Número de bajos', icono: '🎛️', conValor: true, pista: 'Ej: 12' },
    ],
  },
  {
    nombre: 'Taller y entrega',
    chips: [
      { titulo: 'Afinación a mano en el taller', icono: '🔧' },
      { titulo: 'Estuche incluido', icono: '📦' },
    ],
  },
]

/** Todos los chips en plano, para buscar por título. */
export const CHIPS_CARACTERISTICAS: ChipCaracteristica[] = GRUPOS_CARACTERISTICAS.flatMap(g => g.chips)

// ─── Relleno del importador ────────────────────────────────────────────────────

/**
 * 37 de los 38 acordeones publicados tienen en `caracteristicas_jsonb` el mismo trío
 * genérico que dejó el importador ("Material premium / Diseño inteligente / Eficiencia
 * energética"): no describe ningún acordeón y nunca se llegó a publicar porque la ficha
 * no pintaba esta columna. Ahora que sí la pinta, ese relleno se reconoce por su
 * título EXACTO y no se publica ni se cuenta como característica marcada.
 *
 * Se comparte con las plantillas públicas (PlantillaCinema / PlantillaCatalogo) para que
 * el criterio sea uno solo.
 */
export const TITULOS_RELLENO_IMPORTADOR = [
  'material premium',
  'diseño inteligente',
  'eficiencia energética',
  'garantía oficial',
  'soporte dedicado',
  'envío seguro',
]

/** Minúsculas, sin acentos y sin espacios de sobra: para comparar títulos. */
export const normalizarTitulo = (texto: unknown): string =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()

const RELLENO_NORMALIZADO = TITULOS_RELLENO_IMPORTADOR.map(normalizarTitulo)

/** ¿Este detalle es relleno del importador (y por tanto no se publica)? */
export const esRellenoImportador = (detalle: DetalleCaracteristica | null | undefined): boolean =>
  !!detalle && RELLENO_NORMALIZADO.includes(normalizarTitulo(detalle.titulo))

/**
 * Detalles que SÍ se publican: con título y sin relleno del importador.
 * La usan la ficha pública y la vista previa del admin, para que enseñen lo mismo.
 */
export const detallesPublicables = (caracteristicas: any): DetalleCaracteristica[] => {
  const crudo = typeof caracteristicas === 'string' ? parsearSeguro(caracteristicas) : caracteristicas
  const detalles = Array.isArray(crudo?.detalles) ? crudo.detalles : []
  return detalles.filter(
    (d: DetalleCaracteristica) => d && String(d.titulo || '').trim() && !esRellenoImportador(d)
  )
}

const parsearSeguro = (texto: string): any => {
  try {
    return JSON.parse(texto)
  } catch {
    return null
  }
}

// ─── Lectura y escritura de caracteristicas_jsonb ──────────────────────────────

const CARACTERISTICAS_VACIAS = (): CaracteristicasProducto => ({
  titulo: '',
  subtitulo: '',
  detalles: [],
  beneficios: [],
  cta: { texto: '', subtexto: '' },
})

/** Normaliza lo que haya en la columna (objeto, string JSON o nada) sin perder claves extra. */
export const leerCaracteristicas = (valor: any): CaracteristicasProducto => {
  const crudo = typeof valor === 'string' ? parsearSeguro(valor) : valor
  if (!crudo || typeof crudo !== 'object') return CARACTERISTICAS_VACIAS()
  return {
    ...crudo,
    titulo: crudo.titulo || '',
    subtitulo: crudo.subtitulo || '',
    detalles: Array.isArray(crudo.detalles) ? crudo.detalles : [],
    beneficios: Array.isArray(crudo.beneficios) ? crudo.beneficios : [],
    cta: crudo.cta || { texto: '', subtexto: '' },
  }
}

/** Índice del detalle que corresponde a un chip, o -1. Empareja por título normalizado. */
export const indiceDeChip = (detalles: DetalleCaracteristica[], chip: ChipCaracteristica): number =>
  detalles.findIndex(d => normalizarTitulo(d?.titulo) === normalizarTitulo(chip.titulo))

/** ¿Está marcado este chip en las características actuales? */
export const chipMarcado = (valor: any, chip: ChipCaracteristica): boolean =>
  indiceDeChip(leerCaracteristicas(valor).detalles, chip) !== -1

/** Valor escrito en un chip "con valor" (tonalidad, bajos, grabado). '' si no está marcado. */
export const valorDeChip = (valor: any, chip: ChipCaracteristica): string => {
  const detalles = leerCaracteristicas(valor).detalles
  const i = indiceDeChip(detalles, chip)
  return i === -1 ? '' : String(detalles[i].descripcion || '')
}

/**
 * Marca o desmarca un chip y devuelve el objeto COMPLETO listo para guardar.
 * Respeta cualquier detalle que Jesús haya escrito a mano: sólo toca el suyo.
 */
export const alternarChip = (
  valor: any,
  chip: ChipCaracteristica,
  marcado: boolean,
  valorTexto = ''
): CaracteristicasProducto => {
  const datos = leerCaracteristicas(valor)
  const detalles = [...datos.detalles]
  const i = indiceDeChip(detalles, chip)

  if (!marcado) {
    if (i !== -1) detalles.splice(i, 1)
    return { ...datos, detalles }
  }

  const nuevo: DetalleCaracteristica = {
    id: i !== -1 ? detalles[i].id ?? Date.now() : Date.now() + detalles.length,
    icono: chip.icono,
    titulo: chip.titulo,
    descripcion: chip.conValor ? valorTexto : i !== -1 ? detalles[i].descripcion || '' : '',
  }
  if (i === -1) detalles.push(nuevo)
  else detalles[i] = { ...detalles[i], ...nuevo }
  return { ...datos, detalles }
}

/** Cambia sólo el valor de un chip ya marcado (tonalidad, bajos, grabado). */
export const fijarValorChip = (
  valor: any,
  chip: ChipCaracteristica,
  valorTexto: string
): CaracteristicasProducto => alternarChip(valor, chip, true, valorTexto)

/** Añade una característica libre (las que Jesús escriba y no estén en el catálogo). */
export const agregarCaracteristicaLibre = (
  valor: any,
  titulo: string,
  descripcion = '',
  icono = '✨'
): CaracteristicasProducto => {
  const datos = leerCaracteristicas(valor)
  const limpio = titulo.trim()
  if (!limpio) return datos
  if (indiceDeChip(datos.detalles, { titulo: limpio, icono }) !== -1) return datos
  return {
    ...datos,
    detalles: [...datos.detalles, { id: Date.now(), icono, titulo: limpio, descripcion: descripcion.trim() }],
  }
}

/** Quita una característica por su posición en `detalles`. */
export const quitarCaracteristica = (valor: any, indice: number): CaracteristicasProducto => {
  const datos = leerCaracteristicas(valor)
  return { ...datos, detalles: datos.detalles.filter((_, i) => i !== indice) }
}

/** Borra el trío genérico del importador dejando intacto lo que sí es real. */
export const limpiarRellenoImportador = (valor: any): CaracteristicasProducto => {
  const datos = leerCaracteristicas(valor)
  return {
    ...datos,
    detalles: datos.detalles.filter(d => !esRellenoImportador(d)),
    beneficios: datos.beneficios.filter(d => !esRellenoImportador(d)),
  }
}

/** ¿Quedan restos del importador en este producto? */
export const tieneRellenoImportador = (valor: any): boolean => {
  const datos = leerCaracteristicas(valor)
  return datos.detalles.some(esRellenoImportador) || datos.beneficios.some(esRellenoImportador)
}

// ─── Esqueleto de la ficha ─────────────────────────────────────────────────────

/**
 * Estructura de la descripción, con los huecos marcados. NO es texto publicable: los
 * [corchetes] existen para que `validarAcordeon` los detecte si se olvidan.
 */
export const ESQUELETO_DESCRIPCION = [
  '[El instrumento: qué base Hohner es, qué acabado lleva y cómo se ve.]',
  '',
  '[El trabajo del taller: qué se desarmó, se nacaró, se grabó o se ajustó a mano.]',
  '',
  '[Tonalidad y afinación: en qué tono se entrega y cómo se afina.]',
  '',
  '[Fabricación y envío: cuánto tarda y cómo se despacha.]',
].join('\n')

/**
 * Ganchos que YA se publican en los 38 acordeones del catálogo
 * (scripts/publicar-personalizados.mjs). Se reutilizan tal cual: son palabras de Jesús,
 * no texto inventado aquí.
 */
export const GANCHOS_ACORDEON = [
  '🎨 Diseño 100% personalizado',
  '🎶 Sonido vallenato auténtico',
  '🌍 Envío asegurado a Colombia y el mundo',
  '🛡️ Garantía 12 meses',
  '✅ Hohner original certificado',
  '📦 Estuche rígido incluido',
]

/** Slug de la categoría por defecto de un acordeón personalizado. */
export const SLUG_CATEGORIA_ACORDEON = 'acordeones-hohner-personalizados'

export interface ResultadoPlantilla {
  /** Campos que se pueden rellenar sin pisar nada. */
  cambios: Record<string, any>
  /** Campos que YA tienen contenido: la plantilla no los toca sin permiso. */
  conflictos: { campo: string; etiqueta: string; valorNuevo: any }[]
}

const vacio = (v: any): boolean =>
  v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0)

/**
 * Calcula la plantilla de acordeón sobre los datos actuales.
 * Devuelve por separado lo que se puede rellenar y lo que ya estaba escrito, para que
 * la UI pregunte antes de sobrescribir. Nunca pisa nada por su cuenta.
 */
export const calcularPlantillaAcordeon = (
  datos: Record<string, any>,
  categorias: { id: string; nombre?: string; slug?: string }[] = []
): ResultadoPlantilla => {
  const catAcordeon = categorias.find(c => c.slug === SLUG_CATEGORIA_ACORDEON)

  const propuesta: { campo: string; etiqueta: string; valor: any }[] = [
    { campo: 'marca', etiqueta: 'Marca', valor: 'HOHNER' },
    { campo: 'estado', etiqueta: 'Estado', valor: 'nuevo' },
    { campo: 'garantia_meses', etiqueta: 'Garantía (meses)', valor: 12 },
    { campo: 'stock', etiqueta: 'Stock', valor: 1 },
    { campo: 'stock_minimo', etiqueta: 'Stock mínimo', valor: 1 },
    // Ficha larga: un acordeón personalizado siempre la merece (ver SelectorPlantilla).
    { campo: 'landing_tipo', etiqueta: 'Ficha del producto', valor: 'forzar-cinema' },
    { campo: 'ganchos', etiqueta: 'Ganchos de venta', valor: GANCHOS_ACORDEON },
    { campo: 'descripcion_contenido', etiqueta: 'Descripción', valor: ESQUELETO_DESCRIPCION },
  ]

  // El título de la descripción es el nombre del producto, igual que en los 38 ya
  // publicados. Es un dato que ya existe, no texto nuevo.
  if (datos.nombre?.trim()) {
    propuesta.push({ campo: 'descripcion_titulo', etiqueta: 'Título de la descripción', valor: datos.nombre.trim() })
  }
  if (catAcordeon) {
    propuesta.push({ campo: 'categoria_id', etiqueta: 'Categoría', valor: catAcordeon.id })
  }

  const cambios: Record<string, any> = {}
  const conflictos: ResultadoPlantilla['conflictos'] = []

  for (const { campo, etiqueta, valor } of propuesta) {
    const actual = datos[campo]
    if (vacio(actual)) cambios[campo] = valor
    else if (JSON.stringify(actual) !== JSON.stringify(valor)) {
      conflictos.push({ campo, etiqueta, valorNuevo: valor })
    }
  }

  // `estado` viene con 'borrador' por defecto del formulario, que no es un estado válido
  // de la columna (nuevo/usado/vendido/agotado/descontinuado): ahí sí hay que corregir.
  if (datos.estado === 'borrador') {
    cambios.estado = 'nuevo'
    const i = conflictos.findIndex(c => c.campo === 'estado')
    if (i !== -1) conflictos.splice(i, 1)
  }

  return { cambios, conflictos }
}

// ─── Detección de acordeón y avisos ────────────────────────────────────────────

/** Mismo criterio que SelectorPlantilla: categoría o nombre con "acorde". */
export const esAcordeon = (
  datos: Record<string, any>,
  categorias: { id: string; nombre?: string; slug?: string }[] = []
): boolean => {
  const cat = categorias.find(c => c.id === datos.categoria_id)
  return /acorde/i.test(`${cat?.nombre || ''} ${cat?.slug || ''} ${datos.nombre || ''}`)
}

/** ¿Quedan [corchetes] del esqueleto sin rellenar? */
export const tieneHuecosSinRellenar = (texto: unknown): boolean => /\[[^\]]{4,}\]/.test(String(texto ?? ''))

export interface ContextoValidacion {
  /** Hay `producto_imagenes.imagen_principal` guardada. */
  tieneImagenPrincipal: boolean
  /** El producto todavía no existe en la base (no se le pueden subir fotos aún). */
  esNuevo: boolean
  categorias?: { id: string; nombre?: string; slug?: string }[]
}

/**
 * Avisos de la ficha antes de guardar.
 *
 * Regla de foto: un producto ACTIVO sin imagen principal no se puede guardar —la ficha
 * saldría con el cartel "SIN IMAGEN" en Google—. Pero las fotos se suben en la pestaña
 * Imágenes, que necesita que el producto ya exista; por eso el bloqueo aplica a
 * publicarlo (activo), no a crearlo inactivo. Ese es el camino: crear inactivo → subir
 * foto → activar.
 */
export const validarAcordeon = (
  datos: Record<string, any>,
  ctx: ContextoValidacion
): AvisoFicha[] => {
  const avisos: AvisoFicha[] = []
  const activo = datos.activo !== false
  const acordeon = esAcordeon(datos, ctx.categorias || [])

  if (!datos.nombre?.trim()) avisos.push({ nivel: 'bloqueo', texto: 'Falta el nombre del producto.' })
  if (!datos.precio || Number(datos.precio) <= 0) avisos.push({ nivel: 'bloqueo', texto: 'Falta el precio.' })
  if (!datos.categoria_id) avisos.push({ nivel: 'bloqueo', texto: 'Falta elegir la categoría.' })

  if (activo && !ctx.tieneImagenPrincipal) {
    avisos.push({
      nivel: 'bloqueo',
      texto: ctx.esNuevo
        ? 'Sin foto principal no se puede publicar. Guárdalo como Inactivo, sube la foto en la pestaña "Imágenes (Landing)" y luego actívalo.'
        : 'Sin foto principal no se puede publicar. Sube la imagen principal en la pestaña "Imágenes (Landing)" o déjalo Inactivo.',
    })
  }

  const descripcion = datos.descripcion_contenido || datos.descripcion || ''
  if (!String(descripcion).trim()) {
    avisos.push({ nivel: 'bloqueo', texto: 'Falta la descripción.' })
  } else if (tieneHuecosSinRellenar(descripcion)) {
    avisos.push({
      nivel: 'bloqueo',
      texto: 'La descripción todavía tiene huecos de la plantilla entre [corchetes]. Rellénalos o bórralos.',
    })
  }

  if (!acordeon) return avisos

  // A partir de aquí, avisos propios del acordeón: no bloquean, pero la ficha sale más pobre.
  const detalles = detallesPublicables(datos.caracteristicas)
  const tonalidad = detalles.find(d => normalizarTitulo(d.titulo) === normalizarTitulo('Tonalidad'))
  if (!tonalidad || !String(tonalidad.descripcion || '').trim()) {
    avisos.push({ nivel: 'aviso', texto: 'No has indicado la tonalidad: es lo primero que pregunta un acordeonero.' })
  }
  if (detalles.length === 0) {
    avisos.push({ nivel: 'aviso', texto: 'Sin características marcadas la ficha se queda corta. Marca las que tenga este acordeón.' })
  }
  if (!datos.modelo?.trim()) avisos.push({ nivel: 'aviso', texto: 'Falta el modelo (Corona II, Corona III…): sale en las especificaciones.' })
  if (!datos.color?.trim()) avisos.push({ nivel: 'aviso', texto: 'Falta el color: sale en las especificaciones.' })
  if (!Number(datos.garantia_meses)) avisos.push({ nivel: 'aviso', texto: 'Falta la garantía en meses.' })
  if (!datos.meta_description?.trim()) avisos.push({ nivel: 'aviso', texto: 'Falta la meta descripción (el texto que ve Google).' })
  if (tieneRellenoImportador(datos.caracteristicas)) {
    avisos.push({ nivel: 'aviso', texto: 'Este producto arrastra características genéricas del importador. No se publican, pero conviene limpiarlas.' })
  }

  return avisos
}
