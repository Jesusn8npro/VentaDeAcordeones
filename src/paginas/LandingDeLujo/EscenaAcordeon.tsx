'use client'
import * as React from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { PIELES, cruceEn } from './coreografia'
import { esPantallaExigente } from './glOptimizado'
import { prepararPiezas, vestirCruce, liberarPiezas, ocultarPiezasDeVitrina, precargarPieles } from './pielesLanding'

// Copia de vitrina del acordeón REAL de Acordeón Pro Max (7,65 MB → 1,75 MB: sin los 188 morphs del
// fuelle, sin las cajas-ancla y con las texturas horneadas a 512²/256²).
// Se genera con `node scripts/preparar-promax-showroom.mjs`. Vive en /showroom y NO en /modelos3d
// porque middleware.ts devuelve 404 a esa carpeta: los modelos de Pro Max sólo salen por
// /api/security/asset con sesión, y esta landing es pública.
const GLB = '/showroom/acordeon-promax.glb'
const DECODER_DRACO = '/draco/'

// Tamaño al que se normaliza el acordeón, en unidades de mundo de su dimensión mayor. El lienzo es
// CUADRADO (.accstage-inner tiene aspect-ratio 1/1) y con la cámara a z=6 y fov 35 el alto visible es
// de 3.78, así que 3.3 deja el acordeón llenando el cuadro con un margen de aire. La pose (posición,
// escala, giro, desenfoque) la pone el CSS sobre la capa — ver escenarioScroll.ts.
const TAMANO = 3.3

// Giro base del acordeón. El GLB nace con su eje largo apuntando a la cámara (se ve de canto), así
// que hay que girarlo; el valor sale de barrer la rotación en el navegador con el escenario congelado
// y quedarse con el encuadre donde se leen a la vez las dos cajas, el teclado de melodía y el fuelle.
// Es una ventana estrecha: media vuelta más y el acordeón vuelve a ponerse de perfil.
const GIRO_BASE = Math.PI / 2 - 0.85

useGLTF.preload(GLB, DECODER_DRACO)

// Envmap procedural LOCAL (RoomEnvironment + PMREM), el mismo camino que usa el visor de Pro Max.
// No se usa <Environment preset> de drei porque descarga un HDRI de un CDN externo: si ese CDN
// falla, el Canvas revienta entero y la landing queda en negro.
function EnvmapLocal() {
  const { gl, scene } = useThree()
  React.useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl)
    const tex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
    scene.environment = tex
    return () => { tex.dispose(); pmrem.dispose(); scene.environment = null }
  }, [gl, scene])
  return null
}

interface AcordeonProps {
  avanceRef: React.MutableRefObject<number>
  punteroRef: React.MutableRefObject<{ x: number; y: number }>
  animacionReducida: boolean
  onPiel?: (indice: number) => void
}

function Acordeon({ avanceRef, punteroRef, animacionReducida, onPiel }: AcordeonProps) {
  const grupo = React.useRef<THREE.Group>(null!)
  const { scene } = useGLTF(GLB, DECODER_DRACO)
  const inclinacion = React.useRef({ x: 0, y: 0 })
  const pielVisible = React.useRef(-1)

  // Normalización: el GLB viene tal cual sale de Blender — en Z-up y con el origen a más de 100
  // unidades del acordeón (bbox z ≈ 113..135). Se envuelve en dos grupos: uno lo pasa a Y-up y otro
  // lo centra y lo escala, así la escena trabaja en unidades limpias y no en las coordenadas crudas
  // del archivo. Clonar la escena la hace independiente del caché de useGLTF.
  const { modelo, piezas } = React.useMemo(() => {
    const clon = scene.clone(true)
    ocultarPiezasDeVitrina(clon)
    const giro = new THREE.Group()
    giro.rotation.x = -Math.PI / 2
    giro.add(clon)
    const raiz = new THREE.Group()
    raiz.add(giro)
    raiz.updateMatrixWorld(true)

    const caja = new THREE.Box3().setFromObject(raiz)
    const centro = caja.getCenter(new THREE.Vector3())
    const medidas = caja.getSize(new THREE.Vector3())
    giro.position.sub(centro)
    raiz.scale.setScalar(TAMANO / Math.max(medidas.x, medidas.y, medidas.z))
    raiz.updateMatrixWorld(true)

    return { modelo: raiz, piezas: prepararPiezas(raiz) }
  }, [scene])

  React.useEffect(() => { precargarPieles(PIELES.map((p) => p.id)) }, [])

  // Los materiales son CLONES propios de esta instancia y algunas geometrías se re-generaron para
  // llevar las UVs de caja: <primitive> no dispone nada de eso solo. Sin este cleanup, cada visita a
  // la página deja materiales y buffers colgando en GPU. Las texturas de piel NO se tocan: viven en
  // el caché de módulo y se comparten entre montajes.
  React.useEffect(() => () => liberarPiezas(piezas), [piezas])

  useFrame((estado, dt) => {
    const g = grupo.current
    if (!g) return

    // Cruce de pieles: el par y la mezcla salen del avance de scroll ya suavizado por el escenario.
    const { a, b, mezcla } = cruceEn(avanceRef.current)
    vestirCruce(piezas, PIELES[a].id, PIELES[b].id, mezcla, PIELES[a].tintas, PIELES[b].tintas)
    // Para el rótulo de acabado manda la piel que MÁS se ve, no el par entero.
    const dominante = mezcla < 0.5 ? a : b
    if (dominante !== pielVisible.current) { pielVisible.current = dominante; onPiel?.(dominante) }

    // Flotación + paralaje del puntero: respiración lenta más una inclinación que sigue al ratón. Es
    // lo que hace que el acordeón se sienta un objeto en el aire y no una calcomanía. El resto del
    // movimiento (viaje, zoom, giro) lo pone el CSS sobre la capa.
    const t = animacionReducida ? 0 : estado.clock.elapsedTime
    const flotaY = animacionReducida ? 0 : Math.sin(t * 0.62) * 0.09
    const flotaGiro = animacionReducida ? 0 : Math.sin(t * 0.44) * 0.09
    const objIncX = animacionReducida ? 0 : punteroRef.current.y * 0.13
    const objIncY = animacionReducida ? 0 : punteroRef.current.x * 0.24
    const k = 1 - Math.pow(0.02, Math.min(dt, 0.1))
    inclinacion.current.x += (objIncX - inclinacion.current.x) * k
    inclinacion.current.y += (objIncY - inclinacion.current.y) * k

    g.position.y = flotaY
    g.rotation.set(inclinacion.current.x, GIRO_BASE + flotaGiro + inclinacion.current.y, 0)
  })

  return (
    <group ref={grupo}>
      <primitive object={modelo} />
    </group>
  )
}

interface Props {
  avanceRef: React.MutableRefObject<number>
  animacionReducida: boolean
  onListo?: () => void
  onPiel?: (indice: number) => void
}

export default function EscenaAcordeon({ avanceRef, animacionReducida, onListo, onPiel }: Props) {
  // Puntero normalizado (-1..1). Por ref y no por estado: se mueve con cada píxel del ratón y un
  // setState por evento re-renderizaría el árbol entero sesenta veces por segundo.
  const punteroRef = React.useRef({ x: 0, y: 0 })

  React.useEffect(() => {
    if (animacionReducida) return
    const mover = (e: PointerEvent) => {
      punteroRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      punteroRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', mover, { passive: true })
    return () => window.removeEventListener('pointermove', mover)
  }, [animacionReducida])

  return (
    <Canvas
      // Protección del asset 3D: sin menú contextual ni arrastre sobre el lienzo.
      onContextMenu={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      // Fondo transparente: el degradado, el grano y las scanlines los pone el CSS del sistema.
      // dpr con techo 1.5 y sin MSAA en pantallas densas/táctiles: con [1,2]+antialias un
      // iPhone pagaba 4x los píxeles en una página de marketing.
      gl={{ antialias: !esPantallaExigente(), alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 6], fov: 35, near: 0.1, far: 40 }}
      onCreated={({ gl }) => { gl.toneMapping = THREE.ACESFilmicToneMapping; gl.toneMappingExposure = 1.0 }}
    >
      <EnvmapLocal />
      {/* Tres puntos SUAVES encima del envmap: la clave marca el nácar, el relleno abre las sombras
          y la de contra recorta la silueta contra el fondo oscuro. Las intensidades son bajas a
          propósito — RoomEnvironment ya aporta una base cercana a 1 y, sumándole luces fuertes, el
          nácar se quema a blanco y se pierden el relieve y el tinte de las secciones. */}
      <ambientLight intensity={0.14} />
      <directionalLight position={[4, 5, 6]} intensity={1.15} color="#fff6e8" />
      <directionalLight position={[-5, 1, 3]} intensity={0.38} color="#8fb4ff" />
      <directionalLight position={[0, -3, -5]} intensity={0.6} color="#ffd9a0" />
      <React.Suspense fallback={null}>
        <Acordeon
          avanceRef={avanceRef}
          punteroRef={punteroRef}
          animacionReducida={animacionReducida}
          onPiel={onPiel}
        />
        <Aviso onListo={onListo} />
      </React.Suspense>
    </Canvas>
  )
}

/** Avisa una sola vez, ya con el GLB parseado, para poder retirar el cargador. */
function Aviso({ onListo }: { onListo?: () => void }) {
  React.useEffect(() => { onListo?.() }, [onListo])
  return null
}
