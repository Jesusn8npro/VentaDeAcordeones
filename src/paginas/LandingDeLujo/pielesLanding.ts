import * as THREE from 'three'

// Vestido del acordeón de la landing: clasificar cada pieza y CRUZAR entre dos pieles de Acordeón
// Pro Max. Es una versión reducida de lo que hace el visor del tab (VisorAcordeon3D.tsx).
//
// POR QUÉ NO SE IMPORTA DEL VISOR
// `grupoDePieza` y `aplicarMapasPatina` viven en VisorAcordeon3D.tsx, un módulo de ~3.000 líneas que
// arrastra el motor de audio, Supabase, los estampados y el escudo de assets protegidos. Meterlo en
// una landing pública sería cargar toda la app para dibujar un acordeón que no se toca. Aquí se
// replica sólo lo necesario, con menos grupos: la landing no pinta pieza por pieza, viste SECCIONES.
//
// LA DIFERENCIA GRANDE CON EL EDITOR: allá la piel se cambia de golpe. Aquí se CRUZA. Cada material
// lleva DOS juegos de mapas (el actual y el siguiente) y un uniform `uMezcla` los funde en el
// fragment shader, igual que el HTML de referencia funde sus dos PNG con `imgB.style.opacity`. Sin
// esto el acabado saltaría de una textura a otra y se vería como un parpadeo, no como un cambio.

/** Secciones que la landing sabe vestir por separado. */
export type GrupoLanding = 'melodia' | 'bajos' | 'fuelle' | 'botones' | 'herraje'

/**
 * Piezas que la vitrina NO muestra: las correas de mano ('Correa derecha', 'Nueva correa de bajos').
 * En el editor son imprescindibles, pero aquí el acordeón FLOTA — y una correa colgando en el aire
 * lo convierte visualmente en un bolso. Además su lazo es lo más ancho del modelo: con ella dentro,
 * el bbox de normalización se dispara y el acordeón queda diminuto en el encuadre.
 * Los SOPORTES de correa sí se quedan: son herrajes atornillados a la caja.
 */
export const OCULTAR_EN_VITRINA = /^correa|^nueva correa/i

/**
 * Apaga esas piezas. Va SEPARADO de `prepararPiezas` porque hay que llamarlo ANTES de medir el bbox
 * para normalizar: `Box3.setFromObject` no mira `visible`, así que una correa oculta seguiría
 * inflando la caja y encogiendo el acordeón en el encuadre.
 */
export function ocultarPiezasDeVitrina(raiz: THREE.Object3D): void {
  raiz.traverse((o) => { if (OCULTAR_EN_VITRINA.test(o.name || '')) o.visible = false })
}

/**
 * Sección a la que pertenece una malla. Se decide primero por MATERIAL (los 146 anillos del fuelle
 * comparten nombre de malla y sólo el material los separa en cuero vs metal) y luego por nombre.
 */
export function grupoDeMalla(nombreMalla: string, nombreMaterial?: string): GrupoLanding {
  const nombre = nombreMalla.replace(/^ACC_/i, '')
  const n = nombre.toLowerCase().replace(/_/g, ' ').trim()
  const mat = (nombreMaterial || '').toLowerCase()

  // Botones de melodía y de bajos, por nombre: llevan su propia textura de piel.
  if (/^boton [di] \d+/.test(n)) return 'botones'

  // Herrajes: cromados, tornillos, broches, filigrana y codos de acero del fuelle. NUNCA se repintan
  // — son lo que le da el brillo de joyería al acordeón y lo que sostiene el look cuando el cuerpo
  // cambia de color. Van ANTES que nada: sus nombres contienen palabras de otros grupos.
  if (n.startsWith('tornillo') || n.startsWith('bolt') || n.startsWith('pin') || n.startsWith('bases')) return 'herraje'
  if (n.includes('broche') || n.includes('cerrar fuelle')) return 'herraje'
  if (n.includes('correa') || n.startsWith('soporte') || n.startsWith('cuerpo')) return 'herraje'
  if (mat.includes('aro metal') || mat.includes('aro_metal') || mat.includes('acc_axe')) return 'herraje'
  // ⚠️ `diamante` NO va aquí aunque suene a joyería: en este GLB `PRESET__PATINA_diamante__*` es
  // justo el material de las DOS CAJAS, el diapasón y el barrote de la parrilla — el cuerpo entero.
  // Tratándolo como herraje, las cajas se quedaban con el nácar de fábrica y ninguna piel ni ningún
  // tinte las tocaba: el acordeón cambiaba de fuelle y de botones pero seguía color hueso.
  if (mat.includes('metal') || mat.includes('oro') || mat.includes('brass')) return 'herraje'
  if (/^codo.fuelle/.test(n)) return 'herraje'

  // Fuelle: las cintas de cuero y las esquinas.
  if (mat.includes('acc_fuelle') || mat.includes('cuero')) return 'fuelle'
  if (n === 'fuelle' || n.startsWith('fuelle ') || /^cinta.fuelle/.test(n) || /^aro \d/.test(n)) return 'fuelle'

  // Lado de BAJOS (mano izquierda): su caja, tapa, tela, zapatos y marco.
  if (n.includes('caja de los bajos') || n.includes('caja bajos')) return 'bajos'
  if (n.startsWith('zapatos')) return 'bajos'
  if (n.startsWith('tela') && !n.includes('parrilla')) return 'bajos'
  if (n.startsWith('tapa') && !n.includes('diapason')) return 'bajos'
  if (n.startsWith('marco') && n.includes('bajos')) return 'bajos'

  // Todo lo demás es el mueble de MELODÍA: caja, parrilla, tela de parrilla, diapasón y marcos.
  return 'melodia'
}

/** Archivo de piel que le corresponde a cada sección. `null` = se queda con el baked del GLB. */
export function parteDePiel(grupo: GrupoLanding): 'cuerpo' | 'fuelle' | 'botones' | null {
  if (grupo === 'herraje') return null
  if (grupo === 'fuelle') return 'fuelle'
  if (grupo === 'botones') return 'botones'
  return 'cuerpo'
}

// ── Texturas ──────────────────────────────────────────────────────────────────────────────────
const _loader = new THREE.TextureLoader()
const _cache = new Map<string, THREE.Texture>()

// Densidad del patrón en unidades de MUNDO del acordeón (repeticiones por unidad), igual que el
// addon de Blender: así la baldosa de nácar mide lo mismo en la caja grande que en un botón.
const DENSIDAD = 0.05

/**
 * Carga (y cachea) un mapa de piel. Las pieles son inmutables y se comparten entre decenas de
 * mallas, así que el caché es a nivel de módulo: sin él se subirían a GPU tantas copias como piezas.
 */
function cargarMapa(url: string, srgb: boolean): THREE.Texture {
  const clave = srgb ? `s|${url}` : url
  const hit = _cache.get(clave)
  if (hit) return hit
  const t = _loader.load(url)
  t.flipY = false
  if (srgb) t.colorSpace = THREE.SRGBColorSpace
  // Canal 1: las pieles leen las UVs de CAJA generadas aquí. Las UVs horneadas de Blender (canal 0)
  // tienen islas de tamaño arbitrario — con ellas el nácar sale gigante en unas piezas y microscópico
  // en otras. El canal 0 queda intacto para las texturas baked de los herrajes.
  t.channel = 1
  t.wrapS = THREE.RepeatWrapping
  t.wrapT = THREE.RepeatWrapping
  t.repeat.set(DENSIDAD, DENSIDAD)
  _cache.set(clave, t)
  return t
}

/** Precarga las pieles del recorrido para que ningún cruce empiece con la textura sin llegar. */
export function precargarPieles(ids: string[]): void {
  for (const id of ids) {
    for (const parte of ['cuerpo', 'fuelle', 'botones'] as const) {
      cargarMapa(`/showroom/pieles/${id}/${parte}_base.webp`, true)
      cargarMapa(`/showroom/pieles/${id}/${parte}_mr.webp`, false)
      cargarMapa(`/showroom/pieles/${id}/${parte}_normal.webp`, false)
    }
  }
}

/**
 * Genera UVs por PROYECCIÓN DE CAJA en el canal 1, con la escala del nodo horneada para que la
 * densidad quede en coordenadas de mundo. Es imprescindible: buena parte de las piezas del fuelle
 * viene SIN UV en el GLB, y sin esto no se les puede poner textura, sólo color plano.
 * Se proyecta POR CARA (según el eje dominante de su normal) — proyectar el bbox entero de una vez
 * estiraba el patrón sobre los pliegues.
 */
function generarUVCaja(mesh: THREE.Mesh, escala: THREE.Vector3): void {
  let geo = mesh.geometry
  if (geo.index) {
    geo = geo.toNonIndexed()
    geo.userData.uvCajaClonada = true
    mesh.geometry = geo
  }
  const pos = geo.attributes.position as THREE.BufferAttribute
  const arr = new Float32Array(pos.count * 2)
  const pa = new THREE.Vector3(), pb = new THREE.Vector3(), pc = new THREE.Vector3()
  const e1 = new THREE.Vector3(), e2 = new THREE.Vector3(), nrm = new THREE.Vector3()
  for (let i = 0; i < pos.count; i += 3) {
    pa.fromBufferAttribute(pos, i)
    pb.fromBufferAttribute(pos, i + 1)
    pc.fromBufferAttribute(pos, i + 2)
    nrm.crossVectors(e1.subVectors(pb, pa), e2.subVectors(pc, pa))
    const ax = Math.abs(nrm.x), ay = Math.abs(nrm.y), az = Math.abs(nrm.z)
    for (let j = 0; j < 3; j++) {
      const p = j === 0 ? pa : j === 1 ? pb : pc
      let u: number, v: number
      if (ax >= ay && ax >= az) { u = p.z * escala.z; v = p.y * escala.y }
      else if (ay >= az) { u = p.x * escala.x; v = p.z * escala.z }
      else { u = p.x * escala.x; v = p.y * escala.y }
      arr[(i + j) * 2] = u
      arr[(i + j) * 2 + 1] = v
    }
  }
  geo.setAttribute('uv1', new THREE.BufferAttribute(arr, 2))
  if (!geo.attributes.uv) geo.setAttribute('uv', new THREE.BufferAttribute(arr, 2))
  mesh.userData.uvCaja = true
}

// ── Cruce de pieles en el shader ──────────────────────────────────────────────────────────────
interface UniformesCruce {
  uMapB: { value: THREE.Texture | null }
  uMrB: { value: THREE.Texture | null }
  uNormalB: { value: THREE.Texture | null }
  uMezcla: { value: number }
}

/**
 * Parcha un MeshStandardMaterial para que muestre la mezcla de DOS pieles.
 *
 * Los mapas de la piel A siguen en los slots normales (`map`, `roughnessMap`, …) y los de la B viajan
 * en uniforms propios; `uMezcla` funde ambos en color, rugosidad/metalicidad y relieve. Se funde
 * también el NORMAL a propósito: cruzando sólo el color, al terminar un tramo el microrelieve
 * cambiaba de golpe y se notaba un "chasquido" en el nácar aunque el color ya estuviera quieto.
 *
 * Los uniforms se guardan EN EL MATERIAL y se reutilizan si ya está parcheado: `useGLTF` cachea la
 * escena entre montajes y StrictMode invoca el efecto dos veces, así que esta función corre varias
 * veces sobre el MISMO material. Creando uniforms nuevos cada vez, el programa ya compilado se queda
 * enganchado a los primeros (three reutiliza el programa porque customProgramCacheKey no cambia y no
 * vuelve a llamar a onBeforeCompile) mientras el componente escribe en los segundos: el cruce no se
 * movería nunca.
 */
function prepararCruce(mat: THREE.MeshStandardMaterial): UniformesCruce {
  const previo = mat.userData.cruceLujo as UniformesCruce | undefined
  if (previo) return previo

  const u: UniformesCruce = {
    uMapB: { value: null },
    uMrB: { value: null },
    uNormalB: { value: null },
    uMezcla: { value: 0 },
  }
  mat.userData.cruceLujo = u

  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, u)
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        `#include <common>
         uniform sampler2D uMapB;
         uniform sampler2D uMrB;
         uniform sampler2D uNormalB;
         uniform float uMezcla;`,
      )
      .replace(
        '#include <map_fragment>',
        `#ifdef USE_MAP
           diffuseColor *= mix( texture2D( map, vMapUv ), texture2D( uMapB, vMapUv ), uMezcla );
         #endif`,
      )
      .replace(
        '#include <roughnessmap_fragment>',
        `float roughnessFactor = roughness;
         #ifdef USE_ROUGHNESSMAP
           roughnessFactor *= mix( texture2D( roughnessMap, vRoughnessMapUv ), texture2D( uMrB, vRoughnessMapUv ), uMezcla ).g;
         #endif`,
      )
      .replace(
        '#include <metalnessmap_fragment>',
        `float metalnessFactor = metalness;
         #ifdef USE_METALNESSMAP
           metalnessFactor *= mix( texture2D( metalnessMap, vMetalnessMapUv ), texture2D( uMrB, vMetalnessMapUv ), uMezcla ).b;
         #endif`,
      )
      .replace(
        'vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;',
        'vec3 mapN = mix( texture2D( normalMap, vNormalMapUv ), texture2D( uNormalB, vNormalMapUv ), uMezcla ).xyz * 2.0 - 1.0;',
      )
  }
  // Clave propia: sin esto three podría reutilizar el programa SIN parchear de otro material igual.
  mat.customProgramCacheKey = () => 'landing-lujo-cruce-v1'
  mat.needsUpdate = true
  return u
}

export interface PiezaVestible {
  mesh: THREE.Mesh
  mat: THREE.MeshStandardMaterial
  grupo: GrupoLanding
  parte: 'cuerpo' | 'fuelle' | 'botones' | null
  uniformes: UniformesCruce | null
}

/**
 * Recorre el acordeón, CLONA el material de cada malla y devuelve la lista lista para vestir.
 * El clonado es obligatorio: en el GLB un mismo material lo comparten hasta 84 piezas repartidas
 * entre el fuelle y las dos cajas, así que sin clonar no se puede teñir una sección sin arrastrar
 * las otras — que es justo lo que hace falta para el acordeón tricolor.
 */
export function prepararPiezas(raiz: THREE.Object3D): PiezaVestible[] {
  const piezas: PiezaVestible[] = []
  raiz.updateWorldMatrix(true, true)
  const invRaiz = new THREE.Matrix4().copy(raiz.matrixWorld).invert()
  const m = new THREE.Matrix4()
  const escala = new THREE.Vector3()
  const q = new THREE.Quaternion()
  const t = new THREE.Vector3()

  raiz.traverse((obj) => {
    if (OCULTAR_EN_VITRINA.test(obj.name || '')) { obj.visible = false; return }
    const mesh = obj as THREE.Mesh
    if (!mesh.isMesh) return
    const original = mesh.material as THREE.MeshStandardMaterial
    if (!original || Array.isArray(original) || !(original as any).isMeshStandardMaterial) return

    const grupo = grupoDeMalla(mesh.name, original.name)
    const parte = parteDePiel(grupo)
    const mat = original.clone()
    mesh.material = mat

    // Escala del nodo RELATIVA a la raíz del acordeón: se hornea en las uv1 para que el patrón tenga
    // el mismo tamaño físico en todas las piezas (en el GLB una caja viene con escala ~93× y otra ~1×).
    m.multiplyMatrices(invRaiz, mesh.matrixWorld).decompose(t, q, escala)
    if (parte && !mesh.userData.uvCaja) generarUVCaja(mesh, escala)

    piezas.push({ mesh, mat, grupo, parte, uniformes: parte ? prepararCruce(mat) : null })
  })
  return piezas
}

const _colA = new THREE.Color()
const _colB = new THREE.Color()

/**
 * Viste el acordeón con el CRUCE de dos pieles.
 *
 * Los mapas sólo se reasignan cuando cambia el par (reasignarlos cada frame marcaría el material
 * como sucio y recompilaría el shader sesenta veces por segundo). `uMezcla` y los tintes sí se
 * escriben en cada frame: son un float y un color, valen nada.
 */
export function vestirCruce(
  piezas: PiezaVestible[],
  pielA: string,
  pielB: string,
  mezcla: number,
  tintasA?: Partial<Record<GrupoLanding, string>>,
  tintasB?: Partial<Record<GrupoLanding, string>>,
): void {
  for (const p of piezas) {
    if (!p.parte || !p.uniformes) continue

    const par = `${pielA}>${pielB}`
    if (p.mesh.userData.parLujo !== par) {
      p.mesh.userData.parLujo = par
      const dirA = `/showroom/pieles/${pielA}/${p.parte}`
      const dirB = `/showroom/pieles/${pielB}/${p.parte}`
      p.mat.map = cargarMapa(`${dirA}_base.webp`, true)
      const mrA = cargarMapa(`${dirA}_mr.webp`, false)
      p.mat.roughnessMap = mrA
      p.mat.metalnessMap = mrA
      p.mat.normalMap = cargarMapa(`${dirA}_normal.webp`, false)
      // roughness/metalness a 1: los factores multiplican al mapa, y si quedan por debajo el mr de
      // la piel no se nota (el nácar sale mate y plano).
      p.mat.roughness = 1
      p.mat.metalness = 1
      p.uniformes.uMapB.value = cargarMapa(`${dirB}_base.webp`, true)
      p.uniformes.uMrB.value = cargarMapa(`${dirB}_mr.webp`, false)
      p.uniformes.uNormalB.value = cargarMapa(`${dirB}_normal.webp`, false)
      p.mat.needsUpdate = true
    }

    p.uniformes.uMezcla.value = mezcla

    // El tinte de sección se interpola junto con el cruce: al pasar al tricolor, el amarillo, el
    // azul y el rojo ENTRAN despacio sobre el nácar en vez de aparecer de golpe.
    const ta = tintasA?.[p.grupo]
    const tb = tintasB?.[p.grupo]
    if (ta || tb) {
      _colA.set(ta ?? '#ffffff')
      _colB.set(tb ?? '#ffffff')
      p.mat.color.copy(_colA).lerp(_colB, mezcla)
    } else if (p.mat.color.r !== 1 || p.mat.color.g !== 1 || p.mat.color.b !== 1) {
      p.mat.color.set('#ffffff')
    }
  }
}

/** Suelta los materiales clonados y las geometrías re-generadas de esta instancia. */
export function liberarPiezas(piezas: PiezaVestible[]): void {
  for (const p of piezas) {
    p.mat.dispose()
    if (p.mesh.geometry.userData.uvCajaClonada) p.mesh.geometry.dispose()
  }
}
