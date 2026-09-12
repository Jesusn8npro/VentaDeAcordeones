import Link from 'next/link'
import Image from 'next/image'
import { supabaseServidor } from '@/configuracion/supabaseServidor'
import './ProductosRelacionados.css'

// ───────────────────────────────────────────────────────────────────────────
// "También te puede interesar" — cierre de la ficha de producto.
//
// POR QUÉ: la ficha terminaba en un callejón. Quien no compraba ESE producto se
// iba del sitio. Las recomendaciones en ficha son de lo poco que sube a la vez
// conversión y ticket medio, siempre que cumplan tres condiciones que aquí se
// respetan: ser productos REALES y comprables (stock > 0, nunca relleno), ser
// pocas (4: más compiten con el botón de comprar de la propia ficha) y ser
// relevantes de verdad — misma categoría y, dentro de ella, precio parecido,
// que es lo que mantiene al cliente en su presupuesto en vez de espantarlo.
//
// SERVER COMPONENT A PROPÓSITO: la consulta se hace aquí, no en el navegador,
// para que los cuatro <a href="/producto/…"> salgan en el HTML. Así Google los
// lee como enlaces internos reales entre fichas (antes cada ficha era una hoja
// suelta del árbol). `prefetch={false}` porque son cuatro enlaces por ficha y
// prefetcharlos todos dispararía el tráfico sin que nadie los haya pedido.
// ───────────────────────────────────────────────────────────────────────────

const CUANTOS = 4
const CANDIDATOS = 16 // margen para ordenar por cercanía de precio y aún quedarnos con 4

const SELECT =
  'nombre, slug, precio, precio_original, marca, stock, producto_imagenes(imagen_principal)'

type Fila = {
  nombre: string
  slug: string
  precio: number | null
  precio_original: number | null
  marca: string | null
  stock: number | null
  producto_imagenes: { imagen_principal?: string | null }[] | null
}

type Props = {
  slugActual: string
  precio?: number | null
  categoriaSlug?: string | null
  categoriaNombre?: string | null
}

const precioCOP = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`

/** Más cerca en precio = más comparable. Es el criterio de orden dentro de la categoría. */
const distancia = (a: Fila, referencia: number) =>
  referencia > 0 ? Math.abs((Number(a.precio) || 0) - referencia) : 0

async function obtenerRelacionados({ slugActual, precio, categoriaSlug }: Props): Promise<Fila[]> {
  const referencia = Number(precio) || 0
  const elegidos: Fila[] = []

  // 1) Misma categoría. `categorias!inner` filtra por el slug de la categoría sin
  //    necesitar el categoria_id, así no hay que tocar la consulta de la ficha.
  if (categoriaSlug) {
    const { data, error } = await supabaseServidor
      .from('productos')
      .select(`${SELECT}, categorias!inner(slug)`)
      .eq('activo', true)
      .gt('stock', 0)
      .neq('slug', slugActual)
      .eq('categorias.slug', categoriaSlug)
      .limit(CANDIDATOS)
    if (error) console.error('[relacionados categoría]', error.message)
    elegidos.push(
      ...((data as unknown as Fila[]) || []).sort((a, b) => distancia(a, referencia) - distancia(b, referencia))
    )
  }

  // 2) Si la categoría tiene pocos productos, se completa con rango de precio
  //    parecido (±45 %). Mejor un complemento del mismo nivel de gama que una
  //    rejilla a medias o rellena con lo primero que devuelva la BD.
  if (elegidos.length < CUANTOS && referencia > 0) {
    const fuera = [slugActual, ...elegidos.map((p) => p.slug)]
    const { data, error } = await supabaseServidor
      .from('productos')
      .select(SELECT)
      .eq('activo', true)
      .gt('stock', 0)
      .gte('precio', Math.round(referencia * 0.55))
      .lte('precio', Math.round(referencia * 1.45))
      .not('slug', 'in', `(${fuera.join(',')})`)
      .limit(CANDIDATOS)
    if (error) console.error('[relacionados precio]', error.message)
    elegidos.push(
      ...((data as Fila[]) || []).sort((a, b) => distancia(a, referencia) - distancia(b, referencia))
    )
  }

  // Dedupe defensivo: las dos consultas se excluyen entre sí, pero si mañana
  // alguien toca los filtros no queremos la misma tarjeta dos veces.
  const vistos = new Set<string>()
  return elegidos.filter((p) => (vistos.has(p.slug) ? false : (vistos.add(p.slug), true))).slice(0, CUANTOS)
}

export default async function ProductosRelacionados(props: Props) {
  const productos = await obtenerRelacionados(props)

  // Sin productos reales no se pinta nada: un bloque vacío es peor que no tenerlo.
  if (productos.length === 0) return null

  const { categoriaNombre, categoriaSlug } = props

  return (
    <section className="rel-seccion" aria-labelledby="rel-titulo">
      <div className="rel-contenedor">
        <div className="rel-cabecera">
          <h2 className="rel-titulo" id="rel-titulo">
            También te puede <em>interesar</em>
          </h2>
          {categoriaSlug && categoriaNombre && (
            <Link className="rel-ver-mas" href={`/tienda/categoria/${categoriaSlug}`} prefetch={false}>
              VER TODO {categoriaNombre.toUpperCase()} →
            </Link>
          )}
        </div>

        <div className="rel-grid">
          {productos.map((p) => {
            const precio = Number(p.precio) || 0
            const antes = Number(p.precio_original) || 0
            const descuento = antes > precio && precio > 0 ? Math.round((1 - precio / antes) * 100) : 0
            const imagen = p.producto_imagenes?.[0]?.imagen_principal || null
            return (
              <Link
                key={p.slug}
                href={`/producto/${p.slug}`}
                prefetch={false}
                className="rel-card"
                aria-label={`${p.nombre} — ${precioCOP(precio)}`}
              >
                <div className="rel-foto">
                  {imagen ? (
                    <Image
                      src={imagen}
                      alt={p.nombre}
                      width={320}
                      height={320}
                      quality={65}
                      sizes="(max-width: 900px) 45vw, 320px"
                      loading="lazy"
                    />
                  ) : (
                    <span className="rel-sin-foto">SIN FOTO</span>
                  )}
                  {descuento >= 5 && <span className="rel-descuento">-{descuento}%</span>}
                </div>
                <div className="rel-cuerpo">
                  {p.marca && <span className="rel-marca">{p.marca}</span>}
                  <p className="rel-nombre">{p.nombre}</p>
                  <div className="rel-precios">
                    <span className="rel-precio">{precioCOP(precio)}</span>
                    {antes > precio && <span className="rel-antes">{precioCOP(antes)}</span>}
                  </div>
                  <span className="rel-stock">DISPONIBLE</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
