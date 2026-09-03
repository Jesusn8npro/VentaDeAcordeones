'use client'

import React, { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'
import { LayoutGrid, List, SlidersHorizontal, X, ChevronDown, SearchX, RefreshCw } from 'lucide-react'
import { useTituloPagina } from '../../../hooks/useTitulosPagina'
import { clienteSupabase } from '../../../configuracion/supabase'
import DisposicionTienda from '../../../componentes/tienda/DisposicionTienda'
import PanelFiltros from '../../../componentes/tienda/PanelFiltros'
import TarjetaProductoLujo from '../../../componentes/producto/TarjetaProductoLujo'
import TarjetaProductoCinema from '../../../componentes/producto/TarjetaProductoCinema'
import Icono from '../../../componentes/ui/Icono'
import SkeletonCards from './SkeletonCards'
import { usarProductosTienda, PRODUCTOS_POR_PAGINA } from './usarProductosTienda'
import {
  FILTROS_VACIOS,
  OPCIONES_ORDEN,
  contarFiltrosActivos,
  etiquetaMarca,
  filtrosAParams,
  formatearCOP,
  leerFiltrosDeURL,
  type FiltrosTienda,
  type OrdenTienda,
  type VistaTienda,
} from './filtrosTienda'
import './PaginaTienda.css'

const WHATSAPP = 'https://wa.me/573144865310'

/** descripcion puede venir como texto o como JSONB {contenido} */
const textoDescripcion = (d: unknown): string => {
  if (typeof d === 'string') return d
  if (d && typeof d === 'object' && typeof (d as any).contenido === 'string') return (d as any).contenido
  return ''
}

interface CategoriaActual { id: string; nombre: string; slug: string; descripcion: string; enOferta: number }

export default function PaginaTienda() {
  const params = useParams()
  const slug = typeof params?.slug === 'string' ? params.slug : undefined
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // La URL es la única fuente de verdad de filtros/orden/vista
  const { filtros, orden, vista } = useMemo(
    () => leerFiltrosDeURL(new URLSearchParams(searchParams.toString())),
    [searchParams],
  )

  const [categoria, setCategoria] = useState<CategoriaActual | null>(null)
  const [cargandoCategoria, setCargandoCategoria] = useState(!!slug)
  const [drawerAbierto, setDrawerAbierto] = useState(false)

  useTituloPagina(categoria?.nombre || 'Tienda de Acordeones')

  // Categoría de la ruta /tienda/categoria/[slug]
  useEffect(() => {
    if (!slug) { setCategoria(null); setCargandoCategoria(false); return }
    let activo = true
    setCargandoCategoria(true)
    ;(async () => {
      try {
        const { data: cat } = await clienteSupabase
          .from('categorias')
          .select('id, nombre, slug, descripcion')
          .eq('slug', slug)
          .maybeSingle()
        if (!activo) return
        if (!cat) { setCategoria(null); return }
        const { count } = await clienteSupabase
          .from('productos')
          .select('id', { count: 'exact', head: true })
          .eq('categoria_id', cat.id)
          .eq('activo', true)
          .gt('descuento', 0)
        if (!activo) return
        setCategoria({ id: cat.id, nombre: cat.nombre, slug: cat.slug, descripcion: textoDescripcion(cat.descripcion), enOferta: count || 0 })
      } catch {
        if (activo) setCategoria(null)
      } finally {
        if (activo) setCargandoCategoria(false)
      }
    })()
    return () => { activo = false }
  }, [slug])

  const categoriaNoExiste = !!slug && !cargandoCategoria && !categoria

  const { productos, total, cargando, cargandoMas, error, hayMas, cargarMas, reintentar } = usarProductosTienda({
    filtros,
    orden,
    categoriaFija: categoria?.id ?? null,
    listo: !slug || (!cargandoCategoria && !!categoria),
  })

  /* ── Navegación (escribe la URL; el estado se deriva de ella) ── */
  const navegar = useCallback((f: FiltrosTienda, o: OrdenTienda, v: VistaTienda) => {
    const qs = filtrosAParams(f, o, v).toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [router, pathname])

  const cambiarFiltros = useCallback((parcial: Partial<FiltrosTienda>) => navegar({ ...filtros, ...parcial }, orden, vista), [filtros, orden, vista, navegar])
  const limpiar = useCallback(() => navegar(FILTROS_VACIOS, orden, vista), [orden, vista, navegar])
  const cambiarOrden = (o: OrdenTienda) => navegar(filtros, o, vista)
  const cambiarVista = (v: VistaTienda) => navegar(filtros, orden, v)

  const nActivos = contarFiltrosActivos(filtros, !slug)

  /* ── Chips de filtros activos ── */
  const chips = useMemo(() => {
    const lista: { clave: string; texto: string; quitar: () => void }[] = []
    if (filtros.busqueda) lista.push({ clave: 'q', texto: `“${filtros.busqueda}”`, quitar: () => cambiarFiltros({ busqueda: '' }) })
    if (filtros.precioMin != null || filtros.precioMax != null) {
      const texto = filtros.precioMin != null && filtros.precioMax != null
        ? `${formatearCOP(filtros.precioMin)} – ${formatearCOP(filtros.precioMax)}`
        : filtros.precioMin != null ? `Desde ${formatearCOP(filtros.precioMin)}` : `Hasta ${formatearCOP(filtros.precioMax!)}`
      lista.push({ clave: 'precio', texto, quitar: () => cambiarFiltros({ precioMin: null, precioMax: null }) })
    }
    filtros.marcas.forEach(m => lista.push({ clave: `m-${m}`, texto: etiquetaMarca(m), quitar: () => cambiarFiltros({ marcas: filtros.marcas.filter(x => x !== m) }) }))
    if (filtros.rating > 0) lista.push({ clave: 'rating', texto: `★ ${filtros.rating}+`, quitar: () => cambiarFiltros({ rating: 0 }) })
    if (filtros.enStock) lista.push({ clave: 'stock', texto: 'Solo en stock', quitar: () => cambiarFiltros({ enStock: false }) })
    if (filtros.conDescuento) lista.push({ clave: 'oferta', texto: 'Con descuento', quitar: () => cambiarFiltros({ conDescuento: false }) })
    return lista
  }, [filtros, cambiarFiltros])

  const mostrandoSkeleton = cargando || (!!slug && cargandoCategoria)
  const vacio = !mostrandoSkeleton && !error && total === 0
  const totalTexto = total == null ? '' : `${total} ${total === 1 ? 'producto' : 'productos'}`

  return (
    <DisposicionTienda
      sidebar={<PanelFiltros filtros={filtros} onCambiar={cambiarFiltros} categoriaSlug={categoria?.slug ?? slug ?? null} />}
      abierto={drawerAbierto}
      onCerrar={() => setDrawerAbierto(false)}
      filtrosActivos={nActivos}
      onLimpiar={limpiar}
      totalProductos={total}
      cargando={mostrandoSkeleton}
    >
      {/* Cabecera editorial */}
      <header className="tienda-cabecera">
        <nav className="tienda-migas" aria-label="Ruta">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">/</span>
          {categoria ? <Link href="/tienda">Tienda</Link> : <span aria-current="page">Tienda</span>}
          {categoria && (<><span aria-hidden="true">/</span><span aria-current="page">{categoria.nombre}</span></>)}
        </nav>
        <p className="tienda-kicker">{categoria ? 'Categoría' : 'Catálogo completo'}</p>
        <h1 className="tienda-titulo">{categoria ? categoria.nombre : 'Todos los productos'}</h1>
        <p className="tienda-descripcion">
          {categoria
            ? (categoria.descripcion || `Explora nuestra selección de ${categoria.nombre.toLowerCase()} con envío a todo Colombia.`)
            : 'Acordeones, audio profesional y accesorios seleccionados. Precios reales, envío a todo Colombia y asesoría directa.'}
        </p>
        {categoria && categoria.enOferta > 0 && (
          <span className="tienda-pill-oferta">{categoria.enOferta} en oferta</span>
        )}
      </header>

      {/* Barra de resultados (sticky bajo el header) */}
      <div className="tienda-toolbar" role="region" aria-label="Resultados y ordenamiento">
        <div className="toolbar-izq">
          <button type="button" className="btn-filtros-movil" onClick={() => setDrawerAbierto(true)}>
            <SlidersHorizontal size={16} aria-hidden="true" />
            Filtros
            {nActivos > 0 && <span className="btn-filtros-badge">{nActivos}</span>}
          </button>
          <p className="toolbar-total" aria-live="polite">
            {mostrandoSkeleton ? <span className="toolbar-total-skeleton" /> : <><strong>{total ?? 0}</strong> {total === 1 ? 'producto' : 'productos'}</>}
          </p>
        </div>

        <div className="toolbar-der">
          <label className="toolbar-orden">
            <span className="toolbar-etiqueta">Ordenar</span>
            <span className="toolbar-select-caja">
              <select value={orden} onChange={e => cambiarOrden(e.target.value as OrdenTienda)} aria-label="Ordenar productos">
                {OPCIONES_ORDEN.map(o => <option key={o.valor} value={o.valor}>{o.etiqueta}</option>)}
              </select>
              <ChevronDown size={14} aria-hidden="true" />
            </span>
          </label>

          <div className="toolbar-vista" role="group" aria-label="Tipo de vista">
            <button type="button" className={vista === 'grid' ? 'activo' : ''} onClick={() => cambiarVista('grid')} aria-pressed={vista === 'grid'} title="Cuadrícula">
              <LayoutGrid size={16} />
            </button>
            <button type="button" className={vista === 'lista' ? 'activo' : ''} onClick={() => cambiarVista('lista')} aria-pressed={vista === 'lista'} title="Lista">
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="tienda-chips">
          {chips.map(c => (
            <button key={c.clave} type="button" className="tienda-chip" onClick={c.quitar} aria-label={`Quitar filtro ${c.texto}`}>
              {c.texto}
              <X size={12} aria-hidden="true" />
            </button>
          ))}
          <button type="button" className="tienda-chip-limpiar" onClick={limpiar}>Limpiar todo</button>
        </div>
      )}

      {/* Estados */}
      {categoriaNoExiste ? (
        <div className="tienda-vacio">
          <div className="tienda-vacio-icono"><SearchX size={28} /></div>
          <h2>Esta categoría no existe</h2>
          <p>Puede que el enlace esté desactualizado. Explora el catálogo completo o escríbenos.</p>
          <div className="tienda-vacio-acciones">
            <Link href="/tienda" className="btn-oro">Ver toda la tienda</Link>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-contorno"><Icono nombre="whatsapp" tamaño={16} /> WhatsApp</a>
          </div>
        </div>
      ) : error ? (
        <div className="tienda-vacio">
          <div className="tienda-vacio-icono"><RefreshCw size={28} /></div>
          <h2>No pudimos cargar los productos</h2>
          <p>{error}</p>
          <div className="tienda-vacio-acciones">
            <button type="button" className="btn-oro" onClick={reintentar}>Reintentar</button>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="btn-contorno"><Icono nombre="whatsapp" tamaño={16} /> Escríbenos</a>
          </div>
        </div>
      ) : vacio ? (
        <div className="tienda-vacio">
          <div className="tienda-vacio-icono"><SearchX size={28} /></div>
          <h2>No encontramos productos con esos filtros</h2>
          <p>Prueba quitando algún filtro o cuéntanos qué buscas: conseguimos instrumentos y repuestos bajo pedido.</p>
          <div className="tienda-vacio-acciones">
            {nActivos > 0 && <button type="button" className="btn-contorno" onClick={limpiar}>Limpiar filtros</button>}
            <a href={`${WHATSAPP}?text=${encodeURIComponent('Hola, busco un producto que no encuentro en la tienda: ')}`} target="_blank" rel="noopener noreferrer" className="btn-oro">
              <Icono nombre="whatsapp" tamaño={16} /> Preguntar por WhatsApp
            </a>
            <Link href="/accesorios" className="btn-contorno">Ver accesorios</Link>
          </div>
        </div>
      ) : (
        <>
          <section className={`tienda-grid vista-${vista}`} aria-busy={mostrandoSkeleton || cargandoMas}>
            {mostrandoSkeleton ? (
              <SkeletonCards cantidad={PRODUCTOS_POR_PAGINA} />
            ) : (
              productos.map(p =>
                p.plantilla_tarjeta === 'cinema'
                  ? <TarjetaProductoCinema key={p.id} producto={p} />
                  : <TarjetaProductoLujo key={p.id} producto={p} />
              )
            )}
            {cargandoMas && <SkeletonCards cantidad={4} />}
          </section>

          {!mostrandoSkeleton && total != null && total > 0 && (
            <div className="tienda-paginacion">
              <p className="tienda-paginacion-info">
                Mostrando <strong>{Math.min(productos.length, total)}</strong> de <strong>{totalTexto}</strong>
              </p>
              <div className="tienda-paginacion-barra" aria-hidden="true">
                <span style={{ width: `${Math.min(100, (productos.length / total) * 100)}%` }} />
              </div>
              {hayMas && (
                <button type="button" className="btn-oro btn-cargar-mas" onClick={cargarMas} disabled={cargandoMas}>
                  {cargandoMas ? 'Cargando…' : `Cargar ${Math.min(PRODUCTOS_POR_PAGINA, total - productos.length)} más`}
                </button>
              )}
            </div>
          )}
        </>
      )}
    </DisposicionTienda>
  )
}
