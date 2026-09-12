import React from 'react'
import PlantillaCatalogo from './plantillas/PlantillaCatalogo/PlantillaCatalogo'
import PlantillaCinema from './plantillas/PlantillaCinema/PlantillaCinema'

/**
 * SelectorPlantilla — decide con qué ficha se pinta cada producto.
 *
 * POR QUÉ CAMBIÓ: hasta ahora la elección salía sólo de `producto.landing_tipo`, y ese
 * campo vale 'cinema' en los 174 productos activos porque `scripts/set-landing-cinema.mjs`
 * lo puso EN BLOQUE. Resultado: una correa de $120.000, unos fuelles o un micrófono de
 * $25.000 se pintaban con la misma ficha cinematográfica de cinco pantallas que un Hohner
 * de cinco millones, prometiendo estuche, afinación de taller y envíos a 42 países.
 *
 * AHORA: la plantilla se deduce del producto (precio y tipo), y `landing_tipo` sólo manda
 * cuando alguien lo pone a mano para forzar una ficha concreta.
 *
 * Se decide en el SERVIDOR: `app/(sitio)/producto/[slug]/page.tsx` ya trae el producto
 * completo y lo pasa como `initialData`, así que esta función corre en el render de
 * servidor y el HTML sale con la ficha correcta (nada de parpadeos ni de decidir tras
 * hidratar). Es una función pura del producto, así que servidor y navegador coinciden.
 *
 * PlantillaTemu se eliminó: no la usaba ningún producto y estaba llena de datos inventados
 * (testimonios de banco de imágenes, "+15.847 clientes", "70% OFF", contadores de urgencia).
 * Los tipos antiguos 'temu' y 'amazon' caen en la decisión automática.
 */

/**
 * Umbral de "instrumento de alto valor". Por encima de esto la ficha larga se justifica:
 * es una compra meditada, el cliente quiere ver detalle, garantía y taller antes de pagar.
 * Por debajo, la ficha larga estorba y exagera.
 */
export const UMBRAL_CINEMA = 1_500_000

/** Un acordeón (o una categoría de acordeones). Cubre "acordeón", "acordeon" y "Acordeones". */
const RE_ACORDEON = /acorde/i

/**
 * Accesorios y repuestos PARA acordeón: llevan "acordeón" en el nombre y en la categoría
 * ("Accesorios de Acordeón"), pero no son el instrumento. Sin esta lista, una correa o una
 * parrilla de $149.000 se colaba en la ficha cinema por el simple hecho de llamarse
 * "…de acordeón". Ojo al orden: el filtro de precio corre ANTES, para que un
 * "Acordeón piano Hohner Arrieta IM con estuche" de $2.900.000 no caiga aquí por la
 * palabra "estuche".
 */
const RE_ACCESORIO =
  /accesorio|repuesto|estuche|funda|forro|maleta|correa|parrilla|broche|cinta|fuelle|bandolera|soporte|atril|tornill|boquilla|c[áa]psula|pastilla|cable|adaptador|afinador|limpiador/i

/** Fichas forzadas a mano desde la base de datos. Ver `elegirPlantilla`. */
const PLANTILLAS_FORZADAS: Record<string, React.ComponentType<any>> = {
  'forzar-cinema': PlantillaCinema,
  'forzar-catalogo': PlantillaCatalogo,
  // 'catalogo' y 'clasico' no los tiene ningún producto hoy: si aparecen es porque
  // alguien los eligió a propósito en el admin, así que también mandan.
  catalogo: PlantillaCatalogo,
  clasico: PlantillaCatalogo,
}

/**
 * Devuelve el componente de ficha que le toca a un producto.
 *
 * 1. `landing_tipo` forzado a mano ('forzar-cinema' / 'forzar-catalogo' / 'catalogo') manda
 *    siempre, para que Jesús pueda saltarse la regla en un producto concreto.
 *    OJO: 'cinema' a secas NO cuenta como decisión manual, porque es el valor que un script
 *    escribió en todo el catálogo de golpe; si contara, esta regla no haría nada.
 * 2. Instrumento de alto valor (>= UMBRAL_CINEMA) → ficha cinema.
 * 3. Accesorio o repuesto → ficha de catálogo, aunque se llame "de acordeón".
 * 4. Acordeón (por categoría o por nombre) → ficha cinema.
 * 5. Todo lo demás (audio, audífonos, percusión, cajas, amplificación barata) → catálogo.
 */
export function elegirPlantilla(producto: any): React.ComponentType<any> {
  const forzada = PLANTILLAS_FORZADAS[String(producto?.landing_tipo || '').trim().toLowerCase()]
  if (forzada) return forzada

  const precio = Number(producto?.precio) || 0
  if (precio >= UMBRAL_CINEMA) return PlantillaCinema

  const categoria = producto?.categorias?.nombre || producto?.categoria_nombre || ''
  const texto = `${categoria} ${producto?.nombre || ''}`

  if (RE_ACCESORIO.test(texto)) return PlantillaCatalogo
  if (RE_ACORDEON.test(texto)) return PlantillaCinema

  return PlantillaCatalogo
}

interface Props {
  producto: any
  config?: any
  reviews?: any[]
  notificaciones?: any[]
}

const SelectorPlantilla = ({ producto, config, reviews, notificaciones }: Props) => {
  const Plantilla = elegirPlantilla(producto)

  return (
    <Plantilla
      producto={producto}
      config={config}
      reviews={reviews}
      notificaciones={notificaciones}
    />
  )
}

export default SelectorPlantilla
