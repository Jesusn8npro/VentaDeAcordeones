'use client'

import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { I } from '../navIconos'

// ───────────────────────────────────────────────────────────────────────────
// Buscador con sugerencias instantáneas.
//
// POR QUÉ: antes esto solo empujaba a /tienda?q=… al pulsar Enter. En un catálogo
// de ~174 referencias el cliente escribía a ciegas y abandonaba. Aplicado de las
// guías de UX de búsqueda en ecommerce (Baymard / Doofinder / Boost):
//   · productos REALES con foto, marca y precio dentro del desplegable → se puede
//     decidir sin pasar por la página de resultados;
//   · sugerencias agrupadas por tipo (productos / categorías / blog) y un tope de
//     ~11 filas para no provocar parálisis de elección;
//   · el término escrito se resalta en cada sugerencia (feedback de por qué sale);
//   · flechas + Enter, `role="listbox"` y `aria-activedescendant` para teclado y
//     lector de pantalla;
//   · estado "sin resultados" con salida a un humano (WhatsApp) en vez de callejón;
//   · búsquedas recientes: el segundo intento de compra es el que convierte.
// ───────────────────────────────────────────────────────────────────────────

const QUICK = [
  { text: 'Hohner Corona III Sol Do Fa', badge: 'MÁS BUSCADO' },
  { text: 'Estuche rígido acordeón',     badge: 'TOP' },
  { text: 'Afinación profesional',       badge: null },
  { text: 'Voces Hohner repuesto',       badge: null },
  { text: 'Cursos vallenato online',     badge: null },
]

const CLAVE_RECIENTES = 'vda_busquedas_recientes'
const MAX_RECIENTES = 6
const RETARDO_MS = 300 // ni tan corto que dispare una petición por tecla, ni tan largo que se note
const MIN_TERMINO = 2
const WHATSAPP = '573144865310'

type Producto = {
  nombre: string
  slug: string
  precio: number
  precioOriginal: number | null
  marca: string
  imagen: string | null
  categoria: string
  hayStock: boolean
}
type Categoria = { nombre: string; slug: string }
type Articulo = { titulo: string; slug: string }
type Respuesta = { termino: string; productos: Producto[]; categorias: Categoria[]; articulos: Articulo[] }

const VACIO: Respuesta = { termino: '', productos: [], categorias: [], articulos: [] }

/** Sin tildes y en minúsculas: "Acordeón" y "acordeon" son el mismo término. */
const sinTildes = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{Mn}/gu, '')

/** Misma normalización que /api/buscar: sirve para saber si la respuesta en pantalla
 *  es la del término actual y no la de una pulsación anterior. */
const normalizar = (s: string) => sinTildes(s).replace(/\s+/g, ' ').trim()

const precioCOP = (n: number) => `$${Math.round(n).toLocaleString('es-CO')}`

/**
 * Resalta el término dentro del texto comparando sobre la versión sin tildes.
 * Se conservan los índices porque quitar los diacríticos no cambia el número de
 * caracteres en el alfabeto español (ó→o, ñ→n); si aun así no cuadrase, se
 * devuelve el texto tal cual en vez de recortarlo mal.
 */
function Resaltado({ texto, termino }: { texto: string; termino: string }) {
  const plano = sinTildes(texto)
  const busca = sinTildes(termino).trim()
  if (!busca || plano.length !== texto.length) return <>{texto}</>
  const i = plano.indexOf(busca)
  if (i < 0) return <>{texto}</>
  return (
    <>
      {texto.slice(0, i)}
      <mark className="bg-[var(--vda-oro-brillo)] text-[var(--vda-tinta)] rounded-[2px] px-[1px] font-semibold">
        {texto.slice(i, i + busca.length)}
      </mark>
      {texto.slice(i + busca.length)}
    </>
  )
}

function leerRecientes(): string[] {
  try {
    const cru = window.localStorage.getItem(CLAVE_RECIENTES)
    const arr = cru ? JSON.parse(cru) : []
    return Array.isArray(arr) ? arr.filter((s) => typeof s === 'string').slice(0, MAX_RECIENTES) : []
  } catch {
    return [] // modo incógnito o almacenamiento bloqueado: el buscador debe seguir funcionando
  }
}

export default function BuscadorOverlay({ open, onClose, light }: { open: boolean; onClose: () => void; light: boolean }) {
  const [query, setQuery] = useState('')
  const [datos, setDatos] = useState<Respuesta>(VACIO)
  const [cargando, setCargando] = useState(false)
  const [activo, setActivo] = useState(-1)
  const [recientes, setRecientes] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const listaRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | null>(null)
  const router = useRouter()

  const termino = query.trim()
  const buscando = termino.length >= MIN_TERMINO

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
      document.body.style.overflow = 'hidden'
      setRecientes(leerRecientes())
    } else {
      document.body.style.overflow = ''
      setQuery('')
      setDatos(VACIO)
      setActivo(-1)
      abortRef.current?.abort()
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  // Retardo + cancelación: cada pulsación reinicia el temporizador y aborta la
  // petición anterior, así nunca llega una respuesta vieja después de una nueva
  // (condición de carrera clásica del autocompletar) ni se castiga a la API.
  useEffect(() => {
    if (!open) return
    if (!buscando) {
      abortRef.current?.abort()
      setDatos(VACIO)
      setCargando(false)
      return
    }
    const ctrl = new AbortController()
    const t = setTimeout(async () => {
      abortRef.current?.abort()
      abortRef.current = ctrl
      setCargando(true)
      try {
        const r = await fetch(`/api/buscar?q=${encodeURIComponent(termino)}`, { signal: ctrl.signal })
        if (!r.ok) throw new Error(String(r.status))
        const json: Respuesta = await r.json()
        if (!ctrl.signal.aborted) { setDatos(json); setActivo(-1) }
      } catch {
        if (!ctrl.signal.aborted) setDatos(VACIO)
      } finally {
        if (!ctrl.signal.aborted) setCargando(false)
      }
    }, RETARDO_MS)
    return () => { clearTimeout(t); ctrl.abort() }
  }, [termino, buscando, open])

  const guardarReciente = useCallback((texto: string) => {
    const limpio = texto.trim()
    if (limpio.length < MIN_TERMINO) return
    try {
      const previas = leerRecientes().filter((s) => sinTildes(s) !== sinTildes(limpio))
      const nuevas = [limpio, ...previas].slice(0, MAX_RECIENTES)
      window.localStorage.setItem(CLAVE_RECIENTES, JSON.stringify(nuevas))
      setRecientes(nuevas)
    } catch { /* almacenamiento no disponible: no es motivo para romper la búsqueda */ }
  }, [])

  const ir = useCallback((href: string) => {
    guardarReciente(termino)
    router.push(href)
    onClose()
  }, [router, onClose, guardarReciente, termino])

  // /buscar no existe: la tienda es el buscador real y lee el filtro desde ?q= (filtrosTienda.ts).
  // router.push en vez de window.location.href para no recargar toda la app (SPA, sin perder el carrito en memoria).
  const doSearch = useCallback(() => {
    if (!termino) return
    ir(`/tienda?q=${encodeURIComponent(termino)}`)
  }, [termino, ir])

  // Lista PLANA de destinos: es la que recorre el teclado. Se calcula una sola vez
  // por respuesta para que el índice activo y lo pintado no se desincronicen.
  const opciones = useMemo(() => {
    if (!buscando) return [] as { id: string; href: string }[]
    const total = datos.productos.length + datos.categorias.length + datos.articulos.length
    return [
      ...datos.productos.map((p) => ({ id: `sug-p-${p.slug}`, href: `/producto/${p.slug}` })),
      ...datos.categorias.map((c) => ({ id: `sug-c-${c.slug}`, href: `/tienda/categoria/${c.slug}` })),
      ...datos.articulos.map((a) => ({ id: `sug-a-${a.slug}`, href: `/blog/${a.slug}` })),
      ...(total > 0 ? [{ id: 'sug-todos', href: `/tienda?q=${encodeURIComponent(termino)}` }] : []),
    ]
  }, [datos, buscando, termino])

  const mover = useCallback((delta: number) => {
    if (!opciones.length) return
    setActivo((prev) => {
      const siguiente = prev + delta
      if (siguiente < 0) return opciones.length - 1
      if (siguiente >= opciones.length) return 0
      return siguiente
    })
  }, [opciones.length])

  // La fila activa debe quedar a la vista aunque se navegue con el teclado.
  useEffect(() => {
    if (activo < 0 || !opciones[activo]) return
    listaRef.current?.querySelector(`#${CSS.escape(opciones[activo]!.id)}`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [activo, opciones])

  const alTeclear = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); mover(1); return }
    if (e.key === 'ArrowUp')   { e.preventDefault(); mover(-1); return }
    if (e.key === 'Escape')    { onClose(); return }
    if (e.key === 'Enter') {
      e.preventDefault()
      const destino = activo >= 0 ? opciones[activo] : null
      if (destino) ir(destino.href)
      else doSearch()
    }
  }

  const usarSugerencia = (texto: string) => {
    setQuery(texto)
    setActivo(-1)
    inputRef.current?.focus()
  }

  const borrarRecientes = () => {
    try { window.localStorage.removeItem(CLAVE_RECIENTES) } catch { /* nada que borrar */ }
    setRecientes([])
  }

  const hayResultados = datos.productos.length + datos.categorias.length + datos.articulos.length > 0
  // Sólo se anuncia "sin resultados" si la respuesta en pantalla es la del término actual;
  // si no, se mostraría el vacío de una pulsación anterior mientras vuela la petición buena.
  const sinResultados = buscando && !cargando && !hayResultados && datos.termino === normalizar(termino)
  const idActivo = activo >= 0 && opciones[activo] ? opciones[activo]!.id : undefined

  // Clases de fila. El resalte del teclado se aplica con una clase condicional y NO
  // con una variante `data-[…]:`: Tailwind v4 no genera esa utilidad aquí y la fila
  // activa se quedaba sin fondo (invisible para quien navega con flechas).
  const filaBase = 'w-full flex items-center gap-3 px-3 rounded-lg text-left transition-colors hover:bg-[var(--vda-superficie-2)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--vda-oro)]'
  const ACTIVA = 'bg-[var(--vda-superficie-2)] shadow-[inset_3px_0_0_var(--vda-oro)]'
  const fila = `${filaBase} py-2.5`
  /** Fila con el estado activo del teclado ya resuelto. */
  const claseFila = (esActivo: boolean, extra = '') => `${filaBase} py-2.5 ${extra} ${esActivo ? ACTIVA : ''}`
  const rotulo = 'cond text-[10px] tracking-[0.22em] font-bold mb-1.5 px-3 text-[var(--vda-tinta-muted)]'

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex flex-col sm:px-4">
      <div className="absolute inset-0 bg-[var(--vda-overlay)] backdrop-blur-sm" onClick={onClose} />

      {/* Móvil: pantalla completa (el teclado deja poco sitio, cualquier margen roba filas).
          Escritorio: panel centrado de 720px con la altura acotada. */}
      <div
        className="relative mx-auto w-full sm:max-w-[720px] h-full sm:h-auto sm:mt-24 sm:max-h-[78vh] flex flex-col overflow-hidden rounded-none sm:rounded-xl shadow-2xl mega-enter bg-[var(--vda-superficie)] border-0 sm:border sm:border-[var(--vda-linea)]"
        role="dialog"
        aria-modal="true"
        aria-label="Buscar en la tienda"
      >
        <div className="flex items-stretch p-2 gap-2 shrink-0">
          <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3 px-3 rounded-lg bg-[var(--vda-superficie-2)]">
            <I.Search className="h-5 w-5 shrink-0 text-[var(--vda-tinta-muted)]" />
            <input
              ref={inputRef}
              type="text"
              role="combobox"
              aria-expanded={buscando && (hayResultados || cargando)}
              aria-controls="sugerencias-buscador"
              aria-autocomplete="list"
              aria-activedescendant={idActivo}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActivo(-1) }}
              onKeyDown={alTeclear}
              placeholder="Busca acordeones, repuestos, cursos…"
              // 16px obligatorio: por debajo de eso Safari en iPhone hace zoom al enfocar.
              className="flex-1 min-w-0 h-12 bg-transparent text-[16px] outline-none text-[var(--vda-tinta)] placeholder:text-[var(--vda-tinta-muted)]"
            />
            {cargando && <span className="h-3.5 w-3.5 shrink-0 rounded-full border-2 border-[var(--vda-oro)] border-t-transparent animate-spin" aria-hidden="true" />}
            {query && (
              <button onClick={() => { setQuery(''); inputRef.current?.focus() }} aria-label="Borrar búsqueda" className="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-[var(--vda-tinta)]">
                <I.Close className="h-4 w-4" />
              </button>
            )}
          </div>
          <button onClick={doSearch} className="cond px-4 sm:px-5 shrink-0 bg-[var(--vda-oro)] text-black font-bold tracking-[0.16em] text-[13px] rounded-lg hover:brightness-110 transition-[filter]">BUSCAR</button>
          <button onClick={onClose} aria-label="Cerrar buscador" className="sm:hidden shrink-0 px-3 rounded-lg text-[var(--vda-tinta-dim)] hover:bg-[var(--vda-superficie-2)]">
            <I.Close className="h-5 w-5" />
          </button>
        </div>

        <div ref={listaRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-1 pb-3 border-t border-[var(--vda-linea)]">
          {/* ── Con término: sugerencias reales ───────────────────────────── */}
          {buscando ? (
            <div id="sugerencias-buscador" role="listbox" aria-label="Sugerencias de búsqueda">
              {cargando && !hayResultados && (
                <div className="p-3 space-y-2" aria-hidden="true">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3 animate-pulse">
                      <div className="h-14 w-14 rounded-lg bg-[var(--vda-superficie-2)] shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-3/4 rounded bg-[var(--vda-superficie-2)]" />
                        <div className="h-3 w-1/3 rounded bg-[var(--vda-superficie-2)]" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {datos.productos.length > 0 && (
                <div className="pt-3">
                  <div className={rotulo}>PRODUCTOS</div>
                  {datos.productos.map((p, i) => (
                    <button
                      key={p.slug}
                      id={`sug-p-${p.slug}`}
                      role="option"
                      aria-selected={activo === i}
                      tabIndex={-1}
                      onMouseEnter={() => setActivo(i)}
                      onClick={() => ir(`/producto/${p.slug}`)}
                      className={claseFila(activo === i)}
                    >
                      <span className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-[var(--vda-superficie-2)] flex items-center justify-center">
                        {p.imagen ? (
                          // 56px reales: la miniatura pesa unos pocos KB en vez de la foto de ficha completa.
                          <Image src={p.imagen} alt="" width={56} height={56} quality={65} sizes="56px" className="h-full w-full object-contain" />
                        ) : (
                          <I.Box className="h-6 w-6 text-[var(--vda-tinta-muted)]" />
                        )}
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-[14px] leading-tight text-[var(--vda-tinta)] line-clamp-2">
                          <Resaltado texto={p.nombre} termino={termino} />
                        </span>
                        <span className="mt-1 flex items-center gap-2 flex-wrap">
                          {p.marca && <span className="cond text-[10px] tracking-[0.14em] font-bold text-[var(--vda-tinta-muted)]">{p.marca}</span>}
                          <span className="text-[13px] font-bold text-[var(--vda-oro-texto)]">{precioCOP(p.precio)}</span>
                          {p.precioOriginal && <span className="text-[11px] line-through text-[var(--vda-tinta-muted)]">{precioCOP(p.precioOriginal)}</span>}
                          {!p.hayStock && <span className="text-[10px] cond tracking-[0.12em] font-bold text-[var(--vda-tinta-muted)]">SOBRE PEDIDO</span>}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {datos.categorias.length > 0 && (
                <div className="pt-3">
                  <div className={rotulo}>CATEGORÍAS</div>
                  {datos.categorias.map((c, i) => {
                    const idx = datos.productos.length + i
                    return (
                      <button
                        key={c.slug}
                        id={`sug-c-${c.slug}`}
                        role="option"
                        aria-selected={activo === idx}
                        tabIndex={-1}
                        onMouseEnter={() => setActivo(idx)}
                        onClick={() => ir(`/tienda/categoria/${c.slug}`)}
                        className={claseFila(activo === idx)}
                      >
                        <I.Grid className="h-4 w-4 shrink-0 text-[var(--vda-tinta-muted)]" />
                        <span className="text-[14px] flex-1 min-w-0 truncate text-[var(--vda-tinta)]">
                          <Resaltado texto={c.nombre} termino={termino} />
                        </span>
                        <I.ArrowRight className="h-3.5 w-3.5 shrink-0 opacity-40 text-[var(--vda-tinta)]" />
                      </button>
                    )
                  })}
                </div>
              )}

              {datos.articulos.length > 0 && (
                <div className="pt-3">
                  <div className={rotulo}>GUÍAS DEL BLOG</div>
                  {datos.articulos.map((a, i) => {
                    const idx = datos.productos.length + datos.categorias.length + i
                    return (
                      <button
                        key={a.slug}
                        id={`sug-a-${a.slug}`}
                        role="option"
                        aria-selected={activo === idx}
                        tabIndex={-1}
                        onMouseEnter={() => setActivo(idx)}
                        onClick={() => ir(`/blog/${a.slug}`)}
                        className={claseFila(activo === idx)}
                      >
                        <I.Book className="h-4 w-4 shrink-0 text-[var(--vda-tinta-muted)]" />
                        <span className="text-[14px] flex-1 min-w-0 line-clamp-2 text-[var(--vda-tinta-dim)]">
                          <Resaltado texto={a.titulo} termino={termino} />
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}

              {hayResultados && (
                <div className="pt-3">
                  <button
                    id="sug-todos"
                    role="option"
                    aria-selected={activo === opciones.length - 1}
                    tabIndex={-1}
                    onMouseEnter={() => setActivo(opciones.length - 1)}
                    onClick={doSearch}
                    className={claseFila(activo === opciones.length - 1, 'justify-center border border-[var(--vda-linea)]')}
                  >
                    <span className="cond text-[12px] tracking-[0.16em] font-bold text-[var(--vda-oro-texto)]">
                      VER TODOS LOS RESULTADOS DE “{termino}”
                    </span>
                  </button>
                </div>
              )}

              {/* Sin resultados nunca es un callejón sin salida: en esta tienda casi todo
                  se consigue por encargo, así que se ofrece un humano por WhatsApp. */}
              {sinResultados && (
                <div className="px-4 py-8 text-center">
                  <I.Search className="h-8 w-8 mx-auto opacity-25 text-[var(--vda-tinta)]" />
                  <p className="mt-3 text-[15px] font-semibold text-[var(--vda-tinta)]">Sin resultados para “{termino}”</p>
                  <p className="mt-1 text-[13px] text-[var(--vda-tinta-muted)]">Lo conseguimos por encargo. Escríbenos y te decimos precio y tiempo de entrega.</p>
                  <a
                    href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(`Hola, busco "${termino}" en VentaDeAcordeones.com. ¿Lo tienen o lo consiguen?`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cond mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--vda-oro)] text-black font-bold tracking-[0.14em] text-[12px] hover:brightness-110 transition-[filter] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--vda-oro)]"
                  >
                    <I.Whatsapp className="h-4 w-4" /> PREGUNTAR POR WHATSAPP
                  </a>
                </div>
              )}
            </div>
          ) : (
            /* ── Sin término: recientes + populares ─────────────────────── */
            <div className="pt-3">
              {recientes.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between px-3 mb-1.5">
                    <span className="cond text-[10px] tracking-[0.22em] font-bold text-[var(--vda-tinta-muted)]">BÚSQUEDAS RECIENTES</span>
                    <button onClick={borrarRecientes} className="cond text-[10px] tracking-[0.14em] font-bold text-[var(--vda-tinta-muted)] hover:text-[var(--vda-tinta)] transition-colors">BORRAR</button>
                  </div>
                  {recientes.map((r) => (
                    <button key={r} onClick={() => usarSugerencia(r)} className={fila}>
                      <I.Clock className="h-3.5 w-3.5 shrink-0 opacity-50 text-[var(--vda-tinta)]" />
                      <span className="text-[14px] flex-1 min-w-0 truncate text-[var(--vda-tinta-dim)]">{r}</span>
                    </button>
                  ))}
                </div>
              )}
              <div className={rotulo}>BÚSQUEDAS POPULARES</div>
              {QUICK.map((s) => (
                <button key={s.text} onClick={() => usarSugerencia(s.text)} className={fila}>
                  <I.Search className="h-3.5 w-3.5 shrink-0 opacity-50 text-[var(--vda-tinta)]" />
                  <span className="text-[14px] flex-1 min-w-0 truncate text-[var(--vda-tinta-dim)]">{s.text}</span>
                  {s.badge && <span className="cond text-[9px] tracking-[0.16em] font-bold bg-[var(--vda-oro-brillo)] text-[var(--vda-oro-texto)] px-2 py-0.5 rounded-sm shrink-0">{s.badge}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
